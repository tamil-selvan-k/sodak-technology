import { z } from 'zod'

export const createProgramSchema = z.object({
  title:          z.string().min(2).max(200),
  trackCode:      z.string().length(1).optional(),
  summary:        z.string().max(500).optional(),
  descriptionHtml:z.string().optional(),
  duration:       z.string().optional(),
  deliveryMode:   z.string().optional(),
  targetAudience: z.string().optional(),
  prerequisites:  z.string().optional(),
  syllabusJson:   z.unknown().optional(),
  outcomes:       z.array(z.string()).default([]),
  isFeatured:     z.boolean().default(false),
  stackIds:       z.array(z.string()).default([]),
})

export const updateProgramSchema = createProgramSchema.partial()

export type CreateProgramInput = z.infer<typeof createProgramSchema>
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>
