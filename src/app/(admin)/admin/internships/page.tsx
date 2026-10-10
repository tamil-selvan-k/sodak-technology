import Link from 'next/link'
import { auth } from '@/lib/auth'
import { listInternships } from '@/modules/internships/internships.service'
import InternshipsTable from './_components/InternshipsTable'

export const metadata = { title: 'Internships — SODAK Admin' }

interface Props {
  searchParams: { search?: string; status?: string; page?: string }
}

export default async function AdminInternshipsPage({ searchParams }: Props) {
  await auth()

  const { data, pagination } = await listInternships({
    search:             searchParams.search,
    includeUnpublished: true,
    page:               searchParams.page ? Number(searchParams.page) : 1,
  })

  const published = data.filter(i => i.isPublished).length
  const now       = new Date()
  const open      = data.filter(i => !i.applicationDeadline || new Date(i.applicationDeadline) >= now).length

  return (
    <main className="admin-main">
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563EB', marginBottom: 6 }}>SODAK Technology</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172554', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>Internship Management</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Manage internship listings and applications</p>
          </div>
          <Link
            href="/admin/internships/new"
            style={{ padding: '9px 20px', fontSize: 13, fontWeight: 700, background: '#2563EB', color: '#ffffff', borderRadius: '2rem', textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            + Add Internship
          </Link>
        </div>
      </div>

      <div className="admin-stat-grid-4">
        {[
          { label: 'Total',      value: pagination.total },
          { label: 'Published',  value: published },
          { label: 'Open',       value: open },
          { label: 'Expired',    value: data.filter(i => i.applicationDeadline && new Date(i.applicationDeadline) < now).length },
        ].map(c => (
          <div key={c.label} style={{ background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 12, padding: '20px 24px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{c.label}</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: '#334155', lineHeight: 1 }}>{c.value}</p>
          </div>
        ))}
      </div>

      <InternshipsTable
        internships={data.map(i => ({
          id:                  i.id,
          companyName:         i.companyName,
          roleTitle:           i.roleTitle,
          location:            i.location ?? null,
          duration:            i.duration ?? null,
          stipendRange:        i.stipendRange ?? null,
          stackTags:           i.stackTags,
          isPublished:         i.isPublished,
          applicationDeadline: i.applicationDeadline?.toISOString() ?? null,
          createdAt:           i.createdAt.toISOString(),
        }))}
        pagination={pagination}
        search={searchParams.search}
        status={searchParams.status}
      />
    </main>
  )
}
