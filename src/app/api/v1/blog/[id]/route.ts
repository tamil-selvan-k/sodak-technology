import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { getPostById, updatePost, softDeletePost } from '@/modules/blog/blog.service'
import { updatePostSchema } from '@/modules/blog/blog.schema'
import { writeAuditLog } from '@/lib/audit'
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const post = await getPostById(params.id)
    if (!post) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Post not found' } }, { status: 404 })
    return NextResponse.json({ data: post })
  } catch (err) {
    console.error('[blog/[id]/GET] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || !hasRole(session, 'contributor')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
    }

    // Contributors may only edit their own posts; editors and above can edit any post.
    if (session.user.role === 'contributor') {
      const existing = await getPostById(params.id)
      if (!existing) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Post not found' } }, { status: 404 })
      if (existing.authorId !== session.user.id) {
        return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'You can only edit your own posts.' } }, { status: 403 })
      }
    }

    const body = await req.json()
    const parsed = updatePostSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION', details: parsed.error.flatten() } }, { status: 400 })
    const post = await updatePost(params.id, parsed.data)
    await writeAuditLog({ actorId: session.user.id, action: 'UPDATE', entityType: 'blog_post', entityId: params.id, newValue: parsed.data })
    return NextResponse.json({ data: post })
  } catch (err) {
    console.error('[blog/[id]/PATCH] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || !hasRole(session, 'editor')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
    }
    await softDeletePost(params.id)
    await writeAuditLog({ actorId: session.user.id, action: 'DELETE', entityType: 'blog_post', entityId: params.id })
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('[blog/[id]/DELETE] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
