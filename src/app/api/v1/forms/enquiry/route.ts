import { NextRequest, NextResponse } from 'next/server'
import { enquirySchema } from '@/modules/leads/leads.schema'
import * as leadsService from '@/modules/leads/leads.service'
import { formRateLimit, getIP } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  // Rate limit
  const ip     = getIP(req)
  const { success } = await formRateLimit.limit(ip)
  if (!success) {
    return NextResponse.json({ error: { code: 'RATE_LIMITED', message: 'Too many submissions. Try again later.' } }, { status: 429 })
  }

  const body   = await req.json()

  // Honeypot — bots fill website_url, humans leave it blank
  if (body.website_url) {
    return NextResponse.json({ data: { ok: true } }) // silently accept to not reveal detection
  }

  // Validate Turnstile
  const turnstileOk = await verifyTurnstile(body.turnstileToken, ip)
  if (!turnstileOk) {
    return NextResponse.json({ error: { code: 'TURNSTILE_FAILED', message: 'CAPTCHA verification failed.' } }, { status: 422 })
  }

  const parsed = enquirySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input.', details: parsed.error.flatten() } }, { status: 422 })
  }

  // Capture UTM + referrer from meta
  const { consent: _consent, website_url: _hp, turnstileToken: _tk, ...leadData } = parsed.data
  const lead = await leadsService.createLead({
    ...leadData,
    source: 'enquiry-form',
    meta:   { utm: body.utm ?? {}, referrer: body.referrer ?? '' },
  })

  return NextResponse.json({ data: { id: lead.id } }, { status: 201 })
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  if (process.env.NODE_ENV === 'development') return true
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip }),
  })
  const json = await res.json() as { success: boolean }
  return json.success
}
