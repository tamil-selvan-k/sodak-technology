import { auth, hasRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { listLeads } from '@/modules/leads/leads.service'
import Link from 'next/link'

export const metadata = { title: 'Leads — SODAK Admin' }

interface Props { searchParams: { status?: string; page?: string } }

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  new:           { label: 'New',           color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  contacted:     { label: 'Contacted',     color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  proposal_sent: { label: 'Proposal Sent', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
  won:           { label: 'Won',           color: '#c8a035', bg: 'rgba(200,160,53,0.15)' },
  lost:          { label: 'Lost',          color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
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
    <main className="flex-1 min-w-0" style={{ padding: '32px 40px', maxWidth: 'calc(100vw - 220px)', minHeight: '100vh', background: 'linear-gradient(160deg, #0a1628 0%, #0c2040 100%)' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c8a035', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-instrument-sans)' }}>Leads CRM</h1>
        <p style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>Manage sales pipeline and lead status</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Leads',  value: pagination.total },
          { label: 'In Pipeline',  value: pipeline },
          { label: 'Won',          value: won },
          { label: 'Lost',         value: lost },
        ].map(c => (
          <div key={c.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{c.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#e2e8f0' }}>{c.value}</div>
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
              background: searchParams.status === s || (!s && !searchParams.status) ? 'rgba(200,160,53,0.18)' : 'rgba(255,255,255,0.04)',
              color:  searchParams.status === s || (!s && !searchParams.status) ? '#c8a035' : '#94a3b8',
              border: `1px solid ${searchParams.status === s || (!s && !searchParams.status) ? 'rgba(200,160,53,0.3)' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            {s ? (STATUS_MAP[s]?.label ?? s) : 'All'}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.06)' }}>
              {['Name', 'Email', 'Role', 'Institution / Company', 'Program', 'Source', 'Status', 'Date'].map(h => (
                <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '40px 14px', textAlign: 'center', fontSize: 13, color: '#475569' }}>
                  No leads found.
                </td>
              </tr>
            )}
            {data.map(lead => {
              const sm = STATUS_MAP[lead.status] ?? STATUS_MAP.new!
              return (
                <tr key={lead.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} className="hover:bg-[rgba(255,255,255,0.04)]">
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{lead.name}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#94a3b8' }}>{lead.email}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#94a3b8' }}>{lead.role ?? '—'}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#94a3b8' }}>{lead.institutionOrCompany ?? '—'}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#94a3b8' }}>{lead.programOfInterest ?? '—'}</td>
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
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Page {pagination.page} of {pagination.pages} ({pagination.total} total)</span>
          {pagination.page > 1 && (
            <Link href={`/admin/leads?page=${pagination.page - 1}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
              style={{ padding: '6px 14px', fontSize: 13, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, textDecoration: 'none', color: '#e2e8f0', background: 'rgba(255,255,255,0.06)' }}>
              ← Previous
            </Link>
          )}
          {pagination.page < pagination.pages && (
            <Link href={`/admin/leads?page=${pagination.page + 1}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
              style={{ padding: '6px 14px', fontSize: 13, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, textDecoration: 'none', color: '#e2e8f0', background: 'rgba(255,255,255,0.06)' }}>
              Next →
            </Link>
          )}
        </div>
      )}
    </main>
  )
}
