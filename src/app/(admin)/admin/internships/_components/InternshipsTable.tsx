'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCallback, useTransition, useState, useEffect, useRef } from 'react'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'
import { useToast } from '@/components/ui/Toast'
import { useConfirm } from '@/components/ui/ConfirmDialog'

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
  const { toast } = useToast()
  const confirm = useConfirm()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setOpenFilter(null)
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
      toast.error((body as { error?: { message?: string } }).error?.message ?? 'Request failed')
      return false
    }
    startTransition(() => router.refresh())
    return true
  }, [router, toast])

  async function handlePublish(id: string) {
    const ok = await callApi(`/api/v1/internships/${id}/publish`, 'POST')
    if (ok) toast.success('Internship published!')
  }
  async function handleUnpublish(id: string) {
    const ok = await callApi(`/api/v1/internships/${id}/unpublish`, 'POST')
    if (ok) toast.info('Internship unpublished.')
  }
  async function handleDelete(id: string, company: string, role: string) {
    if (!await confirm(`Delete "${company} — ${role}"? This cannot be undone.`, { title: 'Delete Internship', confirmLabel: 'Delete', variant: 'danger' })) return
    const ok = await callApi(`/api/v1/internships/${id}`, 'DELETE')
    if (ok) toast.success('Internship deleted.')
  }

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
          style={{ background: '#EFF6FF', border: '1px solid #DBEAFE', color: '#334155' }}
        />
        <div ref={openFilter === 'status' ? filterRef : undefined} style={{ position: 'relative', display: 'inline-block' }}>
          <button
            onClick={() => setOpenFilter(openFilter === 'status' ? null : 'status')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', fontSize: 13, fontWeight: 500, color: status ? '#172554' : '#64748b', background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 8, cursor: 'pointer', outline: 'none', minWidth: 130, justifyContent: 'space-between', transition: 'border-color 0.15s' }}
          >
            <span>{status === 'published' ? 'Published' : status === 'draft' ? 'Draft' : 'All Status'}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#94a3b8', flexShrink: 0, transform: openFilter === 'status' ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}><path d="M7 10l5 5 5-5z"/></svg>
          </button>
          {openFilter === 'status' && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 100, background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 10, boxShadow: '0 8px 24px rgba(37,99,235,0.12)', minWidth: '100%', overflow: 'hidden' }}>
              {[{ value: '', label: 'All Status' }, { value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { updateParam('status', opt.value); setOpenFilter(null) }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px', fontSize: 13, fontWeight: opt.value === status ? 600 : 400, color: opt.value === status ? '#2563eb' : '#334155', background: opt.value === status ? '#eff6ff' : 'transparent', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => { if (opt.value !== status) e.currentTarget.style.background = '#f8fafc' }}
                  onMouseLeave={e => { if (opt.value !== status) e.currentTarget.style.background = 'transparent' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #DBEAFE', borderRadius: 12, overflow: openMenu ? 'visible' : 'hidden' }}>
        <div style={{ overflowX: openMenu ? 'visible' : 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#EFF6FF' }}>
              {['Company / Role', 'Location', 'Duration', 'Stipend', 'Stack', 'Deadline', 'Status', ''].map(h => (
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
                <tr key={i.id} className="hover:bg-[#EFF6FF]" style={{ borderTop: '1px solid #DBEAFE' }}>
                  <td style={{ padding: '11px 14px', maxWidth: 220 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#172554' }}>{i.companyName}</p>
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
                  <td style={{ padding: '11px 14px', position: 'relative' }}>
                    <div ref={openMenu === i.id ? menuRef : undefined} style={{ display: 'inline-block', position: 'relative' }}>
                      <button
                        onClick={() => setOpenMenu(openMenu === i.id ? null : i.id)}
                        style={{ width: 32, height: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'none', border: '1px solid #dbeafe', borderRadius: 8, cursor: 'pointer', padding: 0 }}
                        title="Actions"
                      >
                        {[0,1,2].map(idx => <span key={idx} style={{ width: 4, height: 4, borderRadius: '50%', background: '#64748b', display: 'block' }} />)}
                      </button>
                      {openMenu === i.id && (
                        <div style={{ position: 'absolute', right: 0, top: '110%', background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 10, boxShadow: '0 8px 24px rgba(37,99,235,0.12)', minWidth: 148, zIndex: 50, overflow: 'hidden' }}>
                          <Link
                            href={`/admin/internships/${i.id}`}
                            onClick={() => setOpenMenu(null)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', fontSize: 13, color: '#172554', textDecoration: 'none', fontWeight: 500 }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            Edit
                          </Link>
                          {!i.isPublished ? (
                            <button
                              onClick={() => { void handlePublish(i.id); setOpenMenu(null) }}
                              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', fontSize: 13, color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, textAlign: 'left' }}
                              onMouseEnter={e => (e.currentTarget.style.background = '#f0fdf4')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              Publish
                            </button>
                          ) : (
                            <button
                              onClick={() => { void handleUnpublish(i.id); setOpenMenu(null) }}
                              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', fontSize: 13, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, textAlign: 'left' }}
                              onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              Unpublish
                            </button>
                          )}
                          <div style={{ height: 1, background: '#f1f5f9', margin: '2px 0' }} />
                          <button
                            onClick={() => { void handleDelete(i.id, i.companyName, i.roleTitle); setOpenMenu(null) }}
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
