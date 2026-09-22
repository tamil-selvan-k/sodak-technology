import { z } from 'zod'

export const createStackSchema = z.object({
  name:        z.string().min(2).max(100),
  icon:        z.string().optional(),
  summary:     z.string().max(500).optional(),
  colorToken:  z.string().optional(),
  displayOrder:z.number().int().default(0),
})

export const updateStackSchema = createStackSchema.partial()

export type CreateStackInput = z.infer<typeof createStackSchema>
export type UpdateStackInput = z.infer<typeof updateStackSchema>
