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
              { icon: '🎓', title: 'Teach What You Know', desc: 'Share real industry experience — not just textbook content.' },
              { icon: '🏠', title: 'Flexible Delivery', desc: 'Part-time, weekend, and project-based trainer engagements available.' },
              { icon: '💰', title: 'Competitive Pay',    desc: 'Per-session and retainer models. Negotiable for senior experts.' },
              { icon: '🌐', title: 'Pan-India Network',  desc: 'Train at 1000+ colleges from Chennai to Hyderabad.' },
            ].map(b => (
              <div key={b.title} className="card card-dark" style={{ textAlign: 'center', padding: '28px 20px' }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>{b.icon}</div>
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
          <div className="section-header">
            <p className="section-eyebrow">Open Positions</p>
            <h2 className="t-h1 c-heading">Current Openings</h2>
          </div>

          {jobs.length === 0 ? (
            <div style={{ padding: '40px 0' }}>
              <div className="card card-light" style={{ textAlign: 'center', padding: '48px 32px' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>👷</div>
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
                        {job.location      && <span className="badge badge-light">📍 {job.location}</span>}
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
