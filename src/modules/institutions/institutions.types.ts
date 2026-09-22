import type { Institution, InstitutionEngagement, InstitutionType } from '@prisma/client'

export type InstitutionWithEngagements = Institution & { engagements: InstitutionEngagement[] }

export interface CreateInstitutionInput {
  name: string
  logoUrl?: string
  city?: string
  state?: string
  type?: InstitutionType
  affiliation?: string
  website?: string
  shortDescription?: string
  showOnHome?: boolean
  displayOrder?: number
  logoPermission?: boolean
}

export type UpdateInstitutionInput = Partial<CreateInstitutionInput>

export interface InstitutionFilters {
  type?: string
  search?: string
  showOnHome?: boolean
  includeUnpublished?: boolean
  page?: number
  perPage?: number
}
