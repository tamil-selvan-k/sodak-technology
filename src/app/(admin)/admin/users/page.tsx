import { auth, hasRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import UsersTable from './_components/UsersTable'

export const metadata = { title: 'Users — SODAK Admin' }

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session || !hasRole(session, 'super_admin')) redirect('/admin')

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const totalUsers = users.length
  const activeUsers = users.filter(u => u.isActive).length
  const adminUsers = users.filter(u => u.role === 'super_admin').length
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
    <main className="flex-1 min-w-0" style={{ padding: '32px 40px', maxWidth: 'calc(100vw - 220px)', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4865ad', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>User Management</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Manage admin accounts and role assignments</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Users',  value: totalUsers },
          { label: 'Active',       value: activeUsers },
          { label: 'Super Admins', value: adminUsers },
          { label: 'Last 30 Days', value: recentUsers },
        ].map(c => (
          <div key={c.label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{c.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#334155' }}>{c.value}</div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>Visible to super_admin only</p>
      <UsersTable users={serialised} />
    </main>
  )
}
