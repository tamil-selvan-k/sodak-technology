import Link from 'next/link'
import { auth } from '@/lib/auth'
import { listCourses } from '@/modules/courses/courses.service'

export const metadata = { title: 'Courses — SODAK Admin' }

interface Props {
  searchParams: { search?: string; category?: string; page?: string }
}

export default async function AdminCoursesPage({ searchParams }: Props) {
  await auth()

  const { data, pagination } = await listCourses({
    search:             searchParams.search,
    category:           searchParams.category,
    page:               searchParams.page ? Number(searchParams.page) : 1,
    includeUnpublished: true,
  })

  return (
    <main className="admin-main">
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563EB', marginBottom: 6 }}>SODAK Technology</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172554', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>Course Management</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Manage courses and their content</p>
          </div>
          <Link
            href="/admin/courses/new"
            style={{ padding: '9px 22px', fontSize: 13, fontWeight: 700, background: '#2563EB', color: '#ffffff', borderRadius: '2rem', textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            + New Course
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="admin-stat-grid-4">
        {[
          { label: 'Total Courses', value: pagination.total },
          { label: 'Published',     value: data.filter(c => c.isPublished).length },
          { label: 'Drafts',        value: data.filter(c => !c.isPublished).length },
          { label: 'This Page',     value: data.length },
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
              <th>Title</th>
              <th>Category</th>
              <th>Level</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
                  No courses yet. <Link href="/admin/courses/new" style={{ color: '#2563EB' }}>Add the first course →</Link>
                </td>
              </tr>
            ) : (
              data.map(course => (
                <tr key={course.id}>
                  <td style={{ fontWeight: 600 }}>{course.title}</td>
                  <td style={{ color: '#64748b', fontSize: 13 }}>{course.category ?? '—'}</td>
                  <td style={{ color: '#64748b', fontSize: 13 }}>{course.level ?? '—'}</td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      background: course.isPublished ? '#dcfce7' : '#fef9c3',
                      color:      course.isPublished ? '#16a34a' : '#b45309',
                      border:     course.isPublished ? '1px solid #bbf7d0' : '1px solid #fde68a',
                    }}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: 13 }}>{course.createdAt.toLocaleDateString()}</td>
                  <td>
                    <Link href={`/admin/courses/${course.id}`} style={{ color: '#2563EB', fontSize: 13, fontWeight: 600 }}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
