import { auth } from '@/lib/auth'
import { listPrograms } from '@/modules/programs/programs.service'
import ProgramsTable from './_components/ProgramsTable'

export const metadata = { title: 'Programs — SODAK Admin' }

interface Props {
  searchParams: { search?: string; track?: string; page?: string }
}

export default async function AdminProgramsPage({ searchParams }: Props) {
  await auth()

  const page = searchParams.page ? Number(searchParams.page) : 1
  const { data: programs, pagination } = await listPrograms({
    search: searchParams.search,
    trackCode: searchParams.track,
    includeUnpublished: true,
    page,
  })

  const published = programs.filter(p => p.isPublished).length
  const deliveryModes = new Set(programs.map(p => p.deliveryMode).filter(Boolean)).size
  const withBrochure = programs.filter(p => p.brochureKey).length

  return (
    <main className="flex-1 min-w-0" style={{ padding: '32px 40px', maxWidth: 'calc(100vw - 220px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Programs</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Manage training programs and tracks</p>
        </div>
        <a href="/admin/programs/new" style={{ padding: '9px 18px', fontSize: 13, fontWeight: 700, background: '#c8a035', color: '#0a0f1e', border: 'none', borderRadius: 6, cursor: 'pointer', textDecoration: 'none' }}>
          + Add Program
        </a>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Programs', value: pagination.total },
          { label: 'Published', value: published },
          { label: 'With Brochure', value: withBrochure },
          { label: 'Delivery Modes', value: deliveryModes },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '20px 24px' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>{value}</div>
          </div>
        ))}
      </div>

      <ProgramsTable programs={programs} pagination={pagination} />
    </main>
  )
}
