'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

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

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      height: 64,
      display: 'flex',
      alignItems: 'center',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 2, textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif', fontWeight: 800, fontSize: 20, color: '#0f172a' }}>SODAK</span>
          <span style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif', fontWeight: 800, fontSize: 20, color: '#4865ad' }}>Technology</span>
        </Link>

        {/* Desktop nav */}
        <ul style={{ display: 'flex', alignItems: 'center', gap: 4, listStyle: 'none', margin: 0, padding: 0 }} className="hidden md:flex">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.href} style={{ position: 'relative' }} className="group">
                <Link
                  href={item.href}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '6px 12px', borderRadius: '2rem',
                    fontFamily: 'var(--font-inter), sans-serif',
                    fontSize: 14, fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#4865ad' : '#334155',
                    textDecoration: 'none',
                    transition: 'color 0.15s',
                  }}
                >
                  {item.label}
                  {'dropdown' in item && <span style={{ fontSize: 10, opacity: 0.5 }}>▾</span>}
                </Link>
                {'dropdown' in item && (
                  <div className="hidden group-hover:flex flex-col" style={{
                    position: 'absolute', top: '100%', left: 0,
                    background: '#ffffff', border: '1px solid #e2e8f0',
                    borderRadius: '1.5rem', minWidth: 200,
                    padding: '8px 0', zIndex: 200,
                    marginTop: 4,
                  }}>
                    {item.dropdown.map(d => (
                      <Link key={d.href} href={d.href} style={{
                        display: 'block', padding: '8px 16px',
                        fontFamily: 'var(--font-inter), sans-serif',
                        fontSize: 13, color: '#334155', textDecoration: 'none',
                        transition: 'color 0.15s, background 0.15s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#4865ad'; (e.currentTarget as HTMLElement).style.background = 'rgba(72,101,173,0.05)'; }}
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

        <div className="hidden md:flex" style={{ alignItems: 'center', gap: 12 }}>
          <Link href="/contact" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 20px', borderRadius: '2.5rem',
            background: '#4865ad', color: '#ffffff',
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
            Book a Program →
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden"
          style={{ padding: 8, color: '#334155', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden" style={{
          position: 'absolute', top: 64, left: 0, right: 0,
          background: '#ffffff', borderBottom: '1px solid #e2e8f0',
          padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 4, zIndex: 200,
        }}>
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href} style={{
              padding: '10px 0', fontFamily: 'var(--font-inter), sans-serif',
              fontSize: 14, fontWeight: 500, color: '#334155', textDecoration: 'none',
              borderBottom: '1px solid #f1f5f9',
            }} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href="/contact" style={{
            marginTop: 8, textAlign: 'center', padding: '10px 20px',
            borderRadius: '2.5rem', background: '#4865ad', color: '#ffffff',
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
