import { auth } from '@/lib/auth'
import { listPhotos } from '@/modules/gallery/gallery.service'
import { listInstitutions } from '@/modules/institutions/institutions.service'
import GalleryManager from './_components/GalleryManager'

export const metadata = { title: 'Gallery — SODAK Admin' }

interface Props { searchParams: { institution?: string; page?: string } }

export default async function AdminGalleryPage({ searchParams }: Props) {
  await auth()
  const [{ data: photos, pagination }, { data: institutions }] = await Promise.all([
    listPhotos({ institutionId: searchParams.institution, page: searchParams.page ? Number(searchParams.page) : 1, includeUnpublished: true }),
    listInstitutions({}),
  ])

  // Serialize dates for client components
  const serializedPhotos = photos.map(p => ({
    id: p.id,
    url: p.url,
    altText: p.altText,
    caption: p.caption,
    title: p.title,
    tags: p.tags,
    hasStudentFaces: p.hasStudentFaces,
    studentConsentRef: p.studentConsentRef,
    isPublished: p.isPublished,
    createdAt: p.createdAt.toISOString(),
  }))

  const totalPublished = photos.filter(p => p.isPublished).length
  const noAlt = photos.filter(p => !p.altText).length
  const consentRequired = photos.filter(p => p.hasStudentFaces && !p.studentConsentRef).length

  return (
    <main className="flex-1 min-w-0" style={{ padding: '32px 40px', maxWidth: 'calc(100vw - 220px)', minHeight: '100vh', background: 'linear-gradient(160deg, #0a1628 0%, #0c2040 100%)' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c8a035', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-instrument-sans)' }}>Gallery Management</h1>
        <p style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>Upload, tag and publish training session photos</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Photos',     value: pagination.total },
          { label: 'Published',        value: totalPublished },
          { label: 'Missing Alt Text', value: noAlt },
          { label: 'Consent Required', value: consentRequired },
        ].map(c => (
          <div key={c.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{c.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#e2e8f0' }}>{c.value}</div>
          </div>
        ))}
      </div>

      <GalleryManager
        photos={serializedPhotos}
        institutions={institutions.map(i => ({ id: i.id, name: i.name }))}
        total={pagination.total}
        page={pagination.page}
        pages={pagination.pages}
        institutionFilter={searchParams.institution}
      />

      <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 8, fontSize: 12, color: '#fbbf24' }}>
        <strong>Note:</strong> Photos with student faces require a consent reference before publishing.
        Photos without alt text cannot be published (accessibility requirement).
      </div>
    </main>
  )
}
