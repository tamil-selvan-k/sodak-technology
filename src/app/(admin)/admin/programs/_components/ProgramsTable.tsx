'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'
import type { Program, Stack } from '@prisma/client'

type ProgramRow = Program & { stacks: { stack: Stack }[] }

interface PaginationMeta { total: number; page: number; perPage: number; pages: number }

interface Props {
  programs: ProgramRow[]
  pagination: PaginationMeta
}

const DELIVERY_LABELS: Record<string, string> = {
  on_campus: 'On Campus',
  hybrid: 'Hybrid',
  online: 'Online',
}

export default function ProgramsTable({ programs, pagination }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
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

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  async function handlePublish(id: string, publish: boolean) {
    const action = publish ? 'publish' : 'unpublish'
    startTransition(async () => {
      await fetch(`/api/v1/programs/${id}/${action}`, { method: 'POST' })
      router.refresh()
    })
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    startTransition(async () => {
      await fetch(`/api/v1/programs/${id}`, { method: 'DELETE' })
      router.refresh()
    })
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="search"
          placeholder="Search programs…"
          defaultValue={searchParams.get('search') ?? ''}
          onChange={e => updateFilter('search', e.target.value)}
          className="text-[13px] rounded-lg px-3 py-2 focus:outline-none min-w-[200px]"
          style={{ background: '#EFF6FF', border: '1px solid #DBEAFE', color: '#334155' }}
        />
      </div>

      <div className={`rounded-[12px] transition-opacity ${isPending ? 'opacity-60' : ''}`} style={{ background: '#ffffff', border: '1px solid #DBEAFE', overflow: openMenu ? 'visible' : 'hidden' }}>
        <div style={{ overflowX: openMenu ? 'visible' : 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table className="w-full border-collapse" style={{ minWidth: 760 }}>
          <thead>
            <tr style={{ background: '#EFF6FF' }}>
              {['Title', 'Stacks', 'Duration', 'Delivery', 'Brochure', 'Status', ''].map(h => (
                <th key={h} className="px-3.5 py-2.5 text-[11px] font-bold text-left whitespace-nowrap text-[#64748b]" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {programs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-[13px] text-[#64748b]">No programs found.</td>
              </tr>
            )}
            {programs.map(prog => (
              <tr key={prog.id} className="border-t border-[#DBEAFE] hover:bg-[#EFF6FF] transition-colors">
                <td className="px-3.5 py-[11px] text-[13px] text-[#172554]" style={{ maxWidth: 280 }}>
                  <strong className="text-[#172554] font-semibold">{prog.title}</strong>
                  {prog.summary && <p className="text-[10px] text-[#94a3b8] mt-0.5 leading-snug" style={{ maxWidth: 260, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{prog.summary}</p>}
                </td>
                <td className="px-3.5 py-[11px]">
                  <div className="flex flex-wrap gap-1">
                    {prog.stacks.map(({ stack }) => (
                      <Badge key={stack.id} variant="light">{stack.name}</Badge>
                    ))}
                    {prog.stacks.length === 0 && <span className="text-[#64748b] text-xs">—</span>}
                  </div>
                </td>
                <td className="px-3.5 py-[11px] text-[13px] text-[#64748b] whitespace-nowrap">{prog.duration ?? '—'}</td>
                <td className="px-3.5 py-[11px] text-[13px] text-[#64748b] whitespace-nowrap">
                  {prog.deliveryMode ? DELIVERY_LABELS[prog.deliveryMode] ?? prog.deliveryMode : '—'}
                </td>
                <td className="px-3.5 py-[11px]">
                  {prog.brochureKey ? <Badge variant="gold">Yes</Badge> : <span className="text-[#64748b] text-[12px]">—</span>}
                </td>
                <td className="px-3.5 py-[11px]">
                  <Badge variant={prog.isPublished ? 'green' : 'amber'}>
                    {prog.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </td>
                <td className="px-3.5 py-[11px]" style={{ position: 'relative' }}>
                  <div ref={openMenu === prog.id ? menuRef : undefined} style={{ display: 'inline-block', position: 'relative' }}>
                    <button
                      onClick={() => setOpenMenu(openMenu === prog.id ? null : prog.id)}
                      style={{ width: 32, height: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'none', border: '1px solid #dbeafe', borderRadius: 8, cursor: 'pointer', padding: 0 }}
                      title="Actions"
                    >
                      {[0,1,2].map(i => <span key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: '#64748b', display: 'block' }} />)}
                    </button>
                    {openMenu === prog.id && (
                      <div style={{ position: 'absolute', right: 0, top: '110%', background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 10, boxShadow: '0 8px 24px rgba(37,99,235,0.12)', minWidth: 148, zIndex: 50, overflow: 'hidden' }}>
                        <Link
                          href={`/admin/programs/${prog.id}`}
                          onClick={() => setOpenMenu(null)}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', fontSize: 13, color: '#172554', textDecoration: 'none', fontWeight: 500 }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          Edit
                        </Link>
                        {prog.isPublished ? (
                          <button
                            onClick={() => { handlePublish(prog.id, false); setOpenMenu(null) }}
                            disabled={isPending}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', fontSize: 13, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, textAlign: 'left' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            Unpublish
                          </button>
                        ) : (
                          <button
                            onClick={() => { handlePublish(prog.id, true); setOpenMenu(null) }}
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
                          onClick={() => { handleDelete(prog.id, prog.title); setOpenMenu(null) }}
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
