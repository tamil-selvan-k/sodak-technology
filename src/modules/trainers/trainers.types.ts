import type { Trainer, Stack } from '@prisma/client'

export type TrainerWithStacks = Trainer & { stacks: { stack: Stack }[] }

export interface CreateTrainerInput {
  name: string
  designation?: string
  currentCompany?: string
  bioHtml?: string
  photoUrl?: string
  yearsExperience?: number
  linkedinUrl?: string
  githubUrl?: string
  expertiseTags?: string[]
  isMentor?: boolean
  isFeatured?: boolean
  consentOnFile?: boolean
  displayOrder?: number
  mentorBio?: string
  sessionTypes?: string[]
  availabilityStatus?: string
  bookingUrl?: string
  stackIds: string[]
}

export interface UpdateTrainerInput extends Partial<Omit<CreateTrainerInput, 'stackIds'>> {
  stackIds?: string[]
}

export interface TrainerListItem {
  id: string
  name: string
  slug: string
  photoUrl: string | null
  currentCompany: string | null
  designation: string | null
  expertiseTags: string[]
  isFeatured: boolean
  isMentor: boolean
  stacks: string[]
}

export interface TrainerDetail extends TrainerListItem {
  bioHtml: string | null
  yearsExperience: number | null
  linkedinUrl: string | null
  githubUrl: string | null
  availabilityStatus: string | null
  bookingUrl: string | null
}

export interface TrainerFilters {
  stack?: string
  company?: string
  search?: string
  isMentor?: boolean
  isFeatured?: boolean
  isPublished?: boolean
  includeUnpublished?: boolean
  page?: number
  perPage?: number
}
