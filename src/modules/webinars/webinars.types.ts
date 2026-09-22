import type { Webinar, Trainer } from '@prisma/client'

export type WebinarWithPresenter = Webinar & { presenter: Trainer | null }

export interface CreateWebinarInput {
  title: string
  description?: string
  presenterId?: string
  scheduledAt?: string
  durationMinutes?: number
  platform?: string
  registrationUrl?: string
}

export type UpdateWebinarInput = Partial<CreateWebinarInput>

export interface WebinarFilters {
  upcoming?: boolean
  includeUnpublished?: boolean
  page?: number
  perPage?: number
}
