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
  const { technologies, ...stackData } = input
  const stack = await db.stack.create({ data: { ...stackData, slug }, include: WITH_TECHNOLOGIES })
  if (technologies && technologies.length > 0) {
    await db.technology.createMany({
      data: technologies.map((name: string, i: number) => ({ name, stackId: stack.id, displayOrder: i + 1 })),
      skipDuplicates: true,
    })
    return db.stack.findUnique({ where: { id: stack.id }, include: WITH_TECHNOLOGIES })
  }
  return stack
}

export async function updateStack(id: string, input: UpdateStackInput) {
  const { technologies: _technologies, ...stackData } = input
  return db.stack.update({
    where: { id },
    data: { ...stackData, ...(stackData.name && { slug: await makeUniqueSlug(stackData.name, (c) =>
      db.stack.findFirst({ where: { slug: c, id: { not: id } }, select: { id: true } }).then(Boolean),
    ) }) },
    include: WITH_TECHNOLOGIES,
  })
}

export async function deleteStack(id: string) {
  return db.$transaction([
    db.trainerStack.deleteMany({ where: { stackId: id } }),
    db.programStack.deleteMany({ where: { stackId: id } }),
    db.technology.deleteMany({ where: { stackId: id } }),
    db.stack.delete({ where: { id } }),
  ])
}
