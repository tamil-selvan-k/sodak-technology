// Rule: only imports from own types/schema, src/lib/*, npm packages.
import { db } from '@/lib/db'
import { makeUniqueSlug } from '@/lib/slugify'
import { parsePagination, buildMeta } from '@/lib/paginate'
import type { Prisma } from '@prisma/client'
import type { PaginationMeta } from '@/lib/paginate'
import type { CreateInstitutionInput, UpdateInstitutionInput, InstitutionFilters } from './institutions.types'

const WITH_ENGAGEMENTS = { engagements: true } as const

type InstitutionRecord     = Prisma.InstitutionGetPayload<{ include: typeof WITH_ENGAGEMENTS }>
type InstitutionSlim       = { id: string; name: string; slug: string; logoUrl: string | null; logoPermission: boolean }

// ── Service functions ─────────────────────────────────────────────────────────

export async function listInstitutions(filters: InstitutionFilters = {}): Promise<{ data: InstitutionRecord[]; pagination: PaginationMeta }> {
  const { skip, take, page, perPage } = parsePagination(filters)

  const where = {
    ...(filters.includeUnpublished ? {} : { isPublished: true }),
    deletedAt:   null,
    ...(filters.showOnHome !== undefined && { showOnHome: filters.showOnHome }),
    ...(filters.type   && { type:  filters.type as import('@prisma/client').InstitutionType }),
    ...(filters.search && { name: { contains: filters.search, mode: 'insensitive' as const } }),
  }
  const [institutions, total] = await Promise.all([
    db.institution.findMany({ where, include: WITH_ENGAGEMENTS, orderBy: { displayOrder: 'asc' }, skip, take }),
    db.institution.count({ where }),
  ])
  return { data: institutions, pagination: buildMeta(total, page, perPage) }
}

// Slim query: only id/name/slug/logo — avoids fetching the engagements join.
// Use for contexts that only need institution names (e.g. home page marquee).
export async function listInstitutionNames(filters: Pick<InstitutionFilters, 'showOnHome' | 'page' | 'perPage'> = {}): Promise<{ data: InstitutionSlim[]; pagination: PaginationMeta }> {
  const { skip, take, page, perPage } = parsePagination(filters)

  const where = {
    isPublished: true,
    deletedAt: null,
    ...(filters.showOnHome !== undefined && { showOnHome: filters.showOnHome }),
  }
  const [institutions, total] = await Promise.all([
    db.institution.findMany({ where, select: { id: true, name: true, slug: true, logoUrl: true, logoPermission: true }, orderBy: { displayOrder: 'asc' }, skip, take }),
    db.institution.count({ where }),
  ])
  return { data: institutions, pagination: buildMeta(total, page, perPage) }
}

export async function getInstitutionBySlug(slug: string): Promise<InstitutionRecord | null> {
  return db.institution.findFirst({ where: { slug, isPublished: true, deletedAt: null }, include: WITH_ENGAGEMENTS })
}

export async function getInstitutionById(id: string): Promise<InstitutionRecord | null> {
  return db.institution.findFirst({ where: { id, deletedAt: null }, include: WITH_ENGAGEMENTS })
}

export async function getByTrainerId(_trainerId: string) {
  // Join via institution_engagements — expand when trainer↔institution join table is added.
  // Cap at 500 to prevent unbounded scans.
  return db.institution.findMany({ where: { isPublished: true, deletedAt: null }, take: 500, orderBy: { displayOrder: 'asc' } })
}

export async function createInstitution(input: CreateInstitutionInput) {
  const slug = await makeUniqueSlug(input.name, (c) =>
    db.institution.findFirst({ where: { slug: c, deletedAt: null }, select: { id: true } }).then(Boolean),
  )
  return db.institution.create({ data: { ...input, slug }, include: WITH_ENGAGEMENTS })
}

export async function updateInstitution(id: string, input: UpdateInstitutionInput) {
  return db.institution.update({
    where: { id },
    data: { ...input, ...(input.name && { slug: await makeUniqueSlug(input.name, (c) =>
      db.institution.findFirst({ where: { slug: c, id: { not: id }, deletedAt: null }, select: { id: true } }).then(Boolean),
    ) }) },
    include: WITH_ENGAGEMENTS,
  })
}

export async function publishInstitution(id: string) {
  // CLAUDE.md rule: logo_permission = false → never *render* the logo; render text name instead.
  // The stored logoUrl is preserved so it can be displayed once permission is granted later.
  // Enforcement is on the rendering side: check logoPermission before showing the <img>.
  return db.institution.update({ where: { id }, data: { isPublished: true }, include: WITH_ENGAGEMENTS })
}

export async function unpublishInstitution(id: string) {
  return db.institution.update({ where: { id }, data: { isPublished: false }, include: WITH_ENGAGEMENTS })
}

export async function softDeleteInstitution(id: string) {
  return db.institution.update({ where: { id }, data: { deletedAt: new Date() } })
}
