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
    <main className="flex-1 min-w-0" style={{ padding: '32px 40px', maxWidth: 'calc(100vw - 220px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Careers Management</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Post and manage job openings at SODAK Technology</p>
        </div>
        <Link
          href="/admin/careers/new"
          style={{ padding: '9px 18px', fontSize: 13, fontWeight: 700, background: '#c8a035', color: '#0a0f1e', borderRadius: 6, textDecoration: 'none' }}
        >
          + Add Job
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Jobs',  value: pagination.total },
          { label: 'Published',  value: published },
          { label: 'Open',       value: open },
          { label: 'Closed',     value: data.filter(j => !j.isOpen).length },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '20px 24px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{c.label}</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{c.value}</p>
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
