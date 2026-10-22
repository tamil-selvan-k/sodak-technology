'use client'

import { useEffect, useRef, useId } from 'react'

interface SodakLoaderProps {
  /** Cover the viewport (true) or fill the parent container (false). Default: true */
  fullScreen?: boolean
  /** Show the SODAK TECHNOLOGY wordmark. Default: true */
  showWordmark?: boolean
  /** Show the progress bar. Default: true */
  showProgress?: boolean
  /** SVG size: sm=120px, md=200px, lg=430px max. Default: 'lg' */
  size?: 'sm' | 'md' | 'lg'
  /** Fires when the construction animation completes (~1.65s) */
  onAnimationComplete?: () => void
}

export default function SodakLoader({
  fullScreen = true,
  showWordmark = true,
  showProgress = true,
  size = 'lg',
  onAnimationComplete,
}: SodakLoaderProps) {
  const uid = useId().replace(/:/g, '')
  const upperMaskRef = useRef<SVGRectElement>(null)
  const lowerMaskRef = useRef<SVGRectElement>(null)
  const callbackRef = useRef(onAnimationComplete)
  callbackRef.current = onAnimationComplete

  useEffect(() => {
    const upper: SVGRectElement | null = upperMaskRef.current
    const lower: SVGRectElement | null = lowerMaskRef.current
    if (!upper || !lower) return

    /* Capture non-null refs for the rAF closure */
    const u: SVGRectElement = upper
    const l: SVGRectElement = lower

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      u.setAttribute('x', '0')
      u.setAttribute('width', '500')
      l.setAttribute('x', '0')
      l.setAttribute('width', '500')
      callbackRef.current?.()
      return
    }

    const duration = 1650
    const start = performance.now()
    const ease = (t: number) => 1 - Math.pow(1 - t, 3)
    let raf: number

    function frame(now: number) {
      const t = Math.min(1, (now - start) / duration)
      const p = ease(t)
      u.setAttribute('x', String(500 * (1 - p)))
      u.setAttribute('width', String(500 * p))
      const q = Math.max(0, Math.min(1, (t - 0.12) / 0.88))
      l.setAttribute('x', '0')
      l.setAttribute('width', String(500 * ease(q)))
      if (t < 1) {
        raf = requestAnimationFrame(frame)
      } else {
        u.setAttribute('x', '0')
        u.setAttribute('width', '500')
        l.setAttribute('x', '0')
        l.setAttribute('width', '500')
        callbackRef.current?.()
      }
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Unique SVG IDs — avoids collisions when multiple loaders coexist */
  const ids = {
    upperBlue: `sl-ub-${uid}`,
    lowerBlue: `sl-lb-${uid}`,
    facet: `sl-fc-${uid}`,
    upperReveal: `sl-ur-${uid}`,
    lowerReveal: `sl-lr-${uid}`,
  }

  return (
    <div
      className={`sodak-loader-wrap ${fullScreen ? 'sodak-loader-fullscreen' : 'sodak-loader-inline'}`}
      role="status"
      aria-label="Sodak Technology loading"
    >
      <div className={`sodak-loader-brand sodak-loader-size-${size}`}>
        <svg
          viewBox="0 0 500 500"
          role="img"
          aria-label="Sodak Technology S logo being constructed from two geometric ribbons"
          className="sodak-loader-svg"
        >
          <defs>
            <linearGradient id={ids.upperBlue} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#0c347f" />
              <stop offset=".48" stopColor="#1456ad" />
              <stop offset="1" stopColor="#2678d0" />
            </linearGradient>
            <linearGradient id={ids.lowerBlue} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#1c66bd" />
              <stop offset=".58" stopColor="#0d469b" />
              <stop offset="1" stopColor="#277bd0" />
            </linearGradient>
            <linearGradient id={ids.facet} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#2f83d8" />
              <stop offset="1" stopColor="#12458f" />
            </linearGradient>
            <mask id={ids.upperReveal} maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
              <rect
                ref={upperMaskRef}
                x="0"
                y="0"
                width="500"
                height="500"
                fill="white"
                style={{ transformOrigin: 'right center' }}
              />
            </mask>
            <mask id={ids.lowerReveal} maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
              <rect
                ref={lowerMaskRef}
                x="0"
                y="0"
                width="500"
                height="500"
                fill="white"
                style={{ transformOrigin: 'left center' }}
              />
            </mask>
          </defs>

          {/* Upper ribbon piece */}
          <g mask={`url(#${ids.upperReveal})`}>
            <path className="sodak-loader-ribbon" fill={`url(#${ids.upperBlue})`} d="M250 82 L375 153 L375 211 L329 184 L329 180 L250 135 L170 180 L170 216 L289 285 L250 308 L124 237 L124 153 Z" />
            <path fill="#0a347e" opacity=".48" d="M250 82 L250 135 L170 180 L124 153 Z" />
            <path fill="#2b79cc" opacity=".56" d="M250 82 L375 153 L329 180 L250 135 Z" />
            <path fill="#0a347e" opacity=".35" d="M124 153 L170 180 L170 216 L124 237 Z" />
            <path fill="#287bd0" opacity=".5" d="M170 216 L289 285 L250 308 L124 237 Z" />
          </g>

          {/* Lower ribbon piece */}
          <g mask={`url(#${ids.lowerReveal})`}>
            <path fill={`url(#${ids.lowerBlue})`} d="M250 180 L375 250 L375 346 L250 418 L124 346 L124 287 L170 313 L170 323 L250 366 L329 321 L329 276 L211 208 Z" />
            <path fill="#2b7bcf" opacity=".55" d="M250 180 L375 250 L329 276 L211 208 Z" />
            <path fill="#0b347d" opacity=".5" d="M124 287 L170 313 L170 323 L124 346 Z" />
            <path fill="#0b347d" opacity=".35" d="M250 366 L329 321 L375 346 L250 418 Z" />
            <path fill="#2473c7" opacity=".45" d="M329 276 L375 250 L375 346 L329 321 Z" />
          </g>

          {/* Spark trails */}
          <path className="sodak-loader-spark" d="M375 205 L250 135 L124 205 L289 297" />
          <path className="sodak-loader-spark sodak-loader-spark-lower" d="M124 294 L250 367 L375 295 L211 204" />
        </svg>

        {showWordmark && (
          <div className="sodak-loader-wordmark" aria-hidden="true">
            <div className="sodak-loader-name">SODAK</div>
            <div className="sodak-loader-sub">TECHNOLOGY</div>
            {showProgress && <div className="sodak-loader-track" />}
          </div>
        )}

        {!showWordmark && showProgress && (
          <div className="sodak-loader-track" aria-hidden="true" />
        )}
      </div>
    </div>
  )
}
