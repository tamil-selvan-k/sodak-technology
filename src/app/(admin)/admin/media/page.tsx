import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { parsePagination, buildMeta } from '@/lib/paginate'
import MediaLibrary from './_components/MediaLibrary'

export const metadata = { title: 'Media Library — SODAK Admin' }

interface Props { searchParams: { page?: string } }

export default async function AdminMediaPage({ searchParams }: Props) {
  await auth()
  const { skip, take, page } = parsePagination({ page: searchParams.page ? parseInt(searchParams.page, 10) : undefined })
  const [total, media] = await Promise.all([
    db.mediaFile.count({ where: { deletedAt: null } }),
    db.mediaFile.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, skip, take }),
  ])
  const pagination = buildMeta(total, page, take)

  // Serialize dates for the client component
  const files = media.map(f => ({
    ...f,
    createdAt: f.createdAt.toISOString(),
    deletedAt: f.deletedAt?.toISOString() ?? null,
  }))

  return (
    <main className="flex-1 min-w-0" style={{ padding: '32px 40px', maxWidth: 'calc(100vw - 220px)', minHeight: '100vh', background: 'linear-gradient(160deg, #0a1628 0%, #0c2040 100%)' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c8a035', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-instrument-sans)' }}>Media Library</h1>
        <p style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>Upload, organise and manage training photos &amp; documents</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Files',  value: total },
          { label: 'Images',       value: media.filter(f => f.mimeType.startsWith('image/')).length },
          { label: 'Documents',    value: media.filter(f => f.mimeType === 'application/pdf').length },
          { label: 'Videos',       value: media.filter(f => f.mimeType.startsWith('video/')).length },
        ].map(c => (
          <div key={c.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{c.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#e2e8f0' }}>{c.value}</div>
          </div>
        ))}
      </div>

      <MediaLibrary
        files={files}
        total={pagination.total}
        page={pagination.page}
        pages={pagination.pages}
      />
    </main>
  )
}
