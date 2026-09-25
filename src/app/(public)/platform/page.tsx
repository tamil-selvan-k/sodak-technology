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
                icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>,
                title: 'SODAK LMS',
                desc: 'A structured learning management system with video lessons, module quizzes, and progress tracking for every student in the program.',
                href: '/platform/lms',
                features: ['Video + text lessons', 'Progress tracking', 'Completion certificates'],
              },
              {
                icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>,
                title: 'SODAK CTF',
                desc: 'Capture-the-Flag competitions to build practical cybersecurity skills. Designed for students preparing for security-focused MNC roles.',
                href: '/platform/ctf',
                features: ['20+ challenge categories', 'Weekly live competitions', 'Leaderboard & certificates'],
              },
              {
                icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>,
                title: 'Assessment Engine',
                desc: 'AI-proctored aptitude and coding tests that mirror the actual format of campus placement drives at top MNCs.',
                href: '/platform/assessments',
                features: ['AI-proctored exams', 'MNC-format question banks', 'Detailed score analytics'],
              },
            ].map(p => (
              <div key={p.title} className="card card-dark" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: 16 }}>{p.icon}</div>
                <h2 className="t-h2 c-white" style={{ marginBottom: 10 }}>{p.title}</h2>
                <p className="t-body c-muted" style={{ marginBottom: 20, flex: 1 }}>{p.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {p.features.map(f => (
                    <p key={f} className="t-sm c-muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>{f}</p>
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
