import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getInstitutionBySlug } from '@/modules/institutions/institutions.service'
import { listPhotos } from '@/modules/gallery/gallery.service'

export const revalidate = 60

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const inst = await getInstitutionBySlug(params.slug)
  return { title: inst?.name ?? 'Institution', description: inst?.shortDescription ?? '' }
}

export default async function InstitutionDetailPage({ params }: Props) {
  const institution = await getInstitutionBySlug(params.slug)
  if (!institution) notFound()

  const { data: photos } = await listPhotos({ institutionId: institution.id, perPage: 12 }).catch(() => ({ data: [] }))

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 18 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <Link href="/institutions"><span>Institutions</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">{institution.name}</span>
          </div>
          <h1 className="t-h1 c-white" style={{ marginBottom: 10 }}>{institution.name}</h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {institution.city && <span className="badge badge-dark">{institution.city}{institution.state ? `, ${institution.state}` : ''}</span>}
            {institution.type && <span className="badge badge-gold">{institution.type.replace('_', ' ')}</span>}
          </div>
          {institution.shortDescription && (
            <p className="t-lg c-muted" style={{ maxWidth: 600, marginTop: 14 }}>{institution.shortDescription}</p>
          )}
        </div>
      </div>

      <section className="s-dark">
        <div className="container">
          <div className="two-col" style={{ alignItems: 'start' }}>
            <div>
              <p className="section-eyebrow">About the Institution</p>
              <p className="t-body c-muted" style={{ marginTop: 10, lineHeight: 1.8 }}>
                {institution.name} is a SODAK Technology partner institution. We have delivered campus placement training here across multiple batches.
              </p>
              {institution.affiliation && (
                <p className="t-sm c-muted" style={{ marginTop: 12 }}>Affiliated to: {institution.affiliation}</p>
              )}
            </div>

            <div>
              <div className="card card-dark">
                <p className="section-eyebrow" style={{ marginBottom: 14 }}>Institution Details</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {institution.city && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="t-sm c-muted">Location</span>
                      <span className="t-sm c-white fw-600">{[institution.city, institution.state].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                  {institution.type && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="t-sm c-muted">Type</span>
                      <span className="t-sm c-white fw-600">{institution.type.replace('_', ' ')}</span>
                    </div>
                  )}
                  {institution.website && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="t-sm c-muted">Website</span>
                      <a href={institution.website} target="_blank" rel="noopener noreferrer" className="t-sm" style={{ color: '#00a0ff' }}>Visit →</a>
                    </div>
                  )}
                </div>
                <Link href="/contact" className="btn btn-gold btn-full" style={{ marginTop: 20 }}>Book Training Here →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {photos.length > 0 && (
        <section className="s-darker">
          <div className="container">
            <p className="section-eyebrow">Photos</p>
            <h2 className="t-h2 c-white" style={{ marginBottom: 24 }}>Training at {institution.name}</h2>
            <div style={{ columns: '3 200px', gap: 12 }}>
              {photos.map((photo) => (
                <div key={photo.id} style={{ breakInside: 'avoid', marginBottom: 12 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt={photo.altText ?? ''} loading="lazy" style={{ width: '100%', borderRadius: 8 }} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="cta-gold">
        <div className="container">
          <div>
            <h2>Interested in Training at {institution.name}?</h2>
            <p>Contact us to schedule a campus training program for this institution.</p>
          </div>
          <Link href="/contact" className="btn-cta">Book a Program →</Link>
        </div>
      </div>
    </>
  )
}
