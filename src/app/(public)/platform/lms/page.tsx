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
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>
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
              { icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>, title: 'Video Lessons', desc: 'High-quality, chapter-structured video content by industry trainers.' },
              { icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>, title: 'Module Quizzes', desc: 'End-of-module assessments to test and reinforce concepts.' },
              { icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>, title: 'Progress Tracking', desc: 'Live progress dashboard for students and college coordinators.' },
              { icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>, title: 'Certificates', desc: 'Auto-generated completion certificates for every track.' },
            ].map(f => (
              <div key={f.title} className="card card-dark" style={{ textAlign: 'center', padding: '28px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>{f.icon}</div>
                <p className="t-card c-white" style={{ marginBottom: 8 }}>{f.title}</p>
                <p className="t-sm c-muted">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center" style={{ marginTop: 48 }}>
            <div className="card card-dark" style={{ maxWidth: 480, margin: '0 auto', padding: '36px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><svg width="56" height="56" viewBox="0 0 24 24" fill="currentColor"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg></div>
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
