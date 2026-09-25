import { auth } from '@/lib/auth'
import { listLeads } from '@/modules/leads/leads.service'
import Link from 'next/link'

export const metadata = { title: 'Enquiries — SODAK Admin' }

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

export default async function AdminEnquiriesPage({ searchParams }: Props) {
  await auth()
  const { data, pagination } = await listLeads({
    status: searchParams.status as never,
    page: searchParams.page ? Number(searchParams.page) : 1,
  })

  const newCount           = data.filter(l => l.status === 'new').length
  const contactedCount     = data.filter(l => l.status === 'contacted').length
  const proposalSentCount  = data.filter(l => l.status === 'proposal_sent').length
  const wonCount           = data.filter(l => l.status === 'won').length

  return (
    <main className="flex-1 min-w-0" style={{ padding: '32px 40px', maxWidth: 'calc(100vw - 220px)', minHeight: '100vh', background: 'linear-gradient(160deg, #0a1628 0%, #0c2040 100%)' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c8a035', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-instrument-sans)' }}>Enquiries</h1>
        <p style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>Leads and contact form submissions from the website</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Enquiries', value: pagination.total },
          { label: 'New',             value: newCount },
          { label: 'Contacted',       value: contactedCount },
          { label: 'Proposal Sent',   value: proposalSentCount },
          { label: 'Won',             value: wonCount },
        ].map(c => (
          <div key={c.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{c.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#e2e8f0' }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {['', 'new', 'contacted', 'proposal_sent', 'won', 'lost'].map(s => (
          <Link
            key={s}
            href={s ? `/admin/enquiries?status=${s}` : '/admin/enquiries'}
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
              {['Name', 'Email', 'Role', 'Institution', 'Program', 'Status', 'Date'].map(h => (
                <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '40px 14px', textAlign: 'center', fontSize: 13, color: '#475569' }}>
                  No enquiries found.
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
            <Link href={`/admin/enquiries?page=${pagination.page - 1}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
              style={{ padding: '6px 14px', fontSize: 13, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, textDecoration: 'none', color: '#e2e8f0', background: 'rgba(255,255,255,0.06)' }}>
              ← Previous
            </Link>
          )}
          {pagination.page < pagination.pages && (
            <Link href={`/admin/enquiries?page=${pagination.page + 1}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
              style={{ padding: '6px 14px', fontSize: 13, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, textDecoration: 'none', color: '#e2e8f0', background: 'rgba(255,255,255,0.06)' }}>
              Next →
            </Link>
          )}
        </div>
      )}

      <p style={{ marginTop: 16, fontSize: 12, color: '#94a3b8' }}>
        Showing {data.length} of {pagination.total} enquiries. Sorted newest first.
      </p>
    </main>
  )
}
