import { z } from 'zod'

export const updateSettingsSchema = z.object({
  heroHeadline:      z.string().max(200).optional(),
  heroSubhead:       z.string().max(400).optional(),
  heroImageUrl:      z.string().url().optional().or(z.literal('')),
  notificationEmail: z.string().email().optional(),
  stats:             z.record(z.number()).optional(),
  socialLinks:       z.record(z.string()).optional(),
})

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>
