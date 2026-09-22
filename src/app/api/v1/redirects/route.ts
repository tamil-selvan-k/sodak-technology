import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { writeAuditLog } from '@/lib/audit'

const redirectSchema = z.object({
  source: z.string().startsWith('/'),
  destination: z.string(),
  permanent: z.boolean().default(false),
})

export async function GET() {
  const redirects = await db.redirect.findMany({ orderBy: { source: 'asc' } })
  return NextResponse.json({ data: redirects })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || !hasRole(session, 'super_admin')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }
  const body = await req.json()
  const parsed = redirectSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION', details: parsed.error.flatten() } }, { status: 400 })

  const redirect = await db.redirect.create({ data: parsed.data })
  await writeAuditLog({ actorId: session.user.id, action: 'CREATE', entityType: 'redirect', entityId: redirect.id, newValue: parsed.data })
  return NextResponse.json({ data: redirect }, { status: 201 })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session || !hasRole(session, 'super_admin')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: { code: 'BAD_REQUEST' } }, { status: 400 })
  await db.redirect.delete({ where: { id } })
  await writeAuditLog({ actorId: session.user.id, action: 'DELETE', entityType: 'redirect', entityId: id })
  return new NextResponse(null, { status: 204 })
}
