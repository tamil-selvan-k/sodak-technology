import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { publishWebinar } from '@/modules/webinars/webinars.service'
import { writeAuditLog } from '@/lib/audit'
export const dynamic = 'force-dynamic'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || !hasRole(session, 'editor')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
    }
    const webinar = await publishWebinar(params.id)
    await writeAuditLog({ actorId: session.user.id, action: 'PUBLISH', entityType: 'webinar', entityId: params.id })
    return NextResponse.json({ data: webinar })
  } catch (err) {
    console.error('[webinars/[id]/publish/POST] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
