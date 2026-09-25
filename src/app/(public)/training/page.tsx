import type { Metadata } from 'next'
import Link from 'next/link'
import { listStacks } from '@/modules/stacks/stacks.service'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'Training Stacks — SODAK Technology',
  description: 'Explore all technology stacks taught in SODAK campus training programs.',
}

export default async function TrainingPage() {
  const stacks = await listStacks().catch(() => [])

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 18 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">Training Stacks</span>
          </div>
          <h1 className="t-page c-white" style={{ marginBottom: 12 }}>Technology Training Stacks</h1>
          <p className="t-lg c-muted" style={{ maxWidth: 560 }}>
            Six core technology tracks and a custom option — each mapped directly to what MNCs look for in campus hires.
          </p>
        </div>
      </div>

      <section className="s-dark">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {stacks.map(stack => (
              <Link key={stack.id} href={`/training/${stack.slug}`} style={{ textDecoration: 'none' }}>
                <div className="card card-dark" style={{ height: '100%' }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ lineHeight: 1, flexShrink: 0 }}>{stack.icon ?? <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>}</div>
                    <div>
                      <p className="t-card c-white" style={{ marginBottom: 4 }}>{stack.name}</p>
                      <p className="t-sm c-muted">{stack.summary}</p>
                    </div>
                  </div>
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
            <h2>Need a Blend of Stacks?</h2>
            <p>We can combine topics from multiple stacks into a custom program for your institution.</p>
          </div>
          <Link href="/contact" className="btn-cta">Request Custom Program →</Link>
        </div>
      </div>
    </>
  )
}
