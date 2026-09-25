import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStackBySlug } from '@/modules/stacks/stacks.service'

export const revalidate = 60

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const stack = await getStackBySlug(params.slug)
  return { title: stack?.name ?? 'Training Stack', description: stack?.summary ?? '' }
}

export default async function TrainingStackPage({ params }: Props) {
  const stack = await getStackBySlug(params.slug)
  if (!stack) notFound()

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 18 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <Link href="/training"><span>Training</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">{stack.name}</span>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
            {stack.icon && <span style={{ fontSize: 48, lineHeight: 1 }}>{stack.icon}</span>}
            {stack.colorToken && (
              <span className="badge badge-lg" style={{ background: stack.colorToken + '22', color: stack.colorToken, border: `1px solid ${stack.colorToken}44` }}>
                Training Stack
              </span>
            )}
          </div>
          <h1 className="t-page c-white" style={{ marginBottom: 10 }}>{stack.name}</h1>
          {stack.summary && <p className="t-lg c-muted" style={{ maxWidth: 540 }}>{stack.summary}</p>}
        </div>
      </div>

      <section className="s-dark">
        <div className="container">
          <div className="two-col" style={{ alignItems: 'start' }}>
            <div>
              <p className="section-eyebrow">Technologies Covered</p>
              <h2 className="t-h2 c-white" style={{ marginBottom: 24 }}>What You&apos;ll Learn</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                {(stack.technologies ?? []).map((tech: { name: string; logoUrl: string | null; displayOrder: number }) => (
                  <div key={tech.name} className="card card-dark" style={{ textAlign: 'center', padding: '20px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg></div>
                    <p className="t-sm c-white fw-600">{tech.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="card card-dark">
                <p className="section-eyebrow" style={{ marginBottom: 14 }}>Train With This Stack</p>
                <p className="t-sm c-muted" style={{ marginBottom: 20 }}>
                  This stack is available as a standalone module or as part of a custom campus program.
                </p>
                <Link href="/contact" className="btn btn-gold btn-full">Enquire Now →</Link>
                <Link href="/programs" className="btn btn-outline btn-full" style={{ marginTop: 10 }}>Browse Programs →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="cta-gold">
        <div className="container">
          <div>
            <h2>Ready to Train in {stack.name}?</h2>
            <p>Book a campus session or explore our programs that include this stack.</p>
          </div>
          <Link href="/contact" className="btn-cta">Book a Demo →</Link>
        </div>
      </div>
    </>
  )
}
