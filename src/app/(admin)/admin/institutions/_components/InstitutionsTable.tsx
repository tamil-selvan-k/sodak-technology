'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'
import { useToast } from '@/components/ui/Toast'

interface Institution {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  city: string | null
  state: string | null
  type: 'Engineering' | 'Arts' | 'Polytechnic' | 'University' | 'Corporate' | null
  affiliation: string | null
  website: string | null
  isPublished: boolean
  showOnHome: boolean
  logoPermission: boolean
  displayOrder: number
}

interface PaginationMeta { total: number; page: number; perPage: number; pages: number }

interface Props {
  institutions: Institution[]
  pagination: PaginationMeta
}

const INST_TYPES = ['Engineering', 'Arts', 'Polytechnic', 'University', 'Corporate']

export default function InstitutionsTable({ institutions, pagination }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
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

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  async function handlePublish(id: string, publish: boolean) {
    const action = publish ? 'publish' : 'unpublish'
    const res = await fetch(`/api/v1/institutions/${id}/${action}`, { method: 'POST' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      toast.error((body as { error?: { message?: string } }).error?.message ?? 'Request failed')
      return
    }
    if (publish) toast.success('Institution published!')
    else toast.info('Institution unpublished.')
    startTransition(() => router.refresh())
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    const res = await fetch(`/api/v1/institutions/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      toast.error((body as { error?: { message?: string } }).error?.message ?? 'Delete failed')
      return
    }
    toast.success('Institution deleted.')
    startTransition(() => router.refresh())
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="search"
          placeholder="Search institutions…"
          defaultValue={searchParams.get('search') ?? ''}
          onChange={e => updateFilter('search', e.target.value)}
          className="text-[13px] rounded-lg px-3 py-2 focus:outline-none min-w-[200px]"
          style={{ background: '#EFF6FF', border: '1px solid #DBEAFE', color: '#334155' }}
        />
        <div ref={openFilter === 'type' ? filterRef : undefined} style={{ position: 'relative', display: 'inline-block' }}>
          <button
            onClick={() => setOpenFilter(openFilter === 'type' ? null : 'type')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', fontSize: 13, fontWeight: 500, color: searchParams.get('type') ? '#172554' : '#64748b', background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 8, cursor: 'pointer', outline: 'none', minWidth: 130, justifyContent: 'space-between', transition: 'border-color 0.15s' }}
          >
            <span>{searchParams.get('type') || 'All Types'}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#94a3b8', flexShrink: 0, transform: openFilter === 'type' ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}><path d="M7 10l5 5 5-5z"/></svg>
          </button>
          {openFilter === 'type' && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 100, background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 10, boxShadow: '0 8px 24px rgba(37,99,235,0.12)', minWidth: '100%', overflow: 'hidden' }}>
              {[{ value: '', label: 'All Types' }, ...INST_TYPES.map(t => ({ value: t, label: t }))].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { updateFilter('type', opt.value); setOpenFilter(null) }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px', fontSize: 13, fontWeight: opt.value === (searchParams.get('type') ?? '') ? 600 : 400, color: opt.value === (searchParams.get('type') ?? '') ? '#2563eb' : '#334155', background: opt.value === (searchParams.get('type') ?? '') ? '#eff6ff' : 'transparent', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => { if (opt.value !== (searchParams.get('type') ?? '')) e.currentTarget.style.background = '#f8fafc' }}
                  onMouseLeave={e => { if (opt.value !== (searchParams.get('type') ?? '')) e.currentTarget.style.background = 'transparent' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`rounded-[12px] transition-opacity ${isPending ? 'opacity-60' : ''}`} style={{ background: '#ffffff', border: '1px solid #DBEAFE', overflow: openMenu ? 'visible' : 'hidden' }}>
        <div style={{ overflowX: openMenu ? 'visible' : 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table className="w-full border-collapse" style={{ minWidth: 760 }}>
          <thead>
            <tr style={{ background: '#EFF6FF' }}>
              {['Name', 'City / State', 'Type', 'Affiliation', 'Logo Perm.', 'On Home', 'Status', ''].map(h => (
                <th key={h} className="px-3.5 py-2.5 text-[11px] font-bold text-left whitespace-nowrap text-[#64748b]" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {institutions.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-[13px] text-slate-400">No institutions found.</td>
              </tr>
            )}
            {institutions.map(inst => (
              <tr key={inst.id} className="border-t border-[#DBEAFE] hover:bg-[#EFF6FF] transition-colors">
                <td className="px-3.5 py-[11px] text-[13px] text-[#172554]">
                  <strong className="text-[#172554] font-semibold">{inst.name}</strong>
                  {!inst.logoPermission && <Badge variant="amber" className="ml-2">No Logo Perm.</Badge>}
                </td>
                <td className="px-3.5 py-[11px] text-[13px] text-[#64748b] whitespace-nowrap">
                  {[inst.city, inst.state].filter(Boolean).join(', ') || '—'}
                </td>
                <td className="px-3.5 py-[11px]">
                  {inst.type ? <Badge variant="blue">{inst.type}</Badge> : <span className="text-[#64748b] text-[13px]">—</span>}
                </td>
                <td className="px-3.5 py-[11px] text-[13px] text-[#64748b]">
                  {inst.affiliation ?? '—'}
                </td>
                <td className="px-3.5 py-[11px]">
                  {inst.logoPermission ? <Badge variant="green">Yes</Badge> : <Badge variant="amber">No</Badge>}
                </td>
                <td className="px-3.5 py-[11px]">
                  {inst.showOnHome ? <Badge variant="gold">Yes</Badge> : <span className="text-[#64748b] text-[13px]">No</span>}
                </td>
                <td className="px-3.5 py-[11px]">
                  <Badge variant={inst.isPublished ? 'green' : 'amber'}>
                    {inst.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </td>
                <td className="px-3.5 py-[11px]" style={{ position: 'relative' }}>
                  <div ref={openMenu === inst.id ? menuRef : undefined} style={{ display: 'inline-block', position: 'relative' }}>
                    <button
                      onClick={() => setOpenMenu(openMenu === inst.id ? null : inst.id)}
                      style={{ width: 32, height: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'none', border: '1px solid #dbeafe', borderRadius: 8, cursor: 'pointer', padding: 0 }}
                      title="Actions"
                    >
                      {[0,1,2].map(i => <span key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: '#64748b', display: 'block' }} />)}
                    </button>
                    {openMenu === inst.id && (
                      <div style={{ position: 'absolute', right: 0, top: '110%', background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 10, boxShadow: '0 8px 24px rgba(37,99,235,0.12)', minWidth: 148, zIndex: 50, overflow: 'hidden' }}>
                        <Link
                          href={`/admin/institutions/${inst.id}`}
                          onClick={() => setOpenMenu(null)}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', fontSize: 13, color: '#172554', textDecoration: 'none', fontWeight: 500 }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          Edit
                        </Link>
                        {inst.isPublished ? (
                          <button
                            onClick={() => { handlePublish(inst.id, false); setOpenMenu(null) }}
                            disabled={isPending}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', fontSize: 13, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, textAlign: 'left' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            Unpublish
                          </button>
                        ) : (
                          <button
                            onClick={() => { handlePublish(inst.id, true); setOpenMenu(null) }}
                            disabled={isPending}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', fontSize: 13, color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, textAlign: 'left' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f0fdf4')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            Publish
                          </button>
                        )}
                        <div style={{ height: 1, background: '#f1f5f9', margin: '2px 0' }} />
                        <button
                          onClick={() => { handleDelete(inst.id, inst.name); setOpenMenu(null) }}
                          disabled={isPending}
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
