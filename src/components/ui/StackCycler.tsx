'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type IconId = 'web' | 'java' | 'python' | 'cloud' | 'security' | 'placement'

export interface StackCyclerItem {
  label: string
  icon: IconId
  from: string
  to: string
}

interface StackCyclerProps {
  items: StackCyclerItem[]
  interval?: number
}

function CyclerIcon({ icon, color }: { icon: IconId; color: string }) {
  const props = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (icon) {
    case 'web':
      return <svg {...props}><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>
    case 'java':
      return <svg {...props}><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21v-3a2 2 0 0 1 2-2h3" /></svg>
    case 'python':
      return <svg {...props}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
    case 'cloud':
      return <svg {...props}><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /></svg>
    case 'security':
      return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
    case 'placement':
      return <svg {...props}><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 6 3 6 3s3 0 6-3v-5" /></svg>
  }
}

type Phase = 'enter' | 'visible' | 'exit'

export default function StackCycler({ items, interval = 3000 }: StackCyclerProps) {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('visible')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const advance = useCallback(() => {
    setPhase('exit')
    setTimeout(() => {
      setIndex(prev => (prev + 1) % items.length)
      setPhase('enter')
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPhase('visible'))
      })
    }, 420)
  }, [items.length])

  useEffect(() => {
    if (items.length <= 1) return
    timerRef.current = setInterval(advance, interval)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [items.length, interval, advance])

  const current = items[index]
  if (!current) return null

  const { from, to } = current

  const transform =
    phase === 'enter' ? 'translateY(32px) scale(0.94)' :
    phase === 'exit'  ? 'translateY(-32px) scale(0.94)' :
    'translateY(0) scale(1)'

  const opacity = phase === 'visible' ? 1 : 0
  const barScale = phase === 'visible' ? 'scaleX(1)' : 'scaleX(0)'
  const barOpacity = phase === 'visible' ? 1 : 0

  return (
    <div
      className="stack-cycler"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        height: 72,
        justifyContent: 'center',
        overflow: 'visible',
        margin: '0 0 2rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          opacity,
          transform,
          transition: 'opacity 0.42s cubic-bezier(0.22, 1, 0.36, 1), transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${from}22, ${to}22)`,
              border: `1.5px solid ${from}55`,
              borderRadius: 10,
              padding: 6,
              boxShadow: `0 0 16px ${from}44`,
            }}
          >
            <CyclerIcon icon={current.icon} color={from} />
          </span>
          <span
            className="stack-cycler-text"
            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
          >
            {current.label}
          </span>
        </div>
        <span
          style={{
            display: 'block',
            height: 2.5,
            width: '100%',
            background: `linear-gradient(90deg, transparent, ${from}, ${to}, transparent)`,
            borderRadius: 9999,
            transformOrigin: 'left center',
            opacity: barOpacity,
            transform: barScale,
            transition: 'opacity 0.5s ease-out 0.1s, transform 0.5s ease-out 0.1s',
          }}
        />
      </div>
    </div>
  )
}
