// Rule: only imports from own types/schema, src/lib/*, npm packages.
import { db } from '@/lib/db'
import { parsePagination, buildMeta } from '@/lib/paginate'
import {
  cacheGet,
  cacheSet,
  cacheDel,
  cacheInvalidateLists,
  LIST_TTL,
  RECORD_TTL,
} from '@/lib/cache'
import type { Internship } from '@prisma/client'
import type { PaginationMeta } from '@/lib/paginate'
import type { CreateInternshipInput, UpdateInternshipInput, InternshipFilters } from './internships.types'

// ── Cache types ───────────────────────────────────────────────────────────────

type InternshipListResult = { data: Internship[]; pagination: PaginationMeta }

// ── Cache helpers ─────────────────────────────────────────────────────────────

const VERSION_KEY = 'internships:v'

function buildListKey(version: number, filters: InternshipFilters): string {
  const { page = 1, perPage = 20, includeUnpublished, stack, search } = filters
  return (
    `internships:list:v${version}:p${page}:pp${perPage}` +
    `:incl${includeUnpublished ? 1 : 0}` +
    `:st${stack ?? ''}` +
    `:q${search ?? ''}`
  )
}

function idKey(id: string): string { return `internships:id:${id}` }

async function invalidate(id: string): Promise<void> {
  await Promise.all([
    cacheInvalidateLists(VERSION_KEY),
    cacheDel(idKey(id)),
  ])
}

// ── Service functions ─────────────────────────────────────────────────────────

export async function listInternships(filters: InternshipFilters = {}): Promise<InternshipListResult> {
  const { skip, take, page, perPage } = parsePagination(filters)

  const version = await cacheGet<number>(VERSION_KEY).then(v => v ?? 0)
  const key = buildListKey(version, { ...filters, page, perPage })
  const cached = await cacheGet<InternshipListResult>(key)
  if (cached !== null) return cached

  const where = {
    ...(filters.includeUnpublished ? {} : { isPublished: true }),
    deletedAt:   null,
    ...(filters.stack  && { stackTags: { has: filters.stack } }),
    ...(filters.search && { companyName: { contains: filters.search, mode: 'insensitive' as const } }),
  }
  const [internships, total] = await Promise.all([
    db.internship.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    db.internship.count({ where }),
  ])
  const result: InternshipListResult = { data: internships, pagination: buildMeta(total, page, perPage) }
  await cacheSet(key, result, LIST_TTL)
  return result
}

/** Public-facing lookup — only returns published internships. */
export async function getInternshipById(id: string): Promise<Internship | null> {
  return db.internship.findFirst({ where: { id, isPublished: true, deletedAt: null } })
}

/** Admin-facing lookup — returns regardless of isPublished status. */
export async function getInternshipByIdAdmin(id: string): Promise<Internship | null> {
  const key = idKey(id)
  const cached = await cacheGet<Internship>(key)
  if (cached !== null) return cached

  const internship = await db.internship.findFirst({ where: { id, deletedAt: null } })
  await cacheSet(key, internship, RECORD_TTL)
  return internship
}

export async function createInternship(input: CreateInternshipInput) {
  const internship = await db.internship.create({ data: input })
  await cacheInvalidateLists(VERSION_KEY)
  return internship
}

export async function updateInternship(id: string, input: UpdateInternshipInput) {
  const internship = await db.internship.update({ where: { id }, data: input })
  await invalidate(id)
  return internship
}

export async function publishInternship(id: string) {
  const internship = await db.internship.update({ where: { id }, data: { isPublished: true } })
  await invalidate(id)
  return internship
}

export async function unpublishInternship(id: string) {
  const internship = await db.internship.update({ where: { id }, data: { isPublished: false } })
  await invalidate(id)
  return internship
}

export async function softDeleteInternship(id: string) {
  const internship = await db.internship.update({ where: { id }, data: { deletedAt: new Date() } })
  await invalidate(id)
  return internship
}
