import type { Lead, LeadNote, User, Prisma } from '@prisma/client'
import type { LeadStatus } from '@prisma/client'

export type LeadWithNotes = Lead & { notes: (LeadNote & { author: Pick<User, 'id' | 'name'> })[] }

export interface LeadFilters {
  status?: LeadStatus
  source?: string
  from?: Date
  to?: Date
  page?: number
  perPage?: number
}

export interface CreateLeadInput {
  name: string
  role?: string
  institutionOrCompany?: string
  email: string
  phone?: string
  city?: string
  programOfInterest?: string
  batchSize?: number
  preferredTimeline?: string
  message?: string
  source?: string
  meta?: Prisma.InputJsonValue
}
