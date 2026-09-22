// Rule: only imports from own types/schema, src/lib/*, npm packages.
import { db } from '@/lib/db'
import { slugify } from '@/lib/slugify'
import { parsePagination, buildMeta } from '@/lib/paginate'
import type { CreateJobInput, UpdateJobInput, JobFilters } from './careers.types'

export async function listJobs(filters: JobFilters = {}) {
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

export async function getJobBySlug(slug: string) {
  return db.jobPost.findFirst({ where: { slug, isPublished: true, deletedAt: null } })
}

export async function createJob(input: CreateJobInput) {
  return db.jobPost.create({ data: { ...input, slug: slugify(input.title) } })
}

export async function updateJob(id: string, input: UpdateJobInput) {
  return db.jobPost.update({ where: { id }, data: { ...input, ...(input.title && { slug: slugify(input.title) }) } })
}

export async function publishJob(id: string) {
  return db.jobPost.update({ where: { id }, data: { isPublished: true } })
}

export async function softDeleteJob(id: string) {
  return db.jobPost.update({ where: { id }, data: { deletedAt: new Date() } })
}

export async function createApplication(jobPostId: string, data: { applicantName: string; email: string; phone?: string; yearsExperience?: number; coverNote?: string; resumeUrl?: string }) {
  return db.jobApplication.create({ data: { jobPostId, ...data } })
}
