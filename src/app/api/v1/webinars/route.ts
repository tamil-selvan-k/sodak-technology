import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { listWebinars, createWebinar } from '@/modules/webinars/webinars.service'
import { createWebinarSchema } from '@/modules/webinars/webinars.schema'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const { data, pagination } = await listWebinars({ upcoming: searchParams.get('upcoming') === 'true' })
  return NextResponse.json({ data, meta: pagination })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || !hasRole(session, 'editor')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }
  const body = await req.json()
  const parsed = createWebinarSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION', details: parsed.error.flatten() } }, { status: 400 })
  const webinar = await createWebinar(parsed.data)
  return NextResponse.json({ data: webinar }, { status: 201 })
}
