import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { unpublishInternship } from '@/modules/internships/internships.service'
import { writeAuditLog } from '@/lib/audit'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || !hasRole(session, 'editor')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }
  const internship = await unpublishInternship(params.id)
  await writeAuditLog({ actorId: session.user.id, action: 'UNPUBLISH', entityType: 'internship', entityId: params.id })
  return NextResponse.json({ data: internship })
}
