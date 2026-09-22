'use client'

import { useState } from 'react'
import type { SiteSetting } from '@prisma/client'

interface SocialLinksData {
  linkedin?: string
  twitter?: string
  youtube?: string
  whatsapp?: string
}

interface StatsData {
  stacks?: number
  technologies?: number
  seats?: number
  questions?: number
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  fontSize: 13,
  border: '1px solid #e2e8f0',
  borderRadius: 6,
  outline: 'none',
  color: '#334155',
  background: '#fff',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: '#475569',
  marginBottom: 6,
  display: 'block',
}

const sectionHeadStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: 16,
  paddingBottom: 12,
  borderBottom: '1px solid #f1f5f9',
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 10,
  border: '1px solid #e2e8f0',
  padding: 28,
  marginBottom: 20,
}

const btnGold = 'px-4 py-2 text-[13px] font-bold bg-[#c8a035] text-[#0a0f1e] rounded-[6px] hover:bg-[#b8902f] transition-colors cursor-pointer border-0 disabled:opacity-60 disabled:cursor-not-allowed'

export default function SettingsForm({ settings }: { settings: SiteSetting }) {
  const stats = (settings.stats ?? {}) as StatsData
  const socialLinks = (settings.socialLinks ?? {}) as SocialLinksData

  const [heroHeadline, setHeroHeadline] = useState(settings.heroHeadline ?? '')
  const [heroSubhead, setHeroSubhead] = useState(settings.heroSubhead ?? '')
  const [notificationEmail, setNotificationEmail] = useState(settings.notificationEmail ?? '')

  const [stacks, setStacks] = useState(String(stats.stacks ?? ''))
  const [technologies, setTechnologies] = useState(String(stats.technologies ?? ''))
  const [seats, setSeats] = useState(String(stats.seats ?? ''))
  const [questions, setQuestions] = useState(String(stats.questions ?? ''))

  const [linkedin, setLinkedin] = useState(socialLinks.linkedin ?? '')
  const [twitter, setTwitter] = useState(socialLinks.twitter ?? '')
  const [youtube, setYoutube] = useState(socialLinks.youtube ?? '')
  const [whatsapp, setWhatsapp] = useState(socialLinks.whatsapp ?? '')

  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setToast(null)
    try {
      const payload = {
        heroHeadline: heroHeadline || undefined,
        heroSubhead: heroSubhead || undefined,
        notificationEmail: notificationEmail || undefined,
        stats: {
          ...(stacks ? { stacks: Number(stacks) } : {}),
          ...(technologies ? { technologies: Number(technologies) } : {}),
          ...(seats ? { seats: Number(seats) } : {}),
          ...(questions ? { questions: Number(questions) } : {}),
        },
        socialLinks: {
          ...(linkedin ? { linkedin } : {}),
          ...(twitter ? { twitter } : {}),
          ...(youtube ? { youtube } : {}),
          ...(whatsapp ? { whatsapp } : {}),
        },
      }
      const res = await fetch('/api/v1/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: { message?: string } }).error?.message ?? 'Failed to save')
      }
      setToast({ type: 'success', message: 'Settings saved successfully.' })
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save settings.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {toast && (
        <div style={{
          marginBottom: 20,
          padding: '12px 16px',
          borderRadius: 8,
          fontSize: 13,
          ...(toast.type === 'success'
            ? { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d' }
            : { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }),
        }}>
          {toast.message}
        </div>
      )}

      {/* Hero Section */}
      <div style={cardStyle}>
        <p style={sectionHeadStyle}>Hero Section</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={labelStyle}>Headline</label>
            <input
              style={inputStyle}
              value={heroHeadline}
              onChange={e => setHeroHeadline(e.target.value)}
              placeholder="e.g. Campus Placement Training That Gets Results"
            />
          </div>
          <div>
            <label style={labelStyle}>Subheadline</label>
            <textarea
              style={{ ...inputStyle, height: 80, resize: 'vertical' }}
              value={heroSubhead}
              onChange={e => setHeroSubhead(e.target.value)}
              placeholder="Supporting text shown below the headline"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={cardStyle}>
        <p style={sectionHeadStyle}>Homepage Stats</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {[
            { label: 'Stacks', value: stacks, set: setStacks },
            { label: 'Technologies', value: technologies, set: setTechnologies },
            { label: 'Seats Trained', value: seats, set: setSeats },
            { label: 'Questions in Bank', value: questions, set: setQuestions },
          ].map(f => (
            <div key={f.label}>
              <label style={labelStyle}>{f.label}</label>
              <input
                type="number"
                style={inputStyle}
                value={f.value}
                onChange={e => f.set(e.target.value)}
                placeholder="0"
                min={0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div style={cardStyle}>
        <p style={sectionHeadStyle}>Social Links</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {[
            { label: 'LinkedIn URL', value: linkedin, set: setLinkedin, ph: 'https://linkedin.com/company/sodakedutech' },
            { label: 'Twitter / X URL', value: twitter, set: setTwitter, ph: 'https://twitter.com/sodakedutech' },
            { label: 'YouTube URL', value: youtube, set: setYoutube, ph: 'https://youtube.com/@sodakedutech' },
            { label: 'WhatsApp Number', value: whatsapp, set: setWhatsapp, ph: '+918939366259' },
          ].map(f => (
            <div key={f.label}>
              <label style={labelStyle}>{f.label}</label>
              <input
                style={inputStyle}
                value={f.value}
                onChange={e => f.set(e.target.value)}
                placeholder={f.ph}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notification Email */}
      <div style={cardStyle}>
        <p style={sectionHeadStyle}>Notification Email</p>
        <div>
          <label style={labelStyle}>Receive admin notifications at this address</label>
          <input
            type="email"
            style={{ ...inputStyle, maxWidth: 360 }}
            value={notificationEmail}
            onChange={e => setNotificationEmail(e.target.value)}
            placeholder="admin@sodakedutech.in"
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" className={btnGold} disabled={saving}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </form>
  )
}
