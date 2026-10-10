// Rule: only imports from own types/schema, src/lib/*, npm packages.
// Mentors are Trainer records with isMentor = true.

import { db } from '@/lib/db'
import { parsePagination, buildMeta } from '@/lib/paginate'
import {
  cacheGet,
  cacheSet,
  cacheInvalidateLists,
  LIST_TTL,
} from '@/lib/cache'
import type { Prisma } from '@prisma/client'
import type { PaginationMeta } from '@/lib/paginate'

const WITH_STACKS = { stacks: { include: { stack: true } } } as const

type MentorRecord = Prisma.TrainerGetPayload<{ include: typeof WITH_STACKS }>
type MentorListResult = { data: MentorRecord[]; pagination: PaginationMeta }

export interface MentorFilters {
  search?: string
  isPublished?: boolean
  includeUnpublished?: boolean
  page?: number
  perPage?: number
}

const VERSION_KEY = 'mentors:v'

function buildListKey(version: number, filters: MentorFilters): string {
  const { page = 1, perPage = 20, includeUnpublished, isPublished, search } = filters
  return (
    `mentors:list:v${version}:p${page}:pp${perPage}` +
    `:incl${includeUnpublished ? 1 : 0}` +
    `:pub${isPublished ?? ''}` +
    `:q${search ?? ''}`
  )
}

export async function listMentors(filters: MentorFilters = {}): Promise<MentorListResult> {
  const { skip, take, page, perPage } = parsePagination(filters)

  const version = await cacheGet<number>(VERSION_KEY).then(v => v ?? 0)
  const key = buildListKey(version, { ...filters, page, perPage })
  const cached = await cacheGet<MentorListResult>(key)
  if (cached !== null) return cached

  const where: Prisma.TrainerWhereInput = {
    isMentor: true,
    deletedAt: null,
    ...(filters.includeUnpublished ? {} : { isPublished: filters.isPublished ?? true }),
    ...(filters.search && { name: { contains: filters.search, mode: 'insensitive' } }),
  }

  const [mentors, total] = await Promise.all([
    db.trainer.findMany({ where, include: WITH_STACKS, orderBy: { displayOrder: 'asc' }, skip, take }),
    db.trainer.count({ where }),
  ])

  const result: MentorListResult = { data: mentors, pagination: buildMeta(total, page, perPage) }
  await cacheSet(key, result, LIST_TTL)
  return result
}
