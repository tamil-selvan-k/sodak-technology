import type { JobPost, JobApplication } from '@prisma/client'

export type JobPostWithApplications = JobPost & { applications: JobApplication[] }

export interface CreateJobInput {
  title: string
  department?: string
  location?: string
  employmentType?: string
  experienceMin?: number
  experienceMax?: number
  descriptionHtml?: string
  responsibilities?: string[]
  requirements?: string[]
  isOpen?: boolean
  closesOn?: string
}

export type UpdateJobInput = Partial<CreateJobInput>

export interface JobFilters {
  department?: string
  isOpen?: boolean
  search?: string
  page?: number
  perPage?: number
}
