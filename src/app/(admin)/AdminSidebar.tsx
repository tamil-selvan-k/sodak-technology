'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <aside className="admin-sidebar">
      <div className="px-5 h-14 flex items-center" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <span style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif', fontWeight: 800, fontSize: 15, color: '#0f172a' }}>SODAK</span>
        <span style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif', fontWeight: 800, fontSize: 15, color: '#4865ad', marginLeft: 3 }}>Admin</span>
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
            >
              {item.label}
            </Link>
          </span>
        ))}
      </nav>
      <div className="mt-auto px-4 py-3" style={{ borderTop: '1px solid #e2e8f0' }}>
        <p style={{ fontSize: 12, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</p>
        <p style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{role}</p>
      </div>
    </aside>
  )
}
