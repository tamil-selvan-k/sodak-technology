import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAuditLog } from '@/lib/audit'
import { z } from 'zod'
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 10000

const exportParamsSchema = z.object({
  from:    z.string().datetime({ offset: true }).optional(),
  to:      z.string().datetime({ offset: true }).optional(),
  page:    z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(PAGE_SIZE).default(PAGE_SIZE),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session || !hasRole(session, 'sales')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const parsed = exportParamsSchema.safeParse({
    from:    searchParams.get('from')    ?? undefined,
    to:      searchParams.get('to')      ?? undefined,
    page:    searchParams.get('page')    ?? undefined,
    perPage: searchParams.get('perPage') ?? undefined,
  })
  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid parameters. Use ISO 8601 dates (e.g. 2026-01-01T00:00:00Z).' } }, { status: 422 })
  }

  const { from: fromStr, to: toStr, page, perPage } = parsed.data
  const from  = fromStr ? new Date(fromStr) : undefined
  const to    = toStr   ? new Date(toStr)   : undefined
  const skip  = (page - 1) * perPage
  const take  = perPage

  let leads
  let total: number
  try {
    ;[total, leads] = await Promise.all([
      db.lead.count({ where: { createdAt: { gte: from, lte: to } } }),
      db.lead.findMany({
        where:   { createdAt: { gte: from, lte: to } },
        orderBy: { createdAt: 'desc' },
        include: { notes: { select: { body: true, createdAt: true } } },
        skip,
        take,
      }),
    ])
  } catch (err) {
    console.error('[leads/export] DB error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'Export failed.' } }, { status: 500 })
  }

  const pages = Math.ceil(total / perPage)

  const csv = [
    'id,name,email,phone,institution,status,source,createdAt',
    ...leads.map(l =>
      [l.id, l.name, l.email, l.phone ?? '', l.institutionOrCompany ?? '', l.status, l.source ?? '', l.createdAt.toISOString()]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    ),
  ].join('\n')

  await writeAuditLog({ actorId: session.user.id, action: 'EXPORT', entityType: 'lead', entityId: 'bulk' })

  // For paginated JSON requests (Accept: application/json), return data + pagination meta.
  // Default (no Accept header or text/csv) streams a CSV file.
  const accept = (req as Request & { headers: Headers }).headers.get('accept') ?? ''
  if (accept.includes('application/json')) {
    return NextResponse.json({
      data:       leads,
      pagination: { total, page, perPage, pages },
    })
  }

  return new Response(csv, {
    headers: {
      'Content-Type':        'text/csv',
      'Content-Disposition': `attachment; filename="leads-page${page}.csv"`,
      'X-Pagination-Total':  String(total),
      'X-Pagination-Page':   String(page),
      'X-Pagination-Pages':  String(pages),
    },
  })
}
