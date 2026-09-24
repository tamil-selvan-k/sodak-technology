'use client'

import { useState, useRef } from 'react'

interface FaqItem {
  question: string
  answer: string
}

interface Props {
  items: FaqItem[]
  light?: boolean
}

function FaqItemRow({ item, index, light }: { item: FaqItem; index: number; light?: boolean }) {
  const [open, setOpen] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  return (
    <div className={`faq-item card ${light ? 'card-light' : 'card-dark'} ${open ? 'open' : ''}`}>
      <button
        className="faq-header"
        aria-expanded={open}
        aria-controls={`faq-body-${index}`}
        onClick={() => setOpen(o => !o)}
      >
        <div className="faq-header-inner">
          <span className="faq-badge">{index + 1}</span>
          <span className={`faq-question ${light ? '' : 'c-white'}`}>{item.question}</span>
        </div>
        <span className="faq-chevron" aria-hidden="true">▼</span>
      </button>
      <div
        ref={bodyRef}
        id={`faq-body-${index}`}
        className="faq-body"
        style={{
          maxHeight: open ? (bodyRef.current?.scrollHeight ?? 600) : 0,
          overflow: 'hidden',
          transition: 'max-height 0.35s ease',
        }}
      >
        <p className={`t-body ${light ? 'c-body' : 'c-muted'}`} style={{ marginTop: 12 }}>{item.answer}</p>
      </div>
    </div>
  )
}

export default function FaqAccordion({ items, light }: Props) {
  return (
    <div className="faq-list" style={{ marginTop: 0 }}>
      {items.map((item, i) => (
        <FaqItemRow key={item.question} item={item} index={i} light={light} />
      ))}
    </div>
  )
}
