import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { publishPost } from '@/modules/blog/blog.service'
import { writeAuditLog } from '@/lib/audit'
export const dynamic = 'force-dynamic'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || !hasRole(session, 'editor')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
    }
    const post = await publishPost(params.id)
    await writeAuditLog({ actorId: session.user.id, action: 'PUBLISH', entityType: 'blog_post', entityId: params.id })
    return NextResponse.json({ data: post })
  } catch (err) {
    console.error('[blog/[id]/publish/POST] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
