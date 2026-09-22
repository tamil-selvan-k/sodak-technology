// Rule: only imports from own types/schema, src/lib/*, npm packages.
import { db } from '@/lib/db'
import { parsePagination, buildMeta } from '@/lib/paginate'
import type { GalleryFilters } from './gallery.types'
import type { CreatePhotoInput, UpdatePhotoInput } from './gallery.schema'
import type { Prisma } from '@prisma/client'

export async function listPhotos(filters: GalleryFilters = {}) {
  const { skip, take, page, perPage } = parsePagination(filters)
  const where = {
    ...(filters.includeUnpublished ? {} : { isPublished: true }),
    deletedAt: null,
    ...(filters.institutionId && { institutionId: filters.institutionId }),
    ...(filters.year && { dateTaken: { gte: new Date(`${filters.year}-01-01`), lt: new Date(`${filters.year + 1}-01-01`) } }),
    ...(filters.tag  && { tags: { has: filters.tag } }),
  }
  const [photos, total] = await Promise.all([
    db.photo.findMany({ where, orderBy: { displayOrder: 'asc' }, skip, take }),
    db.photo.count({ where }),
  ])
  return { data: photos, pagination: buildMeta(total, page, perPage) }
}

export async function createPhoto(input: CreatePhotoInput) {
  return db.photo.create({ data: input as Prisma.PhotoUncheckedCreateInput })
}

export async function getPhotoById(id: string) {
  return db.photo.findUnique({ where: { id } })
}

export async function updatePhoto(id: string, input: UpdatePhotoInput) {
  return db.photo.update({ where: { id }, data: input })
}

export async function publishPhoto(id: string) {
  const photo = await db.photo.findUniqueOrThrow({ where: { id } })
  if (!photo.altText) throw new AltTextError('alt_text is required before publishing a photo.')
  if (photo.hasStudentFaces && !photo.studentConsentRef) {
    throw new ConsentError('student_consent_ref is required when has_student_faces is true.')
  }
  return db.photo.update({ where: { id }, data: { isPublished: true } })
}

export async function unpublishPhoto(id: string) {
  return db.photo.update({ where: { id }, data: { isPublished: false } })
}

export async function deletePhoto(id: string) {
  // Soft delete — physical row removal happens via a cron after 30 days (CLAUDE.md policy)
  return db.photo.update({ where: { id }, data: { deletedAt: new Date() } })
}

export class AltTextError extends Error {
  readonly code = 'ALT_TEXT_REQUIRED'
}
export class ConsentError extends Error {
  readonly code = 'CONSENT_REQUIRED'
}
