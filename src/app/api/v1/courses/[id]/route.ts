import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { getCourseById, updateCourse, deleteCourse } from '@/modules/courses/courses.service'
import { updateCourseSchema } from '@/modules/courses/courses.schema'
import { writeAuditLog } from '@/lib/audit'
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const course = await getCourseById(params.id)
    if (!course) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Course not found' } }, { status: 404 })
    return NextResponse.json({ data: course })
  } catch (err) {
    console.error('[courses/[id]/GET] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || !hasRole(session, 'editor')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
    }
    const body = await req.json()
    const parsed = updateCourseSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION', details: parsed.error.flatten() } }, { status: 400 })
    const course = await updateCourse(params.id, parsed.data)
    await writeAuditLog({ actorId: session.user.id, action: 'UPDATE', entityType: 'course', entityId: params.id, newValue: parsed.data })
    return NextResponse.json({ data: course })
  } catch (err) {
    console.error('[courses/[id]/PATCH] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || !hasRole(session, 'editor')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
    }
    await deleteCourse(params.id)
    await writeAuditLog({ actorId: session.user.id, action: 'DELETE', entityType: 'course', entityId: params.id })
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('[courses/[id]/DELETE] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
