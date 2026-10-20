'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/Toast'

export default function AdminNewMentorPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const body = {
      name:        (fd.get('name') as string).trim(),
      designation: (fd.get('designation') as string).trim() || undefined,
      linkedinUrl: (fd.get('linkedinUrl') as string).trim() || undefined,
      bioHtml:     (fd.get('bioHtml') as string).trim() || undefined,
      isMentor:    true,
      expertiseTags: [],
    }
    const res = await fetch('/api/v1/trainers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSaving(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { error?: { message?: string; detail?: string } }
      const msg = data.error?.detail ?? data.error?.message ?? `Error ${res.status}`
      setError(msg)
      return
    }
    toast.success('Mentor saved!')
    router.push('/admin/mentors')
    router.refresh()
  }

  const cardStyle: React.CSSProperties = { background: '#ffffff', border: '1px solid #DBEAFE', borderRadius: 12, padding: 24 }
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #dbeafe', borderRadius: 8, fontSize: 14, color: '#172554', background: '#fff', outline: 'none', boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }
  const sectionHeadStyle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#172554', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #EFF6FF' }

  return (
    <main className="admin-main">
      <div style={{ marginBottom: 20 }}>
        <Link href="/admin/mentors" className="admin-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back to Mentors
        </Link>
      </div>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563EB', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172554', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>New Mentor</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Add a new mentor profile</p>
      </div>

      <div style={{ marginBottom: 20, padding: '12px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, fontSize: 13, color: '#1e40af' }}>
        <strong>Note:</strong> Mentors share the Trainer data model. This creates a trainer record with the &quot;Is Mentor&quot; flag enabled.
        You can also <Link href="/admin/trainers/new" style={{ color: '#2563EB', fontWeight: 600 }}>create a trainer</Link> and check &quot;Mark as Mentor&quot; directly.
      </div>

      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626' }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="admin-form-grid">

          {/* Left column — primary content */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={cardStyle}>
              <p style={sectionHeadStyle}>Bio</p>
              <div style={{ display: 'grid', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Bio</label>
                  <textarea name="bioHtml" rows={10} placeholder="Brief professional background, expertise, and mentorship focus..." style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar — metadata + actions */}
          <div className="admin-form-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>
            {/* Actions card */}
            <div style={cardStyle}>
              <p style={sectionHeadStyle}>Actions</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button type="submit" disabled={saving} style={{ background: '#2563eb', color: '#fff', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: saving ? 0.7 : 1, width: '100%' }}>
                  {saving ? 'Saving…' : 'Save Mentor'}
                </button>
                <Link href="/admin/mentors" style={{ background: '#fff', border: '1px solid #dbeafe', color: '#374151', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 500, textDecoration: 'none', textAlign: 'center', display: 'block' }}>Cancel</Link>
              </div>
            </div>

            {/* Profile card */}
            <div style={cardStyle}>
              <p style={sectionHeadStyle}>Profile</p>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input name="name" type="text" required placeholder="e.g. Priya Ramesh" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Designation</label>
                  <input name="designation" type="text" placeholder="e.g. Senior Software Engineer" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>LinkedIn URL</label>
                  <input name="linkedinUrl" type="url" placeholder="https://linkedin.com/in/username" style={inputStyle} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </form>
    </main>
  )
}
