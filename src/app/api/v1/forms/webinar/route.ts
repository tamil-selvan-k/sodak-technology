import { NextResponse } from 'next/server'
import { formRateLimit, getIP } from '@/lib/rate-limit'
import { z } from 'zod'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { getWebinarById } from '@/modules/webinars/webinars.service'
export const dynamic = 'force-dynamic'

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[\d\s\-]{7,15}$/),
  webinarId: z.string().cuid(),
  website_url: z.string().optional(),
  cfTurnstileToken: z.string().optional(),
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

    const { name, email, phone, webinarId } = parsed.data

    const webinar = await getWebinarById(webinarId)
    if (!webinar) return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 })

    await db.webinarRegistration.create({ data: { name, email, phone, webinarId } })

    // sendEmail is non-throwing; failure is logged internally
    await sendEmail({ to: email, template: 'webinar-acknowledgement', data: { name, title: webinar.title, scheduledAt: webinar.scheduledAt } })

    return NextResponse.json({ data: { ok: true } })
  } catch (err) {
    console.error('[forms/webinar/POST] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
