import { auth } from '@/lib/auth'
import { listInternships } from '@/modules/internships/internships.service'

export const metadata = { title: 'Internships — SODAK Admin' }

export default async function AdminInternshipsPage() {
  await auth()
  const { data } = await listInternships({})
  // TODO: Implement Internships admin — wireframe: admin/internships.html
  return <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
}
