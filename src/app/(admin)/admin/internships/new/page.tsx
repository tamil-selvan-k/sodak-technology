'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminNewInternshipPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const deadline = fd.get('applicationDeadline') as string
    const body = {
      companyName:         (fd.get('companyName') as string).trim(),
      roleTitle:           (fd.get('roleTitle') as string).trim(),
      location:            (fd.get('location') as string).trim() || undefined,
      duration:            (fd.get('duration') as string).trim() || undefined,
      stipendRange:        (fd.get('stipendRange') as string).trim() || undefined,
      description:         (fd.get('description') as string).trim() || undefined,
      applicationDeadline: deadline ? new Date(deadline).toISOString() : undefined,
    }
    const res = await fetch('/api/v1/internships', {
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
    router.push('/admin/internships')
    router.refresh()
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }

  return (
    <main className="admin-main">
      <div style={{ marginBottom: 20 }}>
        <Link href="/admin/internships" className="admin-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back to Internships
        </Link>
      </div>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563EB', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172554', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>Add Internship</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Create a new internship listing</p>
      </div>

      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626' }}>{error}</div>
      )}

      <form onSubmit={handleSubmit} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 32, maxWidth: 720 }}>
        <div style={{ display: 'grid', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Company Name <span style={{ color: '#ef4444' }}>*</span></label>
              <input name="companyName" type="text" required placeholder="e.g. Zoho Corporation" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Role Title <span style={{ color: '#ef4444' }}>*</span></label>
              <input name="roleTitle" type="text" required placeholder="e.g. Software Developer Intern" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Location</label>
              <input name="location" type="text" placeholder="e.g. Chennai, Remote" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Duration</label>
              <input name="duration" type="text" placeholder="e.g. 3 months" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Stipend Range</label>
              <input name="stipendRange" type="text" placeholder="e.g. ₹8,000–₹15,000/month" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Application Deadline</label>
              <input name="applicationDeadline" type="date" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea name="description" rows={5} placeholder="Describe the internship role..." style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
            <Link href="/admin/internships" style={{ padding: '9px 20px', fontSize: 13, fontWeight: 600, background: '#f1f5f9', color: '#374151', borderRadius: 8, textDecoration: 'none' }}>Cancel</Link>
            <button type="submit" disabled={saving} style={{ padding: '9px 22px', fontSize: 13, fontWeight: 700, background: '#2563EB', color: '#ffffff', borderRadius: 8, border: 'none', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : 'Save Internship'}
            </button>
          </div>
        </div>
      </form>
    </main>
  )
}
