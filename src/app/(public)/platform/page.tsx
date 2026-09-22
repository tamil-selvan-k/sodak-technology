import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Platform — SODAK Technology',
  description: 'SODAK Technology\'s suite of placement tools: CTF, LMS, and Assessment Engine.',
}

export default function PlatformPage() {
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 18 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">Platform</span>
          </div>
          <h1 className="t-page c-white" style={{ marginBottom: 12 }}>The SODAK Platform</h1>
          <p className="t-lg c-muted" style={{ maxWidth: 560 }}>
            Three tools designed to help campus students practice, assess, and prove their skills before they walk into an interview.
          </p>
        </div>
      </div>

      <section className="s-dark">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {[
              {
                icon: '📚',
                title: 'SODAK LMS',
                desc: 'A structured learning management system with video lessons, module quizzes, and progress tracking for every student in the program.',
                href: '/platform/lms',
                features: ['Video + text lessons', 'Progress tracking', 'Completion certificates'],
              },
              {
                icon: '🚩',
                title: 'SODAK CTF',
                desc: 'Capture-the-Flag competitions to build practical cybersecurity skills. Designed for students preparing for security-focused MNC roles.',
                href: '/platform/ctf',
                features: ['20+ challenge categories', 'Weekly live competitions', 'Leaderboard & certificates'],
              },
              {
                icon: '📊',
                title: 'Assessment Engine',
                desc: 'AI-proctored aptitude and coding tests that mirror the actual format of campus placement drives at top MNCs.',
                href: '/platform/assessments',
                features: ['AI-proctored exams', 'MNC-format question banks', 'Detailed score analytics'],
              },
            ].map(p => (
              <div key={p.title} className="card card-dark" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>{p.icon}</div>
                <h2 className="t-h2 c-white" style={{ marginBottom: 10 }}>{p.title}</h2>
                <p className="t-body c-muted" style={{ marginBottom: 20, flex: 1 }}>{p.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {p.features.map(f => (
                    <p key={f} className="t-sm c-muted">✓ {f}</p>
                  ))}
                </div>
                <Link href={p.href} className="btn btn-gold">Learn More →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="cta-gold">
        <div className="container">
          <div>
            <h2>Want Platform Access for Your Campus?</h2>
            <p>All platform tools are included with any SODAK campus training program.</p>
          </div>
          <Link href="/contact" className="btn-cta">Book a Demo →</Link>
        </div>
      </div>
    </>
  )
}
