import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProgramBySlug } from '@/modules/programs/programs.service'
import FaqAccordion from '@/components/ui/FaqAccordion'

export const revalidate = 60

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProgramBySlug(params.slug)
  return { title: p?.title ?? 'Program', description: p?.summary ?? '' }
}

export default async function ProgramDetailPage({ params }: Props) {
  const program = await getProgramBySlug(params.slug)
  if (!program) notFound()

  const faqs = [
    { question: 'What is the class format?', answer: `This program is delivered ${program.deliveryMode === 'on_campus' ? 'on-site at your institution' : program.deliveryMode === 'hybrid' ? 'in a mix of on-campus and online sessions' : 'fully online'}. Batch sizes are kept small to ensure individual attention.` },
    { question: 'Do students receive a certificate?', answer: 'Yes. Participants who complete the program receive a SODAK Technology certificate of completion, co-signed by the trainer.' },
    { question: 'Can the curriculum be customised?', answer: 'Absolutely. We can adjust depth, pacing, and topic mix based on your placement drive timeline and student level.' },
    { question: 'Is there a placement guarantee?', answer: 'We provide dedicated placement support — mock interviews, resume clinics, and company referrals — for all program completers.' },
  ]

  return (
    <>
      {/* Hero */}
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 20 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <Link href="/programs"><span>Programs</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">{program.title}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
            {program.trackCode && (
              <span className="badge badge-gold badge-lg">Track {program.trackCode}</span>
            )}
            {program.isFeatured && <span className="badge badge-green">Featured</span>}
          </div>
          <h1 className="t-h1 c-white" style={{ marginBottom: 12 }}>{program.title}</h1>
          {program.summary && <p className="t-lg c-muted" style={{ maxWidth: 600 }}>{program.summary}</p>}
          <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
            {program.duration && (
              <div className="badge badge-dark badge-lg">⏱ {program.duration}</div>
            )}
            {program.deliveryMode && (
              <div className="badge badge-dark badge-lg">🏫 {program.deliveryMode.replace('_', '-')}</div>
            )}
            {program.targetAudience && (
              <div className="badge badge-dark badge-lg">🎓 {program.targetAudience}</div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="s-dark">
        <div className="container">
          <div className="two-col" style={{ alignItems: 'start' }}>
            <div>
              {/* Outcomes */}
              {program.outcomes && (program.outcomes as string[]).length > 0 && (
                <div style={{ marginBottom: 36 }}>
                  <p className="section-eyebrow">What You&apos;ll Learn</p>
                  <h2 className="t-h2 c-white" style={{ marginBottom: 20 }}>Program Outcomes</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {(program.outcomes as string[]).map((outcome, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#00a0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✓</div>
                        <p className="t-body c-muted">{outcome}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prerequisites */}
              {program.prerequisites && (
                <div style={{ marginBottom: 36 }}>
                  <p className="section-eyebrow">Prerequisites</p>
                  <p className="t-body c-muted" style={{ marginTop: 8 }}>{program.prerequisites}</p>
                </div>
              )}

              {/* FAQ */}
              <div>
                <p className="section-eyebrow">FAQ</p>
                <h2 className="t-h2 c-white" style={{ marginBottom: 20 }}>Frequently Asked Questions</h2>
                <FaqAccordion items={faqs} />
              </div>
            </div>

            <div style={{ position: 'sticky', top: 80 }}>
              <div className="card card-dark">
                <p className="section-eyebrow" style={{ marginBottom: 14 }}>Enrol Your Campus</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  {[
                    { label: 'Duration',   value: program.duration ?? '—' },
                    { label: 'Delivery',   value: program.deliveryMode?.replace('_',' ') ?? '—' },
                    { label: 'For',        value: program.targetAudience ?? 'CS/IT students' },
                    { label: 'Fee',        value: 'Contact for pricing' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 10 }}>
                      <span className="t-sm c-muted">{row.label}</span>
                      <span className="t-sm c-white fw-600">{row.value}</span>
                    </div>
                  ))}
                </div>
                <Link href="/contact" className="btn btn-gold btn-full btn-lg">Enquire Now →</Link>
                <Link href="/contact" className="btn btn-outline btn-full" style={{ marginTop: 10 }}>Download Brochure</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-gold">
        <div className="container">
          <div>
            <h2>Interested in This Program?</h2>
            <p>Contact us to check availability and get a customised schedule for your institution.</p>
          </div>
          <Link href="/contact" className="btn-cta">Book a Consultation →</Link>
        </div>
      </div>
    </>
  )
}
