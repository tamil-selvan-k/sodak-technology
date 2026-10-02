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
import type { CreateInstitutionInput, UpdateInstitutionInput, InstitutionFilters } from './institutions.types'

const WITH_ENGAGEMENTS = { engagements: true } as const

// ── Cache types ───────────────────────────────────────────────────────────────

type InstitutionRecord     = Prisma.InstitutionGetPayload<{ include: typeof WITH_ENGAGEMENTS }>
type InstitutionSlim       = { id: string; name: string; slug: string; logoUrl: string | null; logoPermission: boolean }
type InstitutionListResult = { data: InstitutionRecord[]; pagination: PaginationMeta }
type InstitutionSlimResult = { data: InstitutionSlim[]; pagination: PaginationMeta }

// ── Cache helpers ─────────────────────────────────────────────────────────────

const VERSION_KEY = 'institutions:v'

function buildListKey(version: number, filters: InstitutionFilters): string {
  const { page = 1, perPage = 20, includeUnpublished, showOnHome, type, search } = filters
  return (
    `inst:list:v${version}:p${page}:pp${perPage}` +
    `:incl${includeUnpublished ? 1 : 0}` +
    `:h${showOnHome ?? ''}` +
    `:t${type ?? ''}` +
    `:q${search ?? ''}`
  )
}

function idKey(id: string): string    { return `institutions:id:${id}` }
function slugCacheKey(slug: string): string { return `institutions:slug:${slug}` }

async function invalidate(id: string, slug: string): Promise<void> {
  await Promise.all([
    cacheInvalidateLists(VERSION_KEY),
    cacheDel(idKey(id), slugCacheKey(slug)),
  ])
}

// ── Service functions ─────────────────────────────────────────────────────────

export async function listInstitutions(filters: InstitutionFilters = {}): Promise<InstitutionListResult> {
  const { skip, take, page, perPage } = parsePagination(filters)

  const version = await cacheGet<number>(VERSION_KEY).then(v => v ?? 0)
  const key = buildListKey(version, { ...filters, page, perPage })
  const cached = await cacheGet<InstitutionListResult>(key)
  if (cached !== null) return cached

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
  const result: InstitutionListResult = { data: institutions, pagination: buildMeta(total, page, perPage) }
  await cacheSet(key, result, LIST_TTL)
  return result
}

// Slim query: only id/name/slug/logo — avoids fetching the engagements join.
// Use for contexts that only need institution names (e.g. home page marquee).
export async function listInstitutionNames(filters: Pick<InstitutionFilters, 'showOnHome' | 'page' | 'perPage'> = {}): Promise<InstitutionSlimResult> {
  const { skip, take, page, perPage } = parsePagination(filters)

  const version = await cacheGet<number>(VERSION_KEY).then(v => v ?? 0)
  const key = buildListKey(version, { ...filters, page, perPage }) + ':slim'
  const cached = await cacheGet<InstitutionSlimResult>(key)
  if (cached !== null) return cached

  const where = {
    isPublished: true,
    deletedAt: null,
    ...(filters.showOnHome !== undefined && { showOnHome: filters.showOnHome }),
  }
  const [institutions, total] = await Promise.all([
    db.institution.findMany({ where, select: { id: true, name: true, slug: true, logoUrl: true, logoPermission: true }, orderBy: { displayOrder: 'asc' }, skip, take }),
    db.institution.count({ where }),
  ])
  const result: InstitutionSlimResult = { data: institutions, pagination: buildMeta(total, page, perPage) }
  await cacheSet(key, result, LIST_TTL)
  return result
}

export async function getInstitutionBySlug(slug: string): Promise<InstitutionRecord | null> {
  const key = slugCacheKey(slug)
  const cached = await cacheGet<InstitutionRecord>(key)
  if (cached !== null) return cached

  const institution = await db.institution.findFirst({ where: { slug, isPublished: true, deletedAt: null }, include: WITH_ENGAGEMENTS })
  await cacheSet(key, institution, RECORD_TTL)
  return institution
}

export async function getInstitutionById(id: string): Promise<InstitutionRecord | null> {
  const key = idKey(id)
  const cached = await cacheGet<InstitutionRecord>(key)
  if (cached !== null) return cached

  const institution = await db.institution.findFirst({ where: { id, deletedAt: null }, include: WITH_ENGAGEMENTS })
  await cacheSet(key, institution, RECORD_TTL)
  return institution
}

export async function getByTrainerId(_trainerId: string) {
  // Join via institution_engagements — expand when trainer↔institution join table is added
  return db.institution.findMany({ where: { isPublished: true, deletedAt: null } })
}

export async function createInstitution(input: CreateInstitutionInput) {
  const institution = await db.institution.create({ data: { ...input, slug: slugify(input.name) }, include: WITH_ENGAGEMENTS })
  await cacheInvalidateLists(VERSION_KEY)
  return institution
}

export async function updateInstitution(id: string, input: UpdateInstitutionInput) {
  const institution = await db.institution.update({
    where: { id },
    data: { ...input, ...(input.name && { slug: slugify(input.name) }) },
    include: WITH_ENGAGEMENTS,
  })
  await invalidate(id, institution.slug)
  return institution
}

export async function publishInstitution(id: string) {
  // CLAUDE.md rule: logo_permission = false → never *render* the logo; render text name instead.
  // The stored logoUrl is preserved so it can be displayed once permission is granted later.
  // Enforcement is on the rendering side: check logoPermission before showing the <img>.
  const institution = await db.institution.update({ where: { id }, data: { isPublished: true }, include: WITH_ENGAGEMENTS })
  await invalidate(id, institution.slug)
  return institution
}

export async function unpublishInstitution(id: string) {
  const institution = await db.institution.update({ where: { id }, data: { isPublished: false }, include: WITH_ENGAGEMENTS })
  await invalidate(id, institution.slug)
  return institution
}

export async function softDeleteInstitution(id: string) {
  const result = await db.institution.update({ where: { id }, data: { deletedAt: new Date() } })
  await Promise.all([
    cacheInvalidateLists(VERSION_KEY),
    cacheDel(idKey(id), slugCacheKey(result.slug)),
  ])
  return result
}
