import { auth } from '@/lib/auth'
import AdminSidebar from './AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  // Login page — no sidebar, no auth redirect (middleware handles the redirect)
  if (!session) return <>{children}</>

  return (
    <div className="flex min-h-screen scrollbar-visible" style={{ background: '#f8fafc' }}>
      <AdminSidebar email={session.user.email ?? ''} role={session.user.role ?? ''} />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden overflow-y-auto scrollbar-visible" style={{ height: '100vh' }}>
        {children}
      </div>
    </div>
  )
}
