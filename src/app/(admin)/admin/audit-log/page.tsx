import { auth, hasRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { parsePagination, buildMeta } from '@/lib/paginate'
import AuditTable from './_components/AuditTable'

export const metadata = { title: 'Audit Log — SODAK Admin' }

interface Props {
  searchParams: { entity?: string; action?: string; page?: string }
}

export default async function AdminAuditLogPage({ searchParams }: Props) {
  const session = await auth()
  if (!session || !hasRole(session, 'super_admin')) redirect('/admin')

  const { skip, take, page } = parsePagination({
    page: searchParams.page ? parseInt(searchParams.page, 10) : undefined,
    perPage: 50,
  })

  const where = {
    ...(searchParams.entity ? { entityType: searchParams.entity } : {}),
    ...(searchParams.action ? { action: searchParams.action } : {}),
  }

  const [total, logs] = await Promise.all([
    db.auditLog.count({ where }),
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { actor: { select: { name: true, email: true } } },
    }),
  ])

  const pagination = buildMeta(total, page, take)

  const serialised = logs.map(l => ({
    id: l.id,
    action: l.action,
    entityType: l.entityType,
    entityId: l.entityId,
    actorId: l.actorId,
    actor: l.actor,
    newValue: l.newValue,
    oldValue: l.oldValue,
    createdAt: l.createdAt.toISOString(),
  }))

  return (
    <main className="flex-1 min-w-0" style={{ padding: '32px 40px', maxWidth: 'calc(100vw - 220px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Audit Log</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Read-only record of all create, update, delete, and publish actions</p>
        </div>
      </div>

      <AuditTable logs={serialised} pagination={pagination} />
    </main>
  )
}
