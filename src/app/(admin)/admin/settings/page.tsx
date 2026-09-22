import { auth, hasRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSettings } from '@/modules/settings/settings.service'

export const metadata = { title: 'Settings — SODAK Admin' }

export default async function AdminSettingsPage() {
  const session = await auth()
  if (!session || !hasRole(session, 'super_admin')) redirect('/admin')
  const settings = await getSettings()
  // TODO: Implement Settings page — wireframe: admin/settings.html
  return <pre className="text-xs">{JSON.stringify(settings, null, 2)}</pre>
}
