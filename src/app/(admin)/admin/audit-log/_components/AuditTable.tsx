'use client'

import { useState, useEffect, useRef } from 'react'
import type { Prisma } from '@prisma/client'
import type { PaginationMeta } from '@/lib/paginate'

interface AuditEntry {
  id: string
  action: string
  entityType: string
  entityId: string
  actorId: string
  actor: { name: string | null; email: string } | null
  newValue: Prisma.JsonValue | null
  oldValue: Prisma.JsonValue | null
  createdAt: string
}

const ACTION_BADGE: Record<string, { bg: string; color: string }> = {
  create:    { bg: 'rgba(34,197,94,0.15)',  color: '#16a34a' },
  update:    { bg: 'rgba(59,130,246,0.15)', color: '#2563eb' },
  delete:    { bg: 'rgba(239,68,68,0.15)',  color: '#f87171' },
  publish:   { bg: 'rgba(37,99,235,0.15)', color: '#2563eb' },
  unpublish: { bg: 'rgba(148,163,184,0.12)', color: '#64748b' },
}

function ActionBadge({ action }: { action: string }) {
  const style = ACTION_BADGE[action.toLowerCase()] ?? { bg: 'rgba(148,163,184,0.15)', color: '#64748b' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 9px', borderRadius: 999,
      fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
      background: style.bg, color: style.color,
    }}>
      {action}
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const ACTION_OPTIONS = ['', 'create', 'update', 'delete', 'publish', 'unpublish']

export default function AuditTable({
  logs,
  pagination,
}: {
  logs: AuditEntry[]
  pagination: PaginationMeta
}) {
  const [entityFilter, setEntityFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setOpenFilter(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = logs.filter(l => {
    const matchEntity = !entityFilter || l.entityType.toLowerCase().includes(entityFilter.toLowerCase())
    const matchAction = !actionFilter || l.action.toLowerCase() === actionFilter.toLowerCase()
    return matchEntity && matchAction
  })

  function buildPageUrl(p: number) {
    const url = new URL(window.location.href)
    url.searchParams.set('page', String(p))
    return url.toString()
  }

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input
          type="search"
          placeholder="Filter by entity type…"
          value={entityFilter}
          onChange={e => setEntityFilter(e.target.value)}
          style={{
            flex: 1, padding: '8px 12px', fontSize: 13,
            border: '1px solid #DBEAFE', borderRadius: 6, outline: 'none',
            color: '#334155', background: '#EFF6FF',
          }}
        />
        <div ref={openFilter === 'action' ? filterRef : undefined} style={{ position: 'relative', display: 'inline-block' }}>
          <button
            onClick={() => setOpenFilter(openFilter === 'action' ? null : 'action')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', fontSize: 13, fontWeight: 500, color: actionFilter ? '#172554' : '#64748b', background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 8, cursor: 'pointer', outline: 'none', minWidth: 130, justifyContent: 'space-between', transition: 'border-color 0.15s' }}
          >
            <span>{actionFilter ? actionFilter.charAt(0).toUpperCase() + actionFilter.slice(1) : 'All Actions'}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#94a3b8', flexShrink: 0, transform: openFilter === 'action' ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}><path d="M7 10l5 5 5-5z"/></svg>
          </button>
          {openFilter === 'action' && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 100, background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 10, boxShadow: '0 8px 24px rgba(37,99,235,0.12)', minWidth: '100%', overflow: 'hidden' }}>
              {ACTION_OPTIONS.map(a => {
                const label = a === '' ? 'All Actions' : a.charAt(0).toUpperCase() + a.slice(1)
                return (
                  <button
                    key={a}
                    onClick={() => { setActionFilter(a); setOpenFilter(null) }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px', fontSize: 13, fontWeight: a === actionFilter ? 600 : 400, color: a === actionFilter ? '#2563eb' : '#334155', background: a === actionFilter ? '#eff6ff' : 'transparent', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => { if (a !== actionFilter) e.currentTarget.style.background = '#f8fafc' }}
                    onMouseLeave={e => { if (a !== actionFilter) e.currentTarget.style.background = 'transparent' }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #DBEAFE', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: 680, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#EFF6FF' }}>
              {['Timestamp', 'Action', 'Entity', 'Entity ID', 'Actor', 'Details'].map(h => (
                <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '40px 14px', textAlign: 'center', fontSize: 13, color: '#64748b' }}>
                  No log entries found.
                </td>
              </tr>
            )}
            {filtered.map(l => (
              <>
                <tr key={l.id} className="hover:bg-[#EFF6FF]" style={{ borderTop: '1px solid #DBEAFE' }}>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
                    {formatDate(l.createdAt)}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <ActionBadge action={l.action} />
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#334155', fontWeight: 600 }}>
                    {l.entityType}
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>
                    {l.entityId.slice(0, 8)}…
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#334155' }}>
                    {l.actor ? (l.actor.name ?? l.actor.email) : <span style={{ color: '#64748b' }}>system</span>}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    {(l.newValue !== null || l.oldValue !== null) && (
                      <button
                        onClick={() => setExpandedId(expandedId === l.id ? null : l.id)}
                        style={{
                          padding: '3px 10px', fontSize: 11, fontWeight: 600,
                          border: '1px solid #DBEAFE', borderRadius: 5,
                          background: '#EFF6FF', color: '#64748b',
                          cursor: 'pointer',
                        }}
                      >
                        {expandedId === l.id ? 'Hide' : 'View diff'}
                      </button>
                    )}
                  </td>
                </tr>
                {expandedId === l.id && (
                  <tr key={`${l.id}-diff`} style={{ background: '#fafafa', borderTop: '1px solid #DBEAFE' }}>
                    <td colSpan={6} style={{ padding: '12px 14px' }}>
                      <div className="admin-two-col" style={{ gap: 12 }}>
                        {l.oldValue !== null && (
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>OLD</p>
                            <pre style={{ fontSize: 11, color: '#64748b', background: '#EFF6FF', padding: 10, borderRadius: 6, overflow: 'auto', maxHeight: 200 }}>
                              {JSON.stringify(l.oldValue, null, 2)}
                            </pre>
                          </div>
                        )}
                        {l.newValue !== null && (
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', marginBottom: 4 }}>NEW</p>
                            <pre style={{ fontSize: 11, color: '#64748b', background: '#EFF6FF', padding: 10, borderRadius: 6, overflow: 'auto', maxHeight: 200 }}>
                              {JSON.stringify(l.newValue, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        </div>{/* /scroll-wrapper */}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Page {pagination.page} of {pagination.pages} ({pagination.total} entries)
          </span>
          {pagination.page > 1 && (
            <a
              href={buildPageUrl(pagination.page - 1)}
              style={{ padding: '6px 14px', fontSize: 13, border: '1px solid #DBEAFE', borderRadius: 6, textDecoration: 'none', color: '#334155', background: '#EFF6FF' }}
            >
              ← Previous
            </a>
          )}
          {pagination.page < pagination.pages && (
            <a
              href={buildPageUrl(pagination.page + 1)}
              style={{ padding: '6px 14px', fontSize: 13, border: '1px solid #DBEAFE', borderRadius: 6, textDecoration: 'none', color: '#334155', background: '#EFF6FF' }}
            >
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
