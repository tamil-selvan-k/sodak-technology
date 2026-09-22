import { z } from 'zod'

export const createJobSchema = z.object({
  title:           z.string().min(2).max(200),
  department:      z.string().optional(),
  location:        z.string().optional(),
  employmentType:  z.string().optional(),
  experienceMin:   z.number().int().min(0).optional(),
  experienceMax:   z.number().int().min(0).optional(),
  descriptionHtml: z.string().optional(),
  responsibilities:z.array(z.string()).default([]),
  requirements:    z.array(z.string()).default([]),
  isOpen:          z.boolean().default(true),
  closesOn:        z.string().datetime().optional(),
})

export const applicationSchema = z.object({
  applicantName:   z.string().min(2).max(120),
  email:           z.string().email(),
  phone:           z.string().optional(),
  yearsExperience: z.number().int().min(0).optional(),
  coverNote:       z.string().max(3000).optional(),
  turnstileToken:  z.string().min(1),
})

export const updateJobSchema = createJobSchema.partial()

export type CreateJobInput   = z.infer<typeof createJobSchema>
export type UpdateJobInput   = z.infer<typeof updateJobSchema>
export type ApplicationInput = z.infer<typeof applicationSchema>
