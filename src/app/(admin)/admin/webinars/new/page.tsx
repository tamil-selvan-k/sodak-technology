'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/Toast'

export default function AdminNewWebinarPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const scheduledAt = fd.get('scheduledAt') as string
    const durationRaw = fd.get('durationMinutes') as string
    const body = {
      title:           (fd.get('title') as string).trim(),
      platform:        (fd.get('platform') as string) || undefined,
      durationMinutes: durationRaw ? parseInt(durationRaw, 10) : undefined,
      scheduledAt:     scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      registrationUrl: (fd.get('registrationUrl') as string).trim() || undefined,
      description:     (fd.get('description') as string).trim() || undefined,
    }
    const res = await fetch('/api/v1/webinars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSaving(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError((data as { error?: { message?: string } }).error?.message ?? `Error ${res.status}`)
      return
    }
    toast.success('Webinar saved!')
    router.push('/admin/webinars')
    router.refresh()
  }

  const cardStyle: React.CSSProperties = { background: '#ffffff', border: '1px solid #DBEAFE', borderRadius: 12, padding: 24 }
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #dbeafe', borderRadius: 8, fontSize: 14, color: '#172554', background: '#fff', outline: 'none', boxSizing: 'border-box' }
  const selectStyle: React.CSSProperties = { ...inputStyle, appearance: 'none', WebkitAppearance: 'none', background: "#ffffff url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%2364748b'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\") no-repeat right 12px center", backgroundSize: '16px', paddingRight: '36px', cursor: 'pointer' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }
  const sectionHeadStyle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#172554', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #EFF6FF' }

  return (
    <main className="admin-main">
      <div style={{ marginBottom: 20 }}>
        <Link href="/admin/webinars" className="admin-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back to Webinars
        </Link>
      </div>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563EB', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172554', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>New Webinar</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Schedule a new live session or webinar</p>
      </div>

      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626' }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

          {/* Left column — primary content */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={cardStyle}>
              <p style={sectionHeadStyle}>Webinar Content</p>
              <div style={{ display: 'grid', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Webinar Title <span style={{ color: '#ef4444' }}>*</span></label>
                  <input name="title" type="text" required placeholder="e.g. Cracking FAANG Interviews in 2025" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea name="description" rows={10} placeholder="What will attendees learn? Who is this for?" style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar — metadata + actions */}
          <div style={{ width: 288, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>
            {/* Actions card */}
            <div style={cardStyle}>
              <p style={sectionHeadStyle}>Actions</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button type="submit" disabled={saving} style={{ background: '#2563eb', color: '#fff', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: saving ? 0.7 : 1, width: '100%' }}>
                  {saving ? 'Saving…' : 'Save Webinar'}
                </button>
                <Link href="/admin/webinars" style={{ background: '#fff', border: '1px solid #dbeafe', color: '#374151', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 500, textDecoration: 'none', textAlign: 'center', display: 'block' }}>Cancel</Link>
              </div>
            </div>

            {/* Schedule & Settings card */}
            <div style={cardStyle}>
              <p style={sectionHeadStyle}>Schedule &amp; Settings</p>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Platform</label>
                  <select name="platform" style={selectStyle}>
                    <option value="">Select platform</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Google Meet">Google Meet</option>
                    <option value="YouTube Live">YouTube Live</option>
                    <option value="Teams">Microsoft Teams</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Duration (minutes)</label>
                  <input name="durationMinutes" type="number" min="15" placeholder="e.g. 60" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Scheduled Date &amp; Time</label>
                  <input name="scheduledAt" type="datetime-local" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Registration URL</label>
                  <input name="registrationUrl" type="url" placeholder="https://..." style={inputStyle} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </form>
    </main>
  )
}
