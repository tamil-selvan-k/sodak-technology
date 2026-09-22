import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { publishInstitution } from '@/modules/institutions/institutions.service'
import { writeAuditLog } from '@/lib/audit'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || !hasRole(session, 'editor')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }
  const institution = await publishInstitution(params.id)
  await writeAuditLog({ actorId: session.user.id, action: 'PUBLISH', entityType: 'institution', entityId: params.id })
  return NextResponse.json({ data: institution })
}
