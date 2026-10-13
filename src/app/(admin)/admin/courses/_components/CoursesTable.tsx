'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTransition, useState, useEffect, useRef } from 'react'

interface CourseRow {
  id: string
  title: string
  category: string | null
  level: string | null
  isPublished: boolean
  createdAt: string
}

interface Props {
  courses: CourseRow[]
}

export default function CoursesTable({ courses }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handlePublish(id: string, publish: boolean) {
    const action = publish ? 'publish' : 'unpublish'
    startTransition(async () => {
      await fetch(`/api/v1/courses/${id}/${action}`, { method: 'POST' })
      router.refresh()
    })
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    startTransition(async () => {
      await fetch(`/api/v1/courses/${id}`, { method: 'DELETE' })
      router.refresh()
    })
  }

  return (
    <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #dbeafe', overflow: openMenu ? 'visible' : 'hidden', marginTop: 24, boxShadow: '0 1px 4px rgba(37,99,235,0.06)', opacity: isPending ? 0.6 : 1, transition: 'opacity 0.2s' }}>
      <div style={{ overflowX: openMenu ? 'visible' : 'auto', WebkitOverflowScrolling: 'touch' }}>
      <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#EFF6FF' }}>
            {['Title', 'Category', 'Level', 'Status', 'Created', ''].map(h => (
              <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', textAlign: 'left' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {courses.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>No courses yet.</td>
            </tr>
          )}
          {courses.map(course => (
            <tr key={course.id} style={{ borderTop: '1px solid #DBEAFE' }} className="hover:bg-[#EFF6FF]">
              <td style={{ padding: '11px 14px', fontWeight: 600, color: '#172554', fontSize: 13 }}>{course.title}</td>
              <td style={{ padding: '11px 14px', color: '#64748b', fontSize: 13 }}>{course.category ?? '—'}</td>
              <td style={{ padding: '11px 14px', color: '#64748b', fontSize: 13 }}>{course.level ?? '—'}</td>
              <td style={{ padding: '11px 14px' }}>
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
              <td style={{ padding: '11px 14px', color: '#64748b', fontSize: 13 }}>{new Date(course.createdAt).toLocaleDateString()}</td>
              <td style={{ padding: '11px 14px', position: 'relative' }}>
                <div ref={openMenu === course.id ? menuRef : undefined} style={{ display: 'inline-block', position: 'relative' }}>
                  <button
                    onClick={() => setOpenMenu(openMenu === course.id ? null : course.id)}
                    style={{ width: 32, height: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'none', border: '1px solid #dbeafe', borderRadius: 8, cursor: 'pointer', padding: 0 }}
                    title="Actions"
                  >
                    {[0,1,2].map(i => <span key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: '#64748b', display: 'block' }} />)}
                  </button>
                  {openMenu === course.id && (
                    <div style={{ position: 'absolute', right: 0, top: '110%', background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 10, boxShadow: '0 8px 24px rgba(37,99,235,0.12)', minWidth: 148, zIndex: 50, overflow: 'hidden' }}>
                      <Link
                        href={`/admin/courses/${course.id}`}
                        onClick={() => setOpenMenu(null)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', fontSize: 13, color: '#172554', textDecoration: 'none', fontWeight: 500 }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        Edit
                      </Link>
                      {course.isPublished ? (
                        <button
                          onClick={() => { handlePublish(course.id, false); setOpenMenu(null) }}
                          disabled={isPending}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', fontSize: 13, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, textAlign: 'left' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          Unpublish
                        </button>
                      ) : (
                        <button
                          onClick={() => { handlePublish(course.id, true); setOpenMenu(null) }}
                          disabled={isPending}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', fontSize: 13, color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, textAlign: 'left' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#f0fdf4')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          Publish
                        </button>
                      )}
                      <div style={{ height: 1, background: '#f1f5f9', margin: '2px 0' }} />
                      <button
                        onClick={() => { handleDelete(course.id, course.title); setOpenMenu(null) }}
                        disabled={isPending}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', fontSize: 13, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, textAlign: 'left' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}
