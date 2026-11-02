// Rule: only imports from own types/schema, src/lib/*, npm packages.
// Mentors are Trainer records with isMentor = true.

import { db } from '@/lib/db'
import { parsePagination, buildMeta } from '@/lib/paginate'
import type { Prisma } from '@prisma/client'
import type { PaginationMeta } from '@/lib/paginate'

const WITH_STACKS = { stacks: { include: { stack: true } } } as const

type MentorRecord = Prisma.TrainerGetPayload<{ include: typeof WITH_STACKS }>

export interface MentorFilters {
  search?: string
  isPublished?: boolean
  includeUnpublished?: boolean
  page?: number
  perPage?: number
}

export async function listMentors(filters: MentorFilters = {}): Promise<{ data: MentorRecord[]; pagination: PaginationMeta }> {
  const { skip, take, page, perPage } = parsePagination(filters)

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

  return { data: mentors, pagination: buildMeta(total, page, perPage) }
}
