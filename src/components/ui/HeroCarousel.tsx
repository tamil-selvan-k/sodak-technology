'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

const SLIDES = [
  { label: 'On-Campus Training',  src: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=85' },
  { label: 'Mock Interviews',     src: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=85' },
  { label: 'Placement Bootcamp',  src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=85' },
  { label: 'Industry Trainers',   src: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=900&q=85' },
  { label: 'Hands-on Labs',       src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85' },
]

const TRANSFORMS: Record<string, React.CSSProperties> = {
  center: { transform: 'translate3d(0,0,0) scale(1)',                               zIndex: 3, opacity: 1   },
  right:  { transform: 'translate3d(150px,12px,-60px) rotateY(-20deg) scale(0.88)', zIndex: 1, opacity: 0.9 },
  left:   { transform: 'translate3d(-150px,12px,-60px) rotateY(20deg) scale(0.88)', zIndex: 1, opacity: 0.9 },
  hidden: { transform: 'translate3d(0,20px,-300px) scale(0.6)',                      zIndex: 0, opacity: 0   },
}

function getSlot(i: number, index: number, n: number): string {
  const d = (i - index + n) % n
  if (d === 0)     return 'center'
  if (d === 1)     return 'right'
  if (d === n - 1) return 'left'
  return 'hidden'
}

export default function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [paused, setPaused] = useState(false)
  const n = SLIDES.length

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 960px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setIndex(i => (i + 1) % n), 3500)
    return () => clearInterval(id)
  }, [n, paused])

  if (isMobile) {
    const currentSlide = SLIDES[index] ?? SLIDES[0]!
    // Single flat card — no 3D transforms, no overflow
    return (
      <div style={{ width: '100%', maxWidth: 360, margin: '0 auto', position: 'relative' }}
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div style={{ width: '100%', height: 220, borderRadius: 20, overflow: 'hidden', position: 'relative' }}>
          <Image
            src={currentSlide.src}
            alt={currentSlide.label}
            fill
            sizes="360px"
            unoptimized
            style={{ objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.7))' }} />
          <p style={{ position: 'absolute', bottom: 16, left: 16, color: 'white', fontWeight: 700, fontSize: 14, zIndex: 2, margin: 0 }}>
            {currentSlide.label}
          </p>
        </div>
        {/* Dot indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} aria-label={`Slide ${i + 1}`}
              style={{ width: i === index ? 20 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer', padding: 0, transition: 'width 0.3s', background: i === index ? '#c8a035' : 'rgba(255,255,255,0.35)' }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      style={{ width: 420, height: 380, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1200, marginLeft: -20 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SLIDES.map((slide, i) => {
        const slot = getSlot(i, index, n)
        return (
          <div
            key={slide.label}
            style={{
              position: 'absolute',
              width: 280,
              height: 340,
              borderRadius: 24,
              overflow: 'hidden',
              transition: 'transform 0.75s cubic-bezier(0.2,0.8,0.2,1), opacity 0.75s, filter 0.75s',
              ...TRANSFORMS[slot],
            }}
          >
            <Image
              src={slide.src}
              alt={slide.label}
              fill
              sizes="280px"
              unoptimized
              style={{ objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.7))' }} />
            <p style={{ position: 'absolute', bottom: 20, left: 20, color: 'white', fontWeight: 700, fontSize: 15, zIndex: 2, margin: 0 }}>
              {slide.label}
            </p>
          </div>
        )
      })}

      {/* Prev / Next */}
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 10, zIndex: 10 }}>
        <button
          aria-label="Previous"
          onClick={() => setIndex(i => (i - 1 + n) % n)}
          style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', width: 40, height: 40, borderRadius: '50%', color: 'white', fontSize: 18, cursor: 'pointer' }}
        >‹</button>
        <button
          aria-label="Next"
          onClick={() => setIndex(i => (i + 1) % n)}
          style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', width: 40, height: 40, borderRadius: '50%', color: 'white', fontSize: 18, cursor: 'pointer' }}
        >›</button>
      </div>
    </div>
  )
}
