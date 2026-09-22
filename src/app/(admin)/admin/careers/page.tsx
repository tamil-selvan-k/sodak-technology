import { auth } from '@/lib/auth'
import { listJobs } from '@/modules/careers/careers.service'

export const metadata = { title: 'Careers — SODAK Admin' }

export default async function AdminCareersPage() {
  await auth()
  const { data } = await listJobs({})
  // TODO: Implement Careers admin — wireframe: admin/careers.html
  return <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
}
