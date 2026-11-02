import { auth, hasRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { listLeads } from '@/modules/leads/leads.service'
import Link from 'next/link'
import LeadsTable from './_components/LeadsTable'

export const metadata = { title: 'Leads — SODAK Admin' }

interface Props { searchParams: { status?: string; page?: string } }


export default async function AdminLeadsPage({ searchParams }: Props) {
  const session = await auth()
  if (!session || !hasRole(session, 'sales')) redirect('/admin')

  const { data, pagination } = await listLeads({ status: searchParams.status as never, page: searchParams.page ? Number(searchParams.page) : 1 })

  const won        = data.filter(l => l.status === 'won').length
  const lost       = data.filter(l => l.status === 'lost').length
  const pipeline   = data.filter(l => ['new','contacted','proposal_sent'].includes(l.status)).length

  return (
    <main className="admin-main">
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563EB', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172554', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>Leads CRM</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Manage sales pipeline and lead status</p>
      </div>

      {/* Stat cards */}
      <div className="admin-stat-grid-4">
        {[
          { label: 'Total Leads',  value: pagination.total },
          { label: 'In Pipeline',  value: pipeline },
          { label: 'Won',          value: won },
          { label: 'Lost',         value: lost },
        ].map(c => (
          <div key={c.label} style={{ background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{c.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#334155' }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Status filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {['', 'new', 'contacted', 'proposal_sent', 'won', 'lost'].map(s => (
          <Link
            key={s}
            href={s ? `/admin/leads?status=${s}` : '/admin/leads'}
            style={{
              padding: '6px 14px', fontSize: 12, fontWeight: 600, borderRadius: 6,
              textDecoration: 'none',
              background: searchParams.status === s || (!s && !searchParams.status) ? '#EFF6FF' : '#ffffff',
              color:  searchParams.status === s || (!s && !searchParams.status) ? '#2563EB' : '#64748b',
              border: `1px solid ${searchParams.status === s || (!s && !searchParams.status) ? '#2563EB' : '#DBEAFE'}`,
            }}
          >
            {s ? ({ new: 'New', contacted: 'Contacted', proposal_sent: 'Proposal Sent', won: 'Won', lost: 'Lost' }[s] ?? s) : 'All'}
          </Link>
        ))}
      </div>

      <LeadsTable leads={data} pagination={pagination} currentStatus={searchParams.status} />
    </main>
  )
}
