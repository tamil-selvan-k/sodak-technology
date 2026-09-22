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

const STATUS_BADGE: Record<string, { label: string; variant: 'green' | 'amber' | 'blue' | 'light' }> = {
  published: { label: 'Published', variant: 'green' },
  in_review: { label: 'In Review', variant: 'amber' },
  draft:     { label: 'Draft',     variant: 'light' },
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
          className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[var(--gold-500)]"
        />
        <select
          defaultValue={status}
          onChange={e => updateParam('status', e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-[var(--gold-500)]"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="in_review">In Review</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              {['Title', 'Author', 'Category', 'Status', 'Published', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', textAlign: 'left' }}>{h}</th>
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
              const sb = STATUS_BADGE[p.status] ?? { label: p.status, variant: 'light' as const }
              return (
                <tr key={p.id} className="hover:bg-[#f8fafc]" style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '11px 14px', maxWidth: 300 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>/insights/{p.slug}</p>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#334155' }}>{p.authorName ?? '—'}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#334155' }}>{p.category ?? '—'}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <Badge variant={sb.variant}>{sb.label}</Badge>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#64748b' }}>{formatDate(p.publishedAt)}</td>
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
