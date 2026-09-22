import { auth } from '@/lib/auth'
import { listWebinars } from '@/modules/webinars/webinars.service'

export const metadata = { title: 'Webinars — SODAK Admin' }

export default async function AdminWebinarsPage() {
  await auth()
  const { data } = await listWebinars({})
  // TODO: Implement Webinars admin — wireframe: admin/webinars.html
  return <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
}
