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
    <main className="flex-1 min-w-0" style={{ padding: '32px 40px', maxWidth: 'calc(100vw - 220px)' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Gallery Management</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Upload, tag and publish training session photos</p>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Photos',     value: pagination.total },
          { label: 'Published',        value: totalPublished },
          { label: 'Missing Alt Text', value: noAlt },
          { label: 'Consent Required', value: consentRequired },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '20px 24px' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{c.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>{c.value}</div>
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

      <div style={{ marginTop: 16, padding: '12px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, fontSize: 12, color: '#78350f' }}>
        <strong>Note:</strong> Photos with student faces require a consent reference before publishing.
        Photos without alt text cannot be published (accessibility requirement).
      </div>
    </main>
  )
}
