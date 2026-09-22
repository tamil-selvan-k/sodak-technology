'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function NavigationProgress() {
  const pathname = usePathname()
  const [width, setWidth] = useState(0)
  const [visible, setVisible] = useState(false)
  const tickRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isNavigatingRef = useRef(false)

  // Intercept internal link clicks to start the bar
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      ) return

      isNavigatingRef.current = true
      setVisible(true)
      setWidth(10)

      // Crawl slowly toward 85% — never reaches it until pathname changes
      let current = 10
      const crawl = () => {
        current += (85 - current) * 0.08
        setWidth(current)
        if (current < 84) {
          tickRef.current = setTimeout(crawl, 120)
        }
      }
      tickRef.current = setTimeout(crawl, 120)
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  // Complete bar when pathname actually changes
  useEffect(() => {
    if (!isNavigatingRef.current) return
    isNavigatingRef.current = false
    if (tickRef.current) clearTimeout(tickRef.current)
    setWidth(100)
    const hide = setTimeout(() => {
      setVisible(false)
      setWidth(0)
    }, 350)
    return () => clearTimeout(hide)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: 3,
        width: `${width}%`,
        background: '#c8a035',
        zIndex: 9999,
        borderRadius: '0 2px 2px 0',
        boxShadow: '0 0 10px rgba(200,160,53,0.5)',
        transition: width === 100 ? 'width 0.2s ease' : 'width 0.5s ease-out',
        pointerEvents: 'none',
      }}
    />
  )
}
