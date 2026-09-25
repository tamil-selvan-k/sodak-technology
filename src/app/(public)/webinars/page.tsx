import type { Metadata } from 'next'
import Link from 'next/link'
import { listWebinars } from '@/modules/webinars/webinars.service'
import type { WebinarWithPresenter } from '@/modules/webinars/webinars.types'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'Webinars — SODAK Technology',
  description: 'Free live and recorded webinars on placement preparation, technical interviews, and career growth.',
}

export default async function WebinarsPage() {
  const { data: webinars } = await listWebinars({ perPage: 30 }).catch(() => ({ data: [] as WebinarWithPresenter[] }))

  const upcoming = webinars.filter(w => w.scheduledAt && new Date(w.scheduledAt) > new Date())
  const past     = webinars.filter(w => !w.scheduledAt || new Date(w.scheduledAt) <= new Date())

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 18 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">Webinars</span>
          </div>
          <h1 className="t-page c-white" style={{ marginBottom: 12 }}>Free Webinars</h1>
          <p className="t-lg c-muted" style={{ maxWidth: 540 }}>
            Live and recorded sessions on placement prep, technical interviews, and career growth — by working engineers.
          </p>
        </div>
      </div>

      <section className="s-dark">
        <div className="container">
          {webinars.length === 0 ? (
            <div className="text-center" style={{ padding: '60px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5c-3.87 0-7 3.13-7 7h2c0-2.76 2.24-5 5-5s5 2.24 5 5h2c0-3.87-3.13-7-7-7zm1 9.464V12h-2v2.768c-.596.347-1 .984-1 1.732 0 1.1.9 2 2 2s2-.9 2-2c0-.748-.404-1.385-1-1.732zM12 1C5.925 1 1 5.925 1 12h2C3 7.029 7.029 3 12 3s9 4.029 9 9h2c0-6.075-4.925-11-11-11z"/></svg></div>
              <h2 className="t-h2 c-white" style={{ marginBottom: 10 }}>Webinars coming soon</h2>
              <p className="t-body c-muted">Upcoming sessions will be announced here. Follow us on social media to stay updated.</p>
            </div>
          ) : (
            <>
              {upcoming.length > 0 && (
                <div style={{ marginBottom: 48 }}>
                  <p className="section-eyebrow" style={{ marginBottom: 16 }}>Upcoming</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                    {upcoming.map(w => (
                      <div key={w.id} className="card card-dark">
                        <span className="badge badge-green" style={{ marginBottom: 12 }}>Upcoming</span>
                        <p className="t-card c-white" style={{ marginBottom: 8 }}>{w.title}</p>
                        {w.description && <p className="t-sm c-muted" style={{ marginBottom: 12 }}>{w.description}</p>}
                        {w.scheduledAt && (
                          <p className="t-sm c-muted">
                            {new Date(w.scheduledAt).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                        {w.presenter && <p className="t-micro c-muted" style={{ marginTop: 4 }}>Hosted by {w.presenter.name}</p>}
                        <Link href="/contact" className="btn btn-gold btn-full" style={{ marginTop: 16 }}>Register Free →</Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {past.length > 0 && (
                <div>
                  <p className="section-eyebrow" style={{ marginBottom: 16 }}>Recordings</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                    {past.map(w => (
                      <div key={w.id} className="card card-dark">
                        <span className="badge badge-dark" style={{ marginBottom: 12 }}>Recording</span>
                        <p className="t-card c-white" style={{ marginBottom: 8 }}>{w.title}</p>
                        {w.description && <p className="t-sm c-muted">{w.description}</p>}
                        {w.presenter && <p className="t-micro c-muted" style={{ marginTop: 8 }}>By {w.presenter.name}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <div className="cta-gold">
        <div className="container">
          <div>
            <h2>Want Us to Host a Webinar for Your Students?</h2>
            <p>We can run exclusive live sessions for your college — free of charge.</p>
          </div>
          <Link href="/contact" className="btn-cta">Request a Webinar →</Link>
        </div>
      </div>
    </>
  )
}
