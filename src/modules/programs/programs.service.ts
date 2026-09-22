// Rule: only imports from own types/schema, src/lib/*, npm packages.
import { db } from '@/lib/db'
import { slugify } from '@/lib/slugify'
import { parsePagination, buildMeta } from '@/lib/paginate'
import type { ProgramFilters } from './programs.types'
import type { CreateProgramInput, UpdateProgramInput } from './programs.schema'
import type { Prisma } from '@prisma/client'

const WITH_STACKS = { stacks: { include: { stack: true } } } as const

export async function listPrograms(filters: ProgramFilters = {}) {
  const { skip, take, page, perPage } = parsePagination(filters)
  const where = {
    ...(filters.includeUnpublished ? {} : { isPublished: true }),
    deletedAt:   null,
    ...(filters.trackCode && { trackCode: filters.trackCode }),
    ...(filters.search    && { title: { contains: filters.search, mode: 'insensitive' as const } }),
    ...(filters.stack     && { stacks: { some: { stack: { slug: filters.stack } } } }),
  }
  const [programs, total] = await Promise.all([
    db.program.findMany({ where, include: WITH_STACKS, orderBy: { title: 'asc' }, skip, take }),
    db.program.count({ where }),
  ])
  return { data: programs, pagination: buildMeta(total, page, perPage) }
}

export async function getProgramBySlug(slug: string) {
  return db.program.findFirst({ where: { slug, isPublished: true, deletedAt: null }, include: WITH_STACKS })
}

export async function getProgramById(id: string) {
  return db.program.findFirst({ where: { id, deletedAt: null }, include: WITH_STACKS })
}

export async function createProgram(input: CreateProgramInput) {
  const { stackIds, syllabusJson, ...data } = input
  return db.program.create({
    data: {
      ...data,
      slug: slugify(data.title),
      ...(syllabusJson !== undefined && { syllabusJson: syllabusJson as Prisma.InputJsonValue }),
      stacks: stackIds.length ? { create: stackIds.map(stackId => ({ stackId })) } : undefined,
    },
    include: WITH_STACKS,
  })
}

export async function updateProgram(id: string, input: UpdateProgramInput) {
  const { stackIds, syllabusJson, ...data } = input
  return db.program.update({
    where: { id },
    data: {
      ...data,
      ...(data.title    && { slug: slugify(data.title) }),
      ...(syllabusJson !== undefined && { syllabusJson: syllabusJson as Prisma.InputJsonValue }),
      ...(stackIds !== undefined && { stacks: { deleteMany: {}, create: stackIds.map(stackId => ({ stackId })) } }),
    },
    include: WITH_STACKS,
  })
}

export async function publishProgram(id: string) {
  return db.program.update({ where: { id }, data: { isPublished: true }, include: WITH_STACKS })
}

export async function unpublishProgram(id: string) {
  return db.program.update({ where: { id }, data: { isPublished: false }, include: WITH_STACKS })
}

export async function softDeleteProgram(id: string) {
  return db.program.update({ where: { id }, data: { deletedAt: new Date() } })
}
