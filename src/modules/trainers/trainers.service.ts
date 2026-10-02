// Rule: this file may only import from its own types/schema, src/lib/*, and npm packages.
// Never import from another module's service.

import { db } from '@/lib/db'
import { slugify } from '@/lib/slugify'
import { parsePagination, buildMeta } from '@/lib/paginate'
import { emit } from '@/lib/events'
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
import type { CreateTrainerInput, UpdateTrainerInput, TrainerFilters } from './trainers.types'

const WITH_STACKS = { stacks: { include: { stack: true } } } as const

// ── Cache types ───────────────────────────────────────────────────────────────

type TrainerRecord = Prisma.TrainerGetPayload<{ include: typeof WITH_STACKS }>
type TrainerListResult = { data: TrainerRecord[]; pagination: PaginationMeta }

// ── Cache helpers ─────────────────────────────────────────────────────────────

const VERSION_KEY = 'trainers:v'

function buildListKey(version: number, filters: TrainerFilters): string {
  const {
    page = 1, perPage = 20,
    includeUnpublished, isPublished,
    isMentor, isFeatured,
    company, search, stack,
  } = filters
  return (
    `trainers:list:v${version}:p${page}:pp${perPage}` +
    `:incl${includeUnpublished ? 1 : 0}` +
    `:pub${isPublished ?? ''}` +
    `:m${isMentor ?? ''}` +
    `:f${isFeatured ?? ''}` +
    `:co${company ?? ''}` +
    `:q${search ?? ''}` +
    `:st${stack ?? ''}`
  )
}

function idKey(id: string): string    { return `trainers:id:${id}` }
function slugCacheKey(slug: string): string { return `trainers:slug:${slug}` }

/** Bump list version + delete specific record keys. */
async function invalidate(id: string, slug: string): Promise<void> {
  await Promise.all([
    cacheInvalidateLists(VERSION_KEY),
    cacheDel(idKey(id), slugCacheKey(slug)),
  ])
}

// ── Service functions ─────────────────────────────────────────────────────────

export async function listTrainers(filters: TrainerFilters = {}): Promise<TrainerListResult> {
  const { skip, take, page, perPage } = parsePagination(filters)

  const version = await cacheGet<number>(VERSION_KEY).then(v => v ?? 0)
  const key = buildListKey(version, { ...filters, page, perPage })
  const cached = await cacheGet<TrainerListResult>(key)
  if (cached !== null) return cached

  const where = {
    ...(filters.includeUnpublished ? {} : { isPublished: filters.isPublished ?? true }),
    deletedAt:   null,
    ...(filters.isMentor  !== undefined && { isMentor:  filters.isMentor }),
    ...(filters.isFeatured !== undefined && { isFeatured: filters.isFeatured }),
    ...(filters.company   && { currentCompany: { contains: filters.company, mode: 'insensitive' as const } }),
    ...(filters.search    && { name:           { contains: filters.search,  mode: 'insensitive' as const } }),
    ...(filters.stack     && { stacks: { some: { stack: { slug: filters.stack } } } }),
  }

  const [trainers, total] = await Promise.all([
    db.trainer.findMany({ where, include: WITH_STACKS, orderBy: { displayOrder: 'asc' }, skip, take }),
    db.trainer.count({ where }),
  ])

  const result: TrainerListResult = { data: trainers, pagination: buildMeta(total, page, perPage) }
  await cacheSet(key, result, LIST_TTL)
  return result
}

export async function getTrainerBySlug(slug: string): Promise<TrainerRecord | null> {
  const key = slugCacheKey(slug)
  const cached = await cacheGet<TrainerRecord>(key)
  if (cached !== null) return cached

  const trainer = await db.trainer.findFirst({
    where: { slug, isPublished: true, deletedAt: null },
    include: WITH_STACKS,
  })
  await cacheSet(key, trainer, RECORD_TTL)
  return trainer
}

export async function getTrainerById(id: string): Promise<TrainerRecord | null> {
  const key = idKey(id)
  const cached = await cacheGet<TrainerRecord>(key)
  if (cached !== null) return cached

  const trainer = await db.trainer.findFirst({ where: { id, deletedAt: null }, include: WITH_STACKS })
  await cacheSet(key, trainer, RECORD_TTL)
  return trainer
}

export async function createTrainer(input: CreateTrainerInput) {
  const { stackIds, ...data } = input
  const slug = slugify(data.name)

  const trainer = await db.trainer.create({
    data: {
      ...data,
      slug,
      stacks: stackIds.length
        ? { create: stackIds.map(stackId => ({ stackId })) }
        : undefined,
    },
    include: WITH_STACKS,
  })

  // Bump list version — new trainer has no record keys yet.
  await cacheInvalidateLists(VERSION_KEY)
  return trainer
}

export async function updateTrainer(id: string, input: UpdateTrainerInput) {
  const { stackIds, ...data } = input

  const trainer = await db.trainer.update({
    where: { id, deletedAt: null },
    data: {
      ...data,
      ...(data.name && { slug: slugify(data.name) }),
      ...(stackIds !== undefined && {
        stacks: {
          deleteMany: {},
          create: stackIds.map(stackId => ({ stackId })),
        },
      }),
    },
    include: WITH_STACKS,
  })

  // Delete new slug key + id key; bump list version.
  // If name changed, old slug key becomes stale until its 300 s TTL expires.
  await invalidate(id, trainer.slug)
  return trainer
}

export async function publishTrainer(id: string) {
  const trainer = await db.trainer.findFirstOrThrow({ where: { id, deletedAt: null } })

  if (!trainer.consentOnFile) {
    throw new ConsentError('Trainer consent_on_file must be true before publishing.')
  }

  const updated = await db.trainer.update({
    where: { id },
    data: { isPublished: true },
    include: WITH_STACKS,
  })

  await invalidate(id, updated.slug)
  emit('trainer.published', { trainerId: id })
  return updated
}

export async function unpublishTrainer(id: string) {
  const updated = await db.trainer.update({ where: { id }, data: { isPublished: false }, include: WITH_STACKS })
  await invalidate(id, updated.slug)
  return updated
}

export async function softDeleteTrainer(id: string) {
  const updated = await db.trainer.update({ where: { id }, data: { deletedAt: new Date() } })
  await Promise.all([
    cacheInvalidateLists(VERSION_KEY),
    cacheDel(idKey(id), slugCacheKey(updated.slug)),
  ])
  return updated
}

export async function setConsent(id: string, consentOnFile: boolean) {
  const updated = await db.trainer.update({ where: { id }, data: { consentOnFile } })
  await Promise.all([
    cacheInvalidateLists(VERSION_KEY),
    cacheDel(idKey(id), slugCacheKey(updated.slug)),
  ])
  return updated
}

// ── Domain error ─────────────────────────────────────────────────────────────

export class ConsentError extends Error {
  readonly code = 'CONSENT_REQUIRED'
  constructor(message: string) {
    super(message)
    this.name = 'ConsentError'
  }
}
