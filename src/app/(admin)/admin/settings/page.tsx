import { auth, hasRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSettings } from '@/modules/settings/settings.service'
import SettingsForm from './_components/SettingsForm'

export const metadata = { title: 'Settings — SODAK Admin' }

export default async function AdminSettingsPage() {
  const session = await auth()
  if (!session || !hasRole(session, 'super_admin')) redirect('/admin')
  const settings = await getSettings()
  const serialised = JSON.parse(JSON.stringify(settings)) as typeof settings

  return (
    <main className="flex-1 min-w-0" style={{ padding: '32px 40px', maxWidth: 'calc(100vw - 220px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Site Settings</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Manage site-wide content and configuration</p>
        </div>
      </div>
      <SettingsForm settings={serialised} />
    </main>
  )
}
