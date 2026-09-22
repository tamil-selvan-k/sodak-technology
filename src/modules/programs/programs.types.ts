import type { Program, Stack } from '@prisma/client'

export type ProgramWithStacks = Program & { stacks: { stack: Stack }[] }

export interface ProgramFilters {
  trackCode?: string
  stack?: string
  search?: string
  includeUnpublished?: boolean
  page?: number
  perPage?: number
}
