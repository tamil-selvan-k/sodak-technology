import type { Metadata } from 'next'
import Link from 'next/link'
import { listTrainers } from '@/modules/trainers/trainers.service'
import FaqAccordion from '@/components/ui/FaqAccordion'

export const revalidate = 60
export const metadata: Metadata = { title: 'Mentors — SODAK Technology', description: 'Book a 1-on-1 session with an industry mentor.' }

const HOW_IT_WORKS = [
  { step: '01', title: 'Browse Mentors', desc: 'Explore profiles of working engineers from top MNCs across various tech domains.' },
  { step: '02', title: 'Pick a Session Type', desc: 'Choose from career guidance, technical mock interview, code review, or resume review.' },
  { step: '03', title: 'Book & Connect', desc: 'Submit a session request — our team will confirm the slot within 24 hours.' },
]

const FAQ_ITEMS = [
  { question: 'How long is a typical mentoring session?', answer: 'Sessions are 45–60 minutes over video call. Some mentors also offer async feedback on resumes and code.' },
  { question: 'Is there a fee for mentoring?', answer: 'Introductory sessions are complimentary for students enrolled in any SODAK program. Standalone sessions are available at a nominal fee.' },
  { question: 'Can I book multiple sessions with the same mentor?', answer: 'Yes — you can book recurring sessions if the mentor has availability. Long-term mentoring relationships are encouraged.' },
  { question: 'What topics can I discuss?', answer: 'Career path guidance, technical interview preparation, system design concepts, cloud architecture, or domain-specific deep dives.' },
]

export default async function MentorsPage() {
  const { data: mentors } = await listTrainers({ isMentor: true }).catch(() => ({ data: [] }))

  return (
    <>
      {/* Page hero */}
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 18 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">Mentors</span>
          </div>
          <h1 className="t-page c-white" style={{ marginBottom: 12 }}>1-on-1 Industry Mentors</h1>
          <p className="t-lg c-muted" style={{ maxWidth: 560 }}>
            Connect directly with working engineers from TCS, Infosys, Zoho, and more — for career guidance, mock interviews, and technical deep dives.
          </p>
        </div>
      </div>

      {/* How it works */}
      <section className="s-dark">
        <div className="container">
          <div className="section-header text-center">
            <p className="section-eyebrow">The Process</p>
            <h2 className="t-h1 c-white">How Mentoring Works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, marginTop: 40 }}>
            {HOW_IT_WORKS.map(s => (
              <div key={s.step} className="card card-dark" style={{ textAlign: 'center', padding: '32px 24px' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#00a0ff', marginBottom: 14, fontFamily: 'var(--font-instrument-sans)' }}>{s.step}</div>
                <p className="t-card c-white" style={{ marginBottom: 8 }}>{s.title}</p>
                <p className="t-sm c-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mentor cards */}
      <section className="s-light">
        <div className="container">
          <div className="section-header text-center">
            <p className="section-eyebrow">Our Mentors</p>
            <h2 className="t-h1 c-heading">Meet the Experts</h2>
          </div>

          {mentors.length === 0 ? (
            <div className="text-center" style={{ padding: '60px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M12 14c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z"/></svg></div>
              <h2 className="t-h2 c-heading" style={{ marginBottom: 10 }}>Mentor profiles coming soon</h2>
              <p className="t-body c-body">Our mentor roster is being finalised. Reach out to express interest in early access.</p>
              <Link href="/contact" className="btn btn-ghost" style={{ marginTop: 20 }}>Get Early Access →</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginTop: 40 }}>
              {mentors.map(m => (
                <Link key={m.id} href={`/mentors/${m.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="card card-light" style={{ height: '100%' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
                      <div className="avatar avatar-lg" style={{ background: 'rgba(0,160,255,0.12)', fontSize: 24 }}>
                        {m.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="t-card c-heading">{m.name}</p>
                        <p className="t-sm c-body">{m.designation}</p>
                        {m.currentCompany && <p className="t-micro" style={{ color: '#00a0ff', marginTop: 3 }}>{m.currentCompany}</p>}
                      </div>
                      {m.availabilityStatus === 'available' && (
                        <span className="badge badge-green">Open</span>
                      )}
                    </div>
                    {m.mentorBio && <p className="t-sm c-body" style={{ marginBottom: 12 }}>{m.mentorBio}</p>}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(m.expertiseTags as string[] ?? []).slice(0, 3).map(tag => (
                        <span key={tag} className="badge badge-light">{tag}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="s-dark">
        <div className="container" style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="section-header text-center">
            <p className="section-eyebrow">FAQ</p>
            <h2 className="t-h2 c-white">Questions About Mentoring</h2>
          </div>
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </section>

      {/* CTA */}
      <div className="cta-gold">
        <div className="container">
          <div>
            <h2>Not Sure Which Mentor to Choose?</h2>
            <p>Tell us your goals — we&apos;ll match you with the right mentor from our network.</p>
          </div>
          <Link href="/contact" className="btn-cta">Find My Mentor →</Link>
        </div>
      </div>
    </>
  )
}
