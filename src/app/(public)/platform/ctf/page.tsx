import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SODAK CTF — Cybersecurity Platform',
  description: 'Capture-the-Flag competitions designed for campus students preparing for cybersecurity roles.',
}

export default function CTFPage() {
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 18 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <Link href="/platform"><span>Platform</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">CTF</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>
            <span className="badge badge-red badge-lg">Cybersecurity Platform</span>
          </div>
          <h1 className="t-page c-white" style={{ marginBottom: 12 }}>SODAK CTF</h1>
          <p className="t-lg c-muted" style={{ maxWidth: 560 }}>
            Gamified Capture-the-Flag challenges designed for students who want to break into cybersecurity roles at top MNCs.
          </p>
        </div>
      </div>

      <section className="s-dark">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {[
              { icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"/></svg>, title: '20+ Challenge Categories', desc: 'Web, crypto, forensics, reverse engineering, and more.' },
              { icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>, title: 'Live Competitions', desc: 'Weekly timed CTF competitions with leaderboards.' },
              { icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>, title: 'Learning Paths', desc: 'Guided challenge progressions for absolute beginners.' },
              { icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>, title: 'Certificates', desc: 'Shareable certificates of completion for each track.' },
            ].map(f => (
              <div key={f.title} className="card card-dark" style={{ textAlign: 'center', padding: '28px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>{f.icon}</div>
                <p className="t-card c-white" style={{ marginBottom: 8 }}>{f.title}</p>
                <p className="t-sm c-muted">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center" style={{ marginTop: 48 }}>
            <div className="card card-dark" style={{ maxWidth: 480, margin: '0 auto', padding: '36px 32px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><svg width="56" height="56" viewBox="0 0 24 24" fill="currentColor"><path d="M9.19 6.35c-2.04 2.29-3.44 5.58-3.57 5.89L2 10l4-4 3.19.35zm5.46 12.1c-.31.13-3.58 1.54-5.89 3.57L8.4 18l4-4 2.25 4.45zM11.42 17L7 12.58C8.38 9.4 10.31 7.19 12 5.65c3.19-2.9 6.4-3.46 7.46-3.62.28 2.54.56 7.11-3.58 11.25L11.42 17zm4.65-4.65c.74-.74.74-1.94 0-2.68-.74-.74-1.94-.74-2.68 0-.74.74-.74 1.94 0 2.68.74.73 1.94.73 2.68 0z"/></svg></div>
              <h2 className="t-h2 c-white" style={{ marginBottom: 10 }}>Platform Launching Soon</h2>
              <p className="t-body c-muted" style={{ marginBottom: 24 }}>
                SODAK CTF is currently in private beta. Get early access by registering your interest.
              </p>
              <Link href="/contact" className="btn btn-gold btn-lg">Get Early Access →</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="cta-gold">
        <div className="container">
          <div>
            <h2>Bring CTF Training to Your Campus</h2>
            <p>Our cybersecurity track includes hands-on CTF workshops delivered on-site.</p>
          </div>
          <Link href="/programs" className="btn-cta">View Cyber Program →</Link>
        </div>
      </div>
    </>
  )
}
