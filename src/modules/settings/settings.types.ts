import type { SiteSetting } from '@prisma/client'

export type { SiteSetting }

export interface UpdateSettingsInput {
  heroHeadline?: string
  heroSubhead?: string
  heroImageUrl?: string
  notificationEmail?: string
  stats?: Record<string, number>
  socialLinks?: Record<string, string>
}

export interface SiteStats {
  stacks: number
  technologies: number
  seats: number
  questions: number
}

export interface SocialLinks {
  linkedin?: string
  twitter?: string
  youtube?: string
  whatsapp?: string
}
