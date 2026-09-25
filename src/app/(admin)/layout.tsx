import { auth } from '@/lib/auth'
import AdminSidebar from './AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  // Login page — no sidebar, no auth redirect (middleware handles the redirect)
  if (!session) return <>{children}</>

  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0c2040 100%)' }}>
      <AdminSidebar email={session.user.email ?? ''} role={session.user.role ?? ''} />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  )
}
