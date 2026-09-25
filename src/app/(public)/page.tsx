import Link from 'next/link'
import { listTrainers } from '@/modules/trainers/trainers.service'
import { listStacks } from '@/modules/stacks/stacks.service'
import { getSettings } from '@/modules/settings/settings.service'
import StatCounter from '@/components/ui/StatCounter'

const COMPANIES = [
  'TCS','Infosys','Wipro','HCL','Cognizant','Accenture','IBM','Capgemini',
  'Tech Mahindra','Mphasis','L&T Infotech','Hexaware','Zoho','Freshworks','Zomato',
]

const REVIEWS = [
  { name: 'Harini S.', college: 'Anna University', text: 'Placed at TCS within 2 months of the training. The mock interviews were incredibly realistic.', stars: 5 },
  { name: 'Karthik R.', college: 'SRM Institute', text: 'The Java bootcamp was intense — exactly what you need to crack product company interviews.', stars: 5 },
  { name: 'Meena P.', college: 'VIT Chennai', text: 'SODAK trainers have real industry exposure. Not just theory — real project experience.', stars: 5 },
  { name: 'Arun T.', college: 'PSG Tech', text: 'The cybersecurity track prepared me for CEH. Got placed at Wipro Cyber Security division.', stars: 5 },
  { name: 'Divya L.', college: 'Sathyabama University', text: 'Cloud fundamentals taught here were way ahead of what we covered in college.', stars: 5 },
  { name: 'Rahul G.', college: 'KCG College', text: 'Excellent trainers. The hands-on labs made all the difference during the placement drive.', stars: 5 },
]

const TRUST_BADGES = ['Anna University','IIT Madras','VIT','SRM','PSG Tech','Sathyabama','Saveetha','KCG College','Rajalakshmi','JEPPIAAR']

export const revalidate = 60

export default async function HomePage() {
  const [trainersResult, stacksResult, settings] = await Promise.all([
    listTrainers({ isPublished: true, perPage: 8 }).catch(() => ({ data: [] })),
    listStacks().catch(() => []),
    getSettings().catch(() => null),
  ])

  const trainers = trainersResult.data ?? []
  const stacks   = Array.isArray(stacksResult) ? stacksResult : []
  const stats    = (settings?.stats ?? { placements: 5000, colleges: 500, trainers: 50, years: 8 }) as Record<string, number>

  return (
    <>
      {/* ── Hero ── */}
      <section className="s-dark" style={{ padding: '80px 0 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 48, alignItems: 'center' }}>
            <div>
              <div className="badge badge-gold" style={{ marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>
                Chennai&apos;s Top Campus Placement Trainers
              </div>
              <h1 className="t-hero c-white" style={{ marginBottom: 20 }}>
                {settings?.heroHeadline ?? 'Launch Your Tech Career'}
              </h1>
              <p className="t-lg c-muted" style={{ marginBottom: 32, maxWidth: 520 }}>
                {settings?.heroSubhead ?? 'Expert-led campus placement training trusted by 1000+ colleges across Tamil Nadu'}
              </p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <Link href="/programs" className="btn btn-gold btn-lg">Explore Programs →</Link>
                <Link href="/contact" className="btn btn-outline btn-lg">Book a Visit</Link>
              </div>
              <div style={{ display: 'flex', gap: 24, marginTop: 32, flexWrap: 'wrap' }}>
                <span className="t-sm c-muted">✓ Free demo class</span>
                <span className="t-sm c-muted">✓ No registration fee</span>
                <span className="t-sm c-muted">✓ Placement guarantee*</span>
              </div>
            </div>
            <div className="hero-img-box" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card-dark card" style={{ padding: '20px 24px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg></div>
                <p className="t-card c-white">Campus Training</p>
                <p className="t-sm c-muted">Delivered on-site at your institution</p>
              </div>
              <div className="card-dark card" style={{ padding: '20px 24px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 3.15 16.85 2 15.5 2h-7C7.15 2 6 3.15 6 4.64c0 .48.11.92.18 1.36H4c-1.1 0-1.99.9-1.99 2L2 19c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-5 0H9V4.64c0-.35.29-.64.64-.64h4.72c.35 0 .64.29.64.64V6z"/></svg></div>
                <p className="t-card c-white">Placement Ready</p>
                <p className="t-sm c-muted">Mock interviews + resume workshops</p>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div style={{ display: 'flex', gap: 0, marginTop: 56, borderTop: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}>
            {[
              { value: stats.placements ?? 5000, suffix: '+', label: 'Students Placed' },
              { value: stats.colleges   ?? 500,  suffix: '+', label: 'Partner Colleges' },
              { value: stats.trainers   ?? 50,   suffix: '+', label: 'Expert Trainers' },
              { value: stats.years      ?? 8,    suffix: '+', label: 'Years of Excellence' },
            ].map(s => (
              <div key={s.label} className="hero-stat-glass">
                <div className="stat-value">
                  <StatCounter value={s.value} suffix={s.suffix} />
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Company Marquee ── */}
      <section className="s-dark s-sm">
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 0' }}>
          <div className="marquee-wrap">
            <div className="marquee-track">
              {[...TRUST_BADGES, ...TRUST_BADGES].map((name, i) => (
                <div key={i} className="marquee-item">{name}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Trainers ── */}
      {trainers.length > 0 && (
        <section className="s-dark">
          <div className="container">
            <div className="section-header text-center">
              <p className="section-eyebrow">Our Faculty</p>
              <h2 className="t-h1 c-white">Industry-Trained Experts</h2>
              <p>Our trainers are working engineers and architects from top MNCs — they teach what they practice every day.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, marginTop: 40 }}>
              {trainers.map(t => (
                <Link key={t.id} href={`/trainers/${t.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="card card-dark" style={{ textAlign: 'center', padding: '28px 20px' }}>
                    <div className="avatar avatar-lg" style={{ margin: '0 auto 14px', fontSize: 28, background: 'rgba(0,160,255,0.15)' }}>
                      {t.name.charAt(0)}
                    </div>
                    <p className="t-card c-white" style={{ marginBottom: 4 }}>{t.name}</p>
                    <p className="t-sm c-muted">{t.designation}</p>
                    {t.currentCompany && <p className="t-micro c-gold" style={{ marginTop: 6 }}>{t.currentCompany}</p>}
                    {t.expertiseTags?.slice(0, 2).map((tag: string) => (
                      <span key={tag} className="badge badge-dark" style={{ marginTop: 8, marginRight: 4 }}>{tag}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center" style={{ marginTop: 36 }}>
              <Link href="/trainers" className="btn btn-outline">View All Trainers →</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Technology Stacks ── */}
      {stacks.length > 0 && (
        <section className="s-light">
          <div className="container">
            <div className="section-header text-center">
              <p className="section-eyebrow">What We Teach</p>
              <h2 className="t-h1 c-heading">Industry-Relevant Technology Stacks</h2>
              <p className="dark" style={{ margin: '10px auto 0', maxWidth: 600 }}>
                From full stack web to cybersecurity — our programs are built around what companies actually hire for.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginTop: 40 }}>
              {stacks.map(stack => (
                <Link key={stack.id} href={`/training/${stack.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                  <div className="card card-light" style={{ padding: '28px 24px', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                      <div style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>{stack.icon ?? <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>}</div>
                      <div>
                        <p className="t-card c-heading">{stack.name}</p>
                        <p className="t-sm c-body" style={{ marginTop: 4 }}>{stack.summary}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
                      {(stack.technologies ?? []).slice(0, 4).map((tech: { name: string; logoUrl: string | null; displayOrder: number }) => (
                        <span key={tech.name} className="badge badge-light">{tech.name}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center" style={{ marginTop: 36 }}>
              <Link href="/training" className="btn btn-ghost">View All Stacks →</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Partner Institutions ── */}
      <section className="s-darker">
        <div className="container">
          <div className="section-header text-center">
            <p className="section-eyebrow">Our Network</p>
            <h2 className="t-h1 c-white">Trusted by Leading Institutions</h2>
            <p style={{ color: '#94a3b8' }}>We deliver on-campus training directly inside your institution — no student travel required.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginTop: 40, maxWidth: 700, margin: '40px auto 0' }}>
            {TRUST_BADGES.map(name => (
              <div key={name} className="badge badge-dark badge-lg" style={{ textAlign: 'center', justifyContent: 'center' }}>{name}</div>
            ))}
          </div>
          <div className="text-center" style={{ marginTop: 36 }}>
            <Link href="/institutions" className="btn btn-outline">See All Partners →</Link>
          </div>
        </div>
      </section>

      {/* ── Programs ── */}
      <section className="s-light">
        <div className="container">
          <div className="section-header text-center">
            <p className="section-eyebrow">Our Programs</p>
            <h2 className="t-h1 c-heading">Placement Training Tracks</h2>
            <p className="dark" style={{ margin: '10px auto 0', maxWidth: 560 }}>
              Five structured tracks and a custom option — designed to fit any campus placement requirement.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, marginTop: 40 }}>
            {[
              { label:'Full Stack Web', icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>, color:'#3b82f6', href:'/programs' },
              { label:'Java & Backend', icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z"/></svg>, color:'#f97316', href:'/programs' },
              { label:'Python & ML',    icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>, color:'#eab308', href:'/programs' },
              { label:'DevOps & Cloud', icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>, color:'#6366f1', href:'/programs' },
              { label:'Cybersecurity',  icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>, color:'#ef4444', href:'/programs' },
              { label:'Custom Program', icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>, color:'#22c55e', href:'/contact'  },
            ].map(p => (
              <Link key={p.label} href={p.href} style={{ textDecoration: 'none' }}>
                <div className="card card-light" style={{ textAlign: 'center', padding: '32px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>{p.icon}</div>
                  <p className="t-card c-heading">{p.label}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center" style={{ marginTop: 36 }}>
            <Link href="/programs" className="btn btn-ghost">View Full Curriculum →</Link>
          </div>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="s-dark">
        <div className="container text-center" style={{ maxWidth: 780, margin: '0 auto' }}>
          <p className="section-eyebrow text-center">Student Success</p>
          <blockquote className="t-lg c-white" style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.5, margin: '20px 0 28px', fontStyle: 'italic' }}>
            &ldquo;SODAK Technology&apos;s placement training changed my life. Three months after the bootcamp I got placed at Infosys — the mock interviews here were harder than the real thing!&rdquo;
          </blockquote>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
            <div className="avatar avatar-md" style={{ background: 'rgba(0,160,255,0.2)', fontSize: 18 }}>S</div>
            <div style={{ textAlign: 'left' }}>
              <p className="t-sm c-white fw-600">Sivapriya N.</p>
              <p className="t-micro c-muted">Placed at Infosys · SRM Institute of Technology</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Platform ── */}
      <section className="s-light">
        <div className="container">
          <div className="section-header text-center">
            <p className="section-eyebrow">The Platform</p>
            <h2 className="t-h1 c-heading">Tools Built for Campus Placement</h2>
            <p className="dark" style={{ margin: '10px auto 0', maxWidth: 560 }}>
              Our proprietary tools are designed to assess, practice, and certify students for industry roles.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 40, maxWidth: 900, margin: '40px auto 0' }}>
            {[
              { icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>, title:'SODAK LMS', desc:'Structured learning paths with video lessons, quizzes, and progress tracking.', href:'/platform/lms' },
              { icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>, title:'SODAK CTF', desc:'Capture-the-Flag competitions to build practical cybersecurity skills.', href:'/platform/ctf' },
              { icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>, title:'Assessment Engine', desc:'AI-proctored aptitude and coding tests mirroring company formats.', href:'/platform/assessments' },
            ].map(p => (
              <Link key={p.title} href={p.href} style={{ textDecoration: 'none' }}>
                <div className="card card-light">
                  <div style={{ display: 'flex', marginBottom: 14 }}>{p.icon}</div>
                  <p className="t-h3 c-heading" style={{ marginBottom: 8 }}>{p.title}</p>
                  <p className="t-sm c-body">{p.desc}</p>
                  <p className="t-sm" style={{ color: '#00a0ff', marginTop: 14 }}>Learn more →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews Marquee ── */}
      <section className="s-darker" style={{ overflow: 'hidden', padding: '48px 0' }}>
        <div className="container" style={{ paddingBottom: 0 }}>
          <p className="section-eyebrow text-center">Student Reviews</p>
          <h2 className="t-h2 c-white text-center" style={{ marginBottom: 32 }}>What Students Say</h2>
        </div>
        <div className="marquee-wrap" style={{ marginBottom: 12 }}>
          <div className="marquee-track">
            {[...REVIEWS, ...REVIEWS].map((r, i) => (
              <div key={i} className="review-card">
                <div className="review-stars">{'★'.repeat(r.stars)}</div>
                <p className="t-sm c-muted" style={{ margin: '10px 0 12px' }}>&ldquo;{r.text}&rdquo;</p>
                <p className="t-sm c-white fw-600">{r.name}</p>
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
                <p className="t-sm c-white fw-600">{r.name}</p>
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
          <Link href="/contact" className="btn-cta">Book a Free Demo →</Link>
        </div>
      </div>
    </>
  )
}
