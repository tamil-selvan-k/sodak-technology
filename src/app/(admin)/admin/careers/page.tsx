import Link from 'next/link'
import { auth } from '@/lib/auth'
import { listJobs } from '@/modules/careers/careers.service'
import CareersTable from './_components/CareersTable'

export const metadata = { title: 'Careers — SODAK Admin' }

interface Props {
  searchParams: { search?: string; status?: string; page?: string }
}

export default async function AdminCareersPage({ searchParams }: Props) {
  await auth()

  const isPublishedFilter =
    searchParams.status === 'published' ? true :
    searchParams.status === 'draft'     ? false : undefined

  const { data, pagination } = await listJobs({
    search:             searchParams.search,
    isPublished:        isPublishedFilter,
    page:               searchParams.page ? Number(searchParams.page) : 1,
    includeUnpublished: true,
  })

  const published = data.filter(j => j.isPublished).length
  const open      = data.filter(j => j.isOpen).length

  return (
    <main className="flex-1 min-w-0" style={{ padding: '32px 40px', maxWidth: 'calc(100vw - 220px)', minHeight: '100vh', background: 'linear-gradient(160deg, #0a1628 0%, #0c2040 100%)' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c8a035', marginBottom: 6 }}>SODAK Technology</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-instrument-sans)' }}>Careers Management</h1>
            <p style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>Post and manage job openings at SODAK Technology</p>
          </div>
          <Link
            href="/admin/careers/new"
            style={{ padding: '9px 20px', fontSize: 13, fontWeight: 700, background: '#c8a035', color: '#0a0f1e', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            + Add Job
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Jobs',  value: pagination.total },
          { label: 'Published',  value: published },
          { label: 'Open',       value: open },
          { label: 'Closed',     value: data.filter(j => !j.isOpen).length },
        ].map(c => (
          <div key={c.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 24px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{c.label}</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: '#e2e8f0', lineHeight: 1 }}>{c.value}</p>
          </div>
        ))}
      </div>

      <CareersTable
        jobs={data.map(j => ({
          id:             j.id,
          title:          j.title,
          department:     j.department ?? null,
          location:       j.location ?? null,
          employmentType: j.employmentType ?? null,
          isOpen:         j.isOpen,
          isPublished:    j.isPublished,
          closesOn:       j.closesOn?.toISOString() ?? null,
          createdAt:      j.createdAt.toISOString(),
        }))}
        pagination={pagination}
        search={searchParams.search}
        status={searchParams.status}
      />
    </main>
  )
}
