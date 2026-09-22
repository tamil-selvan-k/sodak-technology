import type { Metadata } from 'next'
import Link from 'next/link'
import { listPhotos } from '@/modules/gallery/gallery.service'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'Gallery — SODAK Technology',
  description: 'Photos from SODAK campus training sessions, workshops, and placement drives.',
}

export default async function GalleryPage() {
  const { data: photos } = await listPhotos({ perPage: 60 }).catch(() => ({ data: [] }))

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 18 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">Gallery</span>
          </div>
          <h1 className="t-page c-white" style={{ marginBottom: 12 }}>Gallery</h1>
          <p className="t-lg c-muted" style={{ maxWidth: 500 }}>
            Behind the scenes of SODAK campus training sessions, workshops, and placement drives.
          </p>
        </div>
      </div>

      <section className="s-dark">
        <div className="container">
          {photos.length === 0 ? (
            <div className="text-center" style={{ padding: '60px 0' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📷</div>
              <h2 className="t-h2 c-white" style={{ marginBottom: 10 }}>Photos coming soon</h2>
              <p className="t-body c-muted">Our gallery is being curated. Follow us on social media for the latest.</p>
            </div>
          ) : (
            <div style={{ columns: '3 300px', gap: 12 }}>
              {photos.map((photo) => (
                <div key={photo.id} style={{ breakInside: 'avoid', marginBottom: 12 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.altText ?? ''}
                    loading="lazy"
                    style={{ width: '100%', borderRadius: 12, display: 'block' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="cta-gold">
        <div className="container">
          <div>
            <h2>Want to See a Session in Action?</h2>
            <p>Book a campus visit — we&apos;ll show you exactly how a SODAK training day runs.</p>
          </div>
          <Link href="/contact" className="btn-cta">Book a Visit →</Link>
        </div>
      </div>
    </>
  )
}
