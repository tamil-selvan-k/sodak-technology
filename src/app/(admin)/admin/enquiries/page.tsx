import { auth } from '@/lib/auth'
import { listLeads } from '@/modules/leads/leads.service'

export const metadata = { title: 'Enquiries — SODAK Admin' }

interface Props { searchParams: { status?: string; page?: string } }

export default async function AdminEnquiriesPage({ searchParams }: Props) {
  await auth()
  const { data, pagination } = await listLeads({
    status: searchParams.status as never,
    page: searchParams.page ? Number(searchParams.page) : 1,
  })
  // TODO: Implement Enquiries list — wireframe: admin/enquiries.html
  return <pre className="text-xs">{JSON.stringify({ data, pagination }, null, 2)}</pre>
}
