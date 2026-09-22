// Rule: this file may only import from its own types/schema, src/lib/*, and npm packages.
// Never import from another module's service.

import { db } from '@/lib/db'
import { slugify } from '@/lib/slugify'
import { parsePagination, buildMeta } from '@/lib/paginate'
import { emit } from '@/lib/events'
import type { CreateTrainerInput, UpdateTrainerInput, TrainerFilters } from './trainers.types'

const WITH_STACKS = { stacks: { include: { stack: true } } } as const

export async function listTrainers(filters: TrainerFilters = {}) {
  const { skip, take, page, perPage } = parsePagination(filters)

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

  return { data: trainers, pagination: buildMeta(total, page, perPage) }
}

export async function getTrainerBySlug(slug: string) {
  return db.trainer.findFirst({
    where: { slug, isPublished: true, deletedAt: null },
    include: WITH_STACKS,
  })
}

export async function getTrainerById(id: string) {
  return db.trainer.findFirst({ where: { id, deletedAt: null }, include: WITH_STACKS })
}

export async function createTrainer(input: CreateTrainerInput) {
  const { stackIds, ...data } = input
  const slug = slugify(data.name)

  return db.trainer.create({
    data: {
      ...data,
      slug,
      stacks: stackIds.length
        ? { create: stackIds.map(stackId => ({ stackId })) }
        : undefined,
    },
    include: WITH_STACKS,
  })
}

export async function updateTrainer(id: string, input: UpdateTrainerInput) {
  const { stackIds, ...data } = input

  return db.trainer.update({
    where: { id },
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
}

export async function publishTrainer(id: string) {
  const trainer = await db.trainer.findUniqueOrThrow({ where: { id } })

  if (!trainer.consentOnFile) {
    throw new ConsentError('Trainer consent_on_file must be true before publishing.')
  }

  const updated = await db.trainer.update({
    where: { id },
    data: { isPublished: true },
    include: WITH_STACKS,
  })

  emit('trainer.published', { trainerId: id })
  return updated
}

export async function unpublishTrainer(id: string) {
  return db.trainer.update({ where: { id }, data: { isPublished: false }, include: WITH_STACKS })
}

export async function softDeleteTrainer(id: string) {
  return db.trainer.update({ where: { id }, data: { deletedAt: new Date() } })
}

export async function setConsent(id: string, consentOnFile: boolean) {
  return db.trainer.update({ where: { id }, data: { consentOnFile } })
}

// ── Domain error ─────────────────────────────────────────────────────────────

export class ConsentError extends Error {
  readonly code = 'CONSENT_REQUIRED'
  constructor(message: string) {
    super(message)
    this.name = 'ConsentError'
  }
}
