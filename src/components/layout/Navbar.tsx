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
      { label: 'Courses',       href: '/courses' },
      { label: 'Campus Programs', href: '/programs' },
      { label: 'Training Stacks', href: '/training' },
      { label: 'Mentors (1-on-1)', href: '/mentors' },
      { label: 'Webinars',      href: '/webinars' },
      { label: 'Internships',   href: '/internships' },
    ],
  },
  { label: 'Institutions', href: '/institutions' },
  {
    label: 'Platform', href: '/platform',
    dropdown: [
      { label: 'Platform Overview', href: '/platform' },
      { label: 'SODAK LMS ↗',       href: '#', external: true },
      { label: 'SODAK CTF ↗',       href: '#', external: true },
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
  const pathname    = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[var(--dm-border)] h-[var(--nav-height)] flex items-center">
      <div className="container flex items-center justify-between w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 font-heading font-800">
          <span className="text-[var(--navy-950)] font-extrabold text-xl">SODAK</span>
          <span className="text-[var(--dm-accent)] font-extrabold text-xl">Technology</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.href} className="relative group">
                <Link
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'text-[var(--dm-accent)] font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {item.label}{'dropdown' in item && <span className="ml-1 text-xs opacity-60">▾</span>}
                </Link>
                {'dropdown' in item && (
                  <div className="absolute top-full left-0 hidden group-hover:flex flex-col bg-white border border-[var(--dm-border)] rounded-xl shadow-lg min-w-[200px] py-2 z-50">
                    {item.dropdown.map(d => (
                      <Link key={d.href} href={d.href} className="px-4 py-2 text-sm text-slate-700 hover:bg-[var(--dm-surface)] hover:text-[var(--dm-accent)] transition-colors">
                        {d.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/contact" className="btn-gold text-sm font-semibold px-4 py-2 rounded-md bg-[var(--gold-500)] text-[var(--navy-950)] hover:bg-[var(--gold-400)] transition-colors">
            Book a Program →
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden p-2 text-slate-700"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden absolute top-[var(--nav-height)] left-0 right-0 bg-white border-b border-[var(--dm-border)] py-4 px-6 flex flex-col gap-2 shadow-lg z-40">
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href} className="py-2 text-sm font-medium text-slate-700" onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href="/contact" className="mt-2 text-center py-2 px-4 rounded-md bg-[var(--gold-500)] text-[var(--navy-950)] font-semibold text-sm">
            Book a Program →
          </Link>
        </div>
      )}
    </nav>
  )
}
