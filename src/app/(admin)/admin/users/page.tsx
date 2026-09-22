import { auth, hasRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'

export const metadata = { title: 'Users — SODAK Admin' }

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session || !hasRole(session, 'super_admin')) redirect('/admin')

  const users = await db.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true }, orderBy: { createdAt: 'desc' } })
  // TODO: Implement Users admin — wireframe: admin/users.html
  return <pre className="text-xs">{JSON.stringify(users, null, 2)}</pre>
}
