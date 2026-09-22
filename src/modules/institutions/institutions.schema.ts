import { z } from 'zod'
import { InstitutionType } from '@prisma/client'

export const createInstitutionSchema = z.object({
  name:             z.string().min(2).max(200),
  logoUrl:          z.string().url().optional().or(z.literal('')),
  city:             z.string().optional(),
  state:            z.string().optional(),
  type:             z.nativeEnum(InstitutionType).optional(),
  affiliation:      z.string().optional(),
  website:          z.string().url().optional().or(z.literal('')),
  shortDescription: z.string().max(500).optional(),
  showOnHome:       z.boolean().default(false),
  displayOrder:     z.number().int().default(0),
  logoPermission:   z.boolean().default(false),
})

export const updateInstitutionSchema = createInstitutionSchema.partial()

export type CreateInstitutionInput = z.infer<typeof createInstitutionSchema>
export type UpdateInstitutionInput = z.infer<typeof updateInstitutionSchema>
