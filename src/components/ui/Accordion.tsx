'use client'

import { useState } from 'react'

interface Item { title: string; body: React.ReactNode; id?: string }

interface Props {
  items: Item[]
  dark?: boolean
  allowMultiple?: boolean
}

export default function Accordion({ items, dark, allowMultiple }: Props) {
  const [open, setOpen] = useState<Set<number>>(new Set())

  function toggle(idx: number) {
    setOpen(prev => {
      const next = new Set(prev)
      if (next.has(idx)) {
        next.delete(idx)
      } else {
        if (!allowMultiple) next.clear()
        next.add(idx)
      }
      return next
    })
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, idx) => {
        const isOpen = open.has(idx)
        return (
          <div key={idx} className={`rounded-md overflow-hidden border ${dark ? 'border-white/8' : 'border-[var(--dm-border)]'}`}>
            <button
              onClick={() => toggle(idx)}
              aria-expanded={isOpen}
              aria-controls={`accordion-body-${idx}`}
              className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors
                ${dark ? 'bg-[var(--navy-800)] text-white hover:bg-[var(--navy-700)]' : 'bg-white text-[var(--dm-text)] hover:bg-slate-50'}`}
            >
              <span className="text-sm font-semibold">{item.title}</span>
              <span className={`text-[var(--gold-500)] text-xs transition-transform ${isOpen ? 'rotate-90' : ''}`}>▶</span>
            </button>
            {isOpen && (
              <div
                id={`accordion-body-${idx}`}
                className={`px-5 pb-5 pt-3 border-t ${dark ? 'bg-[var(--navy-800)] border-white/8 text-slate-300' : 'bg-white border-[var(--dm-border)] text-slate-600'} text-sm leading-relaxed`}
              >
                {item.body}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
