'use client'

import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import Link from 'next/link'
import { useToast } from '@/components/ui/Toast'
import type { Lead } from '@prisma/client'

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  new:           { label: 'New',           color: '#2563eb', bg: 'rgba(59,130,246,0.1)' },
  contacted:     { label: 'Contacted',     color: '#92400e', bg: 'rgba(251,191,36,0.1)' },
  proposal_sent: { label: 'Proposal Sent', color: '#166534', bg: 'rgba(34,197,94,0.1)' },
  won:           { label: 'Won',           color: '#2563EB', bg: 'rgba(37,99,235,0.12)' },
  lost:          { label: 'Lost',          color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
}

const STATUS_OPTIONS = ['new', 'contacted', 'proposal_sent', 'won', 'lost'] as const
type LeadStatus = typeof STATUS_OPTIONS[number]

interface PaginationMeta { total: number; page: number; perPage: number; pages: number }
interface Props { leads: Lead[]; pagination: PaginationMeta; currentStatus?: string }

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function LeadsTable({ leads, pagination, currentStatus }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [updating, setUpdating] = useState<string | null>(null)

  async function handleStatusChange(id: string, status: LeadStatus) {
    setUpdating(id)
    const res = await fetch(`/api/v1/leads/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setUpdating(null)
    if (res.ok) {
      toast.success('Status updated.')
      startTransition(() => router.refresh())
    } else {
      toast.error('Failed to update status.')
    }
  }

  return (
    <>
      {/* Table */}
      <div className={`transition-opacity ${isPending ? 'opacity-60' : ''}`} style={{ background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(37,99,235,0.06)' }}>
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
                const sm = STATUS_MAP[lead.status] ?? STATUS_MAP.new!
                const isUpdating = updating === lead.id
                return (
                  <tr key={lead.id} style={{ borderTop: '1px solid #DBEAFE' }} className="hover:bg-[#EFF6FF]">
                    <td style={{ padding: '11px 14px', fontSize: 13, color: '#334155', fontWeight: 600 }}>{lead.name}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: '#64748b' }}>{lead.email}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: '#64748b' }}>{lead.role ?? '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: '#64748b' }}>{lead.institutionOrCompany ?? '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: '#64748b' }}>{lead.programOfInterest ?? '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{lead.source ?? '—'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <select
                        value={lead.status}
                        disabled={isUpdating}
                        onChange={e => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                        style={{
                          padding: '3px 8px',
                          paddingRight: 24,
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 700,
                          background: sm.bg,
                          color: sm.color,
                          border: `1px solid ${sm.color}33`,
                          cursor: isUpdating ? 'not-allowed' : 'pointer',
                          outline: 'none',
                          appearance: 'auto',
                          opacity: isUpdating ? 0.6 : 1,
                          transition: 'opacity 0.15s',
                        }}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s} style={{ fontWeight: 600, background: '#fff', color: '#172554' }}>
                            {STATUS_MAP[s]!.label}
                          </option>
                        ))}
                      </select>
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
