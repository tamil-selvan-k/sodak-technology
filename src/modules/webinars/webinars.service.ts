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
import type { CreateWebinarInput, UpdateWebinarInput, WebinarFilters } from './webinars.types'

// ── Cache types ───────────────────────────────────────────────────────────────

const WITH_PRESENTER = { presenter: true } as const
type WebinarRecord     = Prisma.WebinarGetPayload<{ include: typeof WITH_PRESENTER }>
type WebinarListResult = { data: WebinarRecord[]; pagination: PaginationMeta }

// ── Cache helpers ─────────────────────────────────────────────────────────────

const VERSION_KEY = 'webinars:v'

function buildListKey(version: number, filters: WebinarFilters): string {
  const { page = 1, perPage = 20, includeUnpublished, upcoming } = filters
  return (
    `webinars:list:v${version}:p${page}:pp${perPage}` +
    `:incl${includeUnpublished ? 1 : 0}` +
    `:up${upcoming ? 1 : 0}`
  )
}

function idKey(id: string): string { return `webinars:id:${id}` }

async function invalidate(id: string): Promise<void> {
  await Promise.all([
    cacheInvalidateLists(VERSION_KEY),
    cacheDel(idKey(id)),
  ])
}

// ── Service functions ─────────────────────────────────────────────────────────

export async function listWebinars(filters: WebinarFilters = {}): Promise<WebinarListResult> {
  const { skip, take, page, perPage } = parsePagination(filters)

  const version = await cacheGet<number>(VERSION_KEY).then(v => v ?? 0)
  const key = buildListKey(version, { ...filters, page, perPage })
  const cached = await cacheGet<WebinarListResult>(key)
  if (cached !== null) return cached

  const where = {
    ...(filters.includeUnpublished ? {} : { isPublished: true }),
    deletedAt:   null,
    ...(filters.upcoming && { scheduledAt: { gte: new Date() } }),
  }
  const [webinars, total] = await Promise.all([
    db.webinar.findMany({ where, include: WITH_PRESENTER, orderBy: { scheduledAt: 'asc' }, skip, take }),
    db.webinar.count({ where }),
  ])
  const result: WebinarListResult = { data: webinars, pagination: buildMeta(total, page, perPage) }
  await cacheSet(key, result, LIST_TTL)
  return result
}

export async function getWebinarBySlug(slug: string): Promise<WebinarRecord | null> {
  return db.webinar.findFirst({ where: { slug, isPublished: true, deletedAt: null }, include: WITH_PRESENTER })
}

/** Admin-facing lookup — returns regardless of isPublished status. */
export async function getWebinarById(id: string): Promise<WebinarRecord | null> {
  const key = idKey(id)
  const cached = await cacheGet<WebinarRecord>(key)
  if (cached !== null) return cached

  const webinar = await db.webinar.findFirst({ where: { id, deletedAt: null }, include: WITH_PRESENTER })
  await cacheSet(key, webinar, RECORD_TTL)
  return webinar
}

export async function createWebinar(input: CreateWebinarInput) {
  const webinar = await db.webinar.create({
    data: { ...input, slug: slugify(input.title), ...(input.scheduledAt && { scheduledAt: new Date(input.scheduledAt) }) },
    include: { presenter: true },
  })
  await cacheInvalidateLists(VERSION_KEY)
  return webinar
}

export async function updateWebinar(id: string, input: UpdateWebinarInput) {
  const webinar = await db.webinar.update({ where: { id }, data: input, include: { presenter: true } })
  await invalidate(id)
  return webinar
}

export async function publishWebinar(id: string) {
  const webinar = await db.webinar.update({ where: { id }, data: { isPublished: true }, include: { presenter: true } })
  await invalidate(id)
  return webinar
}

export async function unpublishWebinar(id: string) {
  const webinar = await db.webinar.update({ where: { id }, data: { isPublished: false }, include: { presenter: true } })
  await invalidate(id)
  return webinar
}

export async function softDeleteWebinar(id: string) {
  const webinar = await db.webinar.update({ where: { id }, data: { deletedAt: new Date() } })
  await invalidate(id)
  return webinar
}
