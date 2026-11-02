// Rule: only imports from own types/schema, src/lib/*, npm packages.
import { db } from '@/lib/db'
import { makeUniqueSlug } from '@/lib/slugify'
import { parsePagination, buildMeta } from '@/lib/paginate'
import type { Prisma } from '@prisma/client'
import type { PaginationMeta } from '@/lib/paginate'
import type { CreateWebinarInput, UpdateWebinarInput, WebinarFilters } from './webinars.types'

const WITH_PRESENTER = { presenter: true } as const
type WebinarRecord = Prisma.WebinarGetPayload<{ include: typeof WITH_PRESENTER }>

// ── Service functions ─────────────────────────────────────────────────────────

export async function listWebinars(filters: WebinarFilters = {}): Promise<{ data: WebinarRecord[]; pagination: PaginationMeta }> {
  const { skip, take, page, perPage } = parsePagination(filters)

  const where = {
    ...(filters.includeUnpublished ? {} : { isPublished: true }),
    deletedAt:   null,
    ...(filters.upcoming && { scheduledAt: { gte: new Date() } }),
  }
  const [webinars, total] = await Promise.all([
    db.webinar.findMany({ where, include: WITH_PRESENTER, orderBy: { scheduledAt: 'asc' }, skip, take }),
    db.webinar.count({ where }),
  ])
  return { data: webinars, pagination: buildMeta(total, page, perPage) }
}

export async function getWebinarBySlug(slug: string): Promise<WebinarRecord | null> {
  return db.webinar.findFirst({ where: { slug, isPublished: true, deletedAt: null }, include: WITH_PRESENTER })
}

/** Admin-facing lookup — returns regardless of isPublished status. */
export async function getWebinarById(id: string): Promise<WebinarRecord | null> {
  return db.webinar.findFirst({ where: { id, deletedAt: null }, include: WITH_PRESENTER })
}

export async function createWebinar(input: CreateWebinarInput) {
  return db.webinar.create({
    data: { ...input, slug: await makeUniqueSlug(input.title, (c) =>
      db.webinar.findFirst({ where: { slug: c, deletedAt: null }, select: { id: true } }).then(Boolean),
    ), ...(input.scheduledAt && { scheduledAt: new Date(input.scheduledAt) }) },
    include: { presenter: true },
  })
}

export async function updateWebinar(id: string, input: UpdateWebinarInput) {
  return db.webinar.update({ where: { id }, data: input, include: { presenter: true } })
}

export async function publishWebinar(id: string) {
  return db.webinar.update({ where: { id }, data: { isPublished: true }, include: { presenter: true } })
}

export async function unpublishWebinar(id: string) {
  return db.webinar.update({ where: { id }, data: { isPublished: false }, include: { presenter: true } })
}

export async function softDeleteWebinar(id: string) {
  return db.webinar.update({ where: { id }, data: { deletedAt: new Date() } })
}
