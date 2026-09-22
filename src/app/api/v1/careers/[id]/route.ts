import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { getJobBySlug, updateJob, softDeleteJob } from '@/modules/careers/careers.service'
import { updateJobSchema } from '@/modules/careers/careers.schema'
import { writeAuditLog } from '@/lib/audit'
import { db } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const job = await db.jobPost.findFirst({ where: { id: params.id, deletedAt: null } })
  if (!job) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Job not found' } }, { status: 404 })
  return NextResponse.json({ data: job })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || !hasRole(session, 'editor')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }
  await softDeleteJob(params.id)
  await writeAuditLog({ actorId: session.user.id, action: 'DELETE', entityType: 'job_post', entityId: params.id })
  return new NextResponse(null, { status: 204 })
}
