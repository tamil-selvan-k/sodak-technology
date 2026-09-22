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
            <span style={{ fontSize: 48, lineHeight: 1 }}>📊</span>
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
              { icon: '🤖', title: 'AI Proctoring',       desc: 'Webcam and browser-focus monitoring for exam integrity.' },
              { icon: '📐', title: 'MNC Question Banks',   desc: 'Curated aptitude questions modelled on TCS, Infosys, Wipro patterns.' },
              { icon: '💻', title: 'Coding Challenges',    desc: 'Timed coding problems with auto-grading across 10+ languages.' },
              { icon: '📈', title: 'Score Analytics',      desc: 'Per-student and per-batch score breakdowns with recommendations.' },
              { icon: '⏱',  title: 'Real-time Testing',   desc: 'Simulate actual placement drive conditions with countdown timers.' },
              { icon: '📜', title: 'Score Reports',        desc: 'Downloadable PDF reports for students and college coordinators.' },
            ].map(f => (
              <div key={f.title} className="card card-dark" style={{ padding: '24px 20px' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
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
