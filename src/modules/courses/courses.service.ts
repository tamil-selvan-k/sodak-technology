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
import type { CreateCourseInput, UpdateCourseInput, CourseFilters } from './courses.types'

// ── Cache types ───────────────────────────────────────────────────────────────

type CourseRecord     = Prisma.CourseGetPayload<Record<string, never>>
type CourseListResult = { data: CourseRecord[]; pagination: PaginationMeta }

// ── Cache helpers ─────────────────────────────────────────────────────────────

const VERSION_KEY = 'courses:v'

function buildListKey(version: number, filters: CourseFilters): string {
  const { page = 1, perPage = 20, includeUnpublished, category, search } = filters
  return (
    `courses:list:v${version}:p${page}:pp${perPage}` +
    `:incl${includeUnpublished ? 1 : 0}` +
    `:cat${category ?? ''}` +
    `:q${search ?? ''}`
  )
}

function idKey(id: string): string   { return `courses:id:${id}` }
function slugKey(slug: string): string { return `courses:slug:${slug}` }

async function invalidate(id: string, slug?: string): Promise<void> {
  await Promise.all([
    cacheInvalidateLists(VERSION_KEY),
    cacheDel(idKey(id)),
    ...(slug ? [cacheDel(slugKey(slug))] : []),
  ])
}

// ── Service functions ─────────────────────────────────────────────────────────

export async function listCourses(filters: CourseFilters = {}): Promise<CourseListResult> {
  const { skip, take, page, perPage } = parsePagination(filters)

  const version = await cacheGet<number>(VERSION_KEY).then(v => v ?? 0)
  const key = buildListKey(version, { ...filters, page, perPage })
  const cached = await cacheGet<CourseListResult>(key)
  if (cached !== null) return cached

  const where: Prisma.CourseWhereInput = {
    deletedAt: null,
    ...(filters.includeUnpublished ? {} : { isPublished: true }),
    ...(filters.category && { category: filters.category }),
    ...(filters.search && {
      OR: [
        { title:    { contains: filters.search, mode: 'insensitive' } },
        { category: { contains: filters.search, mode: 'insensitive' } },
      ],
    }),
  }

  const [courses, total] = await Promise.all([
    db.course.findMany({ where, orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }], skip, take }),
    db.course.count({ where }),
  ])
  const result: CourseListResult = { data: courses, pagination: buildMeta(total, page, perPage) }
  await cacheSet(key, result, LIST_TTL)
  return result
}

export async function getCourseBySlug(slug: string): Promise<CourseRecord | null> {
  const key = slugKey(slug)
  const cached = await cacheGet<CourseRecord>(key)
  if (cached !== null) return cached

  const course = await db.course.findFirst({ where: { slug, isPublished: true, deletedAt: null } })
  if (course) await cacheSet(key, course, RECORD_TTL)
  return course
}

/** Admin-facing lookup — returns regardless of isPublished status. */
export async function getCourseById(id: string): Promise<CourseRecord | null> {
  const key = idKey(id)
  const cached = await cacheGet<CourseRecord>(key)
  if (cached !== null) return cached

  const course = await db.course.findFirst({ where: { id, deletedAt: null } })
  await cacheSet(key, course, RECORD_TTL)
  return course
}

export async function createCourse(input: CreateCourseInput) {
  const course = await db.course.create({
    data: {
      ...input,
      slug:     input.slug ?? slugify(input.title),
      outcomes: input.outcomes ?? [],
    },
  })
  await cacheInvalidateLists(VERSION_KEY)
  return course
}

export async function updateCourse(id: string, input: UpdateCourseInput) {
  const course = await db.course.update({ where: { id }, data: input })
  await invalidate(id, course.slug)
  return course
}

export async function publishCourse(id: string) {
  const course = await db.course.update({ where: { id }, data: { isPublished: true } })
  await invalidate(id, course.slug)
  return course
}

export async function unpublishCourse(id: string) {
  const course = await db.course.update({ where: { id }, data: { isPublished: false } })
  await invalidate(id, course.slug)
  return course
}

export async function deleteCourse(id: string) {
  const course = await db.course.update({ where: { id }, data: { deletedAt: new Date() } })
  await invalidate(id, course.slug)
  return course
}
