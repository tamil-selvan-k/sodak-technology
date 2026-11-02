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
  const stack = await db.stack.create({
    data: {
      ...stackData,
      slug,
      ...(technologies && technologies.length > 0 && {
        technologies: {
          createMany: {
            data: technologies.map((name: string, i: number) => ({ name, displayOrder: i + 1 })),
            skipDuplicates: true,
          },
        },
      }),
    },
    include: WITH_TECHNOLOGIES,
  })
  return stack
}

export async function updateStack(id: string, input: UpdateStackInput) {
  const { technologies, ...stackData } = input
  const newSlug = stackData.name
    ? await makeUniqueSlug(stackData.name, (c) =>
        db.stack.findFirst({ where: { slug: c, id: { not: id } }, select: { id: true } }).then(Boolean),
      )
    : undefined
  return db.$transaction(async (tx) => {
    await tx.stack.update({
      where: { id },
      data: { ...stackData, ...(newSlug && { slug: newSlug }) },
    })
    if (technologies !== undefined) {
      await tx.technology.deleteMany({ where: { stackId: id } })
      if (technologies.length > 0) {
        await tx.technology.createMany({
          data: technologies.map((name: string, i: number) => ({ name, stackId: id, displayOrder: i + 1 })),
          skipDuplicates: true,
        })
      }
    }
    return tx.stack.findUnique({ where: { id }, include: WITH_TECHNOLOGIES })
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
