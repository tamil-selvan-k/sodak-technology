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
          <div key={idx} className={`rounded-xl overflow-hidden border ${dark ? 'border-white/15' : 'border-[#dbeafe]'}`}>
            <button
              onClick={() => toggle(idx)}
              aria-expanded={isOpen}
              aria-controls={`accordion-body-${idx}`}
              className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors
                ${dark ? 'bg-[#1e3a8a] text-white hover:bg-[#1e40af]' : 'bg-white text-[#172554] hover:bg-[#eff6ff]'}`}
            >
              <span className="text-sm font-semibold">{item.title}</span>
              <span className={`text-[#2563eb] text-xs transition-transform ${isOpen ? 'rotate-90' : ''}`}>▶</span>
            </button>
            {isOpen && (
              <div
                id={`accordion-body-${idx}`}
                className={`px-5 pb-5 pt-3 border-t ${dark ? 'bg-[#1e3a8a] border-white/12 text-blue-100' : 'bg-white border-[#dbeafe] text-slate-600'} text-sm leading-relaxed`}
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
