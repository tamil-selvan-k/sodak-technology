import type { Metadata } from 'next'
import Link from 'next/link'
import { listJobs } from '@/modules/careers/careers.service'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'Careers — SODAK Technology',
  description: 'Join the SODAK team — open positions in training, technology, and business development.',
}

export default async function CareersPage() {
  const { data: jobs } = await listJobs({ perPage: 30 }).catch(() => ({ data: [] }))

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 18 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">Careers</span>
          </div>
          <h1 className="t-page c-white" style={{ marginBottom: 12 }}>Work at SODAK Technology</h1>
          <p className="t-lg c-muted" style={{ maxWidth: 540 }}>
            Join a team of engineers who are passionate about giving students the placement training they deserve.
          </p>
        </div>
      </div>

      {/* Why join */}
      <section className="s-dark">
        <div className="container">
          <div className="section-header text-center">
            <p className="section-eyebrow">Why SODAK</p>
            <h2 className="t-h1 c-white">Why Engineers Choose Us</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, marginTop: 40 }}>
            {[
              { icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>, title: 'Teach What You Know', desc: 'Share real industry experience — not just textbook content.' },
              { icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>, title: 'Flexible Delivery', desc: 'Part-time, weekend, and project-based trainer engagements available.' },
              { icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>, title: 'Competitive Pay',    desc: 'Per-session and retainer models. Negotiable for senior experts.' },
              { icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>, title: 'Pan-India Network',  desc: 'Train at 1000+ colleges from Chennai to Hyderabad.' },
            ].map(b => (
              <div key={b.title} className="card card-dark" style={{ textAlign: 'center', padding: '28px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>{b.icon}</div>
                <p className="t-card c-white" style={{ marginBottom: 8 }}>{b.title}</p>
                <p className="t-sm c-muted">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open positions */}
      <section className="s-light">
        <div className="container">
          <div className="section-header text-center">
            <p className="section-eyebrow">Open Positions</p>
            <h2 className="t-h1 c-heading">Current Openings</h2>
          </div>

          {jobs.length === 0 ? (
            <div style={{ padding: '40px 0' }}>
              <div className="card card-light" style={{ textAlign: 'center', padding: '48px 32px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M12 14c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z"/></svg></div>
                <h2 className="t-h3 c-heading" style={{ marginBottom: 10 }}>No open positions right now</h2>
                <p className="t-body c-body" style={{ marginBottom: 20 }}>
                  We hire on a rolling basis. Express your interest and we&apos;ll reach out when a match opens up.
                </p>
                <Link href="/contact" className="btn btn-ghost">Express Interest →</Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 32 }}>
              {jobs.map((job: { id: string; slug: string; title: string; department?: string | null; location?: string | null; employmentType?: string | null }) => (
                <Link key={job.id} href={`/careers/${job.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="card card-light" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, padding: '20px 24px', flexWrap: 'wrap' }}>
                    <div>
                      <p className="t-card c-heading" style={{ marginBottom: 6 }}>{job.title}</p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {job.department    && <span className="badge badge-light">{job.department}</span>}
                        {job.location      && <span className="badge badge-light">{job.location}</span>}
                        {job.employmentType && <span className="badge badge-green">{job.employmentType}</span>}
                      </div>
                    </div>
                    <span className="btn btn-ghost btn-sm">View Details →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="cta-gold">
        <div className="container">
          <div>
            <h2>Don&apos;t See Your Role?</h2>
            <p>We&apos;re always looking for passionate trainers and technologists. Reach out.</p>
          </div>
          <Link href="/contact" className="btn-cta">Get in Touch →</Link>
        </div>
      </div>
    </>
  )
}
