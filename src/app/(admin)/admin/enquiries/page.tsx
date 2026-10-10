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
    <main className="admin-main">
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563EB', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172554', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>Enquiries</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Leads and contact form submissions from the website</p>
      </div>

      {/* Stat cards */}
      <div className="admin-stat-grid-5">
        {[
          { label: 'Total Enquiries', value: pagination.total },
          { label: 'New',             value: newCount },
          { label: 'Contacted',       value: contactedCount },
          { label: 'Proposal Sent',   value: proposalSentCount },
          { label: 'Won',             value: wonCount },
        ].map(c => (
          <div key={c.label} style={{ background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 12, padding: '20px 24px' }}>
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
              background: searchParams.status === s || (!s && !searchParams.status) ? '#EFF6FF' : '#ffffff',
              color:  searchParams.status === s || (!s && !searchParams.status) ? '#2563EB' : '#64748b',
              border: `1px solid ${searchParams.status === s || (!s && !searchParams.status) ? '#2563EB' : '#DBEAFE'}`,
            }}
          >
            {s ? ({ new: 'New', contacted: 'Contacted', proposal_sent: 'Proposal Sent', won: 'Won', lost: 'Lost' }[s] ?? s) : 'All'}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(37,99,235,0.06)' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              {['Name', 'Email', 'Role', 'Institution', 'Program', 'Status', 'Date'].map(h => (
                <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#172554', textAlign: 'left', borderBottom: '1px solid #dbeafe' }}>{h}</th>
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
                <tr key={lead.id} style={{ borderTop: '1px solid #DBEAFE' }} className="hover:bg-[#EFF6FF]">
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
        </div>{/* /scroll-wrapper */}
      </div>

      {pagination.pages > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>Page {pagination.page} of {pagination.pages} ({pagination.total} total)</span>
          {pagination.page > 1 && (
            <Link href={`/admin/enquiries?page=${pagination.page - 1}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
              style={{ padding: '6px 14px', fontSize: 13, border: '1px solid #DBEAFE', borderRadius: 6, textDecoration: 'none', color: '#334155', background: '#EFF6FF' }}>
              ← Previous
            </Link>
          )}
          {pagination.page < pagination.pages && (
            <Link href={`/admin/enquiries?page=${pagination.page + 1}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
              style={{ padding: '6px 14px', fontSize: 13, border: '1px solid #DBEAFE', borderRadius: 6, textDecoration: 'none', color: '#334155', background: '#EFF6FF' }}>
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
