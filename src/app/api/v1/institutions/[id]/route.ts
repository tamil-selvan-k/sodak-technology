import { NextRequest, NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import {
  getInstitutionById,
  updateInstitution,
  softDeleteInstitution,
} from '@/modules/institutions/institutions.service'
import { updateInstitutionSchema } from '@/modules/institutions/institutions.schema'
export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const institution = await getInstitutionById(params.id)
    if (!institution) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Institution not found.' } }, { status: 404 })
    return NextResponse.json({ data: institution })
  } catch (err) {
    console.error('[institutions/[id]/GET] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || !hasRole(session.user.role, 'editor')) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Forbidden.' } }, { status: 403 })
    const body = await req.json()
    const parsed = updateInstitutionSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input.' } }, { status: 422 })
    const institution = await updateInstitution(params.id, parsed.data)
    return NextResponse.json({ data: institution })
  } catch (err) {
    console.error('[institutions/[id]/PATCH] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || !hasRole(session.user.role, 'editor')) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Forbidden.' } }, { status: 403 })
    await softDeleteInstitution(params.id)
    return NextResponse.json({ data: null }, { status: 200 })
  } catch (err) {
    console.error('[institutions/[id]/DELETE] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
