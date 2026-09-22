import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTrainerBySlug } from '@/modules/trainers/trainers.service'
import { getByAuthor } from '@/modules/blog/blog.service'
import { getByTrainerId } from '@/modules/institutions/institutions.service'

export const revalidate = 60

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const trainer = await getTrainerBySlug(params.slug)
  if (!trainer) return {}
  return { title: trainer.name, description: trainer.bioHtml?.replace(/<[^>]+>/g, '').slice(0, 160) }
}

export default async function TrainerProfilePage({ params }: Props) {
  const trainer = await getTrainerBySlug(params.slug)
  if (!trainer) notFound()

  const [posts, institutions] = await Promise.all([
    getByAuthor(trainer.id),
    getByTrainerId(trainer.id),
  ])

  return (
    <>
      {/* Hero */}
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 20 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <Link href="/trainers"><span>Trainers</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">{trainer.name}</span>
          </div>
          <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div className="avatar avatar-xxl" style={{ background: 'rgba(0,160,255,0.18)', fontSize: 40, flexShrink: 0 }}>
              {trainer.name.charAt(0)}
            </div>
            <div>
              <h1 className="t-h1 c-white" style={{ marginBottom: 8 }}>{trainer.name}</h1>
              <p className="t-lg c-muted">{trainer.designation}</p>
              {trainer.currentCompany && (
                <p className="t-body" style={{ color: '#00a0ff', marginTop: 6 }}>{trainer.currentCompany}</p>
              )}
              {trainer.yearsExperience && (
                <p className="t-sm c-muted" style={{ marginTop: 4 }}>{trainer.yearsExperience}+ years experience</p>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                {(trainer.expertiseTags as string[] ?? []).map(tag => (
                  <span key={tag} className="badge badge-dark">{tag}</span>
                ))}
              </div>
              {trainer.linkedinUrl && (
                <a href={trainer.linkedinUrl} target="_blank" rel="noopener noreferrer"
                   className="btn btn-outline btn-sm" style={{ marginTop: 16 }}>
                  LinkedIn Profile ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bio + stacks */}
      <section className="s-dark">
        <div className="container">
          <div className="two-col" style={{ alignItems: 'start' }}>
            <div>
              {trainer.bioHtml && (
                <>
                  <p className="section-eyebrow">About</p>
                  <div className="t-body c-muted" dangerouslySetInnerHTML={{ __html: trainer.bioHtml }} style={{ lineHeight: 1.8 }} />
                </>
              )}

              {institutions.length > 0 && (
                <div style={{ marginTop: 32 }}>
                  <p className="section-eyebrow">Institutions Trained</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
                    {institutions.map((inst: { id: string; name: string }) => (
                      <span key={inst.id} className="badge badge-dark badge-lg">{inst.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              {trainer.isMentor && (
                <div className="card card-dark" style={{ marginBottom: 20 }}>
                  <p className="section-eyebrow" style={{ marginBottom: 10 }}>1-on-1 Mentoring</p>
                  {trainer.mentorBio && <p className="t-sm c-muted" style={{ marginBottom: 14 }}>{trainer.mentorBio}</p>}
                  {trainer.availabilityStatus === 'available' && (
                    <span className="badge badge-green" style={{ marginBottom: 14 }}>Available for sessions</span>
                  )}
                  {(trainer.sessionTypes as string[] ?? []).map(st => (
                    <p key={st} className="t-sm c-muted" style={{ marginBottom: 4 }}>✓ {st}</p>
                  ))}
                  <Link href="/contact" className="btn btn-gold btn-full" style={{ marginTop: 16 }}>
                    Book a Session →
                  </Link>
                </div>
              )}

              <div className="card card-dark">
                <p className="section-eyebrow" style={{ marginBottom: 12 }}>Quick Facts</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {trainer.yearsExperience && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="t-sm c-muted">Experience</span>
                      <span className="t-sm c-white fw-600">{trainer.yearsExperience}+ years</span>
                    </div>
                  )}
                  {trainer.currentCompany && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="t-sm c-muted">Current company</span>
                      <span className="t-sm c-white fw-600">{trainer.currentCompany}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="t-sm c-muted">Role</span>
                    <span className="t-sm c-white fw-600">{trainer.isMentor ? 'Trainer & Mentor' : 'Trainer'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog posts */}
      {posts.length > 0 && (
        <section className="s-light">
          <div className="container">
            <p className="section-eyebrow">By {trainer.name}</p>
            <h2 className="t-h2 c-heading" style={{ marginBottom: 24 }}>Articles & Insights</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {posts.slice(0, 3).map((post: { id: string; slug: string; title: string; excerpt: string | null; publishedAt: Date | null }) => (
                <Link key={post.id} href={`/insights/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="card card-light">
                    <p className="t-card c-heading" style={{ marginBottom: 8 }}>{post.title}</p>
                    {post.excerpt && <p className="t-sm c-body" style={{ marginBottom: 14 }}>{post.excerpt}</p>}
                    <p className="t-micro c-muted">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric' }) : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <div className="cta-gold">
        <div className="container">
          <div>
            <h2>Bring {trainer.name} to Your Campus</h2>
            <p>Book a training session or workshop with this trainer for your institution.</p>
          </div>
          <Link href="/contact" className="btn-cta">Book Now →</Link>
        </div>
      </div>
    </>
  )
}
