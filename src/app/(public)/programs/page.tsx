import Link from 'next/link'
import { listPrograms } from '@/modules/programs/programs.service'

export const revalidate = 60

const TRACKS = [
  { code:'A', icon:'🌐', label:'Full Stack Web',   color:'#3b82f6', duration:'90 days', mode:'On-campus' },
  { code:'B', icon:'☕', label:'Java & Backend',    color:'#f97316', duration:'75 days', mode:'On-campus' },
  { code:'C', icon:'🐍', label:'Python & ML',      color:'#eab308', duration:'60 days', mode:'Hybrid'    },
  { code:'D', icon:'☁️', label:'DevOps & Cloud',   color:'#6366f1', duration:'45 days', mode:'Hybrid'    },
  { code:'E', icon:'🔐', label:'Cybersecurity',    color:'#ef4444', duration:'60 days', mode:'On-campus' },
  { code:'✦', icon:'⚙️', label:'Custom Program',  color:'#22c55e', duration:'Flexible', mode:'Any'       },
]

export default async function ProgramsPage() {
  const { data: programs } = await listPrograms({ perPage: 20 }).catch(() => ({ data: [] }))

  return (
    <>
      {/* Page hero */}
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 18 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">Programs</span>
          </div>
          <h1 className="t-page c-white" style={{ marginBottom: 12 }}>Campus Training Programs</h1>
          <p className="t-lg c-muted" style={{ maxWidth: 560 }}>
            Five structured placement-training tracks + a fully custom option — designed for CS/IT/ECE colleges across Tamil Nadu.
          </p>
        </div>
      </div>

      {/* Tracks */}
      <section className="s-dark">
        <div className="container">
          <div className="section-header text-center">
            <p className="section-eyebrow">Training Tracks</p>
            <h2 className="t-h1 c-white">Choose Your Path</h2>
            <p>Each track is designed around what MNCs actually test during campus drives.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {TRACKS.map((track) => {
              const program = programs.find(p => p.trackCode === track.code)
              return (
                <div key={track.code} className="card card-dark" style={{ display: 'flex', alignItems: 'flex-start', gap: 24, padding: '28px 32px' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: track.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                    {track.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                      <h3 className="t-h3 c-white">{program?.title ?? track.label}</h3>
                    </div>
                    {program?.summary && <p className="t-body c-muted" style={{ marginBottom: 12 }}>{program.summary}</p>}
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      <span className="t-sm c-muted">⏱ {program?.duration ?? track.duration}</span>
                      <span className="t-sm c-muted">🏫 {program?.deliveryMode?.replace('_', '-') ?? track.mode}</span>
                      {program?.targetAudience && <span className="t-sm c-muted">🎓 {program.targetAudience}</span>}
                    </div>
                    {program?.outcomes && (program.outcomes as string[]).length > 0 && (
                      <div style={{ marginTop: 14 }}>
                        {(program.outcomes as string[]).slice(0, 2).map((o: string) => (
                          <p key={o} className="t-sm c-muted" style={{ marginBottom: 4 }}>✓ {o}</p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {program ? (
                      <Link href={`/programs/${program.slug}`} className="btn btn-gold">Details →</Link>
                    ) : (
                      <Link href="/contact" className="btn btn-outline">Enquire →</Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="s-light">
        <div className="container">
          <div className="section-header text-center">
            <p className="section-eyebrow">Why SODAK</p>
            <h2 className="t-h1 c-heading">What Makes Us Different</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, marginTop: 40 }}>
            {[
              { icon:'🏭', title:'On-Campus Delivery', desc:'We come to your college — no student travel, no logistics.' },
              { icon:'👨‍💼', title:'Industry Trainers',  desc:'All trainers are currently employed at top MNCs.' },
              { icon:'💻', title:'Hands-on Labs',      desc:'Practice on real tools — not just slides and theory.' },
              { icon:'🎯', title:'Placement-First',    desc:'Every session is mapped to what interviewers actually ask.' },
            ].map(f => (
              <div key={f.title} className="card card-light" style={{ textAlign: 'center', padding: '28px 20px' }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>{f.icon}</div>
                <p className="t-card c-heading" style={{ marginBottom: 8 }}>{f.title}</p>
                <p className="t-sm c-body">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-gold">
        <div className="container">
          <div>
            <h2>Customise a Program for Your Campus</h2>
            <p>Tell us your timeline and student count — we&apos;ll design a program that fits.</p>
          </div>
          <Link href="/contact" className="btn-cta">Get a Custom Quote →</Link>
        </div>
      </div>
    </>
  )
}
