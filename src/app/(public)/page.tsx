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
              <div className="badge badge-gold" style={{ marginBottom: 20 }}>
                🏆 &nbsp;Chennai&apos;s Top Campus Placement Trainers
              </div>
              <h1 className="t-hero c-white" style={{ marginBottom: 20 }}>
                {settings?.heroHeadline ?? 'Launch Your Tech Career'}
              </h1>
              <p className="t-lg c-muted" style={{ marginBottom: 32, maxWidth: 520 }}>
                {settings?.heroSubhead ?? 'Expert-led campus placement training trusted by 500+ colleges across Tamil Nadu'}
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
                <div style={{ fontSize: 48, marginBottom: 8 }}>🎓</div>
                <p className="t-card c-white">Campus Training</p>
                <p className="t-sm c-muted">Delivered on-site at your institution</p>
              </div>
              <div className="card-dark card" style={{ padding: '20px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>💼</div>
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
                <Link key={stack.id} href={`/training/${stack.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="card card-light" style={{ padding: '28px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                      <div style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>{stack.icon ?? '💻'}</div>
                      <div>
                        <p className="t-card c-heading">{stack.name}</p>
                        <p className="t-sm c-body" style={{ marginTop: 4 }}>{stack.summary}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
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
            <p>We deliver on-campus training directly inside your institution — no student travel required.</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 40 }}>
            {TRUST_BADGES.map(name => (
              <div key={name} className="badge badge-dark badge-lg">{name}</div>
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
              { code:'A', label:'Full Stack Web', icon:'🌐', color:'#3b82f6', href:'/programs' },
              { code:'B', label:'Java & Backend', icon:'☕', color:'#f97316', href:'/programs' },
              { code:'C', label:'Python & ML',    icon:'🐍', color:'#eab308', href:'/programs' },
              { code:'D', label:'DevOps & Cloud', icon:'☁️', color:'#6366f1', href:'/programs' },
              { code:'E', label:'Cybersecurity',  icon:'🔐', color:'#ef4444', href:'/programs' },
              { code:'✦', label:'Custom Program', icon:'⚙️', color:'#22c55e', href:'/contact'  },
            ].map(p => (
              <Link key={p.code} href={p.href} style={{ textDecoration: 'none' }}>
                <div className="card card-light" style={{ textAlign: 'center', padding: '32px 20px' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{p.icon}</div>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: p.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, margin: '0 auto 10px' }}>
                    {p.code}
                  </div>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20, marginTop: 40 }}>
            {[
              { icon:'🚩', title:'SODAK CTF', desc:'Capture-the-Flag competitions to build practical cybersecurity skills.', href:'/platform/ctf' },
              { icon:'📚', title:'SODAK LMS', desc:'Structured learning paths with video lessons, quizzes, and progress tracking.', href:'/platform/lms' },
              { icon:'📊', title:'Assessment Engine', desc:'AI-proctored aptitude and coding tests mirroring company formats.', href:'/platform/assessments' },
            ].map(p => (
              <Link key={p.title} href={p.href} style={{ textDecoration: 'none' }}>
                <div className="card card-light">
                  <div style={{ fontSize: 36, marginBottom: 14 }}>{p.icon}</div>
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
