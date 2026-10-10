import Link from 'next/link'
import Image from 'next/image'

const COLUMNS = [
  {
    title: 'Programs',
    links: [
      { label: 'All Campus Programs',  href: '/programs' },
      { label: 'Placement Prep',       href: '/programs' },
      { label: 'Cloud & DevOps',       href: '/programs' },
      { label: 'Generative AI',        href: '/programs' },
      { label: 'Cybersecurity',        href: '/programs' },
      { label: 'Corporate & FDP',      href: '/corporate' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { label: 'Courses',         href: '/courses' },
      { label: 'Training Stacks', href: '/training' },
      { label: '1-on-1 Mentors',  href: '/mentors' },
      { label: 'Webinars',        href: '/webinars' },
      { label: 'Internships',     href: '/internships' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { label: 'Platform Overview',   href: '/platform' },
      { label: 'SODAK LMS ↗',         href: '#' },
      { label: 'SODAK CTF ↗',         href: '#' },
      { label: 'Assessment Engine ↗', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About SODAK',     href: '/about' },
      { label: 'Our Trainers',    href: '/trainers' },
      { label: 'Institutions',    href: '/institutions' },
      { label: 'Blog & Insights', href: '/insights' },
      { label: 'Careers',         href: '/careers' },
      { label: 'Gallery',         href: '/gallery' },
    ],
  },
  {
    title: 'Location',
    links: [
      { label: 'Chennai, Tamil Nadu 600 001', href: '#' },
      { label: '+91 89393 66259',             href: 'tel:+918939366259' },
      { label: 'hello@sodakedutech.in',       href: 'mailto:hello@sodakedutech.in' },
      { label: 'Chat on WhatsApp',            href: 'https://wa.me/918939366259' },
    ],
  },
]

export default function Footer() {
  return (
    <footer style={{ background: '#1e40af', borderTop: '1px solid rgba(255,255,255,0.12)', color: '#ffffff' }}>
      <div className="container" style={{ paddingTop: 56 }}>
        {/* Top strip */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: 32, paddingBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.12)',
          flexWrap: 'wrap',
        }}>
          <div style={{ maxWidth: 320 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 38, height: 38, background: '#fff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                <Image
                  src="/images/logo.png"
                  alt="SODAK Technology logo"
                  width={34}
                  height={34}
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif', fontWeight: 800, fontSize: 22, color: '#ffffff' }}>SODAK</span>
                <span style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif', fontWeight: 700, fontSize: 20, color: '#bfdbfe' }}>Technology</span>
              </div>
            </div>
            <p style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 14, color: '#bfdbfe', lineHeight: 1.75, margin: 0 }}>
              Campus training by engineers who cleared the interviews your students are preparing for.
              Placement-first. Practice-led. Industry-backed.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 12, color: '#bfdbfe', marginBottom: 4 }}>Ready to upskill your campus?</p>
              <p style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 13, color: '#ffffff', fontWeight: 600 }}>+91 89393 66259 · hello@sodakedutech.in</p>
            </div>
            <Link href="/contact" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 22px', borderRadius: '2.5rem',
              background: '#2563eb', color: '#ffffff',
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: 13, fontWeight: 600, textDecoration: 'none',
              whiteSpace: 'nowrap', transition: 'all 0.15s',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}>
              Book a Program →
            </Link>
          </div>
        </div>

        {/* Link columns */}
        <div className="footer-grid">
          {COLUMNS.map(col => (
            <div key={col.title}>
              <p style={{
                fontFamily: 'var(--font-inter), sans-serif',
                fontSize: 11, fontWeight: 700,
                color: '#bfdbfe', textTransform: 'uppercase',
                letterSpacing: '0.1em', marginBottom: 16,
              }}>{col.title}</p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(link => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.12)',
          padding: '20px 0', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
            &copy; 2026 SODAK Technology Pvt. Ltd. All rights reserved.
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link href="/privacy" style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', transition: 'color 0.15s' }}>Privacy Policy</Link>
            <Link href="/terms"   style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', transition: 'color 0.15s' }}>Terms of Service</Link>
            <Link href="/admin"   style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 13, color: '#93c5fd', fontWeight: 600, textDecoration: 'none', transition: 'color 0.15s' }}>Admin ↗</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
