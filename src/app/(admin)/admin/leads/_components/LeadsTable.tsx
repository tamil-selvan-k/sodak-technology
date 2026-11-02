'use client'

import Link from 'next/link'
import EnquiryStatusSelect from '@/app/(admin)/admin/enquiries/_components/EnquiryStatusSelect'
import type { Lead } from '@prisma/client'

interface PaginationMeta { total: number; page: number; perPage: number; pages: number }
interface Props { leads: Lead[]; pagination: PaginationMeta; currentStatus?: string }

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function LeadsTable({ leads, pagination, currentStatus }: Props) {

  return (
    <>
      {/* Table */}
      <div style={{ background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(37,99,235,0.06)' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: 820, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                {['Name', 'Email', 'Role', 'Institution / Company', 'Program', 'Source', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#172554', textAlign: 'left', borderBottom: '1px solid #dbeafe' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '40px 14px', textAlign: 'center', fontSize: 13, color: '#64748b' }}>
                    No leads found.
                  </td>
                </tr>
              )}
              {leads.map(lead => {
                return (
                  <tr key={lead.id} style={{ borderTop: '1px solid #DBEAFE' }} className="hover:bg-[#EFF6FF]">
                    <td style={{ padding: '11px 14px', fontSize: 13, color: '#334155', fontWeight: 600 }}>{lead.name}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: '#64748b' }}>{lead.email}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: '#64748b' }}>{lead.role ?? '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: '#64748b' }}>{lead.institutionOrCompany ?? '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: '#64748b' }}>{lead.programOfInterest ?? '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{lead.source ?? '—'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <EnquiryStatusSelect leadId={lead.id} status={lead.status as 'new' | 'contacted' | 'proposal_sent' | 'won' | 'lost'} />
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{formatDate(lead.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>Page {pagination.page} of {pagination.pages} ({pagination.total} total)</span>
          {pagination.page > 1 && (
            <Link
              href={`/admin/leads?page=${pagination.page - 1}${currentStatus ? `&status=${currentStatus}` : ''}`}
              style={{ padding: '6px 14px', fontSize: 13, border: '1px solid #DBEAFE', borderRadius: 6, textDecoration: 'none', color: '#334155', background: '#EFF6FF' }}
            >
              ← Previous
            </Link>
          )}
          {pagination.page < pagination.pages && (
            <Link
              href={`/admin/leads?page=${pagination.page + 1}${currentStatus ? `&status=${currentStatus}` : ''}`}
              style={{ padding: '6px 14px', fontSize: 13, border: '1px solid #DBEAFE', borderRadius: 6, textDecoration: 'none', color: '#334155', background: '#EFF6FF' }}
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </>
  )
}
