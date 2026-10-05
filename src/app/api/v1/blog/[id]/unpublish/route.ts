import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { unpublishPost } from '@/modules/blog/blog.service'
import { writeAuditLog } from '@/lib/audit'
export const dynamic = 'force-dynamic'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || !hasRole(session, 'editor')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
    }
    const post = await unpublishPost(params.id)
    await writeAuditLog({ actorId: session.user.id, action: 'UNPUBLISH', entityType: 'blog_post', entityId: params.id })
    return NextResponse.json({ data: post })
  } catch (err) {
    console.error('[blog/[id]/unpublish/POST] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
