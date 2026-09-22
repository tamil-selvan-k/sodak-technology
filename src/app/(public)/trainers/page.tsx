import Link from 'next/link'
import { listTrainers } from '@/modules/trainers/trainers.service'

export const revalidate = 60

const TRUST = ['TCS','Infosys','Wipro','HCL','Cognizant','Accenture','IBM','Capgemini','Zoho','Freshworks']

export default async function TrainersPage() {
  const { data: trainers } = await listTrainers({ isMentor: false, perPage: 50 }).catch(() => ({ data: [] }))

  return (
    <>
      {/* Page hero */}
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 18 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">Trainers</span>
          </div>
          <h1 className="t-page c-white" style={{ marginBottom: 12 }}>Our Expert Trainers</h1>
          <p className="t-lg c-muted" style={{ maxWidth: 540 }}>
            Every trainer at SODAK Technology is a working engineer from a top MNC — teaching what they practice day to day.
          </p>
        </div>
      </div>

      {/* Trust bar */}
      <section className="s-darker" style={{ padding: '20px 0' }}>
        <div className="marquee-wrap">
          <div className="marquee-track">
            {[...TRUST, ...TRUST].map((name, i) => (
              <div key={i} className="marquee-item">{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Trainer grid */}
      <section className="s-dark">
        <div className="container">
          {trainers.length === 0 ? (
            <div className="text-center" style={{ padding: '60px 0' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>👨‍🏫</div>
              <h2 className="t-h2 c-white" style={{ marginBottom: 10 }}>Trainers coming soon</h2>
              <p className="t-body c-muted">Our roster is being finalised. Check back shortly.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {trainers.map(t => (
                <Link key={t.id} href={`/trainers/${t.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="card card-dark" style={{ padding: '28px 20px', textAlign: 'center', height: '100%' }}>
                    <div className="avatar avatar-lg" style={{ margin: '0 auto 14px', background: 'rgba(0,160,255,0.15)', fontSize: 26 }}>
                      {t.name.charAt(0)}
                    </div>
                    <p className="t-card c-white" style={{ marginBottom: 4 }}>{t.name}</p>
                    <p className="t-sm c-muted">{t.designation}</p>
                    {t.currentCompany && (
                      <p className="t-micro" style={{ color: '#00a0ff', marginTop: 6 }}>{t.currentCompany}</p>
                    )}
                    {t.yearsExperience && (
                      <p className="t-micro c-muted" style={{ marginTop: 4 }}>{t.yearsExperience}+ years exp</p>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center', marginTop: 12 }}>
                      {(t.expertiseTags ?? []).slice(0, 3).map((tag: string) => (
                        <span key={tag} className="badge badge-dark">{tag}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <div className="cta-gold">
        <div className="container">
          <div>
            <h2>Bring Our Trainers to Your Campus</h2>
            <p>We deliver training on-site — no student travel, no logistics hassle.</p>
          </div>
          <Link href="/contact" className="btn-cta">Book a Trainer →</Link>
        </div>
      </div>
    </>
  )
}
