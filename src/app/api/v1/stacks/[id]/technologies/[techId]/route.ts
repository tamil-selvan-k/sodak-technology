import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAuditLog } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function DELETE(_req: Request, { params }: { params: { id: string; techId: string } }) {
  try {
    const session = await auth()
    if (!session || !hasRole(session, 'editor')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Forbidden.' } }, { status: 403 })
    }
    const tech = await db.technology.findFirst({
      where: { id: params.techId, stackId: params.id },
      select: { id: true },
    })
    if (!tech) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Technology not found' } }, { status: 404 })
    }
    await db.technology.delete({ where: { id: params.techId } })
    await writeAuditLog({ actorId: session.user.id, action: 'DELETE', entityType: 'technology', entityId: params.techId })
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('[stacks/[id]/technologies/[techId]/DELETE] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
