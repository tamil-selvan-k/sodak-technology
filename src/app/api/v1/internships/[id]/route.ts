import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { getInternshipByIdAdmin, updateInternship, softDeleteInternship } from '@/modules/internships/internships.service'
import { updateInternshipSchema } from '@/modules/internships/internships.schema'
import { writeAuditLog } from '@/lib/audit'
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const internship = await getInternshipByIdAdmin(params.id)
    if (!internship) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Internship not found' } }, { status: 404 })
    return NextResponse.json({ data: internship })
  } catch (err) {
    console.error('[internships/[id]/GET] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || !hasRole(session, 'editor')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
    }
    const body = await req.json()
    const parsed = updateInternshipSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION', details: parsed.error.flatten() } }, { status: 400 })
    const internship = await updateInternship(params.id, parsed.data)
    await writeAuditLog({ actorId: session.user.id, action: 'UPDATE', entityType: 'internship', entityId: params.id, newValue: parsed.data })
    return NextResponse.json({ data: internship })
  } catch (err) {
    console.error('[internships/[id]/PATCH] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || !hasRole(session, 'editor')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
    }
    await softDeleteInternship(params.id)
    await writeAuditLog({ actorId: session.user.id, action: 'DELETE', entityType: 'internship', entityId: params.id })
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('[internships/[id]/DELETE] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
