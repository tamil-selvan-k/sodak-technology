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

      <section className="s-dark">
        <div className="container">
          {internships.length === 0 ? (
            <div className="text-center" style={{ padding: '60px 0' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>💼</div>
              <h2 className="t-h2 c-white" style={{ marginBottom: 10 }}>Internships coming soon</h2>
              <p className="t-body c-muted">New opportunities will be posted here. Express your interest via the form below.</p>
              <Link href="/contact" className="btn btn-outline" style={{ marginTop: 20 }}>Express Interest →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {internships.map(intern => (
                <div key={intern.id} className="card card-dark" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                  <div>
                    <p className="t-card c-white" style={{ marginBottom: 8 }}>{intern.roleTitle}</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span className="badge badge-dark">{intern.companyName}</span>
                      {intern.location      && <span className="badge badge-dark">📍 {intern.location}</span>}
                      {intern.duration      && <span className="badge badge-dark">⏱ {intern.duration}</span>}
                      {intern.stipendRange  && <span className="badge badge-green">₹ {intern.stipendRange}</span>}
                    </div>
                    {intern.description && <p className="t-sm c-muted" style={{ marginTop: 10 }}>{intern.description}</p>}
                    {intern.applicationDeadline && (
                      <p className="t-micro c-muted" style={{ marginTop: 8 }}>
                        Apply by {new Date(intern.applicationDeadline).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <Link href="/contact" className="btn btn-gold btn-sm" style={{ flexShrink: 0 }}>Apply →</Link>
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
