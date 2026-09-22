import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { listJobs, createJob } from '@/modules/careers/careers.service'
import { createJobSchema } from '@/modules/careers/careers.schema'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const { data, pagination } = await listJobs({
    department: searchParams.get('department') ?? undefined,
    isOpen: searchParams.get('open') !== 'false',
  })
  return NextResponse.json({ data, meta: pagination })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || !hasRole(session, 'editor')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }
  const body = await req.json()
  const parsed = createJobSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION', details: parsed.error.flatten() } }, { status: 400 })
  const job = await createJob(parsed.data)
  return NextResponse.json({ data: job }, { status: 201 })
}
