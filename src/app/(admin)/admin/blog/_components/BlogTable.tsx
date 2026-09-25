'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCallback, useTransition } from 'react'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'

const btnEdit    = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[rgba(96,165,250,0.25)] bg-[rgba(96,165,250,0.08)] text-[#60a5fa] hover:bg-[rgba(96,165,250,0.14)] transition-colors'
const btnPublish = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[rgba(74,222,128,0.25)] bg-[rgba(74,222,128,0.08)] text-[#4ade80] hover:bg-[rgba(74,222,128,0.14)] transition-colors'
const btnUnpub   = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[rgba(251,191,36,0.25)] bg-[rgba(251,191,36,0.08)] text-[#fbbf24] hover:bg-[rgba(251,191,36,0.14)] transition-colors'
const btnDelete  = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.08)] text-[#f87171] hover:bg-[rgba(248,113,113,0.14)] transition-colors'

interface SerializedPost {
  id: string
  title: string
  slug: string
  status: string
  category: string | null
  authorName: string | null
  publishedAt: string | null
  updatedAt: string
}

const STATUS_BADGE: Record<string, { label: string; variant: 'green' | 'amber' | 'blue' | 'dark' }> = {
  published: { label: 'Published', variant: 'green' },
  in_review: { label: 'In Review', variant: 'amber' },
  draft:     { label: 'Draft',     variant: 'dark' },
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface Props {
  posts:      SerializedPost[]
  pagination: { total: number; page: number; perPage: number; pages: number }
  search?:    string
  status?:    string
}

export default function BlogTable({ posts, pagination, search = '', status = '' }: Props) {
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
          placeholder="Search posts…"
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
          <option value="in_review" style={{ background: '#1a2342' }}>In Review</option>
          <option value="draft" style={{ background: '#1a2342' }}>Draft</option>
        </select>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.06)' }}>
              {['Title', 'Author', 'Category', 'Status', 'Published', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '40px 14px', textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>No posts found.</td>
              </tr>
            )}
            {posts.map(p => {
              const sb = STATUS_BADGE[p.status] ?? { label: p.status, variant: 'dark' as const }
              return (
                <tr key={p.id} className="hover:bg-[rgba(255,255,255,0.04)]" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: '11px 14px', maxWidth: 300 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>/insights/{p.slug}</p>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#e2e8f0' }}>{p.authorName ?? '—'}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#e2e8f0' }}>{p.category ?? '—'}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <Badge variant={sb.variant}>{sb.label}</Badge>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#94a3b8' }}>{formatDate(p.publishedAt)}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <Link href={`/admin/blog/${p.id}`} className={btnEdit}>Edit</Link>
                      {p.status !== 'published'
                        ? <button className={btnPublish} onClick={() => callApi(`/api/v1/blog/${p.id}/publish`, 'POST')}>Publish</button>
                        : <button className={btnUnpub}   onClick={() => callApi(`/api/v1/blog/${p.id}/unpublish`, 'POST')}>Unpublish</button>
                      }
                      <button className={btnDelete} onClick={async () => {
                        if (!window.confirm(`Delete "${p.title}"?`)) return
                        await callApi(`/api/v1/blog/${p.id}`, 'DELETE')
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
