import { NextResponse } from 'next/server'
import { formRateLimit, getIP } from '@/lib/rate-limit'
import { z } from 'zod'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { getInternshipById } from '@/modules/internships/internships.service'
export const dynamic = 'force-dynamic'

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[\d\s\-]{7,15}$/),
  internshipId: z.string().cuid(),
  collegeName: z.string().min(2).max(200).optional(),
  cgpa: z.number().min(0).max(10).optional(),
  website_url: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const ip = getIP(req)
    const { success } = await formRateLimit.limit(ip)
    if (!success) return NextResponse.json({ error: { code: 'RATE_LIMITED' } }, { status: 429 })

    const body = await req.json()
    if (body.website_url) return NextResponse.json({ data: { ok: true } })

    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION', details: parsed.error.flatten() } }, { status: 400 })

    const { name, email, phone, internshipId, collegeName, cgpa } = parsed.data

    // getInternshipById filters isPublished: true — rejects applications to unpublished listings
    const internship = await getInternshipById(internshipId)
    if (!internship) return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 })

    await db.internshipApplication.create({ data: { name, email, phone, internshipId, collegeName, cgpa } })

    // sendEmail is non-throwing; failure is logged internally
    await sendEmail({ to: email, template: 'internship-acknowledgement', data: { name, role: internship.roleTitle } })

    return NextResponse.json({ data: { ok: true } })
  } catch (err) {
    console.error('[forms/internship/POST] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
