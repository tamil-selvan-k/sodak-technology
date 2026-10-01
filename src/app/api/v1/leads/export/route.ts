import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAuditLog } from '@/lib/audit'
import { z } from 'zod'

const exportParamsSchema = z.object({
  from: z.string().datetime({ offset: true }).optional(),
  to:   z.string().datetime({ offset: true }).optional(),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session || !hasRole(session, 'sales')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const parsed = exportParamsSchema.safeParse({
    from: searchParams.get('from') ?? undefined,
    to:   searchParams.get('to')   ?? undefined,
  })
  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid date format. Use ISO 8601 (e.g. 2026-01-01T00:00:00Z).' } }, { status: 422 })
  }
  const from = parsed.data.from ? new Date(parsed.data.from) : undefined
  const to   = parsed.data.to   ? new Date(parsed.data.to)   : undefined

  let leads
  try {
    leads = await db.lead.findMany({
      where: { createdAt: { gte: from, lte: to } },
      orderBy: { createdAt: 'desc' },
      include: { notes: { select: { body: true, createdAt: true } } },
    })
  } catch (err) {
    console.error('[leads/export] DB error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'Export failed.' } }, { status: 500 })
  }

  const csv = [
    'id,name,email,phone,institution,status,source,createdAt',
    ...leads.map(l =>
      [l.id, l.name, l.email, l.phone ?? '', l.institutionOrCompany ?? '', l.status, l.source ?? '', l.createdAt.toISOString()]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    ),
  ].join('\n')

  await writeAuditLog({ actorId: session.user.id, action: 'EXPORT', entityType: 'lead', entityId: 'bulk' })

  return new Response(csv, {
    headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="leads.csv"' },
  })
}
