import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { auth, hasRole } from '@/lib/auth'
import { unpublishInstitution } from '@/modules/institutions/institutions.service'
import { writeAuditLog } from '@/lib/audit'
export const dynamic = 'force-dynamic'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || !hasRole(session, 'editor')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
    }
    const institution = await unpublishInstitution(params.id)
    await writeAuditLog({ actorId: session.user.id, action: 'UNPUBLISH', entityType: 'institution', entityId: params.id })
    revalidateTag('institutions')
    return NextResponse.json({ data: institution })
  } catch (err) {
    console.error('[institutions/[id]/unpublish/POST] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
