// Rule: only imports from own types/schema, src/lib/*, npm packages.
import { db } from '@/lib/db'
import { parsePagination, buildMeta } from '@/lib/paginate'
import {
  cacheGet,
  cacheSet,
  cacheDel,
  cacheInvalidateLists,
  cacheGetVersion,
  LIST_TTL,
  RECORD_TTL,
} from '@/lib/cache'
import type { GalleryFilters } from './gallery.types'
import type { CreatePhotoInput, UpdatePhotoInput } from './gallery.schema'
import type { Prisma } from '@prisma/client'
import type { PaginationMeta } from '@/lib/paginate'

type PhotoRecord = Prisma.PhotoGetPayload<object>
type PhotoListResult = { data: PhotoRecord[]; pagination: PaginationMeta }

const VERSION_KEY = 'gallery:v'

function buildListKey(version: number, filters: GalleryFilters): string {
  const {
    page = 1, perPage = 20,
    includeUnpublished, institutionId, year, tag,
  } = filters
  return (
    `gallery:list:v${version}:p${page}:pp${perPage}` +
    `:incl${includeUnpublished ? 1 : 0}` +
    `:inst${institutionId ?? ''}` +
    `:y${year ?? ''}` +
    `:tag${tag ?? ''}`
  )
}

function idKey(id: string): string { return `gallery:id:${id}` }

async function invalidate(id: string): Promise<void> {
  await Promise.all([
    cacheInvalidateLists(VERSION_KEY),
    cacheDel(idKey(id)),
  ])
}

export async function listPhotos(filters: GalleryFilters = {}): Promise<PhotoListResult> {
  const { skip, take, page, perPage } = parsePagination(filters)

  const version = await cacheGetVersion(VERSION_KEY)
  const key = buildListKey(version, { ...filters, page, perPage })
  const cached = await cacheGet<PhotoListResult>(key)
  if (cached !== null) return cached

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
  const result: PhotoListResult = { data: photos, pagination: buildMeta(total, page, perPage) }
  await cacheSet(key, result, LIST_TTL)
  return result
}

export async function createPhoto(input: CreatePhotoInput) {
  const photo = await db.photo.create({ data: input as Prisma.PhotoUncheckedCreateInput })
  await cacheInvalidateLists(VERSION_KEY)
  return photo
}

export async function getPhotoById(id: string) {
  const key = idKey(id)
  const cached = await cacheGet<PhotoRecord>(key)
  if (cached !== null) return cached

  const photo = await db.photo.findFirst({ where: { id, deletedAt: null } })
  if (photo) await cacheSet(key, photo, RECORD_TTL)
  return photo
}

export async function updatePhoto(id: string, input: UpdatePhotoInput) {
  const photo = await db.photo.update({ where: { id }, data: input })
  await invalidate(id)
  return photo
}

export async function publishPhoto(id: string) {
  const photo = await db.photo.findFirstOrThrow({ where: { id, deletedAt: null } })
  if (!photo.altText) throw new AltTextError('alt_text is required before publishing a photo.')
  if (photo.hasStudentFaces && !photo.studentConsentRef) {
    throw new ConsentError('student_consent_ref is required when has_student_faces is true.')
  }
  const updated = await db.photo.update({ where: { id }, data: { isPublished: true } })
  await invalidate(id)
  return updated
}

export async function unpublishPhoto(id: string) {
  const photo = await db.photo.update({ where: { id }, data: { isPublished: false } })
  await invalidate(id)
  return photo
}

export async function deletePhoto(id: string) {
  const photo = await db.photo.update({ where: { id }, data: { deletedAt: new Date() } })
  await invalidate(id)
  return photo
}

export class AltTextError extends Error {
  readonly code = 'ALT_TEXT_REQUIRED'
}
export class ConsentError extends Error {
  readonly code = 'CONSENT_REQUIRED'
}
