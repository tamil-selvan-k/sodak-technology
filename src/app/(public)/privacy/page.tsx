import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — SODAK Technology',
  description: 'Privacy policy for SODAK Technology web platform.',
}

export default function PrivacyPage() {
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 18 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">Privacy Policy</span>
          </div>
          <h1 className="t-page c-white">Privacy Policy</h1>
          <p className="t-sm c-muted" style={{ marginTop: 10 }}>Last updated: January 2026</p>
        </div>
      </div>

      <section className="s-light">
        <div className="container-sm">
          <div className="prose">
            <h2>1. Information We Collect</h2>
            <p>When you submit an enquiry through our website, we collect your name, email address, phone number, and institution name. We also collect standard server log data (IP address, browser type, referring URL) and UTM parameters to understand how you found us.</p>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information you provide to respond to your enquiry, schedule training sessions, send relevant updates about our programs, and improve our website. We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>

            <h2>3. Data Storage and Security</h2>
            <p>Your data is stored on Supabase (PostgreSQL) servers located within the European Union. We use industry-standard encryption in transit (HTTPS/TLS) and at rest. Admin access to the database is protected by two-factor authentication.</p>

            <h2>4. Cookies</h2>
            <p>We use strictly necessary cookies for session management and analytics cookies (anonymous, aggregated). No third-party advertising cookies are used.</p>

            <h2>5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. To exercise these rights, email us at <a href="mailto:hello@sodakedutech.in" style={{ color: '#00a0ff' }}>hello@sodakedutech.in</a>.</p>

            <h2>6. Contact</h2>
            <p>For privacy-related queries, contact SODAK Technology Pvt. Ltd., Chennai, Tamil Nadu 600 001 · hello@sodakedutech.in</p>
          </div>
        </div>
      </section>
    </>
  )
}
