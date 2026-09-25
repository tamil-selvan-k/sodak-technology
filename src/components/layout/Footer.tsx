import Link from 'next/link'

const COLUMNS = [
  {
    title: 'Programs',
    links: [
      { label: 'All Campus Programs',   href: '/programs' },
      { label: 'Placement Prep',        href: '/programs' },
      { label: 'Cloud & DevOps',        href: '/programs' },
      { label: 'Generative AI',         href: '/programs' },
      { label: 'Cybersecurity',         href: '/programs' },
      { label: 'Corporate & FDP',       href: '/corporate' },
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
      { label: 'Platform Overview',  href: '/platform' },
      { label: 'SODAK LMS ↗',        href: '#' },
      { label: 'SODAK CTF ↗',        href: '#' },
      { label: 'Assessment Engine ↗', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About SODAK',       href: '/about' },
      { label: 'Our Trainers',      href: '/trainers' },
      { label: 'Institutions',      href: '/institutions' },
      { label: 'Blog & Insights',   href: '/insights' },
      { label: 'Careers',           href: '/careers' },
      { label: 'Gallery',           href: '/gallery' },
    ],
  },
  {
    title: 'Location',
    links: [
      { label: 'Chennai, Tamil Nadu 600 001', href: '#' },
      { label: '+91 89393 66259',             href: 'tel:+918939366259' },
      { label: 'hello@sodakedutech.in',         href: 'mailto:hello@sodakedutech.in' },
      { label: 'Chat on WhatsApp',             href: 'https://wa.me/918939366259' },
    ],
  },
]

export default function Footer() {
  return (
    <footer style={{ background: 'linear-gradient(135deg, #092848 0%, #0d4d8a 50%, #1661ae 100%)', borderTop: '1px solid rgba(0,160,255,0.15)', paddingTop: 48 }}>
      <div className="container pt-16">
        {/* Top strip */}
        <div className="flex items-start justify-between gap-8 pb-12 border-b border-white/[0.07] flex-wrap">
          <div style={{ maxWidth: 300 }}>
            <div className="flex items-center gap-1 mb-4">
              <span className="font-extrabold text-2xl text-white">SODAK</span>
              <span className="font-extrabold text-2xl text-white/50">Technology</span>
            </div>
            <p className="text-sm text-white/50 leading-7 mb-5">
              Campus training by engineers who cleared the interviews your students are preparing for.
              Placement-first. Practice-led. Industry-backed.
            </p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-right">
              <p className="text-xs text-white/40 mb-1">Ready to upskill your campus?</p>
              <p className="text-sm text-white/60">+91 89393 66259 · hello@sodakedutech.in</p>
            </div>
            <Link href="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 whitespace-nowrap" style={{ background: 'linear-gradient(99deg,#00a0ff,#3dc8ef)' }}>
              Book a Program →
            </Link>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-10">
          {COLUMNS.map(col => (
            <div key={col.title}>
              <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">{col.title}</p>
              <ul className="flex flex-col gap-2">
                {col.links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-white/45 hover:text-white/80 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.07] py-5 flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs text-white/30">© 2026 SODAK Technology Pvt. Ltd. All rights reserved.</span>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/privacy" className="text-white/35 hover:text-white/70 transition-colors">Privacy Policy</Link>
            <Link href="/terms"   className="text-white/35 hover:text-white/70 transition-colors">Terms of Service</Link>
            <Link href="/admin"   className="text-[#00a0ff]/50 hover:text-[#00a0ff]/90 transition-colors">Admin ↗</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
