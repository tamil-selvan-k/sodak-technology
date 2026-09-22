import { NextResponse } from 'next/server'
import { formRateLimit, getIP } from '@/lib/rate-limit'
import { db } from '@/lib/db'
import { signedDownloadUrl } from '@/lib/storage'
import { sendEmail } from '@/lib/email'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  institution: z.string().min(2).max(200).optional(),
  website_url: z.string().optional(),
})

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ip = getIP(req)
  const { success } = await formRateLimit.limit(ip)
  if (!success) return NextResponse.json({ error: { code: 'RATE_LIMITED' } }, { status: 429 })

  const body = await req.json()
  if (body.website_url) return NextResponse.json({ data: { ok: true } })

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION', details: parsed.error.flatten() } }, { status: 400 })

  const program = await db.program.findUnique({ where: { id: params.id } })
  if (!program || !program.brochureKey) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Brochure not available' } }, { status: 404 })
  }

  const url = await signedDownloadUrl(program.brochureKey, 3600)

  await db.lead.create({
    data: { name: parsed.data.name, email: parsed.data.email, institutionOrCompany: parsed.data.institution, source: 'brochure_download', meta: { programId: params.id, programTitle: program.title } },
  })

  await sendEmail({ to: parsed.data.email, template: 'brochure-download', data: { name: parsed.data.name, programTitle: program.title, downloadUrl: url } })

  return NextResponse.json({ data: { url } })
}
