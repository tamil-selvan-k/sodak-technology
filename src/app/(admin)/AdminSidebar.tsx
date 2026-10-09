'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

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

interface Props {
  email: string
  role: string
}

export default function AdminSidebar({ email, role }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Close sidebar when viewport grows beyond mobile breakpoint
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile header bar — visible only on ≤768px via CSS */}
      <div className="admin-mobile-header" style={{ borderBottom: '1px solid #DBEAFE' }}>
        <span style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif', fontWeight: 800, fontSize: 15, color: '#1E40AF' }}>SODAK</span>
        <span style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif', fontWeight: 800, fontSize: 15, color: '#2563EB', marginLeft: 3 }}>Admin</span>
        <button
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          style={{
            marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
            padding: 8, color: '#334155', display: 'flex', alignItems: 'center',
          }}
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          )}
        </button>
      </div>

      {/* Overlay backdrop */}
      {open && (
        <div className="admin-sidebar-overlay" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar${open ? ' open' : ''}`}>
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: '#ffffff', borderBottom: '1px solid #DBEAFE',
          padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', flexShrink: 0,
        }}>
          <span style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif', fontWeight: 800, fontSize: 15, color: '#1E40AF' }}>SODAK</span>
          <span style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif', fontWeight: 800, fontSize: 15, color: '#2563EB', marginLeft: 3 }}>Admin</span>
        </div>
        <nav className="py-4">
          {NAV.map(item => (
            <span key={item.href}>
              {item.section && (
                <div className="admin-nav-section">{item.section}</div>
              )}
              <Link
                href={item.href}
                className={`admin-nav-item${isActive(item.href) ? ' active' : ''}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            </span>
          ))}
        </nav>
        <div className="mt-auto px-4 py-3" style={{ borderTop: '1px solid #DBEAFE' }}>
          <p style={{ fontSize: 12, color: '#172554', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</p>
          <p style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{role}</p>
        </div>
      </aside>
    </>
  )
}
