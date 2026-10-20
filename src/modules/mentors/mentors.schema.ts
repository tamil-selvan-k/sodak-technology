import { z } from 'zod'

export const createMentorSchema = z.object({
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
  consentOnFile:   z.boolean().default(false),
  photoUrl:        z.string().url().optional().or(z.literal('')),
  stackIds:        z.array(z.string()).default([]),
  mentorBio:          z.string().optional(),
  sessionTypes:       z.array(z.string()).default([]),
  availabilityStatus: z.string().optional(),
  bookingUrl:         z.string().url().optional().or(z.literal('')),
})

export const updateMentorSchema = createMentorSchema.partial()

export type CreateMentorInput = z.infer<typeof createMentorSchema>
export type UpdateMentorInput = z.infer<typeof updateMentorSchema>
