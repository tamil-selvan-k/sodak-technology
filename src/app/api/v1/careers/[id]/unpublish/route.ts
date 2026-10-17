import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { unpublishJob } from '@/modules/careers/careers.service'
import { writeAuditLog } from '@/lib/audit'
export const dynamic = 'force-dynamic'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || !hasRole(session, 'editor')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
    }
    const job = await unpublishJob(params.id)
    await writeAuditLog({ actorId: session.user.id, action: 'UNPUBLISH', entityType: 'job_post', entityId: params.id })
    return NextResponse.json({ data: job })
  } catch (err) {
    console.error('[careers/[id]/unpublish/POST] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
