'use client'

import { useState } from 'react'

interface FaqItem {
  question: string
  answer: string
}

interface Props {
  items: FaqItem[]
  light?: boolean
}

export default function FaqAccordion({ items, light }: Props) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="faq-list" style={{ marginTop: 0 }}>
      {items.map((item, i) => (
        <div
          key={i}
          className={`faq-item card ${light ? 'card-light' : 'card-dark'} ${open === i ? 'open' : ''}`}
        >
          <button
            className="faq-header"
            aria-expanded={open === i}
            aria-controls={`faq-body-${i}`}
            onClick={() => setOpen(open === i ? null : i)}
          >
            <div className="faq-header-inner">
              <span className="faq-badge">{i + 1}</span>
              <span className={`faq-question ${light ? '' : 'c-white'}`}>{item.question}</span>
            </div>
            <span className="faq-chevron" aria-hidden="true">▼</span>
          </button>
          <div className="faq-body" id={`faq-body-${i}`}>
            <p className={`t-body ${light ? 'c-body' : 'c-muted'}`} style={{ marginTop: 12 }}>{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
