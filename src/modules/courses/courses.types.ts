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

export type UpdateCourseInput = Partial<CreateCourseInput>

export interface CourseFilters {
  isPublished?: boolean
  includeUnpublished?: boolean
  category?: string
  search?: string
  page?: number
  perPage?: number
}
