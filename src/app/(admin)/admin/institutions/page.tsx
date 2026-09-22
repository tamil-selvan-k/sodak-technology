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
    <main className="flex-1 min-w-0" style={{ padding: '32px 40px', maxWidth: 'calc(100vw - 220px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Institutions</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Manage partner colleges and companies</p>
        </div>
        <a href="/admin/institutions/new" style={{ padding: '9px 18px', fontSize: 13, fontWeight: 700, background: '#c8a035', color: '#0a0f1e', border: 'none', borderRadius: 6, cursor: 'pointer', textDecoration: 'none' }}>
          + Add Institution
        </a>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Institutions', value: pagination.total },
          { label: 'Published', value: published },
          { label: 'Show on Home', value: showOnHome },
          { label: 'Logo Permission', value: logoPerm },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '20px 24px' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>{value}</div>
          </div>
        ))}
      </div>

      <InstitutionsTable institutions={institutions} pagination={pagination} />
    </main>
  )
}
