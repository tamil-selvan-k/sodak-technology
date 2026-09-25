import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Assessment Engine — SODAK Technology',
  description: 'AI-proctored aptitude and coding tests mirroring company placement drive formats.',
}

export default function AssessmentsPage() {
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 18 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <Link href="/platform"><span>Platform</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">Assessments</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
            <span className="badge badge-gold badge-lg">Assessment Platform</span>
          </div>
          <h1 className="t-page c-white" style={{ marginBottom: 12 }}>Assessment Engine</h1>
          <p className="t-lg c-muted" style={{ maxWidth: 560 }}>
            AI-proctored aptitude, verbal, and coding tests mirroring the exact format of TCS, Infosys, Wipro, and other MNC campus drives.
          </p>
        </div>
      </div>

      <section className="s-dark">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
            {[
              { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7 9h10v6H7V9zm3 4h2v2h-2v-2zm4 0h2v2h-2v-2z"/></svg>, title: 'AI Proctoring',       desc: 'Webcam and browser-focus monitoring for exam integrity.' },
              { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm0-4H7v-2h5v2zm0-4H7V7h5v2zm5 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/></svg>, title: 'MNC Question Banks',   desc: 'Curated aptitude questions modelled on TCS, Infosys, Wipro patterns.' },
              { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>, title: 'Coding Challenges',    desc: 'Timed coding problems with auto-grading across 10+ languages.' },
              { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>, title: 'Score Analytics',      desc: 'Per-student and per-batch score breakdowns with recommendations.' },
              { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>, title: 'Real-time Testing',   desc: 'Simulate actual placement drive conditions with countdown timers.' },
              { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>, title: 'Score Reports',        desc: 'Downloadable PDF reports for students and college coordinators.' },
            ].map(f => (
              <div key={f.title} className="card card-dark" style={{ padding: '24px 20px' }}>
                <div style={{ marginBottom: 12 }}>{f.icon}</div>
                <p className="t-card c-white" style={{ marginBottom: 8 }}>{f.title}</p>
                <p className="t-sm c-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="cta-gold">
        <div className="container">
          <div>
            <h2>Run Placement Mock Tests at Your Campus</h2>
            <p>Our assessment engine is available to all partner colleges — no per-student fee.</p>
          </div>
          <Link href="/contact" className="btn-cta">Set Up Assessments →</Link>
        </div>
      </div>
    </>
  )
}
