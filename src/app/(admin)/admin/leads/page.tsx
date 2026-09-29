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
  won:           { label: 'Won',           color: '#4865ad', bg: 'rgba(72,101,173,0.1)' },
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
    <main className="flex-1 min-w-0" style={{ padding: '32px 40px', maxWidth: 'calc(100vw - 220px)', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4865ad', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>Leads CRM</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Manage sales pipeline and lead status</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Leads',  value: pagination.total },
          { label: 'In Pipeline',  value: pipeline },
          { label: 'Won',          value: won },
          { label: 'Lost',         value: lost },
        ].map(c => (
          <div key={c.label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 24px' }}>
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
              background: searchParams.status === s || (!s && !searchParams.status) ? 'rgba(72,101,173,0.18)' : '#ffffff',
              color:  searchParams.status === s || (!s && !searchParams.status) ? '#4865ad' : '#94a3b8',
              border: `1px solid ${searchParams.status === s || (!s && !searchParams.status) ? 'rgba(72,101,173,0.3)' : '#e2e8f0'}`,
            }}
          >
            {s ? (STATUS_MAP[s]?.label ?? s) : 'All'}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
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
                <tr key={lead.id} style={{ borderTop: '1px solid #f1f5f9' }} className="hover:bg-[#f8fafc]">
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
      </div>

      {pagination.pages > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>Page {pagination.page} of {pagination.pages} ({pagination.total} total)</span>
          {pagination.page > 1 && (
            <Link href={`/admin/leads?page=${pagination.page - 1}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
              style={{ padding: '6px 14px', fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 6, textDecoration: 'none', color: '#334155', background: '#f8fafc' }}>
              ← Previous
            </Link>
          )}
          {pagination.page < pagination.pages && (
            <Link href={`/admin/leads?page=${pagination.page + 1}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
              style={{ padding: '6px 14px', fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 6, textDecoration: 'none', color: '#334155', background: '#f8fafc' }}>
              Next →
            </Link>
          )}
        </div>
      )}
    </main>
  )
}
