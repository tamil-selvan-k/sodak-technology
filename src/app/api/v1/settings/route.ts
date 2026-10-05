import { NextRequest, NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import * as settingsService from '@/modules/settings/settings.service'
import { updateSettingsSchema } from '@/modules/settings/settings.schema'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized.' } }, { status: 401 })
    }
    const settings = await settingsService.getSettings()
    return NextResponse.json({ data: settings })
  } catch (err) {
    console.error('[settings/GET] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !hasRole(session.user.role, 'super_admin')) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Forbidden.' } }, { status: 403 })
    const body   = await req.json()
    const parsed = updateSettingsSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input.' } }, { status: 422 })
    const settings = await settingsService.updateSettings(parsed.data)
    return NextResponse.json({ data: settings })
  } catch (err) {
    console.error('[settings/PATCH] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
