import type { Stack, Technology } from '@prisma/client'

export type StackWithTechnologies = Stack & { technologies: Technology[] }

export interface CreateStackInput {
  name: string
  icon?: string
  summary?: string
  colorToken?: string
  displayOrder?: number
  technologies?: string[]
}

export type UpdateStackInput = Partial<CreateStackInput>
