'use client'

import { useState } from 'react'
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
  publish:   { bg: 'rgba(72,101,173,0.15)', color: '#d97706' },
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
            border: '1px solid #e2e8f0', borderRadius: 6, outline: 'none',
            color: '#334155', background: '#f8fafc',
          }}
        />
        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          style={{
            padding: '8px 12px', fontSize: 13,
            border: '1px solid #e2e8f0', borderRadius: 6, outline: 'none',
            color: '#334155', background: '#f8fafc',
          }}
        >
          {ACTION_OPTIONS.map(a => (
            <option key={a} value={a}>{a === '' ? 'All Actions' : a.charAt(0).toUpperCase() + a.slice(1)}</option>
          ))}
        </select>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: 680, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
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
                <tr key={l.id} className="hover:bg-[#f8fafc]" style={{ borderTop: '1px solid #f1f5f9' }}>
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
                          border: '1px solid #e2e8f0', borderRadius: 5,
                          background: '#f8fafc', color: '#64748b',
                          cursor: 'pointer',
                        }}
                      >
                        {expandedId === l.id ? 'Hide' : 'View diff'}
                      </button>
                    )}
                  </td>
                </tr>
                {expandedId === l.id && (
                  <tr key={`${l.id}-diff`} style={{ background: '#fafafa', borderTop: '1px solid #f1f5f9' }}>
                    <td colSpan={6} style={{ padding: '12px 14px' }}>
                      <div className="admin-two-col" style={{ gap: 12 }}>
                        {l.oldValue !== null && (
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>OLD</p>
                            <pre style={{ fontSize: 11, color: '#64748b', background: '#f8fafc', padding: 10, borderRadius: 6, overflow: 'auto', maxHeight: 200 }}>
                              {JSON.stringify(l.oldValue, null, 2)}
                            </pre>
                          </div>
                        )}
                        {l.newValue !== null && (
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', marginBottom: 4 }}>NEW</p>
                            <pre style={{ fontSize: 11, color: '#64748b', background: '#f8fafc', padding: 10, borderRadius: 6, overflow: 'auto', maxHeight: 200 }}>
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
              style={{ padding: '6px 14px', fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 6, textDecoration: 'none', color: '#334155', background: '#f8fafc' }}
            >
              ← Previous
            </a>
          )}
          {pagination.page < pagination.pages && (
            <a
              href={buildPageUrl(pagination.page + 1)}
              style={{ padding: '6px 14px', fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 6, textDecoration: 'none', color: '#334155', background: '#f8fafc' }}
            >
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
