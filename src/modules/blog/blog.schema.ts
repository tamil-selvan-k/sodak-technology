import { z } from 'zod'

export const createPostSchema = z.object({
  title:           z.string().min(2).max(300),
  coverImageUrl:   z.string().url().optional().or(z.literal('')),
  excerpt:         z.string().max(500).optional(),
  bodyHtml:        z.string().optional(),
  authorId:        z.string().optional(),
  category:        z.string().optional(),
  tags:            z.array(z.string()).default([]),
  metaTitle:       z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  ogImageUrl:      z.string().url().optional().or(z.literal('')),
})

export const updatePostSchema = createPostSchema.partial()

export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
