import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { updateWebinar, softDeleteWebinar } from '@/modules/webinars/webinars.service'
import { updateWebinarSchema } from '@/modules/webinars/webinars.schema'
import { writeAuditLog } from '@/lib/audit'
import { db } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const webinar = await db.webinar.findFirst({ where: { id: params.id, deletedAt: null }, include: { presenter: true } })
  if (!webinar) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Webinar not found' } }, { status: 404 })
  return NextResponse.json({ data: webinar })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || !hasRole(session, 'editor')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }
  const body = await req.json()
  const parsed = updateWebinarSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION', details: parsed.error.flatten() } }, { status: 400 })
  const webinar = await updateWebinar(params.id, parsed.data)
  await writeAuditLog({ actorId: session.user.id, action: 'UPDATE', entityType: 'webinar', entityId: params.id, newValue: parsed.data })
  return NextResponse.json({ data: webinar })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || !hasRole(session, 'editor')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }
  await softDeleteWebinar(params.id)
  await writeAuditLog({ actorId: session.user.id, action: 'DELETE', entityType: 'webinar', entityId: params.id })
  return new NextResponse(null, { status: 204 })
}
