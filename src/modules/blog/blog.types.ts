import type { BlogPost, Trainer, BlogStatus } from '@prisma/client'

export type BlogPostWithAuthor = BlogPost & { author: Trainer | null }

export interface CreatePostInput {
  title: string
  excerpt?: string
  bodyHtml?: string
  coverImageUrl?: string
  authorId?: string
  category?: string
  tags?: string[]
  readingTimeMinutes?: number
  metaTitle?: string
  metaDescription?: string
  ogImageUrl?: string
}

export interface UpdatePostInput extends Partial<CreatePostInput> {
  status?: BlogStatus
  publishedAt?: Date
}

export interface BlogFilters {
  category?: string
  tag?: string
  authorId?: string
  search?: string
  status?: string
  includeUnpublished?: boolean
  page?: number
  perPage?: number
}
