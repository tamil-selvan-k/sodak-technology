import type { Metadata } from 'next'
import Link from 'next/link'
import { listCourses } from '@/modules/courses/courses.service'
import { listStacks } from '@/modules/stacks/stacks.service'
import StackIcon from '@/components/ui/StackIcon'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'Courses — SODAK Technology',
  description: 'Browse all courses and technology stacks available in SODAK campus programs.',
}

const LEVEL_COLOR: Record<string, { bg: string; color: string }> = {
  Beginner:     { bg: '#f0fdf4', color: '#16a34a' },
  Intermediate: { bg: '#fffbeb', color: '#b45309' },
  Advanced:     { bg: '#fef2f2', color: '#dc2626' },
}

export default async function CoursesPage() {
  const [{ data: courses }, stacks] = await Promise.all([
    listCourses({ perPage: 50 }).catch(() => ({ data: [] })),
    listStacks().catch(() => []),
  ])

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 18 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">Courses</span>
          </div>
          <h1 className="t-page c-white" style={{ marginBottom: 12 }}>Courses & Topics</h1>
          <p className="t-lg c-muted" style={{ maxWidth: 540 }}>
            Every topic we teach is mapped to what companies actually test in campus placement drives.
          </p>
        </div>
      </div>

      {/* Courses from DB */}
      {courses.length > 0 && (
        <section className="s-light">
          <div className="container">
            <div className="section-header text-center">
              <p className="section-eyebrow">Curriculum</p>
              <h2 className="t-h1 c-heading">Our Courses</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {courses.map(course => {
                const lvl = course.level ? LEVEL_COLOR[course.level] : null
                return (
                  <div key={course.id} className="card card-light" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {course.coverImageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={course.coverImageUrl} alt={course.title} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: '10px 10px 0 0', marginBottom: 16 }} />
                    )}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                        {course.category && (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#eff6ff', color: '#1e40af', border: '1px solid #dbeafe' }}>{course.category}</span>
                        )}
                        {lvl && (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: lvl.bg, color: lvl.color }}>{course.level}</span>
                        )}
                      </div>
                      <h3 className="t-card c-heading" style={{ marginBottom: 8 }}>{course.title}</h3>
                      {course.duration && (
                        <p className="t-sm c-muted" style={{ marginBottom: 10 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle', marginRight: 4 }}><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
                          {course.duration}
                        </p>
                      )}
                      {(course.outcomes as string[]).length > 0 && (
                        <ul style={{ paddingLeft: 0, listStyle: 'none', marginTop: 'auto', marginBottom: 0 }}>
                          {(course.outcomes as string[]).slice(0, 3).map((o: string) => (
                            <li key={o} className="t-sm c-body" style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, marginTop: 2 }}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                              {o}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Technology stacks */}
      {stacks.length > 0 && (
        <section className={courses.length > 0 ? 's-alt' : 's-light'}>
          <div className="container">
            <div className="section-header text-center">
              <p className="section-eyebrow">Technology</p>
              <h2 className="t-h1 c-heading">Technology Stacks</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {stacks.map(stack => (
                <Link key={stack.id} href={`/training/${stack.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                  <div className="card card-dark" style={{ height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
                      <span style={{ lineHeight: 1, color: stack.colorToken ?? '#93c5fd' }}><StackIcon slug={stack.slug} size={32} /></span>
                      <p className="t-card c-white">{stack.name}</p>
                    </div>
                    <p className="t-sm c-muted" style={{ marginBottom: 14 }}>{stack.summary}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
                      {(stack.technologies ?? []).map((tech: { name: string }) => (
                        <span key={tech.name} className="badge badge-dark">{tech.name}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {courses.length === 0 && stacks.length === 0 && (
        <section className="s-light">
          <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
            <p className="t-body c-muted">No courses published yet. Check back soon.</p>
          </div>
        </section>
      )}

      <div className="cta-gold">
        <div className="container">
          <div>
            <h2>Want a Full Curriculum?</h2>
            <p>Download our program brochure or book a demo session for your institution.</p>
          </div>
          <Link href="/contact" className="btn-cta">Get a Brochure →</Link>
        </div>
      </div>
    </>
  )
}
