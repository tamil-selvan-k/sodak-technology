// Rule: only imports from own types/schema, src/lib/*, npm packages.
import { db } from '@/lib/db'
import { slugify } from '@/lib/slugify'
import type { CreateStackInput, UpdateStackInput } from './stacks.types'

const WITH_TECHNOLOGIES = { technologies: { orderBy: { displayOrder: 'asc' as const } } } as const

export async function listStacks() {
  return db.stack.findMany({ include: WITH_TECHNOLOGIES, orderBy: { displayOrder: 'asc' } })
}

export async function getStackBySlug(slug: string) {
  return db.stack.findUnique({ where: { slug }, include: WITH_TECHNOLOGIES })
}

export async function createStack(input: CreateStackInput) {
  return db.stack.create({ data: { ...input, slug: slugify(input.name) }, include: WITH_TECHNOLOGIES })
}

export async function updateStack(id: string, input: UpdateStackInput) {
  return db.stack.update({
    where: { id },
    data: { ...input, ...(input.name && { slug: slugify(input.name) }) },
    include: WITH_TECHNOLOGIES,
  })
}

export async function deleteStack(id: string) {
  return db.stack.delete({ where: { id } })
}
