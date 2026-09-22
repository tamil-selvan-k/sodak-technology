import type { Metadata } from 'next'
import Link from 'next/link'
import EnquiryForm from './_components/EnquiryForm'
import FaqAccordion from '@/components/ui/FaqAccordion'

export const metadata: Metadata = {
  title: 'Contact & Enquiry',
  description: 'Book a campus placement training program or ask a question. We respond within 24 hours.',
}

const CONTACT_FAQS = [
  {
    question: 'What is the minimum batch size you accept?',
    answer: "There's no hard minimum, but programs are most effective with 20+ students. We've delivered workshops for batches of 30 up to 250. Smaller batches get more 1:1 time; larger batches leverage our assessment platform for efficient screening.",
  },
  {
    question: 'Do you come to the campus or do students travel to you?',
    answer: "We come to you. All programs are delivered at your institution — in your labs, lecture halls, or online. We don't require students to travel anywhere.",
  },
  {
    question: 'How long does a typical program run?',
    answer: "Programs range from a 1-day bootcamp to a 6-week intensive depending on the track and batch calendar. We design around your academic schedule — not the other way around.",
  },
  {
    question: 'Can we combine multiple tracks?',
    answer: "Yes. Many colleges combine Placement Prep with Cloud & DevOps for final-year batches, or add Assessment Screening as the exit track. Tell us what you want and we'll scope it.",
  },
  {
    question: 'Do you offer certifications?',
    answer: "We issue SODAK Technology completion certificates. For cloud tracks, we align content to AWS/Azure certification paths and run practice assessments — but the certification exam is taken separately through the vendor.",
  },
  {
    question: 'What about corporate and FDP training?',
    answer: 'Yes — we run Faculty Development Programs (FDPs) and corporate upskilling programs. The process is the same: enquire here, we\'ll scope and propose.',
  },
]

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="s-darker" style={{ padding: '72px 0 60px' }}>
        <div className="container">
          <p className="section-eyebrow">Get in Touch</p>
          <h1 className="t-h1 c-white" style={{ maxWidth: 600, marginTop: 10 }}>
            Book a campus program or ask a question
          </h1>
          <p className="t-lg" style={{ color: '#94a3b8', marginTop: 14, maxWidth: 560, lineHeight: 1.75 }}>
            Share your placement calendar, batch size, and target companies — we&apos;ll design the right program and get back to you within 24 hours.
          </p>
        </div>
      </section>

      {/* Form + Sidebar */}
      <section className="s-light">
        <div className="container">
          <div className="two-col gap-48" style={{ alignItems: 'start' }}>

            {/* Left — Enquiry form */}
            <div>
              <h2 className="t-h2 c-heading" style={{ marginBottom: 6 }}>Send an enquiry</h2>
              <p className="t-sm c-body" style={{ marginBottom: 28 }}>
                We read every message. Typical response time: <strong>under 24 hours</strong> on working days.
              </p>
              <EnquiryForm />
            </div>

            {/* Right — Contact sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingTop: 40 }}>

              {/* Direct contact */}
              <div className="card card-light" style={{ padding: 28 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Direct contact</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { icon: '📞', title: '+91 89393 66259', sub: 'Mon–Sat, 9 AM – 7 PM IST', href: 'tel:+918939366259' },
                    { icon: '✉',  title: 'hello@sodakedutech.in', sub: 'General enquiries', href: 'mailto:hello@sodakedutech.in' },
                    { icon: '💬', title: 'WhatsApp us', sub: 'Fastest response channel', href: 'https://wa.me/918939366259' },
                  ].map(c => (
                    <a key={c.href} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                      style={{ display: 'flex', gap: 12, alignItems: 'flex-start', textDecoration: 'none', color: 'inherit' }}>
                      <span style={{ fontSize: 20, width: 28, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', paddingTop: 1 }}>{c.icon}</span>
                      <div style={{ minWidth: 0 }}>
                        <p className="t-sm fw-600 c-heading" style={{ wordBreak: 'break-all' }}>{c.title}</p>
                        <p className="t-label c-muted">{c.sub}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="card card-light" style={{ padding: 28 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Location</p>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>📍</span>
                  <div>
                    <p className="t-sm fw-600 c-heading">Chennai, Tamil Nadu</p>
                    <p className="t-sm c-body" style={{ marginTop: 4, lineHeight: 1.7 }}>
                      We&apos;re campus-first — we come to you. Programs are delivered at your institution.
                    </p>
                  </div>
                </div>
              </div>

              {/* Follow us */}
              <div className="card card-light" style={{ padding: 28 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Follow us</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    {
                      label: 'LinkedIn', href: 'https://linkedin.com/company/sodakedutech', bg: '#0a66c2',
                      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>,
                    },
                    {
                      label: 'X / Twitter', href: 'https://twitter.com/sodakedutech', bg: '#000',
                      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.74-8.851L2.25 2.25h6.988l4.255 5.627zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
                    },
                    {
                      label: 'YouTube', href: 'https://youtube.com/@sodakedutech', bg: '#ff0000',
                      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>,
                    },
                  ].map(s => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                      style={{
                        width: 40, height: 40, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        background: s.bg, color: '#fff', textDecoration: 'none', transition: 'opacity 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Next steps */}
              <div className="card card-dark" style={{ padding: 28, background: 'var(--navy-900)' }}>
                <p className="t-sm c-white fw-600" style={{ marginBottom: 8 }}>Typical next steps</p>
                <ol style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 0, listStyle: 'none' }}>
                  {[
                    'We review your enquiry (within 24h)',
                    '30-min call to understand your needs',
                    'Custom program proposal sent',
                    'Training scheduled and confirmed',
                  ].map((step, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#94a3b8' }}>
                      <span style={{
                        background: 'var(--gold-500)', color: 'var(--navy-950)',
                        width: 20, height: 20, borderRadius: '50%',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, flexShrink: 0,
                      }}>{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="s-dark">
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="section-header text-center">
            <p className="section-eyebrow">FAQs</p>
            <h2 className="t-h2 c-white">Common questions</h2>
          </div>
          <FaqAccordion items={CONTACT_FAQS} />
        </div>
      </section>
    </>
  )
}
