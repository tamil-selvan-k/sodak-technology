'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

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

  useEffect(() => {
    const close = () => { if (window.innerWidth > 960) setOpen(false) }
    window.addEventListener('resize', close)
    return () => window.removeEventListener('resize', close)
  }, [])

  return (
    <nav style={{
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
            return (
              <li key={item.href} style={{ position: 'relative' }} className="group">
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
                  {'dropdown' in item && <span style={{ fontSize: 10, opacity: 0.6 }}>▾</span>}
                </Link>
                {'dropdown' in item && (
                  <div className="hidden group-hover:flex flex-col" style={{
                    position: 'absolute', top: '100%', left: 0,
                    background: '#ffffff', border: '1px solid #dbeafe',
                    borderRadius: '1.25rem', minWidth: 200,
                    padding: '8px 0', zIndex: 200,
                    marginTop: 4,
                    boxShadow: '0 10px 25px rgba(37,99,235,0.08)',
                  }}>
                    {item.dropdown.map(d => (
                      <Link key={d.href} href={d.href} style={{
                        display: 'block', padding: '8px 16px',
                        fontFamily: 'var(--font-inter), sans-serif',
                        fontSize: 13, color: '#334155', textDecoration: 'none',
                        transition: 'color 0.15s, background 0.15s',
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
        }}>
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href} style={{
              padding: '10px 0', fontFamily: 'var(--font-inter), sans-serif',
              fontSize: 14, fontWeight: 500, color: '#172554', textDecoration: 'none',
              borderBottom: '1px solid #eff6ff',
            }} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
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
