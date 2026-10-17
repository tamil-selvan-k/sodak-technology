'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCallback, useTransition, useState, useEffect, useRef } from 'react'
import type { TrainerWithStacks } from '@/modules/trainers/trainers.types'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'
import { useToast } from '@/components/ui/Toast'
import { useConfirm } from '@/components/ui/ConfirmDialog'

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
    if (value) params.set(key, value)
    else params.delete(key)
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
    const ok = await callApi(`/api/v1/trainers/${id}/publish`, 'POST')
    if (ok) toast.success('Trainer published!')
  }
  async function handleUnpublish(id: string) {
    const ok = await callApi(`/api/v1/trainers/${id}/unpublish`, 'POST')
    if (ok) toast.info('Trainer unpublished.')
  }
  async function handleDelete(id: string, name: string) {
    if (!await confirm(`Delete trainer "${name}"? This cannot be undone.`, { title: 'Delete Trainer', confirmLabel: 'Delete', variant: 'danger' })) return
    const ok = await callApi(`/api/v1/trainers/${id}`, 'DELETE')
    if (ok) toast.success('Trainer deleted.')
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
        <div ref={openFilter === 'status' ? filterRef : undefined} style={{ position: 'relative', display: 'inline-block' }}>
          <button
            onClick={() => setOpenFilter(openFilter === 'status' ? null : 'status')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', fontSize: 13, fontWeight: 500, color: status ? '#172554' : '#64748b', background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 8, cursor: 'pointer', outline: 'none', minWidth: 130, justifyContent: 'space-between', transition: 'border-color 0.15s' }}
          >
            <span>{status === 'published' ? 'Published' : status === 'draft' ? 'Draft' : 'All Status'}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#94a3b8', flexShrink: 0, transform: openFilter === 'status' ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}><path d="M7 10l5 5 5-5z"/></svg>
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
        <div ref={openFilter === 'role' ? filterRef : undefined} style={{ position: 'relative', display: 'inline-block' }}>
          <button
            onClick={() => setOpenFilter(openFilter === 'role' ? null : 'role')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', fontSize: 13, fontWeight: 500, color: mentor ? '#172554' : '#64748b', background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 8, cursor: 'pointer', outline: 'none', minWidth: 130, justifyContent: 'space-between', transition: 'border-color 0.15s' }}
          >
            <span>{mentor === '1' ? 'Mentors only' : mentor === '0' ? 'Trainers only' : 'All Roles'}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#94a3b8', flexShrink: 0, transform: openFilter === 'role' ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}><path d="M7 10l5 5 5-5z"/></svg>
          </button>
          {openFilter === 'role' && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 100, background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 10, boxShadow: '0 8px 24px rgba(37,99,235,0.12)', minWidth: '100%', overflow: 'hidden' }}>
              {[{ value: '', label: 'All Roles' }, { value: '1', label: 'Mentors only' }, { value: '0', label: 'Trainers only' }].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { updateParam('mentor', opt.value); setOpenFilter(null) }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px', fontSize: 13, fontWeight: opt.value === mentor ? 600 : 400, color: opt.value === mentor ? '#2563eb' : '#334155', background: opt.value === mentor ? '#eff6ff' : 'transparent', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => { if (opt.value !== mentor) e.currentTarget.style.background = '#f8fafc' }}
                  onMouseLeave={e => { if (opt.value !== mentor) e.currentTarget.style.background = 'transparent' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
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
                <td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="#dbeafe" style={{ margin: '0 auto 12px' }}><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#172554', marginBottom: 4 }}>No trainers found</p>
                  <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>{search || status || mentor ? 'Try adjusting your filters' : 'Get started by adding your first trainer'}</p>
                  {!search && !status && !mentor && <a href="/admin/trainers/new" style={{ display: 'inline-block', background: '#2563eb', color: '#fff', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Add Trainer</a>}
                </td>
              </tr>
            )}
            {trainers.map(t => (
              <tr key={t.id} className="border-t border-[#DBEAFE] hover:bg-[#EFF6FF] transition-colors">
                <td className="px-3.5 py-[11px] text-[13px]">
                  {t.photoUrl ? (
                    <Image src={t.photoUrl} alt={t.name} width={44} height={44} unoptimized className="w-11 h-11 rounded-full object-cover" />
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
                      aria-label={`Actions for ${t.name}`}
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
