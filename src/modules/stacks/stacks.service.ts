// Rule: only imports from own types/schema, src/lib/*, npm packages.
import { db } from '@/lib/db'
import { slugify, makeUniqueSlug } from '@/lib/slugify'
import type { CreateStackInput, UpdateStackInput } from './stacks.types'

const WITH_TECHNOLOGIES = { technologies: { orderBy: { displayOrder: 'asc' as const } } } as const

export async function listStacks() {
  return db.stack.findMany({ include: WITH_TECHNOLOGIES, orderBy: { displayOrder: 'asc' } })
}

export async function getStackBySlug(slug: string) {
  return db.stack.findUnique({ where: { slug }, include: WITH_TECHNOLOGIES })
}

export async function createStack(input: CreateStackInput) {
  const slug = await makeUniqueSlug(input.name, (c) =>
    db.stack.findFirst({ where: { slug: c }, select: { id: true } }).then(Boolean),
  )
  return db.stack.create({ data: { ...input, slug }, include: WITH_TECHNOLOGIES })
}

export async function updateStack(id: string, input: UpdateStackInput) {
  return db.stack.update({
    where: { id },
    data: { ...input, ...(input.name && { slug: await makeUniqueSlug(input.name, (c) =>
      db.stack.findFirst({ where: { slug: c, id: { not: id } }, select: { id: true } }).then(Boolean),
    ) }) },
    include: WITH_TECHNOLOGIES,
  })
}

export async function deleteStack(id: string) {
  return db.stack.delete({ where: { id } })
}
