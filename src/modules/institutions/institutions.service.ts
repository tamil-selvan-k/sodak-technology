// Rule: only imports from own types/schema, src/lib/*, npm packages.
import { db } from '@/lib/db'
import { slugify } from '@/lib/slugify'
import { parsePagination, buildMeta } from '@/lib/paginate'
import type { CreateInstitutionInput, UpdateInstitutionInput, InstitutionFilters } from './institutions.types'

const WITH_ENGAGEMENTS = { engagements: true } as const

export async function listInstitutions(filters: InstitutionFilters = {}) {
  const { skip, take, page, perPage } = parsePagination(filters)
  const where = {
    ...(filters.includeUnpublished ? {} : { isPublished: true }),
    deletedAt:   null,
    ...(filters.showOnHome !== undefined && { showOnHome: filters.showOnHome }),
    ...(filters.type   && { type:  filters.type as never }),
    ...(filters.search && { name: { contains: filters.search, mode: 'insensitive' as const } }),
  }
  const [institutions, total] = await Promise.all([
    db.institution.findMany({ where, include: WITH_ENGAGEMENTS, orderBy: { displayOrder: 'asc' }, skip, take }),
    db.institution.count({ where }),
  ])
  return { data: institutions, pagination: buildMeta(total, page, perPage) }
}

export async function getInstitutionBySlug(slug: string) {
  return db.institution.findFirst({ where: { slug, isPublished: true, deletedAt: null }, include: WITH_ENGAGEMENTS })
}

export async function getInstitutionById(id: string) {
  return db.institution.findFirst({ where: { id, deletedAt: null }, include: WITH_ENGAGEMENTS })
}

export async function getByTrainerId(_trainerId: string) {
  // Join via institution_engagements — expand when trainer↔institution join table is added
  return db.institution.findMany({ where: { isPublished: true, deletedAt: null } })
}

export async function createInstitution(input: CreateInstitutionInput) {
  return db.institution.create({ data: { ...input, slug: slugify(input.name) }, include: WITH_ENGAGEMENTS })
}

export async function updateInstitution(id: string, input: UpdateInstitutionInput) {
  return db.institution.update({
    where: { id },
    data: { ...input, ...(input.name && { slug: slugify(input.name) }) },
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
  return db.institution.update({ where: { id }, data: { isPublished: false } })
}

export async function softDeleteInstitution(id: string) {
  return db.institution.update({ where: { id }, data: { deletedAt: new Date() } })
}
