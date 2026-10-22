'use client'

import { useState, useEffect } from 'react'
import SodakLoader from './SodakLoader'

export default function HomeLoader() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const shown = sessionStorage.getItem('sodak-loader-shown')
    if (shown) {
      setVisible(false)
      return
    }
    sessionStorage.setItem('sodak-loader-shown', '1')
  }, [])

  if (!visible) return null

  return (
    <div
      className="home-loader-overlay"
      style={{ opacity: fading ? 0 : 1 }}
      onTransitionEnd={() => setVisible(false)}
    >
      <SodakLoader
        fullScreen
        size="lg"
        showWordmark
        showProgress
        onAnimationComplete={() => {
          setTimeout(() => setFading(true), 600)
        }}
      />
    </div>
  )
}
