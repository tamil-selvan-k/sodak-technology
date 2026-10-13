import type { Course } from '@prisma/client'

export type CourseRecord = Course

export interface CreateCourseInput {
  title: string
  slug: string
  category?: string
  level?: 'Beginner' | 'Intermediate' | 'Advanced'
  duration?: string
  coverImageUrl?: string
  descriptionHtml?: string
  outcomes?: string[]
  isFeatured?: boolean
  isPublished?: boolean
  displayOrder?: number
}

export interface UpdateCourseInput {
  title?: string
  category?: string | null
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | null
  duration?: string | null
  coverImageUrl?: string | null
  descriptionHtml?: string | null
  outcomes?: string[]
  isFeatured?: boolean
  displayOrder?: number
}

export interface CourseFilters {
  isPublished?: boolean
  includeUnpublished?: boolean
  category?: string
  search?: string
  page?: number
  perPage?: number
}
