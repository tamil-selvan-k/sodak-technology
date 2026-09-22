'use client'

import { useState, useRef, useEffect } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'

const ROLES = [
  { value: 'TPO',       label: 'Training & Placement Officer', icon: '🎓' },
  { value: 'HoD',       label: 'Faculty / HoD',                icon: '🏫' },
  { value: 'Corporate', label: 'Corporate / HR',                icon: '🏢' },
  { value: 'Other',     label: 'Other',                         icon: '👤' },
] as const

type Role = typeof ROLES[number]['value']

export default function EnquiryForm() {
  const [role, setRole]       = useState<Role>('TPO')
  const [token, setToken]     = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus]   = useState<'idle' | 'success' | 'error'>('idle')
  const [errMsg, setErrMsg]   = useState('')
  const utmRef = useRef<Record<string, string>>({})

  // Capture UTM params + referrer once on mount
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    utmRef.current = {
      utm_source:   p.get('utm_source')   ?? '',
      utm_medium:   p.get('utm_medium')   ?? '',
      utm_campaign: p.get('utm_campaign') ?? '',
      referrer:     document.referrer,
    }
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrMsg('')

    const fd = new FormData(e.currentTarget)
    const body = {
      name:          fd.get('name') as string,
      email:         fd.get('email') as string,
      message:       fd.get('message') as string,
      role,
      website_url:   fd.get('website_url') as string, // honeypot
      consent:       true,
      turnstileToken: token,
      utm:           utmRef.current,
      referrer:      utmRef.current.referrer,
    }

    try {
      const res = await fetch('/api/v1/forms/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json() as { data?: unknown; error?: { message: string } }
      if (!res.ok) { setErrMsg(json.error?.message ?? 'Something went wrong.'); setStatus('error') }
      else setStatus('success')
    } catch {
      setErrMsg('Network error. Please try again.')
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'success') {
    return (
      <div className="form-card text-center" style={{ padding: '60px 36px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h3 className="t-h3 c-heading" style={{ marginBottom: 8 }}>Message sent!</h3>
        <p className="t-sm c-body">We'll get back to you within 24 hours on working days. Check your inbox for a confirmation.</p>
      </div>
    )
  }

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      {/* Honeypot — hidden from real users */}
      <input type="text" name="website_url" aria-hidden="true" tabIndex={-1} style={{ display: 'none' }} />

      {/* Role selector */}
      <div className="form-group">
        <label className="form-label">I am a <span style={{ color: '#e05252' }}>*</span></label>
        <div className="radio-group">
          {ROLES.map(r => (
            <label key={r.value} className="radio-option" style={{ cursor: 'pointer' }}>
              <input
                type="radio" name="contact_type" value={r.value}
                checked={role === r.value}
                onChange={() => setRole(r.value)}
                style={{ display: 'none' }}
              />
              <span className="radio-box" style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 8,
                border: `1px solid ${role === r.value ? '#c8a035' : '#e2e8f0'}`,
                background: role === r.value ? 'rgba(200,160,53,0.06)' : '#fff',
                fontSize: 13,
                color: role === r.value ? '#1e293b' : '#334155',
                fontWeight: role === r.value ? 500 : 400,
                transition: 'border-color 0.15s, background 0.15s',
              }}>
                <span style={{ fontSize: 16 }}>{r.icon}</span>
                <span>{r.label}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Name */}
      <div className="form-group">
        <label className="form-label" htmlFor="enq-name">
          Name <span style={{ color: '#e05252' }}>*</span>
        </label>
        <input
          id="enq-name" name="name" type="text" required
          className="form-input" placeholder="Dr. Ramesh Kumar"
        />
      </div>

      {/* Email */}
      <div className="form-group">
        <label className="form-label" htmlFor="enq-email">
          Email <span style={{ color: '#e05252' }}>*</span>
        </label>
        <input
          id="enq-email" name="email" type="email" required
          className="form-input" placeholder="you@college.ac.in"
        />
      </div>

      {/* Message */}
      <div className="form-group">
        <label className="form-label" htmlFor="enq-message">
          Message <span style={{ color: '#e05252' }}>*</span>
        </label>
        <textarea
          id="enq-message" name="message" rows={5} required
          className="form-input"
          style={{ resize: 'vertical', minHeight: 120 }}
          placeholder="Tell us what you need — program, batch size, timeline, or anything else…"
        />
      </div>

      {/* Cloudflare Turnstile */}
      <Turnstile
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA'}
        onSuccess={setToken}
        options={{ theme: 'light', size: 'normal' }}
      />

      {errMsg && (
        <p style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>{errMsg}</p>
      )}

      <button
        type="submit"
        className="btn btn-gold btn-lg"
        style={{ width: '100%', marginTop: 8, opacity: loading ? 0.65 : 1 }}
        disabled={loading || !token}
      >
        {loading ? 'Sending…' : 'Send message →'}
      </button>
      <p className="t-label c-muted text-center" style={{ marginTop: 10 }}>
        We reply within 24 hours on working days. No spam.
      </p>
    </form>
  )
}
