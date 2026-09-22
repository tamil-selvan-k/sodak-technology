import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — SODAK Technology',
  description: 'Terms of service for SODAK Technology web platform.',
}

export default function TermsPage() {
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 18 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">Terms of Service</span>
          </div>
          <h1 className="t-page c-white">Terms of Service</h1>
          <p className="t-sm c-muted" style={{ marginTop: 10 }}>Last updated: January 2026</p>
        </div>
      </div>

      <section className="s-light">
        <div className="container-sm">
          <div className="prose">
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing the SODAK Technology website, you agree to be bound by these terms. If you do not agree, please do not use the website.</p>

            <h2>2. Services</h2>
            <p>SODAK Technology provides campus placement training programs, mentoring sessions, and technology education. All programs are subject to availability and the terms of individual agreements signed with your institution.</p>

            <h2>3. Enquiry Forms</h2>
            <p>By submitting an enquiry form, you consent to SODAK Technology contacting you via phone, email, or WhatsApp with information relevant to your enquiry. You may opt out at any time by emailing hello@sodakedutech.in.</p>

            <h2>4. Intellectual Property</h2>
            <p>All training materials, course content, website design, and branding are the intellectual property of SODAK Technology Pvt. Ltd. Reproduction or redistribution without written permission is prohibited.</p>

            <h2>5. Limitation of Liability</h2>
            <p>SODAK Technology makes no guarantees of employment outcomes. While we provide placement support, job offers depend on student performance and employer decisions beyond our control.</p>

            <h2>6. Governing Law</h2>
            <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Chennai, Tamil Nadu.</p>

            <h2>7. Contact</h2>
            <p>For questions about these terms, contact: SODAK Technology Pvt. Ltd., Chennai, Tamil Nadu 600 001 · hello@sodakedutech.in</p>
          </div>
        </div>
      </section>
    </>
  )
}
