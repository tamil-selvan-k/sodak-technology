import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTrainerBySlug } from '@/modules/trainers/trainers.service'

export const revalidate = 60

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const mentor = await getTrainerBySlug(params.slug)
  if (!mentor) return {}
  return { title: `${mentor.name} — Mentor`, description: mentor.mentorBio ?? mentor.bioHtml?.replace(/<[^>]+>/g, '').slice(0, 160) ?? '' }
}

export default async function MentorProfilePage({ params }: Props) {
  const mentor = await getTrainerBySlug(params.slug)
  if (!mentor || !mentor.isMentor) notFound()

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 20 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <Link href="/mentors"><span>Mentors</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">{mentor.name}</span>
          </div>
          <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div className="avatar avatar-xxl" style={{ background: 'rgba(0,160,255,0.18)', fontSize: 40, flexShrink: 0 }}>
              {mentor.name.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                <span className="badge badge-gold">Mentor</span>
                {mentor.availabilityStatus === 'available' && <span className="badge badge-green">Available</span>}
              </div>
              <h1 className="t-h1 c-white" style={{ marginBottom: 8 }}>{mentor.name}</h1>
              <p className="t-lg c-muted">{mentor.designation}</p>
              {mentor.currentCompany && <p className="t-body" style={{ color: '#00a0ff', marginTop: 6 }}>{mentor.currentCompany}</p>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                {(mentor.expertiseTags as string[] ?? []).map(tag => (
                  <span key={tag} className="badge badge-dark">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="s-dark">
        <div className="container">
          <div className="two-col" style={{ alignItems: 'start' }}>
            <div>
              {mentor.mentorBio && (
                <div style={{ marginBottom: 28 }}>
                  <p className="section-eyebrow">About</p>
                  <p className="t-body c-muted" style={{ marginTop: 8, lineHeight: 1.8 }}>{mentor.mentorBio}</p>
                </div>
              )}
              {mentor.bioHtml && (
                <div className="t-body c-muted" dangerouslySetInnerHTML={{ __html: mentor.bioHtml }} style={{ lineHeight: 1.8 }} />
              )}
            </div>

            <div>
              <div className="card card-dark">
                <p className="section-eyebrow" style={{ marginBottom: 14 }}>Book a Session</p>
                {(mentor.sessionTypes as string[] ?? []).length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <p className="t-sm c-muted" style={{ marginBottom: 10 }}>Available session types:</p>
                    {(mentor.sessionTypes as string[]).map(st => (
                      <p key={st} className="t-sm c-muted" style={{ marginBottom: 6 }}>✓ {st}</p>
                    ))}
                  </div>
                )}
                <Link href="/contact" className="btn btn-gold btn-full btn-lg">Request a Session →</Link>
                <p className="t-micro c-muted text-center" style={{ marginTop: 10 }}>Sessions confirmed within 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="cta-gold">
        <div className="container">
          <div>
            <h2>Ready to Connect with {mentor.name}?</h2>
            <p>Book your 1-on-1 session — career guidance, mock interview, or code review.</p>
          </div>
          <Link href="/contact" className="btn-cta">Book Now →</Link>
        </div>
      </div>
    </>
  )
}
