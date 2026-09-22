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
            <span style={{ fontSize: 48, lineHeight: 1 }}>🚩</span>
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
              { icon: '🧩', title: '20+ Challenge Categories', desc: 'Web, crypto, forensics, reverse engineering, and more.' },
              { icon: '🏆', title: 'Live Competitions', desc: 'Weekly timed CTF competitions with leaderboards.' },
              { icon: '🎓', title: 'Learning Paths', desc: 'Guided challenge progressions for absolute beginners.' },
              { icon: '📜', title: 'Certificates', desc: 'Shareable certificates of completion for each track.' },
            ].map(f => (
              <div key={f.title} className="card card-dark" style={{ textAlign: 'center', padding: '28px 20px' }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
                <p className="t-card c-white" style={{ marginBottom: 8 }}>{f.title}</p>
                <p className="t-sm c-muted">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center" style={{ marginTop: 48 }}>
            <div className="card card-dark" style={{ maxWidth: 480, margin: '0 auto', padding: '36px 32px', textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🚀</div>
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
