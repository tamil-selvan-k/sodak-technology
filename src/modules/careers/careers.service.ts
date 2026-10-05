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
import type { JobPost } from '@prisma/client'
import type { PaginationMeta } from '@/lib/paginate'
import type { CreateJobInput, UpdateJobInput, JobFilters } from './careers.types'

// ── Cache types ───────────────────────────────────────────────────────────────

type JobListResult = { data: JobPost[]; pagination: PaginationMeta }

// ── Cache helpers ─────────────────────────────────────────────────────────────

const VERSION_KEY = 'careers:v'

function buildListKey(version: number, filters: JobFilters): string {
  const { page = 1, perPage = 20, includeUnpublished, isPublished, isOpen, department, search } = filters
  return (
    `careers:list:v${version}:p${page}:pp${perPage}` +
    `:incl${includeUnpublished ? 1 : 0}` +
    `:pub${isPublished ?? ''}` +
    `:open${isOpen ?? ''}` +
    `:dept${department ?? ''}` +
    `:q${search ?? ''}`
  )
}

function idKey(id: string): string { return `careers:id:${id}` }

async function invalidate(id: string): Promise<void> {
  await Promise.all([
    cacheInvalidateLists(VERSION_KEY),
    cacheDel(idKey(id)),
  ])
}

// ── Service functions ─────────────────────────────────────────────────────────

export async function listJobs(filters: JobFilters = {}): Promise<JobListResult> {
  const { skip, take, page, perPage } = parsePagination(filters)

  const version = await cacheGet<number>(VERSION_KEY).then(v => v ?? 0)
  const key = buildListKey(version, { ...filters, page, perPage })
  const cached = await cacheGet<JobListResult>(key)
  if (cached !== null) return cached

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
  const result: JobListResult = { data: jobs, pagination: buildMeta(total, page, perPage) }
  await cacheSet(key, result, LIST_TTL)
  return result
}

export async function getJobBySlug(slug: string): Promise<JobPost | null> {
  return db.jobPost.findFirst({ where: { slug, isPublished: true, deletedAt: null } })
}

/** Admin-facing lookup — returns regardless of isPublished status. */
export async function getJobById(id: string): Promise<JobPost | null> {
  const key = idKey(id)
  const cached = await cacheGet<JobPost>(key)
  if (cached !== null) return cached

  const job = await db.jobPost.findFirst({ where: { id, deletedAt: null } })
  await cacheSet(key, job, RECORD_TTL)
  return job
}

export async function createJob(input: CreateJobInput) {
  const job = await db.jobPost.create({ data: { ...input, slug: slugify(input.title) } })
  await cacheInvalidateLists(VERSION_KEY)
  return job
}

export async function updateJob(id: string, input: UpdateJobInput) {
  const job = await db.jobPost.update({ where: { id }, data: { ...input, ...(input.title && { slug: slugify(input.title) }) } })
  await invalidate(id)
  return job
}

export async function publishJob(id: string) {
  const job = await db.jobPost.update({ where: { id }, data: { isPublished: true } })
  await invalidate(id)
  return job
}

export async function softDeleteJob(id: string) {
  const job = await db.jobPost.update({ where: { id }, data: { deletedAt: new Date() } })
  await invalidate(id)
  return job
}

export async function createApplication(jobPostId: string, data: { applicantName: string; email: string; phone?: string; yearsExperience?: number; coverNote?: string; resumeUrl?: string }) {
  return db.jobApplication.create({ data: { jobPostId, ...data } })
}
