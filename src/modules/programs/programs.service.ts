// Rule: only imports from own types/schema, src/lib/*, npm packages.
import { db } from '@/lib/db'
import { makeUniqueSlug } from '@/lib/slugify'
import { parsePagination, buildMeta } from '@/lib/paginate'
import type { Prisma } from '@prisma/client'
import type { PaginationMeta } from '@/lib/paginate'
import type { ProgramFilters } from './programs.types'
import type { CreateProgramInput, UpdateProgramInput } from './programs.schema'

const WITH_STACKS = { stacks: { include: { stack: true } } } as const

type ProgramRecord = Prisma.ProgramGetPayload<{ include: typeof WITH_STACKS }>

// ── Service functions ─────────────────────────────────────────────────────────

export async function listPrograms(filters: ProgramFilters = {}): Promise<{ data: ProgramRecord[]; pagination: PaginationMeta }> {
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

export async function getProgramBySlug(slug: string): Promise<ProgramRecord | null> {
  return db.program.findFirst({ where: { slug, isPublished: true, deletedAt: null }, include: WITH_STACKS })
}

export async function getProgramById(id: string): Promise<ProgramRecord | null> {
  return db.program.findFirst({ where: { id, deletedAt: null }, include: WITH_STACKS })
}

export async function createProgram(input: CreateProgramInput) {
  const { stackIds, syllabusJson, ...data } = input
  return db.program.create({
    data: {
      ...data,
      slug: await makeUniqueSlug(data.title, (c) =>
        db.program.findFirst({ where: { slug: c, deletedAt: null }, select: { id: true } }).then(Boolean),
      ),
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
      ...(data.title && { slug: await makeUniqueSlug(data.title, (c) =>
        db.program.findFirst({ where: { slug: c, id: { not: id }, deletedAt: null }, select: { id: true } }).then(Boolean),
      ) }),
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
