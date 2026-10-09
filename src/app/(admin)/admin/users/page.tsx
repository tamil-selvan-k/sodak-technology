import { Suspense } from 'react'
import { auth, hasRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { parsePagination, buildMeta } from '@/lib/paginate'
import UsersTable from './_components/UsersTable'
import Pagination from '@/components/ui/Pagination'

export const metadata = { title: 'Users — SODAK Admin' }

interface Props { searchParams: { page?: string } }

export default async function AdminUsersPage({ searchParams }: Props) {
  const session = await auth()
  if (!session || !hasRole(session, 'super_admin')) redirect('/admin')

  const { skip, take, page, perPage } = parsePagination({ page: searchParams.page ? Number(searchParams.page) : 1 })
  const SELECT = { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } as const

  const [users, totalUsers] = await Promise.all([
    db.user.findMany({ select: SELECT, orderBy: { createdAt: 'desc' }, skip, take }),
    db.user.count(),
  ])

  const pagination = buildMeta(totalUsers, page, perPage)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const activeUsers = users.filter(u => u.isActive).length
  const adminUsers  = users.filter(u => u.role === 'super_admin').length
  const recentUsers = users.filter(u => u.createdAt >= thirtyDaysAgo).length

  const serialised = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as string,
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
  }))

  return (
    <main className="admin-main">
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563EB', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172554', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>User Management</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Manage admin accounts and role assignments</p>
      </div>

      <div className="admin-stat-grid-4">
        {[
          { label: 'Total Users',  value: pagination.total },
          { label: 'Active',       value: activeUsers },
          { label: 'Super Admins', value: adminUsers },
          { label: 'Last 30 Days', value: recentUsers },
        ].map(c => (
          <div key={c.label} style={{ background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 11, color: '#2563EB', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{c.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#172554' }}>{c.value}</div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>Visible to super_admin only</p>
      <UsersTable users={serialised} />
      <Suspense fallback={null}>
        <Pagination total={pagination.total} page={pagination.page} perPage={pagination.perPage} pages={pagination.pages} />
      </Suspense>
    </main>
  )
}
