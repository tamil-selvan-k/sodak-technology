import { auth, hasRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { listLeads } from '@/modules/leads/leads.service'
import Link from 'next/link'

export const metadata = { title: 'Leads — SODAK Admin' }

interface Props { searchParams: { status?: string; page?: string } }

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  new:           { label: 'New',           color: '#2563eb', bg: 'rgba(59,130,246,0.1)' },
  contacted:     { label: 'Contacted',     color: '#92400e', bg: 'rgba(251,191,36,0.1)' },
  proposal_sent: { label: 'Proposal Sent', color: '#166534', bg: 'rgba(34,197,94,0.1)' },
  won:           { label: 'Won',           color: '#2563EB', bg: 'rgba(37,99,235,0.12)' },
  lost:          { label: 'Lost',          color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
}

function formatDate(iso: string | Date) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

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
          <div key={c.label} style={{ background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: 12, padding: '20px 24px' }}>
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
            {s ? (STATUS_MAP[s]?.label ?? s) : 'All'}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#ffffff', border: '1px solid #DBEAFE', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: 750, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#EFF6FF' }}>
              {['Name', 'Email', 'Role', 'Institution / Company', 'Program', 'Source', 'Status', 'Date'].map(h => (
                <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '40px 14px', textAlign: 'center', fontSize: 13, color: '#64748b' }}>
                  No leads found.
                </td>
              </tr>
            )}
            {data.map(lead => {
              const sm = STATUS_MAP[lead.status] ?? STATUS_MAP.new!
              return (
                <tr key={lead.id} style={{ borderTop: '1px solid #DBEAFE' }} className="hover:bg-[#EFF6FF]">
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#334155', fontWeight: 600 }}>{lead.name}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#64748b' }}>{lead.email}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#64748b' }}>{lead.role ?? '—'}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#64748b' }}>{lead.institutionOrCompany ?? '—'}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#64748b' }}>{lead.programOfInterest ?? '—'}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{lead.source ?? '—'}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ padding: '2px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: sm.bg, color: sm.color }}>
                      {sm.label}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{formatDate(lead.createdAt)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>{/* /scroll-wrapper */}
      </div>

      {pagination.pages > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>Page {pagination.page} of {pagination.pages} ({pagination.total} total)</span>
          {pagination.page > 1 && (
            <Link href={`/admin/leads?page=${pagination.page - 1}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
              style={{ padding: '6px 14px', fontSize: 13, border: '1px solid #DBEAFE', borderRadius: 6, textDecoration: 'none', color: '#334155', background: '#EFF6FF' }}>
              ← Previous
            </Link>
          )}
          {pagination.page < pagination.pages && (
            <Link href={`/admin/leads?page=${pagination.page + 1}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
              style={{ padding: '6px 14px', fontSize: 13, border: '1px solid #DBEAFE', borderRadius: 6, textDecoration: 'none', color: '#334155', background: '#EFF6FF' }}>
              Next →
            </Link>
          )}
        </div>
      )}
    </main>
  )
}
