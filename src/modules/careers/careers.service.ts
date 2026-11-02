// Rule: only imports from own types/schema, src/lib/*, npm packages.
import { db } from '@/lib/db'
import { makeUniqueSlug } from '@/lib/slugify'
import { parsePagination, buildMeta } from '@/lib/paginate'
import type { JobPost } from '@prisma/client'
import type { PaginationMeta } from '@/lib/paginate'
import type { CreateJobInput, UpdateJobInput, JobFilters } from './careers.types'

// ── Service functions ─────────────────────────────────────────────────────────

export async function listJobs(filters: JobFilters = {}): Promise<{ data: JobPost[]; pagination: PaginationMeta }> {
  const { skip, take, page, perPage } = parsePagination(filters)

  const where = {
    ...(filters.includeUnpublished
      ? filters.isPublished !== undefined ? { isPublished: filters.isPublished } : {}
      : { isPublished: true }),
    deletedAt:   null,
    ...(filters.isOpen     !== undefined && { isOpen: filters.isOpen }),
    ...(filters.department && { department: filters.department }),
    ...(filters.search     && { title: { contains: filters.search, mode: 'insensitive' as const } }),
  }
  const [jobs, total] = await Promise.all([
    db.jobPost.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    db.jobPost.count({ where }),
  ])
  return { data: jobs, pagination: buildMeta(total, page, perPage) }
}

export async function getJobBySlug(slug: string): Promise<JobPost | null> {
  return db.jobPost.findFirst({ where: { slug, isPublished: true, deletedAt: null } })
}

/** Admin-facing lookup — returns regardless of isPublished status. */
export async function getJobById(id: string): Promise<JobPost | null> {
  return db.jobPost.findFirst({ where: { id, deletedAt: null } })
}

export async function createJob(input: CreateJobInput) {
  const slug = await makeUniqueSlug(input.title, (c) =>
    db.jobPost.findFirst({ where: { slug: c, deletedAt: null }, select: { id: true } }).then(Boolean),
  )
  return db.jobPost.create({ data: { ...input, slug } })
}

export async function updateJob(id: string, input: UpdateJobInput) {
  return db.jobPost.update({ where: { id }, data: { ...input, ...(input.title && { slug: await makeUniqueSlug(input.title, (c) =>
    db.jobPost.findFirst({ where: { slug: c, id: { not: id }, deletedAt: null }, select: { id: true } }).then(Boolean),
  ) }) } })
}

export async function publishJob(id: string) {
  return db.jobPost.update({ where: { id }, data: { isPublished: true } })
}

export async function unpublishJob(id: string) {
  return db.jobPost.update({ where: { id }, data: { isPublished: false } })
}

export async function softDeleteJob(id: string) {
  return db.jobPost.update({ where: { id }, data: { deletedAt: new Date() } })
}

export async function createApplication(jobPostId: string, data: { applicantName: string; email: string; phone?: string; yearsExperience?: number; coverNote?: string; resumeUrl?: string }) {
  return db.jobApplication.create({ data: { jobPostId, ...data } })
}
