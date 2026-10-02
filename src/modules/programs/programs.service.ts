// Rule: only imports from own types/schema, src/lib/*, npm packages.
import { db } from '@/lib/db'
import { slugify } from '@/lib/slugify'
import { parsePagination, buildMeta } from '@/lib/paginate'
import {
  cacheGet,
  cacheSet,
  cacheDel,
  cacheInvalidateLists,
  LIST_TTL,
  RECORD_TTL,
} from '@/lib/cache'
import type { Prisma } from '@prisma/client'
import type { PaginationMeta } from '@/lib/paginate'
import type { ProgramFilters } from './programs.types'
import type { CreateProgramInput, UpdateProgramInput } from './programs.schema'

const WITH_STACKS = { stacks: { include: { stack: true } } } as const

// ── Cache types ───────────────────────────────────────────────────────────────

type ProgramRecord = Prisma.ProgramGetPayload<{ include: typeof WITH_STACKS }>
type ProgramListResult = { data: ProgramRecord[]; pagination: PaginationMeta }

// ── Cache helpers ─────────────────────────────────────────────────────────────

const VERSION_KEY = 'programs:v'

function buildListKey(version: number, filters: ProgramFilters): string {
  const { page = 1, perPage = 20, includeUnpublished, trackCode, search, stack } = filters
  return (
    `programs:list:v${version}:p${page}:pp${perPage}` +
    `:incl${includeUnpublished ? 1 : 0}` +
    `:tr${trackCode ?? ''}` +
    `:q${search ?? ''}` +
    `:st${stack ?? ''}`
  )
}

function idKey(id: string): string    { return `programs:id:${id}` }
function slugCacheKey(slug: string): string { return `programs:slug:${slug}` }

async function invalidate(id: string, slug: string): Promise<void> {
  await Promise.all([
    cacheInvalidateLists(VERSION_KEY),
    cacheDel(idKey(id), slugCacheKey(slug)),
  ])
}

// ── Service functions ─────────────────────────────────────────────────────────

export async function listPrograms(filters: ProgramFilters = {}): Promise<ProgramListResult> {
  const { skip, take, page, perPage } = parsePagination(filters)

  const version = await cacheGet<number>(VERSION_KEY).then(v => v ?? 0)
  const key = buildListKey(version, { ...filters, page, perPage })
  const cached = await cacheGet<ProgramListResult>(key)
  if (cached !== null) return cached

  const where = {
    ...(filters.includeUnpublished ? {} : { isPublished: true }),
    deletedAt:   null,
    ...(filters.trackCode && { trackCode: filters.trackCode }),
    ...(filters.search    && { title: { contains: filters.search, mode: 'insensitive' as const } }),
    ...(filters.stack     && { stacks: { some: { stack: { slug: filters.stack } } } }),
  }
  const [programs, total] = await Promise.all([
    db.program.findMany({ where, include: WITH_STACKS, orderBy: { title: 'asc' }, skip, take }),
    db.program.count({ where }),
  ])
  const result: ProgramListResult = { data: programs, pagination: buildMeta(total, page, perPage) }
  await cacheSet(key, result, LIST_TTL)
  return result
}

export async function getProgramBySlug(slug: string): Promise<ProgramRecord | null> {
  const key = slugCacheKey(slug)
  const cached = await cacheGet<ProgramRecord>(key)
  if (cached !== null) return cached

  const program = await db.program.findFirst({ where: { slug, isPublished: true, deletedAt: null }, include: WITH_STACKS })
  await cacheSet(key, program, RECORD_TTL)
  return program
}

export async function getProgramById(id: string): Promise<ProgramRecord | null> {
  const key = idKey(id)
  const cached = await cacheGet<ProgramRecord>(key)
  if (cached !== null) return cached

  const program = await db.program.findFirst({ where: { id, deletedAt: null }, include: WITH_STACKS })
  await cacheSet(key, program, RECORD_TTL)
  return program
}

export async function createProgram(input: CreateProgramInput) {
  const { stackIds, syllabusJson, ...data } = input
  const program = await db.program.create({
    data: {
      ...data,
      slug: slugify(data.title),
      ...(syllabusJson !== undefined && { syllabusJson: syllabusJson as Prisma.InputJsonValue }),
      stacks: stackIds.length ? { create: stackIds.map(stackId => ({ stackId })) } : undefined,
    },
    include: WITH_STACKS,
  })

  await cacheInvalidateLists(VERSION_KEY)
  return program
}

export async function updateProgram(id: string, input: UpdateProgramInput) {
  const { stackIds, syllabusJson, ...data } = input
  const program = await db.program.update({
    where: { id },
    data: {
      ...data,
      ...(data.title    && { slug: slugify(data.title) }),
      ...(syllabusJson !== undefined && { syllabusJson: syllabusJson as Prisma.InputJsonValue }),
      ...(stackIds !== undefined && { stacks: { deleteMany: {}, create: stackIds.map(stackId => ({ stackId })) } }),
    },
    include: WITH_STACKS,
  })

  await invalidate(id, program.slug)
  return program
}

export async function publishProgram(id: string) {
  const program = await db.program.update({ where: { id }, data: { isPublished: true }, include: WITH_STACKS })
  await invalidate(id, program.slug)
  return program
}

export async function unpublishProgram(id: string) {
  const program = await db.program.update({ where: { id }, data: { isPublished: false }, include: WITH_STACKS })
  await invalidate(id, program.slug)
  return program
}

export async function softDeleteProgram(id: string) {
  const result = await db.program.update({ where: { id }, data: { deletedAt: new Date() } })
  await Promise.all([
    cacheInvalidateLists(VERSION_KEY),
    cacheDel(idKey(id), slugCacheKey(result.slug)),
  ])
  return result
}
