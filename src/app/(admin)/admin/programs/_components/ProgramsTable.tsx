'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'

const btnEdit    = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[rgba(96,165,250,0.25)] bg-[rgba(96,165,250,0.08)] text-[#60a5fa] hover:bg-[rgba(96,165,250,0.14)] transition-colors'
const btnDefault = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.06)] text-[#94a3b8] hover:bg-[rgba(255,255,255,0.1)] transition-colors disabled:opacity-40'
const btnDelete  = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.08)] text-[#f87171] hover:bg-[rgba(248,113,113,0.14)] transition-colors disabled:opacity-40'
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

const TRACKS = ['TRACK_A', 'TRACK_B', 'TRACK_C', 'TRACK_D', 'TRACK_E']

export default function ProgramsTable({ programs, pagination }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

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
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0' }}
        />
        <select
          defaultValue={searchParams.get('track') ?? ''}
          onChange={e => updateFilter('track', e.target.value)}
          className="text-[13px] rounded-lg px-3 py-2 focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0' }}
        >
          <option value="" style={{ background: '#1a2342' }}>All Tracks</option>
          {TRACKS.map(t => <option key={t} value={t} style={{ background: '#1a2342' }}>{t}</option>)}
        </select>
      </div>

      {/* Table — wireframe-exact */}
      <div className={`rounded-[12px] overflow-hidden transition-opacity ${isPending ? 'opacity-60' : ''}`} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.06)' }}>
              {['Title', 'Track', 'Stacks', 'Duration', 'Delivery', 'Brochure', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-3.5 py-2.5 text-[11px] font-bold text-left whitespace-nowrap text-[#94a3b8]" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {programs.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-[13px] text-[#94a3b8]">No programs found.</td>
              </tr>
            )}
            {programs.map(prog => (
              <tr key={prog.id} className="border-t border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.04)] transition-colors">
                <td className="px-3.5 py-[11px] text-[13px] text-[#e2e8f0]">
                  <strong className="text-[#f8fafc] font-semibold">{prog.title}</strong>
                  {prog.summary && <p className="text-[11px] text-[#94a3b8] mt-0.5">{prog.summary}</p>}
                </td>
                <td className="px-3.5 py-[11px] whitespace-nowrap">
                  {prog.trackCode ? <Badge variant="blue">{prog.trackCode}</Badge> : <span className="text-[#94a3b8] text-[13px]">—</span>}
                </td>
                <td className="px-3.5 py-[11px]">
                  <div className="flex flex-wrap gap-1">
                    {prog.stacks.map(({ stack }) => (
                      <Badge key={stack.id} variant="dark">{stack.name}</Badge>
                    ))}
                  </div>
                </td>
                <td className="px-3.5 py-[11px] text-[13px] text-[#94a3b8] whitespace-nowrap">{prog.duration ?? '—'}</td>
                <td className="px-3.5 py-[11px] text-[13px] text-[#94a3b8] whitespace-nowrap">
                  {prog.deliveryMode ? DELIVERY_LABELS[prog.deliveryMode] ?? prog.deliveryMode : '—'}
                </td>
                <td className="px-3.5 py-[11px]">
                  {prog.brochureKey ? <Badge variant="gold">Yes</Badge> : <span className="text-[#94a3b8] text-[12px]">—</span>}
                </td>
                <td className="px-3.5 py-[11px]">
                  <Badge variant={prog.isPublished ? 'green' : 'amber'}>
                    {prog.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </td>
                <td className="px-3.5 py-[11px]">
                  <div className="flex items-center gap-1.5">
                    <a href={`/admin/programs/${prog.id}`} className={btnEdit}>Edit</a>
                    <button className={btnDefault} disabled={isPending} onClick={() => handlePublish(prog.id, !prog.isPublished)}>
                      {prog.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button className={btnDelete} disabled={isPending} onClick={() => handleDelete(prog.id, prog.title)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination {...pagination} />
    </div>
  )
}
