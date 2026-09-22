import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { publishJob } from '@/modules/careers/careers.service'
import { writeAuditLog } from '@/lib/audit'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || !hasRole(session, 'editor')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }
  const job = await publishJob(params.id)
  await writeAuditLog({ actorId: session.user.id, action: 'PUBLISH', entityType: 'job_post', entityId: params.id })
  return NextResponse.json({ data: job })
}
