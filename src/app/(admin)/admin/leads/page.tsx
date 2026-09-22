import { auth, hasRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { listLeads } from '@/modules/leads/leads.service'

export const metadata = { title: 'Leads — SODAK Admin' }

interface Props { searchParams: { status?: string; page?: string } }

export default async function AdminLeadsPage({ searchParams }: Props) {
  const session = await auth()
  if (!session || !hasRole(session, 'sales')) redirect('/admin')

  const { data, pagination } = await listLeads({ status: searchParams.status as never, page: searchParams.page ? Number(searchParams.page) : 1 })
  // TODO: Implement Leads CRM — wireframe: admin/leads.html
  return <pre className="text-xs">{JSON.stringify({ data, pagination }, null, 2)}</pre>
}
