'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { broadcastLogout } from '@/components/AuthSyncProvider'

// ── SVG icons (inline, no external dep) ─────────────────────────────────────
const Icons: Record<string, React.ReactNode> = {
  Dashboard:    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>,
  Enquiries:    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>,
  Leads:        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>,
  Trainers:     <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>,
  Mentors:      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z"/></svg>,
  Programs:     <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>,
  Courses:      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>,
  Institutions: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>,
  Gallery:      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"/></svg>,
  Webinars:     <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>,
  Internships:  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.53 15.5 0 12.36 0c-2 0-3.45 1.18-4.36 2.45C7.08 1.18 5.63 0 3.64 0 .5 0-2 2.53-2 4.64c0 .48.11.92.18 1.36H-2c-1.1 0-1.99.9-1.99 2L-4 19c0 1.1.9 2 2 2h22c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7.64-4c1.16 0 2.64.87 2.64 2.64 0 1.44-.87 2.36-2 2.36-1 0-2-.78-2-2.36C11 3.01 12.2 2 12.36 2zM4 4.64C4 2.87 5.48 2 6.64 2 6.8 2 8 3.01 8 4.64c0 1.58-1 2.36-2 2.36-1.13 0-2-.92-2-2.36zM20 19H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/></svg>,
  Blog:         <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>,
  Careers:      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>,
  Media:        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM9.5 14.5l2.5-3.5 2.5 3.5 1.5-2 2.5 3H6l3.5-4.5z"/></svg>,
  Settings:     <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>,
  Users:        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>,
  'Audit Log':  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>,
}

const NAV = [
  { label: 'Dashboard',    href: '/admin' },
  { label: 'Enquiries',    href: '/admin/enquiries',    section: 'Leads' },
  { label: 'Leads',        href: '/admin/leads' },
  { label: 'Trainers',     href: '/admin/trainers',     section: 'Content' },
  { label: 'Mentors',      href: '/admin/mentors' },
  { label: 'Programs',     href: '/admin/programs' },
  { label: 'Courses',      href: '/admin/courses' },
  { label: 'Institutions', href: '/admin/institutions' },
  { label: 'Gallery',      href: '/admin/gallery' },
  { label: 'Webinars',     href: '/admin/webinars' },
  { label: 'Internships',  href: '/admin/internships' },
  { label: 'Blog',         href: '/admin/blog' },
  { label: 'Careers',      href: '/admin/careers' },
  { label: 'Media',        href: '/admin/media',        section: 'System' },
  { label: 'Settings',     href: '/admin/settings' },
  { label: 'Users',        href: '/admin/users' },
  { label: 'Audit Log',    href: '/admin/audit-log' },
]

interface Props { email: string; role: string }

const BG        = '#1e3a8a'
const BG_HEADER = '#172554'
const BG_HOVER  = 'rgba(255,255,255,0.08)'
const BG_ACTIVE = 'rgba(255,255,255,0.14)'
const TEXT_NAV  = 'rgba(255,255,255,0.7)'
const TEXT_ACT  = '#ffffff'
const GOLD      = '#c8a035'
const DIVIDER   = 'rgba(255,255,255,0.1)'
const TEXT_SEC  = 'rgba(255,255,255,0.38)'

const COLLAPSED_W = 56
const EXPANDED_W  = 220

export default function AdminSidebar({ email, role }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('admin-sidebar-collapsed')
    if (stored === 'true') setCollapsed(true)
  }, [])

  function toggleCollapse() {
    setCollapsed(v => {
      localStorage.setItem('admin-sidebar-collapsed', String(!v))
      return !v
    })
  }

  useEffect(() => {
    function onResize() { if (window.innerWidth >= 768) setMobileOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile header bar */}
      <div className="admin-mobile-header" style={{ background: BG_HEADER, borderBottom: `1px solid ${DIVIDER}` }}>
        <Image src="/images/logo.png" alt="SODAK" width={24} height={24} style={{ width: 90, height: 24, objectFit: 'contain' }} priority />
        <button
          onClick={() => setMobileOpen(o => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: '#fff', display: 'flex', alignItems: 'center' }}
        >
          {mobileOpen
            ? <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            : <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
          }
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && <div className="admin-sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar${mobileOpen ? ' open' : ''}`}
        style={{
          background: BG,
          width: collapsed ? COLLAPSED_W : EXPANDED_W,
          minWidth: collapsed ? COLLAPSED_W : EXPANDED_W,
          transition: 'width 0.25s ease, min-width 0.25s ease',
          // overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: BG_HEADER, borderBottom: `1px solid ${DIVIDER}`,
          height: 56, display: 'flex', alignItems: 'center',
          flexShrink: 0,
          padding: collapsed ? '0' : '0 12px 0 20px',
          justifyContent: collapsed ? 'center' : 'space-between',
          transition: 'padding 0.25s ease',
        }}>
          {/* Logo + Admin label — only shown when expanded */}
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: '#ffffff', borderRadius: 8, padding: '4px 8px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <Image
                  src="/images/logo.png"
                  alt="SODAK"
                  width={120}
                  height={32}
                  style={{ height: 28, width: 'auto', display: 'block' }}
                  priority
                />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: GOLD, whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>Admin</span>
            </div>
          )}

          {/* Collapse / expand toggle — hidden on mobile via CSS */}
          <button
            onClick={toggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="admin-sidebar-collapse-btn"
            style={{
              background: collapsed ? 'transparent' : 'rgba(255,255,255,0.08)',
              border: 'none', borderRadius: 6,
              width: collapsed ? COLLAPSED_W : 28,
              height: collapsed ? 56 : 28,
              cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.65)', transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.background = collapsed ? 'transparent' : 'rgba(255,255,255,0.08)')}
          >
            {collapsed
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 18l6-6-6-6v12z"/></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15 18l-6-6 6-6v12z"/></svg>
            }
          </button>
        </div>

        {/* Nav */}
        <nav style={{ padding: '8px 0', overflowY: 'auto', overflowX: 'hidden', flex: 1 }}>
          {NAV.map(item => {
            const active = isActive(item.href)
            const icon   = Icons[item.label]
            return (
              <span key={item.href}>
                {/* Section label — hidden when collapsed */}
                {item.section && !collapsed && (
                  <div style={{
                    padding: '18px 20px 6px', fontSize: 10, fontWeight: 700,
                    color: TEXT_SEC, textTransform: 'uppercase', letterSpacing: '0.1em',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.section}
                  </div>
                )}
                {item.section && collapsed && (
                  <div style={{ height: 1, background: DIVIDER, margin: '10px 8px' }} />
                )}
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? 'page' : undefined}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: collapsed ? '0' : '0 20px',
                    height: 40, fontSize: 13,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: 10,
                    color: active ? TEXT_ACT : TEXT_NAV,
                    fontWeight: active ? 600 : 400,
                    borderLeft: `3px solid ${active ? GOLD : 'transparent'}`,
                    background: active ? BG_ACTIVE : 'transparent',
                    textDecoration: 'none', whiteSpace: 'nowrap',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = BG_HOVER; e.currentTarget.style.color = '#fff' } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TEXT_NAV } }}
                >
                  <span style={{ flexShrink: 0, opacity: active ? 1 : 0.75 }}>{icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </span>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${DIVIDER}`, flexShrink: 0 }}>
          {!collapsed && (
            <div style={{ padding: '12px 20px 8px' }}>
              <p title={email} style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.42)', marginTop: 2 }}>{role}</p>
            </div>
          )}
          <button
            onClick={() => { broadcastLogout(); signOut({ callbackUrl: '/admin/login' }) }}
            title="Log out"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', border: 'none', cursor: 'pointer',
              padding: collapsed ? '12px 0' : '8px 20px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              background: 'transparent', color: TEXT_NAV,
              fontSize: 13, transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = BG_HOVER; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TEXT_NAV }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, opacity: 0.75 }}><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
