import { kv } from '@/lib/redis'

export interface UploadProgress {
  done:   number
  total:  number
  errors: string[]
}

export async function setProgress(jobId: string, value: UploadProgress): Promise<void> {
  await kv.set(`upload:progress:${jobId}`, value, 120)
}
