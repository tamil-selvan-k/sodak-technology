// Rule: only imports from own types/schema, src/lib/*, npm packages.
import { db } from '@/lib/db'
import { makeUniqueSlug } from '@/lib/slugify'
import { parsePagination, buildMeta } from '@/lib/paginate'
import type { Prisma } from '@prisma/client'
import type { PaginationMeta } from '@/lib/paginate'
import type { CreateCourseInput, UpdateCourseInput, CourseFilters } from './courses.types'

type CourseRecord = Prisma.CourseGetPayload<Record<string, never>>

// ── Service functions ─────────────────────────────────────────────────────────

export async function listCourses(filters: CourseFilters = {}): Promise<{ data: CourseRecord[]; pagination: PaginationMeta }> {
  const { skip, take, page, perPage } = parsePagination(filters)

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
  return { data: courses, pagination: buildMeta(total, page, perPage) }
}

export async function getCourseBySlug(slug: string): Promise<CourseRecord | null> {
  return db.course.findFirst({ where: { slug, isPublished: true, deletedAt: null } })
}

/** Admin-facing lookup — returns regardless of isPublished status. */
export async function getCourseById(id: string): Promise<CourseRecord | null> {
  return db.course.findFirst({ where: { id, deletedAt: null } })
}

export async function createCourse(input: CreateCourseInput) {
  return db.course.create({
    data: {
      ...input,
      slug: input.slug ?? await makeUniqueSlug(input.title, (c) =>
        db.course.findFirst({ where: { slug: c, deletedAt: null }, select: { id: true } }).then(Boolean),
      ),
      outcomes: input.outcomes ?? [],
    },
  })
}

export async function updateCourse(id: string, input: UpdateCourseInput) {
  return db.course.update({ where: { id }, data: input })
}

export async function publishCourse(id: string) {
  return db.course.update({ where: { id }, data: { isPublished: true } })
}

export async function unpublishCourse(id: string) {
  return db.course.update({ where: { id }, data: { isPublished: false } })
}

export async function deleteCourse(id: string) {
  return db.course.update({ where: { id }, data: { deletedAt: new Date() } })
}
