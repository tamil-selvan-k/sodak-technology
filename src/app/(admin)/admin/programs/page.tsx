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
    <main className="flex-1 min-w-0" style={{ padding: '32px 40px', maxWidth: 'calc(100vw - 220px)', minHeight: '100vh', background: 'linear-gradient(160deg, #0a1628 0%, #0c2040 100%)' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c8a035', marginBottom: 6 }}>SODAK Technology</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-instrument-sans)' }}>Programs</h1>
            <p style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>Manage training programs and tracks</p>
          </div>
          <a href="/admin/programs/new" style={{ padding: '9px 20px', fontSize: 13, fontWeight: 700, background: '#c8a035', color: '#0a0f1e', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            + Add Program
          </a>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Programs', value: pagination.total },
          { label: 'Published', value: published },
          { label: 'With Brochure', value: withBrochure },
          { label: 'Delivery Modes', value: deliveryModes },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#e2e8f0' }}>{value}</div>
          </div>
        ))}
      </div>

      <ProgramsTable programs={programs} pagination={pagination} />
    </main>
  )
}
