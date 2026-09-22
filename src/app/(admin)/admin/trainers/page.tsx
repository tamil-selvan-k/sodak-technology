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
    <main className="flex-1 min-w-0" style={{ padding: '32px 40px', maxWidth: 'calc(100vw - 220px)' }}>
      {/* Top bar — wireframe: admin/trainers.html */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Trainer Management</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Manage trainer profiles, domains and programs</p>
        </div>
        <Link
          href="/admin/trainers/new"
          style={{ padding: '9px 18px', fontSize: 13, fontWeight: 700, background: '#c8a035', color: '#0a0f1e', borderRadius: 6, textDecoration: 'none' }}
        >
          + Add Trainer
        </Link>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Trainers',  value: pagination.total },
          { label: 'Published',       value: published,      colour: 'text-green-600' },
          { label: 'Mentors',         value: mentors },
          { label: 'Missing Consent', value: noConsent,      colour: 'text-amber-600' },
        ].map(c => (
          <div key={c.label} className="bg-white border border-[#e2e8f0] rounded-[10px] p-5" style={{ padding: '20px 24px' }}>
            <p className="text-[12px] uppercase tracking-widest text-slate-500 font-semibold mb-1">{c.label}</p>
            <p className={`text-[32px] font-extrabold leading-none text-[#0f172a] ${c.colour ?? ''}`}>{c.value}</p>
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

      <p className="mt-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
        <strong>Note:</strong> Unpublishing a trainer hides their profile from the public site. Program history is preserved.
        Trainers with <strong>No Consent</strong> cannot be published.
      </p>
    </main>
  )
}
