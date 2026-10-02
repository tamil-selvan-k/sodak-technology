import { auth } from '@/lib/auth'
import { listLeads } from '@/modules/leads/leads.service'
import Link from 'next/link'
import EnquiryStatusSelect from './_components/EnquiryStatusSelect'

export const metadata = { title: 'Enquiries — SODAK Admin' }

interface Props { searchParams: { status?: string; page?: string } }


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
    <main className="flex-1 min-w-0" style={{ padding: '32px 40px', maxWidth: 'calc(100vw - 220px)', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4865ad', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>Enquiries</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Leads and contact form submissions from the website</p>
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
          <div key={c.label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{c.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#334155' }}>{c.value}</div>
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
              background: searchParams.status === s || (!s && !searchParams.status) ? 'rgba(72,101,173,0.18)' : '#ffffff',
              color:  searchParams.status === s || (!s && !searchParams.status) ? '#4865ad' : '#94a3b8',
              border: `1px solid ${searchParams.status === s || (!s && !searchParams.status) ? 'rgba(72,101,173,0.3)' : '#e2e8f0'}`,
            }}
          >
            {s ? ({ new: 'New', contacted: 'Contacted', proposal_sent: 'Proposal Sent', won: 'Won', lost: 'Lost' }[s] ?? s) : 'All'}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Name', 'Email', 'Role', 'Institution', 'Program', 'Status', 'Date'].map(h => (
                <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '40px 14px', textAlign: 'center', fontSize: 13, color: '#64748b' }}>
                  No enquiries found.
                </td>
              </tr>
            )}
            {data.map(lead => {
              return (
                <tr key={lead.id} style={{ borderTop: '1px solid #f1f5f9' }} className="hover:bg-[#f8fafc]">
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#334155', fontWeight: 600 }}>{lead.name}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#64748b' }}>{lead.email}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#64748b' }}>{lead.role ?? '—'}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#64748b' }}>{lead.institutionOrCompany ?? '—'}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#64748b' }}>{lead.programOfInterest ?? '—'}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <EnquiryStatusSelect leadId={lead.id} status={lead.status as never} />
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
            <Link href={`/admin/enquiries?page=${pagination.page - 1}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
              style={{ padding: '6px 14px', fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 6, textDecoration: 'none', color: '#334155', background: '#f8fafc' }}>
              ← Previous
            </Link>
          )}
          {pagination.page < pagination.pages && (
            <Link href={`/admin/enquiries?page=${pagination.page + 1}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
              style={{ padding: '6px 14px', fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 6, textDecoration: 'none', color: '#334155', background: '#f8fafc' }}>
              Next →
            </Link>
          )}
        </div>
      )}

      <p style={{ marginTop: 16, fontSize: 12, color: '#64748b' }}>
        Showing {data.length} of {pagination.total} enquiries. Sorted newest first.
      </p>
    </main>
  )
}
