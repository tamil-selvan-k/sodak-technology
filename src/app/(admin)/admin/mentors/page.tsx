import Link from 'next/link'
import { auth } from '@/lib/auth'
import { listMentors } from '@/modules/mentors/mentors.service'

export const metadata = { title: 'Mentors — SODAK Admin' }

interface Props {
  searchParams: { search?: string; status?: string; page?: string }
}

export default async function AdminMentorsPage({ searchParams }: Props) {
  await auth()

  const isPublishedFilter =
    searchParams.status === 'published' ? true :
    searchParams.status === 'draft'     ? false : undefined

  const { data, pagination } = await listMentors({
    search:             searchParams.search,
    isPublished:        isPublishedFilter,
    page:               searchParams.page ? Number(searchParams.page) : 1,
    includeUnpublished: true,
  })

  const published  = data.filter(m => m.isPublished).length
  const noConsent  = data.filter(m => !m.consentOnFile).length

  return (
    <main className="admin-main">
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563EB', marginBottom: 6 }}>SODAK Technology</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172554', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>Mentor Management</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Manage mentor profiles and availability</p>
          </div>
          <Link
            href="/admin/mentors/new"
            style={{ padding: '9px 22px', fontSize: 13, fontWeight: 700, background: '#2563EB', color: '#ffffff', borderRadius: '2rem', textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            + Add Mentor
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="admin-stat-grid-4">
        {[
          { label: 'Total Mentors',   value: pagination.total },
          { label: 'Published',       value: published },
          { label: 'Drafts',          value: pagination.total - published },
          { label: 'Missing Consent', value: noConsent },
        ].map(c => (
          <div key={c.label} style={{ background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 12, padding: '20px 24px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{c.label}</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: '#334155', lineHeight: 1 }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #dbeafe', overflow: 'hidden', marginTop: 24, boxShadow: '0 1px 4px rgba(37,99,235,0.06)' }}>
        <table className="admin-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Designation</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
                  No mentors yet. Add a trainer and mark them as a mentor.
                </td>
              </tr>
            ) : (
              data.map(mentor => (
                <tr key={mentor.id}>
                  <td style={{ fontWeight: 600 }}>{mentor.name}</td>
                  <td style={{ color: '#64748b', fontSize: 13 }}>{mentor.designation ?? '—'}</td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      background: mentor.isPublished ? '#dcfce7' : '#fef9c3',
                      color:      mentor.isPublished ? '#16a34a' : '#b45309',
                      border:     mentor.isPublished ? '1px solid #bbf7d0' : '1px solid #fde68a',
                    }}>
                      {mentor.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <Link href={`/admin/trainers/${mentor.id}`} style={{ color: '#2563EB', fontSize: 13, fontWeight: 600 }}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 16, fontSize: 12, color: '#1e40af', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 16px' }}>
        <strong>Note:</strong> Mentors are trainers with the &quot;Is Mentor&quot; flag enabled.
        To add a new mentor, <Link href="/admin/trainers/new" style={{ color: '#2563EB' }}>create a trainer</Link> and check &quot;Mark as Mentor&quot;.
      </p>
    </main>
  )
}
