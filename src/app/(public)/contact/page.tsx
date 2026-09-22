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
    answer: "Yes. Many colleges combine Placement Prep (Track A) with Cloud & DevOps (Track B) for final-year batches, or Assessment Screening (Track E) with any other track as the exit exam. Tell us what you want and we'll scope it.",
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
                      style={{ display: 'flex', gap: 12, alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                      <span style={{ fontSize: 20 }}>{c.icon}</span>
                      <div>
                        <p className="t-sm fw-600 c-heading">{c.title}</p>
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
                    { label: 'in', href: 'https://linkedin.com/company/sodakedutech' },
                    { label: 'tw', href: 'https://twitter.com/sodakedutech' },
                    { label: 'yt', href: 'https://youtube.com/@sodakedutech' },
                  ].map(s => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                      className="footer-social"
                      style={{ width: 40, height: 40, fontSize: 13 }}>
                      {s.label}
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
