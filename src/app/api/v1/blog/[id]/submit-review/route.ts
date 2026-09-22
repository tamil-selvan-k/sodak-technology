import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { getPostById, submitForReview } from '@/modules/blog/blog.service'
import { writeAuditLog } from '@/lib/audit'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || !hasRole(session, 'contributor')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }

  // Contributors may only submit their own drafts.  Editors and above can submit any post.
  if (!hasRole(session, 'editor')) {
    const existing = await getPostById(params.id)
    if (!existing) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Post not found.' } }, { status: 404 })
    }
    if (existing.authorId !== session.user.id) {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'You can only submit your own posts for review.' } }, { status: 403 })
    }
  }

  const post = await submitForReview(params.id)
  await writeAuditLog({ actorId: session.user.id, action: 'SUBMIT_REVIEW', entityType: 'blog_post', entityId: params.id })
  return NextResponse.json({ data: post })
}
