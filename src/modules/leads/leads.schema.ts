import { z } from 'zod'

export const enquirySchema = z.object({
  name:                z.string().min(2).max(120),
  role:                z.enum(['TPO', 'HoD', 'Student', 'Corporate', 'Other']).optional(),
  institutionOrCompany:z.string().max(200).optional(),
  email:               z.string().email(),
  phone:               z.string().min(10).max(15).optional(),
  city:                z.string().max(100).optional(),
  programOfInterest:   z.string().max(200).optional(),
  batchSize:           z.number().int().min(1).optional(),
  preferredTimeline:   z.string().optional(),
  message:             z.string().max(2000).optional(),
  consent:             z.literal(true, { errorMap: () => ({ message: 'Consent is required.' }) }),
  // honeypot — must be empty
  website_url:         z.string().max(0).optional(),
  turnstileToken:      z.string().min(1),
})

export type EnquiryInput = z.infer<typeof enquirySchema>
