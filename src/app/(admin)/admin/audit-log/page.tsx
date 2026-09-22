import { auth, hasRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { parsePagination, buildMeta } from '@/lib/paginate'

export const metadata = { title: 'Audit Log — SODAK Admin' }

interface Props { searchParams: { entity?: string; actor?: string; page?: string } }

export default async function AdminAuditLogPage({ searchParams }: Props) {
  const session = await auth()
  if (!session || !hasRole(session, 'super_admin')) redirect('/admin')

  const { skip, take, page } = parsePagination({ page: searchParams.page ? parseInt(searchParams.page, 10) : undefined })
  const where = {
    ...(searchParams.entity ? { entityType: searchParams.entity } : {}),
    ...(searchParams.actor ? { actorId: searchParams.actor } : {}),
  }
  const [total, logs] = await Promise.all([
    db.auditLog.count({ where }),
    db.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take, include: { actor: { select: { name: true, email: true } } } }),
  ])
  const pagination = buildMeta(total, page, take)
  // TODO: Implement Audit Log — wireframe: admin/audit-log.html
  return <pre className="text-xs">{JSON.stringify({ logs, pagination }, null, 2)}</pre>
}
