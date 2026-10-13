'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface TrainerOption { id: string; name: string }

export default function BlogPostForm({ trainers }: { trainers: TrainerOption[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const tagsRaw = (fd.get('tags') as string).trim()
    const body = {
      title:               (fd.get('title') as string).trim(),
      authorId:            (fd.get('authorId') as string) || undefined,
      category:            (fd.get('category') as string).trim() || undefined,
      excerpt:             (fd.get('excerpt') as string).trim() || undefined,
      bodyHtml:            (fd.get('bodyHtml') as string).trim() || undefined,
      tags:                tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [],
      readingTimeMinutes:  fd.get('readingTimeMinutes') ? Number(fd.get('readingTimeMinutes')) : undefined,
    }
    const res = await fetch('/api/v1/blog', {
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
    router.push('/admin/blog')
    router.refresh()
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }
  const selectStyle: React.CSSProperties = { ...inputStyle, appearance: 'none', WebkitAppearance: 'none', background: "#ffffff url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%2364748b'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\") no-repeat right 12px center", backgroundSize: '16px', paddingRight: '36px', cursor: 'pointer' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }

  return (
    <>
      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626' }}>{error}</div>
      )}
      <form onSubmit={handleSubmit} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 32, maxWidth: 800 }}>
        <div style={{ display: 'grid', gap: 20 }}>
          <div>
            <label style={labelStyle}>Post Title <span style={{ color: '#ef4444' }}>*</span></label>
            <input name="title" type="text" required placeholder="e.g. Top 10 Placement Tips for 2025" style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Author</label>
              <select name="authorId" style={selectStyle}>
                <option value="">Select author</option>
                {trainers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <input name="category" type="text" placeholder="e.g. Career Tips, Tech, Industry" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Excerpt</label>
            <textarea name="excerpt" rows={2} placeholder="A short summary shown in post listings..." style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div>
            <label style={labelStyle}>Body <span style={{ color: '#ef4444' }}>*</span></label>
            <textarea name="bodyHtml" rows={12} required placeholder="Write your post content here (HTML supported)..." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Tags</label>
              <input name="tags" type="text" placeholder="comma-separated, e.g. placement, coding, interview" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Reading Time (minutes)</label>
              <input name="readingTimeMinutes" type="number" min={1} max={60} placeholder="e.g. 5" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
            <Link href="/admin/blog" style={{ padding: '9px 20px', fontSize: 13, fontWeight: 600, background: '#f1f5f9', color: '#374151', borderRadius: 8, textDecoration: 'none' }}>Cancel</Link>
            <button type="submit" disabled={saving} style={{ padding: '9px 22px', fontSize: 13, fontWeight: 700, background: '#2563EB', color: '#ffffff', borderRadius: 8, border: 'none', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : 'Save as Draft'}
            </button>
          </div>
        </div>
      </form>
    </>
  )
}
