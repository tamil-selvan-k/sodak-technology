import type { Metadata } from 'next'
import Link from 'next/link'
import { listInternships } from '@/modules/internships/internships.service'
import type { Internship } from '@prisma/client'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'Internships — SODAK Technology',
  description: 'Internship opportunities at SODAK Technology and our partner companies.',
}

export default async function InternshipsPage() {
  const { data: internships } = await listInternships({ perPage: 30 }).catch(() => ({ data: [] as Internship[] }))

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 18 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">Internships</span>
          </div>
          <h1 className="t-page c-white" style={{ marginBottom: 12 }}>Internship Opportunities</h1>
          <p className="t-lg c-muted" style={{ maxWidth: 560 }}>
            Paid and unpaid internship positions with SODAK Technology and our network of partner companies.
          </p>
        </div>
      </div>

      <section className="s-alt">
        <div className="container">
          {internships.length === 0 ? (
            <div className="text-center" style={{ padding: '60px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: '#3b82f6' }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                </svg>
              </div>
              <h2 className="t-h2 c-heading" style={{ marginBottom: 10 }}>Internships coming soon</h2>
              <p className="t-body c-muted">New opportunities will be posted here. Express your interest via the form below.</p>
              <Link href="/contact" className="btn btn-outline" style={{ marginTop: 20 }}>Express Interest →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 860, margin: '0 auto' }}>
              {internships.map(intern => (
                <div key={intern.id} style={{
                  background: '#ffffff',
                  border: '1px solid #dbeafe',
                  borderLeft: '4px solid #2563eb',
                  borderRadius: '1rem',
                  padding: '24px 28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 24,
                  flexWrap: 'wrap',
                  boxShadow: '0 2px 12px rgba(37,99,235,0.06)',
                  transition: 'box-shadow 0.2s',
                }}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <p style={{ fontSize: 18, fontWeight: 700, color: '#172554', marginBottom: 10 }}>{intern.roleTitle}</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                      <span style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #dbeafe', borderRadius: '2rem', padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>
                        {intern.companyName}
                      </span>
                      {intern.location && (
                        <span style={{ background: '#f1f5f9', color: '#475569', borderRadius: '2rem', padding: '3px 12px', fontSize: 12, fontWeight: 500 }}>
                          📍 {intern.location}
                        </span>
                      )}
                      {intern.duration && (
                        <span style={{ background: '#f1f5f9', color: '#475569', borderRadius: '2rem', padding: '3px 12px', fontSize: 12, fontWeight: 500 }}>
                          🕐 {intern.duration}
                        </span>
                      )}
                      {intern.stipendRange && (
                        <span style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '2rem', padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>
                          ₹ {intern.stipendRange}
                        </span>
                      )}
                    </div>
                    {intern.description && (
                      <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5, marginBottom: 8 }}>{intern.description}</p>
                    )}
                    {intern.applicationDeadline && (
                      <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                        Apply by {new Date(intern.applicationDeadline).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <Link href="/contact" className="btn btn-gold btn-sm" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>Apply →</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="cta-gold">
        <div className="container">
          <div>
            <h2>Looking for an Internship Partner?</h2>
            <p>We connect colleges with companies offering structured internship programs for students.</p>
          </div>
          <Link href="/contact" className="btn-cta">Partner With Us →</Link>
        </div>
      </div>
    </>
  )
}
