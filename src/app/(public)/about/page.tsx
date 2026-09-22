import Link from 'next/link'
import { listTrainers } from '@/modules/trainers/trainers.service'
import { getSettings } from '@/modules/settings/settings.service'
import StatCounter from '@/components/ui/StatCounter'

export const revalidate = 60

const TIMELINE = [
  { year: '2016', title: 'SODAK Founded', desc: 'Started as a small placement coaching unit serving 3 colleges in Chennai.' },
  { year: '2018', title: 'Expanded to 50+ Colleges', desc: 'Grew our network to 50+ partner institutions across Tamil Nadu.' },
  { year: '2020', title: 'Launched CTF Platform', desc: 'Built SODAK CTF — a gamified cybersecurity practice platform for students.' },
  { year: '2022', title: '5000+ Placements', desc: 'Crossed the milestone of 5,000 students placed at top MNCs.' },
  { year: '2024', title: 'Pan-India Expansion', desc: 'Opened operations in Bengaluru, Coimbatore, and Hyderabad.' },
]

const VALUES = [
  { icon:'🏭', title:'Practice-led Training', desc:'Every module includes hands-on labs and real-world projects — theory alone does not place students.' },
  { icon:'🤝', title:'Placement-first Focus', desc:'We measure our success by your placement rate, not by course completion certificates.' },
  { icon:'🔒', title:'Industry Integrity',    desc:'All trainers sign NDAs and follow strict content accuracy standards before entering classrooms.' },
]

export default async function AboutPage() {
  const [trainersResult, settings] = await Promise.all([
    listTrainers({ isPublished: true, perPage: 8 }).catch(() => ({ data: [] })),
    getSettings().catch(() => null),
  ])
  const trainers = trainersResult.data ?? []
  const stats = (settings?.stats ?? { placements: 5000, colleges: 500, trainers: 50, years: 8 }) as Record<string, number>

  return (
    <>
      {/* Page hero */}
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 18 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">About</span>
          </div>
          <h1 className="t-page c-white" style={{ marginBottom: 12 }}>About SODAK Technology</h1>
          <p className="t-lg c-muted" style={{ maxWidth: 560 }}>
            We are Chennai&apos;s most trusted campus placement training company — founded by engineers, for engineers.
          </p>
        </div>
      </div>

      {/* Story + stats */}
      <section className="s-dark">
        <div className="container">
          <div className="two-col" style={{ alignItems: 'start' }}>
            <div>
              <p className="section-eyebrow">Our Story</p>
              <h2 className="t-h1 c-white" style={{ marginBottom: 20 }}>
                Building Careers Since 2016
              </h2>
              <p className="t-lg c-muted" style={{ marginBottom: 16 }}>
                SODAK Technology was founded in Chennai with a single mission: give college students the practical, industry-level training that coursework alone can never provide.
              </p>
              <p className="t-body c-muted" style={{ marginBottom: 16 }}>
                Our founding team were engineers who had been through the grind — campus drives, aptitude tests, technical rounds, and HR interviews. They knew exactly what students were missing and built SODAK to fill that gap.
              </p>
              <p className="t-body c-muted">
                Today we train across 1000+ colleges, with a roster of 50+ working engineers as trainers — every one of them currently employed at the same companies your students aspire to join.
              </p>
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { value: stats.placements ?? 5000, suffix: '+', label: 'Placements' },
                  { value: stats.colleges   ?? 500,  suffix: '+', label: 'Partner Colleges' },
                  { value: stats.trainers   ?? 50,   suffix: '+', label: 'Expert Trainers' },
                  { value: stats.years      ?? 8,    suffix: '+', label: 'Years Active' },
                ].map(s => (
                  <div key={s.label} className="card card-dark" style={{ textAlign: 'center', padding: '24px 16px' }}>
                    <div className="stat-value" style={{ fontSize: 32 }}>
                      <StatCounter value={s.value} suffix={s.suffix} />
                    </div>
                    <p className="stat-label" style={{ marginTop: 6 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & values */}
      <section className="s-light">
        <div className="container">
          <div className="section-header text-center">
            <p className="section-eyebrow">Our Values</p>
            <h2 className="t-h1 c-heading">What We Stand For</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, marginTop: 40 }}>
            {VALUES.map(v => (
              <div key={v.title} className="card card-light">
                <div style={{ fontSize: 40, marginBottom: 14 }}>{v.icon}</div>
                <p className="t-h3 c-heading" style={{ marginBottom: 10 }}>{v.title}</p>
                <p className="t-sm c-body">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      {trainers.length > 0 && (
        <section className="s-dark">
          <div className="container">
            <div className="section-header text-center">
              <p className="section-eyebrow">Our Team</p>
              <h2 className="t-h1 c-white">The Engineers Behind SODAK</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, marginTop: 40 }}>
              {trainers.slice(0, 8).map((t: { id: string; name: string; slug: string; designation: string | null; currentCompany: string | null }) => (
                <Link key={t.id} href={`/trainers/${t.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="card card-dark" style={{ textAlign: 'center', padding: '24px 16px' }}>
                    <div className="avatar avatar-lg" style={{ margin: '0 auto 12px', background: 'rgba(0,160,255,0.15)', fontSize: 24 }}>
                      {t.name.charAt(0)}
                    </div>
                    <p className="t-sm c-white fw-600">{t.name}</p>
                    <p className="t-micro c-muted" style={{ marginTop: 4 }}>{t.designation}</p>
                    {t.currentCompany && <p className="t-micro" style={{ color: '#00a0ff', marginTop: 4 }}>{t.currentCompany}</p>}
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center" style={{ marginTop: 36 }}>
              <Link href="/trainers" className="btn btn-outline">Meet All Trainers →</Link>
            </div>
          </div>
        </section>
      )}

      {/* Timeline */}
      <section className="s-light">
        <div className="container">
          <div className="section-header text-center">
            <p className="section-eyebrow">Our Journey</p>
            <h2 className="t-h1 c-heading">Building Towards Excellence</h2>
          </div>
          <div className="timeline" style={{ maxWidth: 640, margin: '40px auto 0' }}>
            {TIMELINE.map((item, i) => (
              <div key={item.year} className="timeline-item">
                <div className="timeline-line">
                  <div className="timeline-dot" />
                  {i < TIMELINE.length - 1 && <div className="timeline-rail" />}
                </div>
                <div className="timeline-content" style={{ paddingLeft: 20 }}>
                  <p className="timeline-year">{item.year}</p>
                  <p className="t-card c-heading" style={{ marginBottom: 6 }}>{item.title}</p>
                  <p className="t-sm c-body">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-gold">
        <div className="container">
          <div>
            <h2>Partner With SODAK Technology</h2>
            <p>Bring world-class placement training to your campus — backed by 8+ years of results.</p>
          </div>
          <Link href="/contact" className="btn-cta">Start a Conversation →</Link>
        </div>
      </div>
    </>
  )
}
