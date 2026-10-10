import Link from 'next/link'
import { auth } from '@/lib/auth'
import { listWebinars } from '@/modules/webinars/webinars.service'
import WebinarsTable from './_components/WebinarsTable'

export const metadata = { title: 'Webinars — SODAK Admin' }

interface Props {
  searchParams: { status?: string; page?: string }
}

export default async function AdminWebinarsPage({ searchParams }: Props) {
  await auth()

  const { data, pagination } = await listWebinars({
    includeUnpublished: true,
    page:               searchParams.page ? Number(searchParams.page) : 1,
  })

  const now       = new Date()
  const published = data.filter(w => w.isPublished).length
  const upcoming  = data.filter(w => w.scheduledAt && new Date(w.scheduledAt) >= now).length

  return (
    <main className="admin-main">
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563EB', marginBottom: 6 }}>SODAK Technology</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172554', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>Webinar Management</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Schedule and manage live sessions and webinars</p>
          </div>
          <Link
            href="/admin/webinars/new"
            style={{ padding: '9px 20px', fontSize: 13, fontWeight: 700, background: '#2563EB', color: '#ffffff', borderRadius: '2rem', textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            + Add Webinar
          </Link>
        </div>
      </div>

      <div className="admin-stat-grid-4">
        {[
          { label: 'Total',       value: pagination.total },
          { label: 'Published',   value: published },
          { label: 'Upcoming',    value: upcoming },
          { label: 'Past',        value: data.filter(w => w.scheduledAt && new Date(w.scheduledAt) < now).length },
        ].map(c => (
          <div key={c.label} style={{ background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 12, padding: '20px 24px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{c.label}</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: '#172554', lineHeight: 1 }}>{c.value}</p>
          </div>
        ))}
      </div>

      <WebinarsTable
        webinars={data.map(w => ({
          id:             w.id,
          title:          w.title,
          platform:       w.platform ?? null,
          presenterName:  w.presenter?.name ?? null,
          scheduledAt:    w.scheduledAt?.toISOString() ?? null,
          durationMinutes: w.durationMinutes ?? null,
          isPublished:    w.isPublished,
        }))}
        pagination={pagination}
        status={searchParams.status}
      />
    </main>
  )
}
