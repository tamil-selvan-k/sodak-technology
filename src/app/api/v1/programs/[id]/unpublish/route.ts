import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth, hasRole } from '@/lib/auth'
import { unpublishProgram } from '@/modules/programs/programs.service'
import { writeAuditLog } from '@/lib/audit'
export const dynamic = 'force-dynamic'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || !hasRole(session, 'editor')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
    }
    const program = await unpublishProgram(params.id)
    await writeAuditLog({ actorId: session.user.id, action: 'UNPUBLISH', entityType: 'program', entityId: params.id })
    revalidatePath('/programs')
    revalidatePath('/programs/[slug]', 'page')
    return NextResponse.json({ data: program })
  } catch (err) {
    console.error('[programs/[id]/unpublish/POST] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
