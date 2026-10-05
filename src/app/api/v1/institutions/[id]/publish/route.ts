import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { auth, hasRole } from '@/lib/auth'
import { publishInstitution } from '@/modules/institutions/institutions.service'
import { writeAuditLog } from '@/lib/audit'
export const dynamic = 'force-dynamic'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || !hasRole(session, 'editor')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
    }
    const institution = await publishInstitution(params.id)
    await writeAuditLog({ actorId: session.user.id, action: 'PUBLISH', entityType: 'institution', entityId: params.id })
    // Trigger on-demand ISR revalidation for public institution pages.
    revalidateTag('institutions')
    return NextResponse.json({ data: institution })
  } catch (err) {
    console.error('[institutions/[id]/publish/POST] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
