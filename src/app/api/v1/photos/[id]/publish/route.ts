import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { publishPhoto } from '@/modules/gallery/gallery.service'
import { writeAuditLog } from '@/lib/audit'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || !hasRole(session, 'editor')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }
  try {
    const photo = await publishPhoto(params.id)
    await writeAuditLog({ actorId: session.user.id, action: 'PUBLISH', entityType: 'photo', entityId: params.id })
    return NextResponse.json({ data: photo })
  } catch (err: unknown) {
    if (err instanceof Error && (err.constructor.name === 'ConsentError' || err.constructor.name === 'AltTextError')) {
      return NextResponse.json({ error: { code: 'CONSENT_VIOLATION', message: err.message } }, { status: 422 })
    }
    throw err
  }
}
