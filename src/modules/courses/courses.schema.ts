import { z } from 'zod'

export const createCourseSchema = z.object({
  title:           z.string().min(1),
  slug:            z.string().min(1).regex(/^[a-z0-9-]+$/),
  category:        z.string().optional(),
  level:           z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  duration:        z.string().optional(),
  coverImageUrl:   z.string().url().optional().or(z.literal('')),
  descriptionHtml: z.string().optional(),
  outcomes:        z.array(z.string()).optional(),
  isFeatured:      z.boolean().optional(),
  isPublished:     z.boolean().optional(),
  displayOrder:    z.number().int().optional(),
})

export const updateCourseSchema = createCourseSchema.partial()

export type CreateCourseInput = z.infer<typeof createCourseSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>
