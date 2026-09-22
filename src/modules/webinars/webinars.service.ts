// Rule: only imports from own types/schema, src/lib/*, npm packages.
import { db } from '@/lib/db'
import { slugify } from '@/lib/slugify'
import { parsePagination, buildMeta } from '@/lib/paginate'
import type { CreateWebinarInput, UpdateWebinarInput, WebinarFilters } from './webinars.types'

export async function listWebinars(filters: WebinarFilters = {}) {
  const { skip, take, page, perPage } = parsePagination(filters)
  const where = {
    isPublished: true,
    deletedAt:   null,
    ...(filters.upcoming && { scheduledAt: { gte: new Date() } }),
  }
  const [webinars, total] = await Promise.all([
    db.webinar.findMany({ where, include: { presenter: true }, orderBy: { scheduledAt: 'asc' }, skip, take }),
    db.webinar.count({ where }),
  ])
  return { data: webinars, pagination: buildMeta(total, page, perPage) }
}

export async function getWebinarBySlug(slug: string) {
  return db.webinar.findFirst({ where: { slug, isPublished: true, deletedAt: null }, include: { presenter: true } })
}

export async function createWebinar(input: CreateWebinarInput) {
  return db.webinar.create({
    data: { ...input, slug: slugify(input.title), ...(input.scheduledAt && { scheduledAt: new Date(input.scheduledAt) }) },
    include: { presenter: true },
  })
}

export async function updateWebinar(id: string, input: UpdateWebinarInput) {
  return db.webinar.update({ where: { id }, data: input, include: { presenter: true } })
}

export async function publishWebinar(id: string) {
  return db.webinar.update({ where: { id }, data: { isPublished: true } })
}

export async function softDeleteWebinar(id: string) {
  return db.webinar.update({ where: { id }, data: { deletedAt: new Date() } })
}
