import type { Photo } from '@prisma/client'

export type { Photo }

export interface GalleryFilters {
  institutionId?: string
  year?: number
  tag?: string
  includeUnpublished?: boolean
  page?: number
  perPage?: number
}
