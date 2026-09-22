import type { Internship } from '@prisma/client'

export type { Internship }

export interface CreateInternshipInput {
  companyName: string
  companyLogoUrl?: string
  roleTitle: string
  location?: string
  duration?: string
  stipendRange?: string
  stackTags?: string[]
  description?: string
  requirements?: string[]
  applicationDeadline?: string
}

export type UpdateInternshipInput = Partial<CreateInternshipInput>

export interface InternshipFilters {
  stack?: string
  search?: string
  page?: number
  perPage?: number
}
