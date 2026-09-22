import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { listInternships, createInternship } from '@/modules/internships/internships.service'
import { createInternshipSchema } from '@/modules/internships/internships.schema'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const { data, pagination } = await listInternships({ stack: searchParams.get('stack') ?? undefined })
  return NextResponse.json({ data, meta: pagination })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || !hasRole(session, 'editor')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }
  const body = await req.json()
  const parsed = createInternshipSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION', details: parsed.error.flatten() } }, { status: 400 })
  const internship = await createInternship(parsed.data)
  return NextResponse.json({ data: internship }, { status: 201 })
}
