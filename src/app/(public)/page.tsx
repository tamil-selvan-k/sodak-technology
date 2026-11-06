import type { Metadata } from 'next'
import Link from 'next/link'

import { listMentors } from '@/modules/mentors/mentors.service'
import { listStacks } from '@/modules/stacks/stacks.service'
import { getSettings } from '@/modules/settings/settings.service'
import StackIcon from '@/components/ui/StackIcon'
import MentorCarousel from '@/components/ui/MentorCarousel'
import HeroReveal from '@/components/ui/HeroReveal'
import StackCycler from '@/components/ui/StackCycler'
import type { StackCyclerItem } from '@/components/ui/StackCycler'
import { ScrollReveal, StaggerContainer } from '@/components/ui/ScrollReveal'
import CompanyLogos from '@/components/ui/CompanyLogos'
import StatCounter from '@/components/ui/StatCounter'

export const metadata: Metadata = {
  title: 'Campus Placement Training in Chennai | SODAK Technology',
  description: 'SODAK Technology delivers hands-on campus placement training for engineering colleges across Tamil Nadu — with certified trainers from TCS, Infosys, Wipro and more.',
  openGraph: {
    title: 'Campus Placement Training in Chennai | SODAK Technology',
    description: 'Hands-on placement training delivered inside your campus by working engineers from top MNCs.',
    url: 'https://sodakedutech.in',
    siteName: 'SODAK Technology',
    locale: 'en_IN',
    type: 'website',
  },
}

const HERO_STACKS: StackCyclerItem[] = [
  { label: 'Full Stack Web Development', icon: 'web', from: '#60a5fa', to: '#818cf8' },
  { label: 'Java & Backend Engineering', icon: 'java', from: '#fbbf24', to: '#f97316' },
  { label: 'Python & Machine Learning', icon: 'python', from: '#34d399', to: '#06b6d4' },
  { label: 'DevOps & Cloud Computing', icon: 'cloud', from: '#38bdf8', to: '#6366f1' },
  { label: 'Cybersecurity Training', icon: 'security', from: '#ef4444', to: '#f97316' },
  { label: 'Campus Placement Prep', icon: 'placement', from: '#a78bfa', to: '#ec4899' },
]


const REVIEWS = [
  { name: 'Harini S.', college: 'Anna University', text: 'Placed at TCS within 2 months of the training. The mock interviews were incredibly realistic.', stars: 5 },
  { name: 'Karthik R.', college: 'SRM Institute', text: 'The Java bootcamp was intense — exactly what you need to crack product company interviews.', stars: 5 },
  { name: 'Meena P.', college: 'VIT Chennai', text: 'SODAK trainers have real industry exposure. Not just theory — real project experience.', stars: 5 },
  { name: 'Arun T.', college: 'PSG Tech', text: 'The cybersecurity track prepared me for CEH. Got placed at Wipro Cyber Security division.', stars: 5 },
  { name: 'Divya L.', college: 'Sathyabama University', text: 'Cloud fundamentals taught here were way ahead of what we covered in college.', stars: 5 },
  { name: 'Rahul G.', college: 'KCG College', text: 'Excellent trainers. The hands-on labs made all the difference during the placement drive.', stars: 5 },
]


export const revalidate = 60

export default async function HomePage() {
  const [mentorsResult, stacksResult, settings] = await Promise.all([
    listMentors({ isPublished: true, perPage: 12 }).catch(() => ({ data: [], pagination: { total: 0, page: 1, perPage: 12, pages: 0 } })),
    listStacks().catch(() => []),
    getSettings().catch(() => null),
  ])

  const mentors = mentorsResult.data ?? []
  const stacks   = Array.isArray(stacksResult) ? stacksResult : []

  return (
    <>
      {/* ── Hero ── */}
      <section className="home-hero">
        <div className="hero-center">
          <HeroReveal delay={0}>
            <h1 className="hero-headline">
              {settings?.heroHeadline ?? 'Launch Your Tech Career'}
            </h1>
          </HeroReveal>
          <HeroReveal delay={0.15}>
            <p className="hero-subtitle">
              {settings?.heroSubhead ?? 'Expert-led campus placement training for engineering students across Tamil Nadu'}
            </p>
          </HeroReveal>
          <HeroReveal delay={0.25}>
            <StackCycler items={HERO_STACKS} />
          </HeroReveal>
          <HeroReveal delay={0.35}>
            <div className="hero-ctas">
              <Link href="/programs" className="btn hero-btn-primary btn-lg">Explore Programs</Link>
              <Link href="/contact" className="btn hero-btn-secondary btn-lg">Book a Visit</Link>
            </div>
          </HeroReveal>
          <HeroReveal delay={0.45}>
            <div className="hero-trust">
              <span>Free demo class</span>
              <span>No registration fee</span>
            </div>
          </HeroReveal>
        </div>
      </section>

      {/* ── Companies Marquee ── */}
      <section className="companies-section" style={{ padding: '60px 0 40px', background: '#f8fafc' }}>
        <div className="container text-center" style={{ marginBottom: 32 }}>
          <p className="section-eyebrow">Our Mentors</p>
          <h2 className="t-h2 c-heading" style={{ marginBottom: 0 }}>Top Companies Our Mentors Working In</h2>
        </div>
        <CompanyLogos companies={[
          { name: 'Zoho', logo: '/images/companies/zoho.svg', fallback: '/images/companies/zoho.svg' },
          { name: 'TCS', logo: '/images/companies/tcs.png', fallback: '/images/companies/tcs.svg' },
          { name: 'Deloitte', logo: '/images/companies/deloitte.svg', fallback: '/images/companies/deloitte.svg' },
          { name: 'Accenture', logo: '/images/companies/accenture.svg', fallback: '/images/companies/accenture.svg' },
          { name: 'Cognizant', logo: '/images/companies/cognizant.svg', fallback: '/images/companies/cognizant.svg' },
          { name: 'PayPal', logo: '/images/companies/paypal.svg', fallback: '/images/companies/paypal.svg' },
          { name: 'Amazon', logo: '/images/companies/amazon.png', fallback: '/images/companies/amazon.svg' },
          { name: 'Northern Arc', logo: '/images/companies/northern-arc.svg', fallback: '/images/companies/northern-arc.svg' },
        ]} />
      </section>

      {/* ── Who We Are ── */}
      <section className="who-section">
        <div className="container">
          <ScrollReveal>
            <div className="who-grid">
              {/* Left column — text */}
              <div>
                <p style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const,
                  color: '#2563EB',
                  marginBottom: 12,
                }}>
                  Who We Are
                </p>
                <h2 style={{
                  fontFamily: 'var(--font-plus-jakarta), sans-serif',
                  fontSize: 'clamp(1.4rem, 2.8vw, 2.2rem)',
                  fontWeight: 700,
                  lineHeight: 1.18,
                  color: '#172554',
                  margin: '0 0 18px',
                }}>
                  From a Campus Coaching Unit to Chennai&apos;s Most Trusted Placement Partner
                </h2>
                <p style={{
                  fontFamily: 'var(--font-inter), sans-serif',
                  fontSize: 15,
                  lineHeight: 1.75,
                  color: '#334155',
                  margin: '0 0 4px',
                }}>
                  Founded in 2016 by engineers who had been through the campus placement grind, SODAK Technology trains with working engineers as trainers — every one of them currently employed at the companies your students aspire to join.
                </p>

                {/* Stats */}
                {(() => {
                  const stats = settings?.stats as Record<string, unknown> | null
                  const trainers = Number(stats?.trainers) || 10
                  const studentsTrained = Number(stats?.studentsTrained) || 1000
                  return (
                <div className="who-stats-row">
                  {[
                    { value: trainers, suffix: '+', label: 'No. of Trainers' },
                    { value: studentsTrained, suffix: '+', label: 'Students Trained' },
                  ].map(s => (
                    <div key={s.label} className="who-stat">
                      <div className="who-stat-value">
                        <StatCounter value={s.value} suffix={s.suffix} />
                      </div>
                      <div className="who-stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
                  )
                })()}

                {/* CTA */}
                <Link href="/about" className="btn btn-ghost arrow-link" style={{ marginTop: 4 }}>
                  Learn More About Us <span className="arrow-icon">→</span>
                </Link>
              </div>

              {/* Right column — team image */}
              <div className="who-image">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={settings?.aboutImageUrl ?? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800'}
                  alt="SODAK Technology training team collaborating"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Institution Marquee (hidden) ── */}

      {/* ── Mentors Carousel ── */}
      {mentors.length > 0 && (
        <section className="mentor-marquee-section" id="mentors" aria-labelledby="mentor-heading">
          <div className="container">
            <ScrollReveal>
              <div className="section-header text-center">
                <p className="section-eyebrow">Our industry mentors</p>
                <h2 className="t-h2 c-heading" id="mentor-heading">Learn from Industry Leaders</h2>
                <p>Working professionals who bring real-world experience into every learning session.</p>
              </div>
            </ScrollReveal>
          </div>

          <MentorCarousel mentors={mentors} />

          <ScrollReveal delay={0.35}>
            <div className="container text-center" style={{ marginTop: 32 }}>
              <Link href="/mentors" className="btn btn-outline-white arrow-link">Explore all mentors <span className="arrow-icon">→</span></Link>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* ── Technology Stacks ── */}
      {stacks.length > 0 && (
        <section className="s-alt">
          <div className="container">
            <div className="section-header text-center">
              <p className="section-eyebrow">What We Teach</p>
              <h2 className="t-h2 c-heading">Industry-Relevant Technology Stacks</h2>
              <p className="dark" style={{ margin: '10px auto 0', maxWidth: 600 }}>
                From full stack web to cybersecurity — our programs are built around what companies actually hire for.
              </p>
            </div>
            <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20, marginTop: 36 }}>
              {stacks.slice(0, 6).map(stack => (
                <ScrollReveal key={stack.id}>
                  <Link href={`/training/${stack.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                    <div className="teach-card">
                      <div className="teach-icon" style={{ color: stack.colorToken ?? '#2563eb' }}>
                        <StackIcon slug={stack.slug} size={26} />
                      </div>
                      <p className="teach-title">{stack.name}</p>
                      <p className="teach-desc">{stack.summary}</p>
                      <div className="teach-tags">
                        {(stack.technologies ?? []).slice(0, 4).map((tech: { name: string; logoUrl: string | null; displayOrder: number }) => (
                          <span key={tech.name} className="badge">{tech.name}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </StaggerContainer>
            <div className="text-center" style={{ marginTop: 36 }}>
              <Link href="/training" className="btn btn-ghost arrow-link">View All Stacks <span className="arrow-icon">→</span></Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Partner Institutions (hidden) ── */}

      {/* ── Programs ── */}
      <section className="s-light">
        <div className="container">
          <div className="section-header text-center">
            <p className="section-eyebrow">Our Programs</p>
            <h2 className="t-h2 c-heading">Placement Training Tracks</h2>
            <p className="dark" style={{ margin: '10px auto 0', maxWidth: 560 }}>
              Five structured tracks and a custom option — designed to fit any campus placement requirement.
            </p>
          </div>
          <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, marginTop: 40 }}>
            {[
              { label:'Full Stack Web', icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>, color:'#3b82f6', href:'/programs' },
              { label:'Java & Backend', icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z"/></svg>, color:'#f97316', href:'/programs' },
              { label:'Python & ML',    icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>, color:'#eab308', href:'/programs' },
              { label:'DevOps & Cloud', icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>, color:'#6366f1', href:'/programs' },
              { label:'Cybersecurity',  icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>, color:'#ef4444', href:'/programs' },
              { label:'Custom Program', icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>, color:'#22c55e', href:'/contact'  },
            ].map(p => (
              <ScrollReveal key={p.label}>
                <Link href={p.href} style={{ textDecoration: 'none' }}>
                  <div className="card card-light" style={{ textAlign: 'center', padding: '32px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                      <div className="icon-box" style={{ margin: '0 auto' }}>{p.icon}</div>
                    </div>
                    <p className="t-card c-heading">{p.label}</p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </StaggerContainer>
          <div className="text-center" style={{ marginTop: 36 }}>
            <Link href="/programs" className="btn btn-ghost arrow-link">View Full Curriculum <span className="arrow-icon">→</span></Link>
          </div>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="s-dark">
        <div className="container text-center" style={{ maxWidth: 780, margin: '0 auto' }}>
          <p className="section-eyebrow text-center">Student Success</p>
          <blockquote className="t-lg c-heading" style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.5, margin: '20px 0 28px', fontStyle: 'italic' }}>
            &ldquo;SODAK Technology&apos;s placement training changed my life. Three months after the bootcamp I got placed at Infosys — the mock interviews here were harder than the real thing!&rdquo;
          </blockquote>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
            <div className="avatar avatar-md" style={{ background: '#eff6ff', color: '#2563eb', fontSize: 18 }}>S</div>
            <div style={{ textAlign: 'left' }}>
              <p className="t-sm c-heading fw-600">Sivapriya N.</p>
              <p className="t-micro c-muted">Placed at Infosys · SRM Institute of Technology</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Platform ── */}
      <section className="s-alt">
        <div className="container">
          <div className="section-header text-center">
            <p className="section-eyebrow">The Platform</p>
            <h2 className="t-h2 c-heading">Tools Built for Campus Placement</h2>
            <p className="dark" style={{ margin: '10px auto 0', maxWidth: 560 }}>
              Our proprietary tools are designed to assess, practice, and certify students for industry roles.
            </p>
          </div>
          <StaggerContainer className="platform-grid">
            {[
              { icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>, title:'SODAK LMS', desc:'Structured learning paths with video lessons, quizzes, and progress tracking.', href:'/platform/lms' },
              { icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>, title:'SODAK CTF', desc:'Capture-the-Flag competitions to build practical cybersecurity skills.', href:'/platform/ctf' },
              { icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>, title:'Assessment Engine', desc:'AI-proctored aptitude and coding tests mirroring company formats.', href:'/platform/assessments' },
            ].map(p => (
              <ScrollReveal key={p.title} className="h-full">
                <Link href={p.href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                  <div className="card card-light" style={{ height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', marginBottom: 14 }}>
                      <div className="icon-box">{p.icon}</div>
                    </div>
                    <p className="t-h3 c-heading" style={{ marginBottom: 8 }}>{p.title}</p>
                    <div style={{ flex: 1 }}><p className="t-sm c-body">{p.desc}</p></div>
                    <p className="t-sm arrow-link" style={{ color: '#2563eb', fontWeight: 600, marginTop: 14 }}>Learn more <span className="arrow-icon">→</span></p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Reviews Marquee ── */}
      <section className="s-light" style={{ overflow: 'hidden', padding: '48px 0' }}>
        <div className="container text-center" style={{ paddingBottom: 0 }}>
          <p className="section-eyebrow">Student Reviews</p>
          <h2 className="t-h2 c-heading" style={{ marginBottom: 32 }}>What Students Say</h2>
        </div>
        <div className="marquee-wrap" style={{ marginBottom: 12 }}>
          <div className="marquee-track">
            {[...REVIEWS, ...REVIEWS].map((r, i) => (
              <div key={i} className="review-card">
                <div className="review-stars">{'★'.repeat(r.stars)}</div>
                <p className="t-sm c-muted" style={{ margin: '10px 0 12px' }}>&ldquo;{r.text}&rdquo;</p>
                <p className="t-sm c-heading fw-600">{r.name}</p>
                <p className="t-micro c-muted">{r.college}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="marquee-wrap">
          <div className="marquee-track-reverse">
            {[...REVIEWS.slice().reverse(), ...REVIEWS.slice().reverse()].map((r, i) => (
              <div key={i} className="review-card">
                <div className="review-stars">{'★'.repeat(r.stars)}</div>
                <p className="t-sm c-muted" style={{ margin: '10px 0 12px' }}>&ldquo;{r.text}&rdquo;</p>
                <p className="t-sm c-heading fw-600">{r.name}</p>
                <p className="t-micro c-muted">{r.college}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="cta-gold">
        <div className="container">
          <div>
            <h2>Ready to Transform Your Campus Placements?</h2>
            <p>Book a free demo session — we come to your campus. No commitments.</p>
          </div>
          <Link href="/contact" className="btn-cta arrow-link">Book a Free Demo <span className="arrow-icon">→</span></Link>
        </div>
      </div>
    </>
  )
}
