import { kv } from '@/lib/redis'

export interface UploadProgress {
  uploaderId: string
  done:       number
  total:      number
  errors:     string[]
}

/** Initialise a new upload job, binding it to the user who created it. */
export async function createJob(jobId: string, uploaderId: string): Promise<void> {
  await kv.set(`upload:progress:${jobId}`, { uploaderId, done: 0, total: 0, errors: [] } satisfies UploadProgress, 120)
}

/** Update progress counters for an existing job. uploaderId must match the value set by createJob. */
export async function setProgress(jobId: string, value: UploadProgress): Promise<void> {
  await kv.set(`upload:progress:${jobId}`, value, 120)
}
