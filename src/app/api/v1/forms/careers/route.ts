import { NextResponse } from 'next/server'
import { formRateLimit, getIP } from '@/lib/rate-limit'
import { z } from 'zod'
import { createApplication } from '@/modules/careers/careers.service'

const schema = z.object({
  jobId: z.string().cuid(),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[\d\s\-]{7,15}$/),
  resumeFileKey: z.string(),
  coverLetterUrl: z.string().url().optional(),
  website_url: z.string().optional(),
})

export async function POST(req: Request) {
  const ip = getIP(req)
  const { success } = await formRateLimit.limit(ip)
  if (!success) return NextResponse.json({ error: { code: 'RATE_LIMITED' } }, { status: 429 })

  const body = await req.json()
  if (body.website_url) return NextResponse.json({ data: { ok: true } })

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION', details: parsed.error.flatten() } }, { status: 400 })

  const application = await createApplication(parsed.data.jobId, {
    applicantName: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    resumeUrl: parsed.data.resumeFileKey,
    coverNote: parsed.data.coverLetterUrl,
  })
  return NextResponse.json({ data: application }, { status: 201 })
}
