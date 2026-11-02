'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import type { StackWithTechnologies } from '@/modules/stacks/stacks.types'

interface Props {
  stacks: StackWithTechnologies[]
}

export default function StacksTable({ stacks }: Props) {
  const router = useRouter()
  const confirm = useConfirm()
  const { toast } = useToast()
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
    router.push(`${pathname}?${params.toString()}`)
  }

  async function handleDelete(id: string, name: string) {
    if (!await confirm(`Delete "${name}"? This cannot be undone.`, { title: 'Delete Stack', confirmLabel: 'Delete', variant: 'danger' })) return
    startTransition(async () => {
      const res = await fetch(`/api/v1/stacks/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Stack deleted.')
      } else {
        toast.error('Failed to delete stack.')
      }
      router.refresh()
    })
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="search"
          placeholder="Search stacks…"
          defaultValue={searchParams.get('search') ?? ''}
          onChange={e => updateFilter('search', e.target.value)}
          className="text-[13px] rounded-lg px-3 py-2 focus:outline-none min-w-[200px]"
          style={{ background: '#EFF6FF', border: '1px solid #DBEAFE', color: '#334155' }}
        />
      </div>

      <div
        className={`rounded-[12px] transition-opacity ${isPending ? 'opacity-60' : ''}`}
        style={{ background: '#ffffff', border: '1px solid #DBEAFE', overflow: openMenu ? 'visible' : 'hidden' }}
      >
        <div style={{ overflowX: openMenu ? 'visible' : 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="w-full border-collapse" style={{ minWidth: 760 }}>
            <thead>
              <tr style={{ background: '#EFF6FF' }}>
                {['Name / Summary', 'Slug', 'Technologies', 'Color', 'Order', ''].map(h => (
                  <th
                    key={h}
                    className="px-3.5 py-2.5 text-[11px] font-bold text-left whitespace-nowrap text-[#64748b]"
                    style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stacks.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[13px] text-[#64748b]">No stacks found.</td>
                </tr>
              )}
              {stacks.map(stack => (
                <tr key={stack.id} className="border-t border-[#DBEAFE] hover:bg-[#EFF6FF] transition-colors">
                  {/* Name */}
                  <td className="px-3.5 py-[11px] text-[13px] text-[#172554]" style={{ maxWidth: 280 }}>
                    <strong className="text-[#172554] font-semibold">{stack.name}</strong>
                    {stack.summary && (
                      <p
                        className="text-[10px] text-[#94a3b8] mt-0.5 leading-snug"
                        style={{ maxWidth: 260, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                      >
                        {stack.summary}
                      </p>
                    )}
                  </td>

                  {/* Slug */}
                  <td className="px-3.5 py-[11px] text-[12px] text-[#64748b] font-mono">{stack.slug}</td>

                  {/* Technologies */}
                  <td className="px-3.5 py-[11px]">
                    <div className="flex flex-wrap gap-1 items-center">
                      {stack.technologies.slice(0, 3).map(t => (
                        <Badge key={t.id} variant="light">{t.name}</Badge>
                      ))}
                      {stack.technologies.length > 3 && (
                        <span className="text-[11px] text-[#64748b]">+{stack.technologies.length - 3}</span>
                      )}
                      {stack.technologies.length === 0 && (
                        <span className="text-[#64748b] text-xs">—</span>
                      )}
                    </div>
                  </td>

                  {/* Color */}
                  <td className="px-3.5 py-[11px]">
                    {stack.colorToken ? (
                      <div className="flex items-center gap-2">
                        <span
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            background: stack.colorToken,
                            border: '1px solid rgba(0,0,0,0.1)',
                            display: 'inline-block',
                            flexShrink: 0,
                          }}
                        />
                        <span className="text-[12px] text-[#64748b] font-mono">{stack.colorToken}</span>
                      </div>
                    ) : (
                      <span className="text-[#64748b] text-[12px]">—</span>
                    )}
                  </td>

                  {/* Order */}
                  <td className="px-3.5 py-[11px] text-[13px] text-[#64748b] whitespace-nowrap">{stack.displayOrder}</td>

                  {/* Actions */}
                  <td className="px-3.5 py-[11px]" style={{ position: 'relative' }}>
                    <div ref={openMenu === stack.id ? menuRef : undefined} style={{ display: 'inline-block', position: 'relative' }}>
                      <button
                        onClick={() => setOpenMenu(openMenu === stack.id ? null : stack.id)}
                        style={{ width: 32, height: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'none', border: '1px solid #dbeafe', borderRadius: 8, cursor: 'pointer', padding: 0 }}
                        title="Actions"
                      >
                        {[0, 1, 2].map(i => (
                          <span key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: '#64748b', display: 'block' }} />
                        ))}
                      </button>
                      {openMenu === stack.id && (
                        <div style={{ position: 'absolute', right: 0, top: '110%', background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 10, boxShadow: '0 8px 24px rgba(37,99,235,0.12)', minWidth: 148, zIndex: 50, overflow: 'hidden' }}>
                          <Link
                            href={`/admin/stacks/${stack.id}`}
                            onClick={() => setOpenMenu(null)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', fontSize: 13, color: '#172554', textDecoration: 'none', fontWeight: 500 }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            Edit
                          </Link>
                          <div style={{ height: 1, background: '#f1f5f9', margin: '2px 0' }} />
                          <button
                            onClick={() => { handleDelete(stack.id, stack.name); setOpenMenu(null) }}
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
        </div>
      </div>
    </div>
  )
}
