'use client'

import { useRef, useState, useEffect, type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface HeroRevealProps {
  children: ReactNode
  delay?: number
  className?: string
  style?: React.CSSProperties
}

export default function HeroReveal({ children, delay = 0, className, style }: HeroRevealProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <motion.div
      initial={mounted ? { opacity: 0, y: 24 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}
