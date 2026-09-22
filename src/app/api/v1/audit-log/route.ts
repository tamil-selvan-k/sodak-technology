import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { db } from '@/lib/db'
import { parsePagination, buildMeta } from '@/lib/paginate'

export async function GET(req: Request) {
  const session = await auth()
  if (!session || !hasRole(session, 'super_admin')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const { skip, take, page } = parsePagination({ page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : undefined })
  const where = {
    ...(searchParams.get('entity') ? { entityType: searchParams.get('entity')! } : {}),
    ...(searchParams.get('actor') ? { actorId: searchParams.get('actor')! } : {}),
  }

  const [total, logs] = await Promise.all([
    db.auditLog.count({ where }),
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { actor: { select: { id: true, name: true, email: true } } },
    }),
  ])

  return NextResponse.json({ data: logs, meta: buildMeta(total, page, take) })
}
