'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import MentorCard from '@/components/ui/MentorCard'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

type MentorItem = {
  id: string
  name: string
  slug: string
  photoUrl?: string | null
  designation?: string | null
  currentCompany?: string | null
  expertiseTags: string[]
  yearsExperience?: number | null
}

export default function MentorCarousel({ mentors }: { mentors: MentorItem[] }) {
  const [index, setIndex] = useState(0)
  const [visCount, setVisCount] = useState(3)
  const trackRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)

  useEffect(() => {
    function update() {
      if (window.innerWidth <= 560) setVisCount(1)
      else if (window.innerWidth <= 850) setVisCount(2)
      else setVisCount(3)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const maxIndex = Math.max(0, mentors.length - visCount)

  const goTo = useCallback((next: number) => {
    setIndex(Math.max(0, Math.min(next, maxIndex)))
  }, [maxIndex])

  useEffect(() => {
    setIndex(i => Math.min(i, maxIndex))
  }, [maxIndex])

  useEffect(() => {
    if (!trackRef.current) return
    const card = trackRef.current.children[0] as HTMLElement
    if (!card) return
    const gap = parseFloat(getComputedStyle(trackRef.current).gap) || 18
    const step = card.getBoundingClientRect().width + gap
    trackRef.current.style.transform = `translate3d(${-index * step}px, 0, 0)`
  }, [index, visCount])

  function onPointerDown(e: React.PointerEvent) { startX.current = e.clientX }
  function onPointerUp(e: React.PointerEvent) {
    const delta = e.clientX - startX.current
    if (Math.abs(delta) > 45) goTo(index + (delta < 0 ? 1 : -1))
  }

  const pad = (n: number) => String(n + 1).padStart(2, '0')
  const cardBasis = visCount === 1 ? '84%' : visCount === 2 ? 'calc((100% - 18px) / 2)' : 'calc((100% - 36px) / 3)'

  return (
    <ScrollReveal delay={0.2}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 clamp(18px,5vw,64px)' }}>
        {/* Counter row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ color: '#d5e3ff', fontSize: 11, letterSpacing: '0.13em', fontWeight: 800 }}>
            FEATURED PROFESSIONALS
          </span>
          <span style={{ color: '#d5e3ff', fontSize: 12 }}>
            {pad(index)} / {pad(maxIndex)}
          </span>
        </div>

        {/* Viewport */}
        <div
          style={{ overflow: 'hidden', padding: '10px 0', margin: '-10px 0' }}
          tabIndex={0}
          aria-label="Featured mentors carousel"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onKeyDown={e => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1) }
            if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1) }
          }}
        >
          <div
            ref={trackRef}
            style={{ display: 'flex', gap: 18, transition: 'transform 0.48s cubic-bezier(0.2,0.75,0.25,1)', willChange: 'transform' }}
          >
            {mentors.map(m => (
              <div key={m.id} style={{ flex: `0 0 ${cardBasis}`, minWidth: 0 }}>
                <MentorCard mentor={m} />
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, marginTop: 22 }}>
          <div style={{ display: 'flex', gap: 9 }}>
            <button
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              aria-label="Previous mentors"
              style={{ width: 42, height: 42, display: 'grid', placeItems: 'center', borderRadius: '50%', border: '1px solid rgba(220,234,255,0.65)', color: 'white', background: 'rgba(255,255,255,0.10)', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.35 : 1, transition: 'background 0.2s' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => goTo(index + 1)}
              disabled={index === maxIndex}
              aria-label="Next mentors"
              style={{ width: 42, height: 42, display: 'grid', placeItems: 'center', borderRadius: '50%', border: '1px solid rgba(220,234,255,0.65)', color: 'white', background: 'rgba(255,255,255,0.10)', cursor: index === maxIndex ? 'not-allowed' : 'pointer', opacity: index === maxIndex ? 0.35 : 1, transition: 'background 0.2s' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* Dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }} aria-label="Choose carousel page">
            {Array.from({ length: maxIndex + 1 }, (_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Show mentor set ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                style={{
                  padding: 0,
                  border: 0,
                  borderRadius: 99,
                  cursor: 'pointer',
                  transition: 'width 0.25s, background 0.25s',
                  width: i === index ? 23 : 7,
                  height: 7,
                  background: i === index ? 'white' : 'rgba(220,234,255,0.45)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </ScrollReveal>
  )
}
