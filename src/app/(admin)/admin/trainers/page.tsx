import Link from 'next/link'
import { auth } from '@/lib/auth'
import { listTrainers } from '@/modules/trainers/trainers.service'
import TrainersTable from './_components/TrainersTable'

export const metadata = { title: 'Trainers — SODAK Admin' }

interface Props {
  searchParams: { search?: string; status?: string; mentor?: string; page?: string }
}

export default async function AdminTrainersPage({ searchParams }: Props) {
  await auth()

  const isMentorFilter =
    searchParams.mentor === '1' ? true : searchParams.mentor === '0' ? false : undefined

  const { data, pagination } = await listTrainers({
    search:            searchParams.search,
    isPublished:       searchParams.status === 'published' ? true : searchParams.status === 'draft' ? false : undefined,
    isMentor:          isMentorFilter,
    page:              searchParams.page ? Number(searchParams.page) : 1,
    includeUnpublished: true,
  })

  const published = data.filter(t => t.isPublished).length
  const mentors   = data.filter(t => t.isMentor).length
  const noConsent = data.filter(t => !t.consentOnFile).length

  return (
    <main className="flex-1 min-w-0" style={{ padding: '32px 40px', maxWidth: 'calc(100vw - 220px)', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4865ad', marginBottom: 6 }}>SODAK Technology</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>Trainer Management</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Manage trainer profiles, domains and programs</p>
          </div>
          <Link
            href="/admin/trainers/new"
            style={{ padding: '9px 22px', fontSize: 13, fontWeight: 700, background: '#4865ad', color: '#ffffff', borderRadius: '2rem', textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            + Add Trainer
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Trainers',  value: pagination.total },
          { label: 'Published',       value: published },
          { label: 'Mentors',         value: mentors },
          { label: 'Missing Consent', value: noConsent },
        ].map(c => (
          <div key={c.label} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1.5rem', padding: '20px 24px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{c.label}</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{c.value}</p>
          </div>
        ))}
      </div>

      <TrainersTable
        trainers={data}
        pagination={pagination}
        search={searchParams.search}
        status={searchParams.status}
        mentor={searchParams.mentor}
      />

      <p style={{ marginTop: 16, fontSize: 12, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 16px' }}>
        <strong>Note:</strong> Unpublishing a trainer hides their profile from the public site. Program history is preserved.
        Trainers with <strong>No Consent</strong> cannot be published.
      </p>
    </main>
  )
}
