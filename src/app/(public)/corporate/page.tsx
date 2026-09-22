import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Corporate Training — SODAK Technology',
  description: 'Corporate upskilling and Faculty Development Programs (FDP) by SODAK Technology.',
}

export default function CorporatePage() {
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 18 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">Corporate</span>
          </div>
          <h1 className="t-page c-white" style={{ marginBottom: 12 }}>Corporate & FDP Training</h1>
          <p className="t-lg c-muted" style={{ maxWidth: 560 }}>
            Upskilling programs for working professionals and Faculty Development Programs for engineering college faculty.
          </p>
        </div>
      </div>

      <section className="s-dark">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {[
              {
                icon: '🏢',
                title: 'Corporate Upskilling',
                desc: 'Custom training programs for teams at technology companies. Topics range from cloud-native development to cybersecurity.',
                features: ['Customised for your tech stack', 'On-site or hybrid delivery', 'Post-training assessment reports'],
              },
              {
                icon: '🎓',
                title: 'Faculty Development Programs',
                desc: 'Structured FDPs for engineering faculty to stay current with industry tools and placement interview patterns.',
                features: ['AICTE-aligned content', 'Certificate of completion', 'Hands-on lab sessions'],
              },
              {
                icon: '🤝',
                title: 'Placement Drive Support',
                desc: 'End-to-end support for conducting campus placement drives — aptitude tests, technical rounds, and HR preparation.',
                features: ['Pre-drive student bootcamp', 'Mock interview panels', 'Drive coordination support'],
              },
            ].map(p => (
              <div key={p.title} className="card card-dark">
                <div style={{ fontSize: 40, marginBottom: 14 }}>{p.icon}</div>
                <h2 className="t-h3 c-white" style={{ marginBottom: 10 }}>{p.title}</h2>
                <p className="t-body c-muted" style={{ marginBottom: 16 }}>{p.desc}</p>
                {p.features.map(f => (
                  <p key={f} className="t-sm c-muted" style={{ marginBottom: 6 }}>✓ {f}</p>
                ))}
                <Link href="/contact" className="btn btn-gold btn-full" style={{ marginTop: 20 }}>Enquire →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="cta-gold">
        <div className="container">
          <div>
            <h2>Talk to Our Corporate Team</h2>
            <p>We design programs around your organisation&apos;s specific skills gap — no generic syllabi.</p>
          </div>
          <Link href="/contact" className="btn-cta">Start the Conversation →</Link>
        </div>
      </div>
    </>
  )
}
