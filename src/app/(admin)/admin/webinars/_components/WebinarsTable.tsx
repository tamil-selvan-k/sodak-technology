'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCallback, useTransition } from 'react'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'

const btnEdit    = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[rgba(59,130,246,0.2)] bg-[rgba(59,130,246,0.07)] text-[#3b82f6] hover:bg-[rgba(59,130,246,0.12)] transition-colors'
const btnPublish = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.07)] text-[#16a34a] hover:bg-[rgba(34,197,94,0.12)] transition-colors'
const btnUnpub   = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[rgba(234,179,8,0.2)] bg-[rgba(234,179,8,0.07)] text-[#b45309] hover:bg-[rgba(234,179,8,0.12)] transition-colors'
const btnDelete  = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.07)] text-[#ef4444] hover:bg-[rgba(239,68,68,0.12)] transition-colors'

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
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-[var(--gold-500)]"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              {['Title', 'Presenter', 'Platform', 'Scheduled', 'Duration', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {webinars.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '40px 14px', textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>No webinars found.</td>
              </tr>
            )}
            {webinars.map(w => {
              const isUpcoming = w.scheduledAt && new Date(w.scheduledAt) >= now
              return (
                <tr key={w.id} className="hover:bg-[#f8fafc]" style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '11px 14px', maxWidth: 260 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.title}</p>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#334155' }}>{w.presenterName ?? '—'}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#334155' }}>{w.platform ?? '—'}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: '#475569' }}>
                    <span>{formatDate(w.scheduledAt)}</span>
                    {w.scheduledAt && (
                      <Badge variant={isUpcoming ? 'blue' : 'light'} className="ml-2">{isUpcoming ? 'Upcoming' : 'Past'}</Badge>
                    )}
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#334155' }}>
                    {w.durationMinutes ? `${w.durationMinutes} min` : '—'}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <Badge variant={w.isPublished ? 'green' : 'light'}>{w.isPublished ? 'Published' : 'Draft'}</Badge>
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
