import { NextRequest, NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import * as blogService from '@/modules/blog/blog.service'
import { createPostSchema } from '@/modules/blog/blog.schema'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const p = Object.fromEntries(req.nextUrl.searchParams)
    const result = await blogService.listPosts({ category: p['category'], tag: p['tag'], search: p['search'], page: p['page'] ? Number(p['page']) : undefined })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[blog/GET] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !hasRole(session.user.role, 'contributor')) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Forbidden.' } }, { status: 403 })
    const body = await req.json()
    const parsed = createPostSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input.' } }, { status: 422 })
    const post = await blogService.createPost(parsed.data)
    return NextResponse.json({ data: post }, { status: 201 })
  } catch (err) {
    console.error('[blog/POST] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
