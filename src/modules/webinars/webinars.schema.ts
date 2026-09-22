import { z } from 'zod'

export const createWebinarSchema = z.object({
  title:           z.string().min(2).max(200),
  description:     z.string().optional(),
  presenterId:     z.string().optional(),
  scheduledAt:     z.string().datetime().optional(),
  durationMinutes: z.number().int().min(1).optional(),
  platform:        z.enum(['Zoom', 'Meet', 'Teams']).optional(),
  registrationUrl: z.string().url().optional().or(z.literal('')),
})

export const updateWebinarSchema = createWebinarSchema.partial()

export type CreateWebinarInput = z.infer<typeof createWebinarSchema>
export type UpdateWebinarInput = z.infer<typeof updateWebinarSchema>
