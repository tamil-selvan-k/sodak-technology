import { NextRequest, NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import * as institutionsService from '@/modules/institutions/institutions.service'
import { createInstitutionSchema } from '@/modules/institutions/institutions.schema'

export async function GET(req: NextRequest) {
  const p = Object.fromEntries(req.nextUrl.searchParams)
  const result = await institutionsService.listInstitutions({ type: p['type'], search: p['search'], showOnHome: p['showOnHome'] === 'true' ? true : undefined })
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !hasRole(session.user.role, 'editor')) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Forbidden.' } }, { status: 403 })
  const body = await req.json()
  const parsed = createInstitutionSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input.' } }, { status: 422 })
  const institution = await institutionsService.createInstitution(parsed.data)
  return NextResponse.json({ data: institution }, { status: 201 })
}
