'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'

const btnEdit    = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[#dbeafe] bg-[#eff6ff] text-[#2563eb] hover:bg-[#dbeafe] transition-colors'
const btnDefault = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[#DBEAFE] bg-[#EFF6FF] text-[#64748b] hover:bg-[#DBEAFE] transition-colors disabled:opacity-40'
const btnDelete  = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[#fecaca] bg-[#fef2f2] text-[#dc2626] hover:bg-[#fecaca] transition-colors disabled:opacity-40'

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
      await fetch(`/api/v1/institutions/${id}/${action}`, { method: 'POST' })
      router.refresh()
    })
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    startTransition(async () => {
      await fetch(`/api/v1/institutions/${id}`, { method: 'DELETE' })
      router.refresh()
    })
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
        <select
          defaultValue={searchParams.get('type') ?? ''}
          onChange={e => updateFilter('type', e.target.value)}
          className="text-[13px] rounded-lg px-3 py-2 focus:outline-none"
          style={{ background: '#EFF6FF', border: '1px solid #DBEAFE', color: '#334155' }}
        >
          <option value="" style={{ background: '#ffffff' }}>All Types</option>
          {INST_TYPES.map(t => <option key={t} value={t} style={{ background: '#ffffff' }}>{t}</option>)}
        </select>
      </div>

      {/* Table — wireframe-exact */}
      <div className={`rounded-[12px] overflow-hidden transition-opacity ${isPending ? 'opacity-60' : ''}`} style={{ background: '#ffffff', border: '1px solid #DBEAFE' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table className="w-full border-collapse" style={{ minWidth: 760 }}>
          <thead>
            <tr style={{ background: '#EFF6FF' }}>
              {['Name', 'City / State', 'Type', 'Affiliation', 'Logo Perm.', 'On Home', 'Status', 'Actions'].map(h => (
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
                <td className="px-3.5 py-[11px]">
                  <div className="flex items-center gap-1.5">
                    <a href={`/admin/institutions/${inst.id}`} className={btnEdit}>Edit</a>
                    <button className={btnDefault} disabled={isPending} onClick={() => handlePublish(inst.id, !inst.isPublished)}>
                      {inst.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button className={btnDelete} disabled={isPending} onClick={() => handleDelete(inst.id, inst.name)}>Delete</button>
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
