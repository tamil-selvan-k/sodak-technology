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
                icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>,
                title: 'Corporate Upskilling',
                desc: 'Custom training programs for teams at technology companies. Topics range from cloud-native development to cybersecurity.',
                features: ['Customised for your tech stack', 'On-site or hybrid delivery', 'Post-training assessment reports'],
              },
              {
                icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>,
                title: 'Faculty Development Programs',
                desc: 'Structured FDPs for engineering faculty to stay current with industry tools and placement interview patterns.',
                features: ['AICTE-aligned content', 'Certificate of completion', 'Hands-on lab sessions'],
              },
              {
                icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>,
                title: 'Placement Drive Support',
                desc: 'End-to-end support for conducting campus placement drives — aptitude tests, technical rounds, and HR preparation.',
                features: ['Pre-drive student bootcamp', 'Mock interview panels', 'Drive coordination support'],
              },
            ].map(p => (
              <div key={p.title} className="card card-dark">
                <div style={{ marginBottom: 14 }}>{p.icon}</div>
                <h2 className="t-h3 c-white" style={{ marginBottom: 10 }}>{p.title}</h2>
                <p className="t-body c-muted" style={{ marginBottom: 16 }}>{p.desc}</p>
                {p.features.map(f => (
                  <p key={f} className="t-sm c-muted" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>{f}</p>
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
