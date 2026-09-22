import { z } from 'zod'

export const createInternshipSchema = z.object({
  companyName:         z.string().min(2).max(200),
  companyLogoUrl:      z.string().url().optional().or(z.literal('')),
  roleTitle:           z.string().min(2).max(200),
  location:            z.string().optional(),
  duration:            z.string().optional(),
  stipendRange:        z.string().optional(),
  stackTags:           z.array(z.string()).default([]),
  description:         z.string().optional(),
  requirements:        z.array(z.string()).default([]),
  applicationDeadline: z.string().datetime().optional(),
})

export const updateInternshipSchema = createInternshipSchema.partial()

export type CreateInternshipInput = z.infer<typeof createInternshipSchema>
export type UpdateInternshipInput = z.infer<typeof updateInternshipSchema>
