'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminNewInstitutionPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const body = {
      name:           (fd.get('name') as string).trim(),
      city:           (fd.get('city') as string).trim() || undefined,
      type:           (fd.get('type') as string) || undefined,
      website:        (fd.get('website') as string).trim() || undefined,
      logoPermission: fd.get('logoPermission') === 'on',
      showOnHome:     fd.get('showOnHome') === 'on',
    }
    const res = await fetch('/api/v1/institutions', {
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
    router.push('/admin/institutions')
    router.refresh()
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }
  const selectStyle: React.CSSProperties = { ...inputStyle, appearance: 'none', WebkitAppearance: 'none', background: "#ffffff url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%2364748b'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\") no-repeat right 12px center", backgroundSize: '16px', paddingRight: '36px', cursor: 'pointer' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }

  return (
    <main className="admin-main">
      <div style={{ marginBottom: 20 }}>
        <Link href="/admin/institutions" className="admin-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back to Institutions
        </Link>
      </div>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563EB', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172554', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>New Institution</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Add a partner college or company</p>
      </div>

      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626' }}>{error}</div>
      )}

      <form onSubmit={handleSubmit} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 32, maxWidth: 720 }}>
        <div style={{ display: 'grid', gap: 20 }}>
          <div>
            <label style={labelStyle}>Institution Name <span style={{ color: '#ef4444' }}>*</span></label>
            <input name="name" type="text" required placeholder="e.g. Anna University" style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Type</label>
              <select name="type" style={selectStyle}>
                <option value="">Select type</option>
                <option value="Engineering">Engineering</option>
                <option value="Arts">Arts &amp; Science</option>
                <option value="Polytechnic">Polytechnic</option>
                <option value="University">University</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>City</label>
              <input name="city" type="text" placeholder="e.g. Chennai" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Website URL</label>
            <input name="website" type="url" placeholder="https://..." style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#374151', fontWeight: 600, paddingTop: 4 }}>
              <input type="checkbox" name="logoPermission" style={{ width: 16, height: 16, accentColor: '#2563EB' }} />
              Logo Permission Granted
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#374151', fontWeight: 600, paddingTop: 4 }}>
              <input type="checkbox" name="showOnHome" style={{ width: 16, height: 16, accentColor: '#2563EB' }} />
              Show on Homepage
            </label>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
            <Link href="/admin/institutions" style={{ padding: '9px 20px', fontSize: 13, fontWeight: 600, background: '#f1f5f9', color: '#374151', borderRadius: 8, textDecoration: 'none' }}>Cancel</Link>
            <button type="submit" disabled={saving} style={{ padding: '9px 22px', fontSize: 13, fontWeight: 700, background: '#2563EB', color: '#ffffff', borderRadius: 8, border: 'none', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : 'Save Institution'}
            </button>
          </div>
        </div>
      </form>
    </main>
  )
}
