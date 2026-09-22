import type { Metadata } from 'next'
import Link from 'next/link'
import { listInstitutions } from '@/modules/institutions/institutions.service'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'Partner Institutions — SODAK Technology',
  description: 'SODAK Technology partners with 500+ colleges across Tamil Nadu for on-campus placement training.',
}

export default async function InstitutionsPage() {
  const { data: institutions } = await listInstitutions({ perPage: 60 }).catch(() => ({ data: [] }))

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 18 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">Institutions</span>
          </div>
          <h1 className="t-page c-white" style={{ marginBottom: 12 }}>Partner Institutions</h1>
          <p className="t-lg c-muted" style={{ maxWidth: 540 }}>
            We deliver on-campus placement training at 500+ engineering and arts colleges across Tamil Nadu and beyond.
          </p>
        </div>
      </div>

      <section className="s-dark">
        <div className="container">
          {institutions.length === 0 ? (
            <div className="text-center" style={{ padding: '60px 0' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🏫</div>
              <h2 className="t-h2 c-white" style={{ marginBottom: 10 }}>Institutions coming soon</h2>
              <p className="t-body c-muted">Our partner directory is being published. Check back shortly.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {institutions.map((inst: { id: string; slug: string; name: string; city?: string | null; state?: string | null; institutionType?: string | null }) => (
                <Link key={inst.id} href={`/institutions/${inst.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="card card-dark" style={{ padding: '20px 24px' }}>
                    <p className="t-card c-white" style={{ marginBottom: 6 }}>{inst.name}</p>
                    {(inst.city || inst.state) && (
                      <p className="t-sm c-muted">{[inst.city, inst.state].filter(Boolean).join(', ')}</p>
                    )}
                    {inst.institutionType && (
                      <span className="badge badge-dark" style={{ marginTop: 8 }}>{inst.institutionType.replace('_', ' ')}</span>
                    )}
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
            <h2>Is Your College Not Listed?</h2>
            <p>Reach out to become a SODAK partner institution — onboarding is free.</p>
          </div>
          <Link href="/contact" className="btn-cta">Partner With Us →</Link>
        </div>
      </div>
    </>
  )
}
