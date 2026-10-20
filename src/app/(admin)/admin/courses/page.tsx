import Link from 'next/link'
import { auth } from '@/lib/auth'
import { listCourses } from '@/modules/courses/courses.service'
import CoursesTable from './_components/CoursesTable'

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

  const courses = data.map(c => ({
    id:          c.id,
    title:       c.title,
    category:    c.category,
    level:       c.level,
    isPublished: c.isPublished,
    createdAt:   c.createdAt.toISOString(),
  }))

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
          { label: 'Published',     value: courses.filter(c => c.isPublished).length },
          { label: 'Drafts',        value: courses.filter(c => !c.isPublished).length },
          { label: 'This Page',     value: courses.length },
        ].map(c => (
          <div key={c.label} style={{ background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 12, padding: '20px 24px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{c.label}</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: '#334155', lineHeight: 1 }}>{c.value}</p>
          </div>
        ))}
      </div>

      <CoursesTable courses={courses} pagination={pagination} />
    </main>
  )
}
