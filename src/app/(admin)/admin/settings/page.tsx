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
    <main className="flex-1 min-w-0" style={{ padding: '32px 40px', maxWidth: 'calc(100vw - 220px)', minHeight: '100vh', background: 'linear-gradient(160deg, #0a1628 0%, #0c2040 100%)' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c8a035', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-instrument-sans)' }}>Site Settings</h1>
        <p style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>Manage site-wide content and configuration</p>
      </div>
      <SettingsForm settings={serialised} />
    </main>
  )
}
