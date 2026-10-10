import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { listCourses, createCourse } from '@/modules/courses/courses.service'
import { createCourseSchema } from '@/modules/courses/courses.schema'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const { data, pagination } = await listCourses({
      search:             searchParams.get('search')             ?? undefined,
      category:           searchParams.get('category')           ?? undefined,
      page:               searchParams.get('page')    ? Number(searchParams.get('page'))    : 1,
      perPage:            searchParams.get('perPage') ? Number(searchParams.get('perPage')) : 20,
      includeUnpublished: searchParams.get('includeUnpublished') === 'true',
    })
    return NextResponse.json({ data, pagination })
  } catch (err) {
    console.error('[courses/GET] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || !hasRole(session, 'editor')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
    }
    const body = await req.json()
    const parsed = createCourseSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION', details: parsed.error.flatten() } }, { status: 400 })
    const course = await createCourse(parsed.data)
    return NextResponse.json({ data: course }, { status: 201 })
  } catch (err) {
    console.error('[courses/POST] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
