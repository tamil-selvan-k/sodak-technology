import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getJobBySlug } from '@/modules/careers/careers.service'

export const revalidate = 60

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const job = await getJobBySlug(params.slug)
  return { title: job?.title ?? 'Job Opening', description: job?.title ?? '' }
}

export default async function CareerDetailPage({ params }: Props) {
  const job = await getJobBySlug(params.slug)
  if (!job) notFound()

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 18 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <Link href="/careers"><span>Careers</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">{job.title}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {job.department     && <span className="badge badge-gold">{job.department}</span>}
            {job.location       && <span className="badge badge-dark">📍 {job.location}</span>}
            {job.employmentType && <span className="badge badge-green">{job.employmentType}</span>}
          </div>
          <h1 className="t-h1 c-white" style={{ marginBottom: 10 }}>{job.title}</h1>
          {job.department && <p className="t-lg c-muted" style={{ maxWidth: 600 }}>{job.department} — {job.location ?? 'Chennai'}</p>}
        </div>
      </div>

      <section className="s-dark">
        <div className="container">
          <div className="two-col" style={{ alignItems: 'start' }}>
            <div>
              {job.descriptionHtml ? (
                <div className="prose" style={{ color: '#94a3b8' }} dangerouslySetInnerHTML={{ __html: job.descriptionHtml }} />
              ) : (
                <p className="t-body c-muted">Full job description coming soon. Contact us for details.</p>
              )}
            </div>

            <div style={{ position: 'sticky', top: 80 }}>
              <div className="card card-dark">
                <p className="section-eyebrow" style={{ marginBottom: 14 }}>Apply for This Role</p>
                <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label c-muted" htmlFor="app-name">Full Name *</label>
                    <input id="app-name" name="name" type="text" required className="form-input" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label c-muted" htmlFor="app-email">Email *</label>
                    <input id="app-email" name="email" type="email" required className="form-input" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label c-muted" htmlFor="app-phone">Phone</label>
                    <input id="app-phone" name="phone" type="tel" className="form-input" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label c-muted" htmlFor="app-note">Cover Note</label>
                    <textarea id="app-note" name="coverNote" className="form-input form-textarea" rows={3} style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }} />
                  </div>
                  <Link href="/contact" className="btn btn-gold btn-full">Submit Application →</Link>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="cta-gold">
        <div className="container">
          <div>
            <h2>More Questions?</h2>
            <p>Talk to our team before applying — we&apos;re happy to explain the role in detail.</p>
          </div>
          <Link href="/contact" className="btn-cta">Contact Us →</Link>
        </div>
      </div>
    </>
  )
}
