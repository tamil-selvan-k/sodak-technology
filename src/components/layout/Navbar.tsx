'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

const NAV_ITEMS = [
  { label: 'About',        href: '/about' },
  { label: 'Trainers',     href: '/trainers' },
  {
    label: 'Learn', href: '/courses',
    dropdown: [
      { label: 'Courses',           href: '/courses' },
      { label: 'Campus Programs',   href: '/programs' },
      { label: 'Training Stacks',   href: '/training' },
      { label: 'Mentors (1-on-1)',  href: '/mentors' },
      { label: 'Webinars',          href: '/webinars' },
      { label: 'Internships',       href: '/internships' },
    ],
  },
  { label: 'Institutions', href: '/institutions' },
  {
    label: 'Platform', href: '/platform',
    dropdown: [
      { label: 'Platform Overview',   href: '/platform' },
      { label: 'SODAK LMS ↗',         href: '#', external: true },
      { label: 'SODAK CTF ↗',         href: '#', external: true },
      { label: 'Assessment Engine ↗', href: '#', external: true },
    ],
  },
  {
    label: 'Careers', href: '/careers',
    dropdown: [
      { label: 'Work at SODAK', href: '/careers' },
      { label: 'Internships',   href: '/internships' },
    ],
  },
  { label: 'Contact', href: '/contact' },
] as const

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Clear any pending close timeout
  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  // Open dropdown immediately on hover
  const handleDropdownEnter = (href: string) => {
    clearCloseTimeout()
    setActiveDropdown(href)
  }

  // Close dropdown with small delay to allow cursor movement
  const handleDropdownLeave = () => {
    clearCloseTimeout()
    closeTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150)
  }

  // Toggle on click (for touch devices and preference)
  const handleDropdownClick = (href: string, isOpen: boolean) => {
    clearCloseTimeout()
    setActiveDropdown(isOpen ? null : href)
  }

  useEffect(() => {
    const close = () => {
      if (window.innerWidth > 960) {
        setOpen(false) // Close mobile menu on desktop
      } else {
        setActiveDropdown(null) // Close desktop dropdowns on mobile
      }
    }
    window.addEventListener('resize', close)
    return () => window.removeEventListener('resize', close)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current)
          closeTimeoutRef.current = null
        }
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current)
          closeTimeoutRef.current = null
        }
        setActiveDropdown(null)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
    }
  }, [])

  return (
    <nav ref={navRef} style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: '#ffffff',
      borderBottom: '1px solid #dbeafe',
      height: 64,
      display: 'flex',
      alignItems: 'center',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image
            src="/images/logo.png"
            alt="SODAK Technology logo"
            width={36}
            height={36}
            priority
            style={{ objectFit: 'contain' }}
          />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif', fontWeight: 800, fontSize: 20, color: '#172554', letterSpacing: '-0.01em' }}>SODAK</span>
            <span style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif', fontWeight: 700, fontSize: 18, color: '#2563eb' }}>Technology</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <ul style={{ alignItems: 'center', gap: 4, listStyle: 'none', margin: 0, padding: 0 }} className="nav-desktop-links">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const hasDropdown = 'dropdown' in item
            const isDropdownOpen = hasDropdown && activeDropdown === item.href
            return (
              <li key={item.href} style={{ position: 'relative' }}>
                {hasDropdown ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleDropdownClick(item.href, isDropdownOpen)
                    }}
                    onMouseEnter={() => handleDropdownEnter(item.href)}
                    onMouseLeave={handleDropdownLeave}
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '6px 12px', borderRadius: '2rem',
                      fontFamily: 'var(--font-inter), sans-serif',
                      fontSize: 14, fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#2563eb' : '#334155',
                      background: isActive || isDropdownOpen ? '#eff6ff' : 'transparent',
                      textDecoration: 'none',
                      transition: 'all 0.15s',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {item.label}
                    <span style={{ fontSize: 10, opacity: 0.6 }}>▾</span>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '6px 12px', borderRadius: '2rem',
                      fontFamily: 'var(--font-inter), sans-serif',
                      fontSize: 14, fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#2563eb' : '#334155',
                      background: isActive ? '#eff6ff' : 'transparent',
                      textDecoration: 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    {item.label}
                  </Link>
                )}
                {hasDropdown && isDropdownOpen && (
                  <div
                    onMouseEnter={clearCloseTimeout}
                    onMouseLeave={handleDropdownLeave}
                    style={{
                      position: 'absolute', top: '100%', left: 0,
                      background: '#ffffff', border: '1px solid #dbeafe',
                      borderRadius: 12, minWidth: 200,
                      padding: '8px 0', zIndex: 200,
                      marginTop: 2,
                      boxShadow: '0 8px 24px rgba(37,99,235,0.10)',
                      display: 'flex',
                      flexDirection: 'column',
                      animation: 'dropdownIn 0.15s ease forwards',
                    }}>
                    {item.dropdown.map(d => (
                      <Link key={d.href} href={d.href} style={{
                        display: 'block', padding: '10px 16px',
                        fontFamily: 'var(--font-inter), sans-serif',
                        fontSize: 14, color: '#334155', textDecoration: 'none',
                        transition: 'color 0.15s, background 0.15s',
                      }}
                      onClick={() => {
                        clearCloseTimeout()
                        setActiveDropdown(null)
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#2563eb'; (e.currentTarget as HTMLElement).style.background = '#eff6ff'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#334155'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                        {d.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        <div className="nav-desktop-links" style={{ alignItems: 'center', gap: 12 }}>
          <Link href="/contact" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 20px', borderRadius: '2.5rem',
            background: '#2563eb', color: '#ffffff',
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
            transition: 'all 0.15s',
            boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1d4ed8'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#2563eb'; }}>
            Book a Program →
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="nav-hamburger-btn"
          style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <line x1="4" y1="4" x2="18" y2="18" stroke="#172554" strokeWidth="2" strokeLinecap="round"/>
              <line x1="18" y1="4" x2="4" y2="18" stroke="#172554" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="2" y1="5.5" x2="20" y2="5.5" stroke="#172554" strokeWidth="2" strokeLinecap="round"/>
              <line x1="2" y1="11" x2="20" y2="11" stroke="#172554" strokeWidth="2" strokeLinecap="round"/>
              <line x1="2" y1="16.5" x2="20" y2="16.5" stroke="#172554" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="nav-mobile-menu" style={{
          position: 'absolute', top: 64, left: 0, right: 0,
          background: '#ffffff', borderBottom: '1px solid #dbeafe',
          padding: '16px 24px', flexDirection: 'column', gap: 4, zIndex: 200,
          boxShadow: '0 10px 25px rgba(37,99,235,0.08)',
          animation: 'mobileMenuIn 0.2s ease',
        }}>
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link key={item.href} href={item.href} style={{
                padding: '10px 0', fontFamily: 'var(--font-inter), sans-serif',
                fontSize: 14, fontWeight: active ? 700 : 500,
                color: active ? '#2563eb' : '#172554', textDecoration: 'none',
                borderBottom: '1px solid #eff6ff',
              }} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            )
          })}
          <Link href="/contact" style={{
            marginTop: 8, textAlign: 'center', padding: '10px 20px',
            borderRadius: '2.5rem', background: '#2563eb', color: '#ffffff',
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
          }} onClick={() => setOpen(false)}>
            Book a Program →
          </Link>
        </div>
      )}
    </nav>
  )
}
