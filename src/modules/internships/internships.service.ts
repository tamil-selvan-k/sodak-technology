// Rule: only imports from own types/schema, src/lib/*, npm packages.
import { db } from '@/lib/db'
import { parsePagination, buildMeta } from '@/lib/paginate'
import type { Internship } from '@prisma/client'
import type { PaginationMeta } from '@/lib/paginate'
import type { CreateInternshipInput, UpdateInternshipInput, InternshipFilters } from './internships.types'

// ── Service functions ─────────────────────────────────────────────────────────

export async function listInternships(filters: InternshipFilters = {}): Promise<{ data: Internship[]; pagination: PaginationMeta }> {
  const { skip, take, page, perPage } = parsePagination(filters)

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
  return { data: internships, pagination: buildMeta(total, page, perPage) }
}

/** Public-facing lookup — only returns published internships. */
export async function getInternshipById(id: string): Promise<Internship | null> {
  return db.internship.findFirst({ where: { id, isPublished: true, deletedAt: null } })
}

/** Admin-facing lookup — returns regardless of isPublished status. */
export async function getInternshipByIdAdmin(id: string): Promise<Internship | null> {
  return db.internship.findFirst({ where: { id, deletedAt: null } })
}

export async function createInternship(input: CreateInternshipInput) {
  return db.internship.create({ data: input })
}

export async function updateInternship(id: string, input: UpdateInternshipInput) {
  return db.internship.update({ where: { id }, data: input })
}

export async function publishInternship(id: string) {
  return db.internship.update({ where: { id }, data: { isPublished: true } })
}

export async function unpublishInternship(id: string) {
  return db.internship.update({ where: { id }, data: { isPublished: false } })
}

export async function softDeleteInternship(id: string) {
  return db.internship.update({ where: { id }, data: { deletedAt: new Date() } })
}
