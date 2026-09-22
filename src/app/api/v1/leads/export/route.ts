import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAuditLog } from '@/lib/audit'

export async function GET(req: Request) {
  const session = await auth()
  if (!session || !hasRole(session, 'sales')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined
  const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined

  const leads = await db.lead.findMany({
    where: { createdAt: { gte: from, lte: to } },
    orderBy: { createdAt: 'desc' },
    include: { notes: { select: { body: true, createdAt: true } } },
  })

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
