import type { Stack, Technology } from '@prisma/client'

export type StackWithTechnologies = Stack & { technologies: Technology[] }

export interface CreateStackInput {
  name: string
  icon?: string
  summary?: string
  colorToken?: string
  displayOrder?: number
}

export type UpdateStackInput = Partial<CreateStackInput>
