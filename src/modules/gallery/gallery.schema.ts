import { z } from 'zod'

export const createPhotoSchema = z.object({
  r2Key:             z.string().min(1),
  url:               z.string().url(),
  altText:           z.string().max(500).optional(),
  caption:           z.string().max(500).optional(),
  institutionId:     z.string().optional(),
  tags:              z.array(z.string()).optional(),
  dateTaken:         z.string().datetime().optional(),
  hasStudentFaces:   z.boolean().default(false),
  studentConsentRef: z.string().optional(),
  displayOrder:      z.number().int().default(0),
})

export type CreatePhotoInput = z.infer<typeof createPhotoSchema>

export const updatePhotoSchema = z.object({
  title:            z.string().max(200).optional(),
  altText:          z.string().max(500).optional(),
  caption:          z.string().max(500).optional(),
  institutionId:    z.string().optional().nullable(),
  tags:             z.array(z.string()).optional(),
  displayOrder:     z.number().int().optional(),
  hasStudentFaces:  z.boolean().optional(),
  studentConsentRef:z.string().optional().nullable(),
})

export type UpdatePhotoInput = z.infer<typeof updatePhotoSchema>
