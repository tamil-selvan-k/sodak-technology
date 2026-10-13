'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCallback, useTransition, useState, useEffect, useRef } from 'react'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'

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
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
          style={{ background: '#EFF6FF', border: '1px solid #DBEAFE', color: '#334155' }}
        />
        <select
          defaultValue={status}
          onChange={e => updateParam('status', e.target.value)}
          style={{ appearance: 'none', WebkitAppearance: 'none', background: "#ffffff url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%2364748b'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\") no-repeat right 10px center", backgroundSize: '16px', border: '1px solid #dbeafe', borderRadius: 8, padding: '8px 32px 8px 12px', fontSize: 13, color: '#334155', cursor: 'pointer', outline: 'none', minWidth: 130 }}
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="in_review">In Review</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #DBEAFE', borderRadius: 12, overflow: openMenu ? 'visible' : 'hidden' }}>
        <div style={{ overflowX: openMenu ? 'visible' : 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#EFF6FF' }}>
              {['Title', 'Author', 'Category', 'Status', 'Published', ''].map(h => (
                <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '40px 14px', textAlign: 'center', fontSize: 13, color: '#64748b' }}>No posts found.</td>
              </tr>
            )}
            {posts.map(p => {
              const sb = STATUS_BADGE[p.status] ?? { label: p.status, variant: 'dark' as const }
              return (
                <tr key={p.id} className="hover:bg-[#EFF6FF]" style={{ borderTop: '1px solid #DBEAFE' }}>
                  <td style={{ padding: '11px 14px', maxWidth: 300 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#172554', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                    <p style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>/insights/{p.slug}</p>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#334155' }}>{p.authorName ?? '—'}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#334155' }}>{p.category ?? '—'}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <Badge variant={sb.variant}>{sb.label}</Badge>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#64748b' }}>{formatDate(p.publishedAt)}</td>
                  <td style={{ padding: '11px 14px', position: 'relative' }}>
                    <div ref={openMenu === p.id ? menuRef : undefined} style={{ display: 'inline-block', position: 'relative' }}>
                      <button
                        onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}
                        style={{ width: 32, height: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'none', border: '1px solid #dbeafe', borderRadius: 8, cursor: 'pointer', padding: 0 }}
                        title="Actions"
                      >
                        {[0,1,2].map(i => <span key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: '#64748b', display: 'block' }} />)}
                      </button>
                      {openMenu === p.id && (
                        <div style={{ position: 'absolute', right: 0, top: '110%', background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 10, boxShadow: '0 8px 24px rgba(37,99,235,0.12)', minWidth: 148, zIndex: 50, overflow: 'hidden' }}>
                          <Link
                            href={`/admin/blog/${p.id}`}
                            onClick={() => setOpenMenu(null)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', fontSize: 13, color: '#172554', textDecoration: 'none', fontWeight: 500 }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            Edit
                          </Link>
                          {p.status !== 'published' ? (
                            <button
                              onClick={() => { callApi(`/api/v1/blog/${p.id}/publish`, 'POST'); setOpenMenu(null) }}
                              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', fontSize: 13, color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, textAlign: 'left' }}
                              onMouseEnter={e => (e.currentTarget.style.background = '#f0fdf4')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              Publish
                            </button>
                          ) : (
                            <button
                              onClick={() => { callApi(`/api/v1/blog/${p.id}/unpublish`, 'POST'); setOpenMenu(null) }}
                              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', fontSize: 13, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, textAlign: 'left' }}
                              onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              Unpublish
                            </button>
                          )}
                          <div style={{ height: 1, background: '#f1f5f9', margin: '2px 0' }} />
                          <button
                            onClick={async () => {
                              if (!window.confirm(`Delete "${p.title}"?`)) return
                              await callApi(`/api/v1/blog/${p.id}`, 'DELETE')
                              setOpenMenu(null)
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', fontSize: 13, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, textAlign: 'left' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            Delete
                          </button>
                        </div>
                      )}
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
