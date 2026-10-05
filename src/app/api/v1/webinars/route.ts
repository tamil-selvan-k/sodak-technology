import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { listWebinars, createWebinar } from '@/modules/webinars/webinars.service'
import { createWebinarSchema } from '@/modules/webinars/webinars.schema'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const { data, pagination } = await listWebinars({ upcoming: searchParams.get('upcoming') === 'true' })
    return NextResponse.json({ data, meta: pagination })
  } catch (err) {
    console.error('[webinars/GET] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || !hasRole(session, 'editor')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
    }
    const body = await req.json()
    const parsed = createWebinarSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION', details: parsed.error.flatten() } }, { status: 400 })
    const webinar = await createWebinar(parsed.data)
    return NextResponse.json({ data: webinar }, { status: 201 })
  } catch (err) {
    console.error('[webinars/POST] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
