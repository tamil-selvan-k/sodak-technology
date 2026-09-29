'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCallback, useTransition } from 'react'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'

const btnEdit    = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[#dbeafe] bg-[#eff6ff] text-[#2563eb] hover:bg-[#dbeafe] transition-colors'
const btnPublish = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[#bbf7d0] bg-[#f0fdf4] text-[#16a34a] hover:bg-[#bbf7d0] transition-colors'
const btnUnpub   = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[#fef3c7] bg-[#fffbeb] text-[#d97706] hover:bg-[#fef3c7] transition-colors'
const btnDelete  = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[#fecaca] bg-[#fef2f2] text-[#dc2626] hover:bg-[#fecaca] transition-colors'

interface SerializedWebinar {
  id:              string
  title:           string
  platform:        string | null
  presenterName:   string | null
  scheduledAt:     string | null
  durationMinutes: number | null
  isPublished:     boolean
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

interface Props {
  webinars:   SerializedWebinar[]
  pagination: { total: number; page: number; perPage: number; pages: number }
  status?:    string
}

export default function WebinarsTable({ webinars, pagination, status = '' }: Props) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) { params.set(key, value) } else { params.delete(key) }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  const callApi = useCallback(async (url: string, method: string) => {
    const res = await fetch(url, { method })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      alert((body as { error?: { message?: string } }).error?.message ?? 'Request failed')
      return false
    }
    startTransition(() => router.refresh())
    return true
  }, [router])

  const now = new Date()

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          defaultValue={status}
          onChange={e => updateParam('status', e.target.value)}
          className="px-3 py-2 text-sm rounded-lg focus:outline-none"
          style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155' }}
        >
          <option value="" style={{ background: '#f1f5f9' }}>All Status</option>
          <option value="published" style={{ background: '#f1f5f9' }}>Published</option>
          <option value="draft" style={{ background: '#f1f5f9' }}>Draft</option>
        </select>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Title', 'Presenter', 'Platform', 'Scheduled', 'Duration', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {webinars.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '40px 14px', textAlign: 'center', fontSize: 13, color: '#64748b' }}>No webinars found.</td>
              </tr>
            )}
            {webinars.map(w => {
              const isUpcoming = w.scheduledAt && new Date(w.scheduledAt) >= now
              return (
                <tr key={w.id} className="hover:bg-[#f8fafc]" style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '11px 14px', maxWidth: 260 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.title}</p>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#64748b' }}>{w.presenterName ?? '—'}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#64748b' }}>{w.platform ?? '—'}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>
                    <span>{formatDate(w.scheduledAt)}</span>
                    {w.scheduledAt && (
                      <Badge variant={isUpcoming ? 'blue' : 'dark'} className="ml-2">{isUpcoming ? 'Upcoming' : 'Past'}</Badge>
                    )}
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#64748b' }}>
                    {w.durationMinutes ? `${w.durationMinutes} min` : '—'}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <Badge variant={w.isPublished ? 'green' : 'dark'}>{w.isPublished ? 'Published' : 'Draft'}</Badge>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link href={`/admin/webinars/${w.id}`} className={btnEdit}>Edit</Link>
                      {!w.isPublished
                        ? <button className={btnPublish} onClick={() => callApi(`/api/v1/webinars/${w.id}/publish`, 'POST')}>Publish</button>
                        : <button className={btnUnpub}   onClick={() => callApi(`/api/v1/webinars/${w.id}/unpublish`, 'POST')}>Unpublish</button>
                      }
                      <button className={btnDelete} onClick={async () => {
                        if (!window.confirm(`Delete "${w.title}"?`)) return
                        await callApi(`/api/v1/webinars/${w.id}`, 'DELETE')
                      }}>Delete</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <div className="mt-5">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  )
}
