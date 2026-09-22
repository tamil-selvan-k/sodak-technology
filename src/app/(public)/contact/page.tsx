import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact SODAK Technology',
  description: 'Get in touch to book a campus placement training program or general enquiry.',
}

export default function ContactPage() {
  return (
    <>
      {/* Page hero */}
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 18 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">Contact</span>
          </div>
          <h1 className="t-page c-white" style={{ marginBottom: 12 }}>Get in Touch</h1>
          <p className="t-lg c-muted" style={{ maxWidth: 520 }}>
            Book a free demo session, enquire about programs, or just say hello. We respond within one business day.
          </p>
        </div>
      </div>

      {/* Contact content */}
      <section className="s-dark">
        <div className="container">
          <div className="two-col" style={{ alignItems: 'start' }}>
            {/* Enquiry form */}
            <div>
              <p className="section-eyebrow" style={{ marginBottom: 12 }}>Send an Enquiry</p>
              <div className="card card-dark">
                <form action="/api/v1/leads" method="POST" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* honeypot */}
                  <input type="text" name="website_url" aria-hidden="true" tabIndex={-1} style={{ display: 'none' }} />

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label c-muted" htmlFor="name">Your Name *</label>
                      <input id="name" name="name" type="text" required className="form-input" placeholder="Priya Krishnan" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label c-muted" htmlFor="phone">Phone Number *</label>
                      <input id="phone" name="phone" type="tel" required className="form-input" placeholder="+91 98765 43210" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label c-muted" htmlFor="email">Email Address *</label>
                    <input id="email" name="email" type="email" required className="form-input" placeholder="you@example.com" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }} />
                  </div>

                  <div className="form-group">
                    <label className="form-label c-muted" htmlFor="institution">Institution / College</label>
                    <input id="institution" name="institution" type="text" className="form-input" placeholder="Anna University, Chennai" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }} />
                  </div>

                  <div className="form-group">
                    <label className="form-label c-muted" htmlFor="enquiry_type">Enquiry Type</label>
                    <select id="enquiry_type" name="enquiry_type" className="form-input" style={{ background: 'rgba(15,30,60,0.95)', borderColor: 'rgba(255,255,255,0.12)', color: '#94a3b8' }}>
                      <option value="">Select a topic…</option>
                      <option value="campus_program">Campus Training Program</option>
                      <option value="corporate">Corporate / FDP Training</option>
                      <option value="mentoring">1-on-1 Mentoring</option>
                      <option value="placement_drive">Placement Drive</option>
                      <option value="general">General Enquiry</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label c-muted" htmlFor="message">Message</label>
                    <textarea id="message" name="message" className="form-input form-textarea" placeholder="Tell us about your requirements — student count, timeline, preferred topics…" rows={4} style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }} />
                  </div>

                  <button type="submit" className="btn btn-gold btn-full btn-lg">
                    Send Enquiry →
                  </button>
                  <p className="t-micro c-muted text-center">We respond within 1 business day. No spam, ever.</p>
                </form>
              </div>
            </div>

            {/* Contact info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card card-dark">
                <p className="section-eyebrow" style={{ marginBottom: 14 }}>Contact Details</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { icon: '📍', label: 'Address', value: 'Chennai, Tamil Nadu 600 001' },
                    { icon: '📞', label: 'Phone',   value: '+91 89393 66259', href: 'tel:+918939366259' },
                    { icon: '✉',  label: 'Email',   value: 'hello@sodakedutech.in', href: 'mailto:hello@sodakedutech.in' },
                    { icon: '💬', label: 'WhatsApp', value: 'Chat on WhatsApp', href: 'https://wa.me/918939366259?text=Hi%20SODAK%20Team' },
                  ].map(c => (
                    <div key={c.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 20, lineHeight: 1, marginTop: 2 }}>{c.icon}</span>
                      <div>
                        <p className="t-micro c-muted" style={{ marginBottom: 2 }}>{c.label}</p>
                        {c.href ? (
                          <a href={c.href} className="t-sm c-white" style={{ textDecoration: 'none' }}>{c.value}</a>
                        ) : (
                          <p className="t-sm c-white">{c.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card card-dark">
                <p className="section-eyebrow" style={{ marginBottom: 14 }}>Office Hours</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="t-sm c-muted">Mon – Fri</span>
                    <span className="t-sm c-white">9:00 AM – 6:00 PM</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="t-sm c-muted">Saturday</span>
                    <span className="t-sm c-white">10:00 AM – 2:00 PM</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="t-sm c-muted">Sunday</span>
                    <span className="t-sm c-muted">Closed</span>
                  </div>
                </div>
              </div>

              <div className="card card-dark">
                <p className="section-eyebrow" style={{ marginBottom: 10 }}>Follow Us</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { label: 'LinkedIn',  href: 'https://linkedin.com/company/sodakedutech' },
                    { label: 'Instagram', href: 'https://instagram.com/sodakedutech' },
                    { label: 'YouTube',   href: 'https://youtube.com/@sodakedutech' },
                    { label: 'Twitter',   href: 'https://twitter.com/sodakedutech' },
                  ].map(s => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                       className="badge badge-dark badge-lg" style={{ textDecoration: 'none' }}>
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
