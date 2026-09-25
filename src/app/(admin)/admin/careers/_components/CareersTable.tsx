'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCallback, useTransition } from 'react'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'

const btnEdit    = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[rgba(96,165,250,0.25)] bg-[rgba(96,165,250,0.08)] text-[#60a5fa] hover:bg-[rgba(96,165,250,0.14)] transition-colors'
const btnPublish = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[rgba(74,222,128,0.25)] bg-[rgba(74,222,128,0.08)] text-[#4ade80] hover:bg-[rgba(74,222,128,0.14)] transition-colors'
const btnDelete  = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.08)] text-[#f87171] hover:bg-[rgba(248,113,113,0.14)] transition-colors'

interface SerializedJob {
  id:             string
  title:          string
  department:     string | null
  location:       string | null
  employmentType: string | null
  isOpen:         boolean
  isPublished:    boolean
  closesOn:       string | null
  createdAt:      string
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface Props {
  jobs:       SerializedJob[]
  pagination: { total: number; page: number; perPage: number; pages: number }
  search?:    string
  status?:    string
}

export default function CareersTable({ jobs, pagination, search = '', status = '' }: Props) {
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

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="search"
          placeholder="Search jobs…"
          defaultValue={search}
          onChange={e => updateParam('search', e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 text-sm rounded-lg focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0' }}
        />
        <select
          defaultValue={status}
          onChange={e => updateParam('status', e.target.value)}
          className="px-3 py-2 text-sm rounded-lg focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0' }}
        >
          <option value="" style={{ background: '#1a2342' }}>All Status</option>
          <option value="published" style={{ background: '#1a2342' }}>Published</option>
          <option value="draft" style={{ background: '#1a2342' }}>Draft</option>
        </select>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.06)' }}>
              {['Title', 'Department', 'Location', 'Type', 'Status', 'Closes', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '40px 14px', textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>No jobs found.</td>
              </tr>
            )}
            {jobs.map(j => (
              <tr key={j.id} className="hover:bg-[rgba(255,255,255,0.04)]" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <td style={{ padding: '11px 14px', maxWidth: 260 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.title}</p>
                </td>
                <td style={{ padding: '11px 14px', fontSize: 13, color: '#94a3b8' }}>{j.department ?? '—'}</td>
                <td style={{ padding: '11px 14px', fontSize: 13, color: '#94a3b8' }}>{j.location ?? '—'}</td>
                <td style={{ padding: '11px 14px', fontSize: 13, color: '#94a3b8' }}>{j.employmentType ?? '—'}</td>
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Badge variant={j.isPublished ? 'green' : 'dark'}>{j.isPublished ? 'Published' : 'Draft'}</Badge>
                    <Badge variant={j.isOpen ? 'blue' : 'red'}>{j.isOpen ? 'Open' : 'Closed'}</Badge>
                  </div>
                </td>
                <td style={{ padding: '11px 14px', fontSize: 13, color: '#94a3b8' }}>{formatDate(j.closesOn)}</td>
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Link href={`/admin/careers/${j.id}`} className={btnEdit}>Edit</Link>
                    {!j.isPublished && (
                      <button className={btnPublish} onClick={() => callApi(`/api/v1/careers/${j.id}/publish`, 'POST')}>Publish</button>
                    )}
                    <button className={btnDelete} onClick={async () => {
                      if (!window.confirm(`Delete "${j.title}"?`)) return
                      await callApi(`/api/v1/careers/${j.id}`, 'DELETE')
                    }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
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
