'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCallback, useTransition, useState, useEffect, useRef } from 'react'
import type { TrainerWithStacks } from '@/modules/trainers/trainers.types'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'

interface Props {
  trainers: TrainerWithStacks[]
  pagination: { total: number; page: number; perPage: number; pages: number }
  search?: string
  status?: string
  mentor?: string
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function TrainersTable({ trainers, pagination, search = '', status = '', mentor = '' }: Props) {
  const router = useRouter()
  const pathname = usePathname()
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
    if (value) params.set(key, value)
    else params.delete(key)
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

  async function handlePublish(id: string) {
    await callApi(`/api/v1/trainers/${id}/publish`, 'POST')
  }
  async function handleUnpublish(id: string) {
    await callApi(`/api/v1/trainers/${id}/unpublish`, 'POST')
  }
  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete trainer "${name}"? This cannot be undone.`)) return
    await callApi(`/api/v1/trainers/${id}`, 'DELETE')
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="search"
          placeholder="Search trainers…"
          defaultValue={search}
          onChange={e => updateParam('search', e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 text-sm rounded-lg focus:outline-none"
          style={{ background: '#ffffff', border: '1px solid #DBEAFE', color: '#172554' }}
        />
        <select
          defaultValue={status}
          onChange={e => updateParam('status', e.target.value)}
          style={{ appearance: 'none', WebkitAppearance: 'none', background: "#ffffff url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%2364748b'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\") no-repeat right 10px center", backgroundSize: '16px', border: '1px solid #dbeafe', borderRadius: 8, padding: '8px 32px 8px 12px', fontSize: 13, color: '#334155', cursor: 'pointer', outline: 'none', minWidth: 130 }}
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select
          defaultValue={mentor}
          onChange={e => updateParam('mentor', e.target.value)}
          style={{ appearance: 'none', WebkitAppearance: 'none', background: "#ffffff url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%2364748b'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\") no-repeat right 10px center", backgroundSize: '16px', border: '1px solid #dbeafe', borderRadius: 8, padding: '8px 32px 8px 12px', fontSize: 13, color: '#334155', cursor: 'pointer', outline: 'none', minWidth: 130 }}
        >
          <option value="">All Roles</option>
          <option value="1">Mentors only</option>
          <option value="0">Trainers only</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#ffffff', border: '1px solid #DBEAFE', borderRadius: '1rem', overflow: openMenu ? 'visible' : 'hidden' }}>
        <div style={{ overflowX: openMenu ? 'visible' : 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table className="w-full border-collapse" style={{ minWidth: 680 }}>
          <thead>
            <tr style={{ background: '#EFF6FF' }}>
              {['Photo','Name','Company','Stacks','Status',''].map(h => (
                <th key={h} className="px-3.5 py-2.5 text-left text-[11px] font-bold uppercase text-[#64748b]" style={{ letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trainers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-[#64748b]">No trainers found.</td>
              </tr>
            )}
            {trainers.map(t => (
              <tr key={t.id} className="border-t border-[#DBEAFE] hover:bg-[#EFF6FF] transition-colors">
                <td className="px-3.5 py-[11px] text-[13px]">
                  {t.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.photoUrl} alt={t.name} className="w-11 h-11 rounded-full object-cover" />
                  ) : (
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-[15px] font-bold flex-shrink-0"
                      style={{ background: 'rgba(37,99,235,0.12)', color: '#2563EB' }}
                    >
                      {initials(t.name)}
                    </div>
                  )}
                </td>
                <td className="px-3.5 py-[11px] text-[13px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-[13px] text-[#172554]">{t.name}</strong>
                    {!t.consentOnFile && <Badge variant="amber">No Consent</Badge>}
                    {t.isFeatured && <Badge variant="gold">Featured</Badge>}
                  </div>
                  {t.designation && <span className="text-[11px] text-[#64748b]">{t.designation}</span>}
                </td>
                <td className="px-3.5 py-[11px] text-[13px] text-[#334155]">
                  <strong className="text-[13px]">{t.currentCompany ?? '—'}</strong>
                </td>
                <td className="px-3.5 py-[11px] text-[13px] text-[#334155]">
                  <div className="flex flex-wrap gap-1">
                    {t.stacks.map(s => (
                      <Badge key={s.stack.id} variant="light">{s.stack.name}</Badge>
                    ))}
                    {t.stacks.length === 0 && <span className="text-[#64748b] text-xs">—</span>}
                  </div>
                </td>
                <td className="px-3.5 py-[11px]">
                  <div className="flex flex-col gap-1">
                    <Badge variant={t.isPublished ? 'green' : 'amber'}>
                      {t.isPublished ? 'Active' : 'Draft'}
                    </Badge>
                    {t.isMentor && <Badge variant="blue">Mentor</Badge>}
                  </div>
                </td>
                <td className="px-3.5 py-[11px]" style={{ position: 'relative' }}>
                  <div ref={openMenu === t.id ? menuRef : undefined} style={{ display: 'inline-block', position: 'relative' }}>
                    <button
                      onClick={() => setOpenMenu(openMenu === t.id ? null : t.id)}
                      style={{ width: 32, height: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'none', border: '1px solid #dbeafe', borderRadius: 8, cursor: 'pointer', padding: 0 }}
                      title="Actions"
                    >
                      {[0,1,2].map(i => <span key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: '#64748b', display: 'block' }} />)}
                    </button>
                    {openMenu === t.id && (
                      <div style={{ position: 'absolute', right: 0, top: '110%', background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 10, boxShadow: '0 8px 24px rgba(37,99,235,0.12)', minWidth: 148, zIndex: 50, overflow: 'hidden' }}>
                        <Link
                          href={`/admin/trainers/${t.id}`}
                          onClick={() => setOpenMenu(null)}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', fontSize: 13, color: '#172554', textDecoration: 'none', fontWeight: 500 }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          Edit
                        </Link>
                        {t.isPublished ? (
                          <button
                            onClick={() => { handleUnpublish(t.id); setOpenMenu(null) }}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', fontSize: 13, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, textAlign: 'left' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => { if (t.consentOnFile) { handlePublish(t.id); setOpenMenu(null) } }}
                            disabled={!t.consentOnFile}
                            title={!t.consentOnFile ? 'Consent required' : undefined}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', fontSize: 13, color: t.consentOnFile ? '#16a34a' : '#94a3b8', background: 'none', border: 'none', cursor: t.consentOnFile ? 'pointer' : 'not-allowed', fontWeight: 500, textAlign: 'left' }}
                            onMouseEnter={e => { if (t.consentOnFile) (e.currentTarget.style.background = '#f0fdf4') }}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            Publish
                          </button>
                        )}
                        <div style={{ height: 1, background: '#f1f5f9', margin: '2px 0' }} />
                        <button
                          onClick={() => { handleDelete(t.id, t.name); setOpenMenu(null) }}
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
            ))}
          </tbody>
        </table>
        </div>{/* /scroll-wrapper */}
      </div>

      <Pagination {...pagination} />
    </div>
  )
}
