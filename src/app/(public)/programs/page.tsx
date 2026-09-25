import Link from 'next/link'
import { listPrograms } from '@/modules/programs/programs.service'

export const revalidate = 60

const TRACKS = [
  { code:'A', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>, label:'Full Stack Web',   color:'#3b82f6', duration:'90 days', mode:'On-campus' },
  { code:'B', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z"/></svg>, label:'Java & Backend',    color:'#f97316', duration:'75 days', mode:'On-campus' },
  { code:'C', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>, label:'Python & ML',      color:'#eab308', duration:'60 days', mode:'Hybrid'    },
  { code:'D', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>, label:'DevOps & Cloud',   color:'#6366f1', duration:'45 days', mode:'Hybrid'    },
  { code:'E', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>, label:'Cybersecurity',    color:'#ef4444', duration:'60 days', mode:'On-campus' },
  { code:'✦', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>, label:'Custom Program',  color:'#22c55e', duration:'Flexible', mode:'Any'       },
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
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: track.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff' }}>
                    {track.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                      <h3 className="t-h3 c-white">{program?.title ?? track.label}</h3>
                    </div>
                    {program?.summary && <p className="t-body c-muted" style={{ marginBottom: 12 }}>{program.summary}</p>}
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      <span className="t-sm c-muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>{program?.duration ?? track.duration}</span>
                      <span className="t-sm c-muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>{program?.deliveryMode?.replace('_', '-') ?? track.mode}</span>
                      {program?.targetAudience && <span className="t-sm c-muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>{program.targetAudience}</span>}
                    </div>
                    {program?.outcomes && (program.outcomes as string[]).length > 0 && (
                      <div style={{ marginTop: 14 }}>
                        {(program.outcomes as string[]).slice(0, 2).map((o: string) => (
                          <p key={o} className="t-sm c-muted" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>{o}</p>
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
              { icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3H3v18h18V3H5zm8 14H7v-2h6v2zm0-4H7v-2h6v2zm0-4H7V7h6v2zm4 8h-2V7h2v10z"/></svg>, title:'On-Campus Delivery', desc:'We come to your college — no student travel, no logistics.' },
              { icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M12 14c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z"/></svg>, title:'Industry Trainers',  desc:'All trainers are currently employed at top MNCs.' },
              { icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>, title:'Hands-on Labs',      desc:'Practice on real tools — not just slides and theory.' },
              { icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3-8c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z"/></svg>, title:'Placement-First',    desc:'Every session is mapped to what interviewers actually ask.' },
            ].map(f => (
              <div key={f.title} className="card card-light" style={{ textAlign: 'center', padding: '28px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>{f.icon}</div>
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
