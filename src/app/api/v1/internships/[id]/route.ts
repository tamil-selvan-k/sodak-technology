import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { updateInternship, softDeleteInternship } from '@/modules/internships/internships.service'
import { updateInternshipSchema } from '@/modules/internships/internships.schema'
import { writeAuditLog } from '@/lib/audit'
import { db } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const internship = await db.internship.findFirst({ where: { id: params.id, deletedAt: null } })
  if (!internship) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Internship not found' } }, { status: 404 })
  return NextResponse.json({ data: internship })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || !hasRole(session, 'editor')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }
  await softDeleteInternship(params.id)
  await writeAuditLog({ actorId: session.user.id, action: 'DELETE', entityType: 'internship', entityId: params.id })
  return new NextResponse(null, { status: 204 })
}
