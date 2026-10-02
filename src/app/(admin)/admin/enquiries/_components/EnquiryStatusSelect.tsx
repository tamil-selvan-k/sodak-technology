'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

const STATUS_MAP = {
  new:           { label: 'New',           color: '#2563eb', bg: 'rgba(59,130,246,0.1)' },
  contacted:     { label: 'Contacted',     color: '#92400e', bg: 'rgba(251,191,36,0.1)' },
  proposal_sent: { label: 'Proposal Sent', color: '#166534', bg: 'rgba(34,197,94,0.1)' },
  won:           { label: 'Won',           color: '#4865ad', bg: 'rgba(72,101,173,0.1)' },
  lost:          { label: 'Lost',          color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
} as const

type Status = keyof typeof STATUS_MAP

interface Props {
  leadId: string
  status: Status
}

export default function EnquiryStatusSelect({ leadId, status: initialStatus }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>(initialStatus)
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleChange(next: Status) {
    setOpen(false)
    if (next === status) return
    setStatus(next)
    const res = await fetch(`/api/v1/leads/${leadId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    if (!res.ok) {
      setStatus(initialStatus)
      return
    }
    startTransition(() => router.refresh())
  }

  const sm = STATUS_MAP[status]

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        disabled={isPending}
        style={{
          padding: '2px 9px 2px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700,
          background: sm.bg, color: sm.color, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 4, opacity: isPending ? 0.6 : 1,
        }}
      >
        {sm.label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </svg>
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 10 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: 'absolute', top: '100%', left: 0, zIndex: 20, marginTop: 4,
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8,
            boxShadow: '0 4px 16px rgba(15,23,42,0.1)', minWidth: 140, overflow: 'hidden',
          }}>
            {(Object.entries(STATUS_MAP) as [Status, typeof STATUS_MAP[Status]][]).map(([key, s]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleChange(key)}
                style={{
                  width: '100%', textAlign: 'left', padding: '8px 12px',
                  fontSize: 12, fontWeight: key === status ? 700 : 500,
                  color: key === status ? s.color : '#334155',
                  background: key === status ? s.bg : 'transparent',
                  border: 'none', cursor: 'pointer', display: 'block',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
