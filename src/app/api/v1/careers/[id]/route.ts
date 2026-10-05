import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { getJobById, updateJob, softDeleteJob } from '@/modules/careers/careers.service'
import { updateJobSchema } from '@/modules/careers/careers.schema'
import { writeAuditLog } from '@/lib/audit'
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const job = await getJobById(params.id)
    if (!job) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Job not found' } }, { status: 404 })
    return NextResponse.json({ data: job })
  } catch (err) {
    console.error('[careers/[id]/GET] error:', err)
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
    const parsed = updateJobSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION', details: parsed.error.flatten() } }, { status: 400 })
    const job = await updateJob(params.id, parsed.data)
    await writeAuditLog({ actorId: session.user.id, action: 'UPDATE', entityType: 'job_post', entityId: params.id, newValue: parsed.data })
    return NextResponse.json({ data: job })
  } catch (err) {
    console.error('[careers/[id]/PATCH] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || !hasRole(session, 'editor')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
    }
    await softDeleteJob(params.id)
    await writeAuditLog({ actorId: session.user.id, action: 'DELETE', entityType: 'job_post', entityId: params.id })
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('[careers/[id]/DELETE] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
