import { z } from 'zod'

export const createTrainerSchema = z.object({
  name:            z.string().min(2).max(120),
  currentCompany:  z.string().max(120).optional(),
  designation:     z.string().max(120).optional(),
  expertiseTags:   z.array(z.string()).default([]),
  bioHtml:         z.string().optional(),
  yearsExperience: z.number().int().min(0).max(60).optional(),
  linkedinUrl:     z.string().url().optional().or(z.literal('')),
  githubUrl:       z.string().url().optional().or(z.literal('')),
  displayOrder:    z.number().int().default(0),
  isFeatured:      z.boolean().default(false),
  isMentor:        z.boolean().default(false),
  stackIds:        z.array(z.string()).default([]),
  // mentor extras
  mentorBio:          z.string().optional(),
  sessionTypes:       z.array(z.string()).default([]),
  availabilityStatus: z.string().optional(),
  bookingUrl:         z.string().url().optional().or(z.literal('')),
})

export const updateTrainerSchema = createTrainerSchema.partial()

export const consentSchema = z.object({
  consentOnFile: z.literal(true, {
    errorMap: () => ({ message: 'Trainer consent must be on file before publishing.' }),
  }),
})

export type CreateTrainerInput = z.infer<typeof createTrainerSchema>
export type UpdateTrainerInput = z.infer<typeof updateTrainerSchema>
