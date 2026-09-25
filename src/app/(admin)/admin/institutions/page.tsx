import { auth } from '@/lib/auth'
import { listInstitutions } from '@/modules/institutions/institutions.service'
import InstitutionsTable from './_components/InstitutionsTable'

export const metadata = { title: 'Institutions — SODAK Admin' }

interface Props {
  searchParams: { search?: string; type?: string; page?: string }
}

export default async function AdminInstitutionsPage({ searchParams }: Props) {
  await auth()

  const page = searchParams.page ? Number(searchParams.page) : 1
  const { data: institutions, pagination } = await listInstitutions({
    search: searchParams.search,
    type: searchParams.type,
    includeUnpublished: true,
    page,
  })

  const published = institutions.filter(i => i.isPublished).length
  const showOnHome = institutions.filter(i => i.showOnHome).length
  const logoPerm = institutions.filter(i => i.logoPermission).length

  return (
    <main className="flex-1 min-w-0" style={{ padding: '32px 40px', maxWidth: 'calc(100vw - 220px)', minHeight: '100vh', background: 'linear-gradient(160deg, #0a1628 0%, #0c2040 100%)' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c8a035', marginBottom: 6 }}>SODAK Technology</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-instrument-sans)' }}>Institutions</h1>
            <p style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>Manage partner colleges and companies</p>
          </div>
          <a href="/admin/institutions/new" style={{ padding: '9px 20px', fontSize: 13, fontWeight: 700, background: '#c8a035', color: '#0a0f1e', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            + Add Institution
          </a>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Institutions', value: pagination.total },
          { label: 'Published', value: published },
          { label: 'Show on Home', value: showOnHome },
          { label: 'Logo Permission', value: logoPerm },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#e2e8f0' }}>{value}</div>
          </div>
        ))}
      </div>

      <InstitutionsTable institutions={institutions} pagination={pagination} />
    </main>
  )
}
