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

interface SerializedInternship {
  id:                  string
  companyName:         string
  roleTitle:           string
  location:            string | null
  duration:            string | null
  stipendRange:        string | null
  stackTags:           string[]
  isPublished:         boolean
  applicationDeadline: string | null
  createdAt:           string
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface Props {
  internships: SerializedInternship[]
  pagination:  { total: number; page: number; perPage: number; pages: number }
  search?:     string
  status?:     string
}

export default function InternshipsTable({ internships, pagination, search = '', status = '' }: Props) {
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
        <input
          type="search"
          placeholder="Search by company…"
          defaultValue={search}
          onChange={e => updateParam('search', e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 text-sm rounded-lg focus:outline-none"
          style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155' }}
        />
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
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Company / Role', 'Location', 'Duration', 'Stipend', 'Stack', 'Deadline', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {internships.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '40px 14px', textAlign: 'center', fontSize: 13, color: '#64748b' }}>No internships found.</td>
              </tr>
            )}
            {internships.map(i => {
              const expired = i.applicationDeadline && new Date(i.applicationDeadline) < now
              return (
                <tr key={i.id} className="hover:bg-[#f8fafc]" style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '11px 14px', maxWidth: 220 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{i.companyName}</p>
                    <p style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{i.roleTitle}</p>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#64748b' }}>{i.location ?? '—'}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#64748b' }}>{i.duration ?? '—'}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#64748b' }}>{i.stipendRange ?? '—'}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {i.stackTags.slice(0, 3).map(t => (
                        <Badge key={t} variant="blue">{t}</Badge>
                      ))}
                      {i.stackTags.length > 3 && <Badge variant="dark">+{i.stackTags.length - 3}</Badge>}
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: expired ? '#f87171' : '#94a3b8' }}>
                    {formatDate(i.applicationDeadline)}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <Badge variant={i.isPublished ? 'green' : 'dark'}>{i.isPublished ? 'Published' : 'Draft'}</Badge>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link href={`/admin/internships/${i.id}`} className={btnEdit}>Edit</Link>
                      {!i.isPublished
                        ? <button className={btnPublish} onClick={() => callApi(`/api/v1/internships/${i.id}/publish`, 'POST')}>Publish</button>
                        : <button className={btnUnpub}   onClick={() => callApi(`/api/v1/internships/${i.id}/unpublish`, 'POST')}>Unpublish</button>
                      }
                      <button className={btnDelete} onClick={async () => {
                        if (!window.confirm(`Delete "${i.companyName} — ${i.roleTitle}"?`)) return
                        await callApi(`/api/v1/internships/${i.id}`, 'DELETE')
                      }}>Delete</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>{/* /scroll-wrapper */}
      </div>

      {pagination.pages > 1 && (
        <div className="mt-5">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  )
}
