'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCallback, useTransition } from 'react'
import type { TrainerWithStacks } from '@/modules/trainers/trainers.types'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'

// Wireframe-exact admin action button styles
const btnEdit    = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[rgba(96,165,250,0.25)] bg-[rgba(96,165,250,0.08)] text-[#60a5fa] hover:bg-[rgba(96,165,250,0.14)] transition-colors'
const btnPublish = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[rgba(74,222,128,0.25)] bg-[rgba(74,222,128,0.08)] text-[#4ade80] hover:bg-[rgba(74,222,128,0.14)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
const btnDelete  = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.08)] text-[#f87171] hover:bg-[rgba(248,113,113,0.14)] transition-colors'
const btnDefault = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.06)] text-[#94a3b8] hover:bg-[rgba(255,255,255,0.1)] transition-colors'

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
          <option value="draft" style={{ background: '#1a2342' }}>Draft</option>
        </select>
        <select
          defaultValue={mentor}
          onChange={e => updateParam('mentor', e.target.value)}
          className="px-3 py-2 text-sm rounded-lg focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0' }}
        >
          <option value="" style={{ background: '#1a2342' }}>All Roles</option>
          <option value="1" style={{ background: '#1a2342' }}>Mentors only</option>
          <option value="0" style={{ background: '#1a2342' }}>Trainers only</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.06)' }}>
              {['Photo','Name','Company','Stacks','Status','Actions'].map(h => (
                <th key={h} className="px-3.5 py-2.5 text-left text-[11px] font-bold uppercase text-[#94a3b8]" style={{ letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trainers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-[#475569]">No trainers found.</td>
              </tr>
            )}
            {trainers.map(t => (
              <tr key={t.id} className="border-t border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.04)] transition-colors">
                <td className="px-3.5 py-[11px] text-[13px] text-[#e2e8f0]">
                  {t.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.photoUrl} alt={t.name} className="w-11 h-11 rounded-full object-cover" />
                  ) : (
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-[15px] font-bold flex-shrink-0"
                      style={{ background: '#1a2342', color: '#c8a035' }}
                    >
                      {initials(t.name)}
                    </div>
                  )}
                </td>
                <td className="px-3.5 py-[11px] text-[13px] text-[#e2e8f0]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-[13px] text-[#f8fafc]">{t.name}</strong>
                    {!t.consentOnFile && <Badge variant="amber">No Consent</Badge>}
                    {t.isFeatured && <Badge variant="gold">Featured</Badge>}
                  </div>
                  {t.designation && <span className="text-[11px] text-[#94a3b8]">{t.designation}</span>}
                </td>
                <td className="px-3.5 py-[11px] text-[13px] text-[#e2e8f0]">
                  <strong className="text-[13px]">{t.currentCompany ?? '—'}</strong>
                </td>
                <td className="px-3.5 py-[11px] text-[13px] text-[#334155]">
                  <div className="flex flex-wrap gap-1">
                    {t.stacks.map(s => (
                      <Badge key={s.stack.id} variant="dark">{s.stack.name}</Badge>
                    ))}
                    {t.stacks.length === 0 && <span className="text-[#94a3b8] text-xs">—</span>}
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
                <td className="px-3.5 py-[11px]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Link href={`/admin/trainers/${t.id}`} className={btnEdit}>Edit</Link>
                    {t.isPublished ? (
                      <button className={btnDefault} onClick={() => handleUnpublish(t.id)}>Deactivate</button>
                    ) : (
                      <button
                        className={btnPublish}
                        disabled={!t.consentOnFile}
                        title={!t.consentOnFile ? 'Consent required before publishing' : undefined}
                        onClick={() => handlePublish(t.id)}
                      >
                        Publish
                      </button>
                    )}
                    <button className={btnDelete} onClick={() => handleDelete(t.id, t.name)}>Delete</button>
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
