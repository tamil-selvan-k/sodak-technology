import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth, hasRole } from '@/lib/auth'
import { publishProgram } from '@/modules/programs/programs.service'
import { writeAuditLog } from '@/lib/audit'
export const dynamic = 'force-dynamic'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || !hasRole(session, 'editor')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
    }
    const program = await publishProgram(params.id)
    await writeAuditLog({ actorId: session.user.id, action: 'PUBLISH', entityType: 'program', entityId: params.id })
    // revalidatePath works unconditionally for ISR pages; revalidateTag requires
    // unstable_cache-wrapped fetches with matching tags (none exist in this codebase).
    revalidatePath('/programs')
    revalidatePath('/programs/[slug]', 'page')
    return NextResponse.json({ data: program })
  } catch (err) {
    console.error('[programs/[id]/publish/POST] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
