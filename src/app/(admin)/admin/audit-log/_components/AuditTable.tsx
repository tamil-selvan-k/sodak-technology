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
  create:    { bg: 'rgba(34,197,94,0.15)',  color: '#4ade80' },
  update:    { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  delete:    { bg: 'rgba(239,68,68,0.15)',  color: '#f87171' },
  publish:   { bg: 'rgba(200,160,53,0.15)', color: '#fbbf24' },
  unpublish: { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' },
}

function ActionBadge({ action }: { action: string }) {
  const style = ACTION_BADGE[action.toLowerCase()] ?? { bg: 'rgba(148,163,184,0.15)', color: '#475569' }
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
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, outline: 'none',
            color: '#e2e8f0', background: 'rgba(255,255,255,0.06)',
          }}
        />
        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          style={{
            padding: '8px 12px', fontSize: 13,
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, outline: 'none',
            color: '#e2e8f0', background: 'rgba(255,255,255,0.06)',
          }}
        >
          {ACTION_OPTIONS.map(a => (
            <option key={a} value={a}>{a === '' ? 'All Actions' : a.charAt(0).toUpperCase() + a.slice(1)}</option>
          ))}
        </select>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.06)' }}>
              {['Timestamp', 'Action', 'Entity', 'Entity ID', 'Actor', 'Details'].map(h => (
                <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '40px 14px', textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
                  No log entries found.
                </td>
              </tr>
            )}
            {filtered.map(l => (
              <>
                <tr key={l.id} className="hover:bg-[rgba(255,255,255,0.04)]" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {formatDate(l.createdAt)}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <ActionBadge action={l.action} />
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>
                    {l.entityType}
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>
                    {l.entityId.slice(0, 8)}…
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#e2e8f0' }}>
                    {l.actor ? (l.actor.name ?? l.actor.email) : <span style={{ color: '#64748b' }}>system</span>}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    {(l.newValue !== null || l.oldValue !== null) && (
                      <button
                        onClick={() => setExpandedId(expandedId === l.id ? null : l.id)}
                        style={{
                          padding: '3px 10px', fontSize: 11, fontWeight: 600,
                          border: '1px solid rgba(255,255,255,0.15)', borderRadius: 5,
                          background: 'rgba(255,255,255,0.06)', color: '#94a3b8',
                          cursor: 'pointer',
                        }}
                      >
                        {expandedId === l.id ? 'Hide' : 'View diff'}
                      </button>
                    )}
                  </td>
                </tr>
                {expandedId === l.id && (
                  <tr key={`${l.id}-diff`} style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <td colSpan={6} style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {l.oldValue !== null && (
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>OLD</p>
                            <pre style={{ fontSize: 11, color: '#94a3b8', background: 'rgba(255,255,255,0.04)', padding: 10, borderRadius: 6, overflow: 'auto', maxHeight: 200 }}>
                              {JSON.stringify(l.oldValue, null, 2)}
                            </pre>
                          </div>
                        )}
                        {l.newValue !== null && (
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', marginBottom: 4 }}>NEW</p>
                            <pre style={{ fontSize: 11, color: '#94a3b8', background: 'rgba(255,255,255,0.04)', padding: 10, borderRadius: 6, overflow: 'auto', maxHeight: 200 }}>
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
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            Page {pagination.page} of {pagination.pages} ({pagination.total} entries)
          </span>
          {pagination.page > 1 && (
            <a
              href={buildPageUrl(pagination.page - 1)}
              style={{ padding: '6px 14px', fontSize: 13, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, textDecoration: 'none', color: '#e2e8f0', background: 'rgba(255,255,255,0.06)' }}
            >
              ← Previous
            </a>
          )}
          {pagination.page < pagination.pages && (
            <a
              href={buildPageUrl(pagination.page + 1)}
              style={{ padding: '6px 14px', fontSize: 13, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, textDecoration: 'none', color: '#e2e8f0', background: 'rgba(255,255,255,0.06)' }}
            >
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
