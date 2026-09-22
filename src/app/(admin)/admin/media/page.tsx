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
    <main className="flex-1 min-w-0" style={{ padding: '32px 40px', maxWidth: 'calc(100vw - 220px)' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Media Gallery</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Upload, organise and manage training photos &amp; documents</p>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Files',  value: total },
          { label: 'Images',       value: media.filter(f => f.mimeType.startsWith('image/')).length },
          { label: 'Documents',    value: media.filter(f => f.mimeType === 'application/pdf').length },
          { label: 'Videos',       value: media.filter(f => f.mimeType.startsWith('video/')).length },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '20px 24px' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{c.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>{c.value}</div>
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
