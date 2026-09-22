import type { Metadata } from 'next'
import Link from 'next/link'
import { listStacks } from '@/modules/stacks/stacks.service'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'Courses — SODAK Technology',
  description: 'Browse all courses and technology stacks available in SODAK campus programs.',
}

export default async function CoursesPage() {
  const stacks = await listStacks().catch(() => [])

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

      <section className="s-dark">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {stacks.map(stack => (
              <Link key={stack.id} href={`/training/${stack.slug}`} style={{ textDecoration: 'none' }}>
                <div className="card card-dark" style={{ height: '100%' }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
                    <span style={{ fontSize: 32, lineHeight: 1 }}>{stack.icon ?? '💻'}</span>
                    <p className="t-card c-white">{stack.name}</p>
                  </div>
                  <p className="t-sm c-muted" style={{ marginBottom: 14 }}>{stack.summary}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
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
