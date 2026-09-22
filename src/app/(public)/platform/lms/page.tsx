import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SODAK LMS — Learning Management System',
  description: 'Structured learning paths with video lessons and progress tracking for campus placement training.',
}

export default function LMSPage() {
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 18 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <Link href="/platform"><span>Platform</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">LMS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <span style={{ fontSize: 48, lineHeight: 1 }}>📚</span>
            <span className="badge badge-blue badge-lg">Learning Platform</span>
          </div>
          <h1 className="t-page c-white" style={{ marginBottom: 12 }}>SODAK LMS</h1>
          <p className="t-lg c-muted" style={{ maxWidth: 560 }}>
            Structured learning paths with video lessons, quizzes, and progress tracking — built around campus placement training programs.
          </p>
        </div>
      </div>

      <section className="s-dark">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {[
              { icon: '🎥', title: 'Video Lessons', desc: 'High-quality, chapter-structured video content by industry trainers.' },
              { icon: '📝', title: 'Module Quizzes', desc: 'End-of-module assessments to test and reinforce concepts.' },
              { icon: '📈', title: 'Progress Tracking', desc: 'Live progress dashboard for students and college coordinators.' },
              { icon: '🏅', title: 'Certificates', desc: 'Auto-generated completion certificates for every track.' },
            ].map(f => (
              <div key={f.title} className="card card-dark" style={{ textAlign: 'center', padding: '28px 20px' }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
                <p className="t-card c-white" style={{ marginBottom: 8 }}>{f.title}</p>
                <p className="t-sm c-muted">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center" style={{ marginTop: 48 }}>
            <div className="card card-dark" style={{ maxWidth: 480, margin: '0 auto', padding: '36px 32px' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🔧</div>
              <h2 className="t-h2 c-white" style={{ marginBottom: 10 }}>LMS in Development</h2>
              <p className="t-body c-muted" style={{ marginBottom: 24 }}>
                SODAK LMS is being built alongside our campus programs. Register interest for early access.
              </p>
              <Link href="/contact" className="btn btn-gold btn-lg">Register Interest →</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="cta-gold">
        <div className="container">
          <div>
            <h2>Complement Classroom Training With the LMS</h2>
            <p>LMS access is bundled with all campus training programs at no extra cost.</p>
          </div>
          <Link href="/programs" className="btn-cta">See Our Programs →</Link>
        </div>
      </div>
    </>
  )
}
