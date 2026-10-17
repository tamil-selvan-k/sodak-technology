'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/Toast'
import type { Prisma } from '@prisma/client'

type WebinarRecord = Prisma.WebinarGetPayload<{ include: { presenter: true } }>

interface Props { webinar: WebinarRecord }

function toDatetimeLocal(date: Date | null): string {
  if (!date) return ''
  const d = new Date(date)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function WebinarEditForm({ webinar }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [deleting, setDeleting] = useState(false)
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
    const res = await fetch(`/api/v1/webinars/${webinar.id}`, {
      method: 'PATCH',
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
    router.refresh()
  }

  async function handlePublish() {
    setPublishing(true)
    setError(null)
    const action = webinar.isPublished ? 'unpublish' : 'publish'
    const res = await fetch(`/api/v1/webinars/${webinar.id}/${action}`, { method: 'POST' })
    setPublishing(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError((data as { error?: { message?: string } }).error?.message ?? `${action} failed`)
      return
    }
    toast.success(webinar.isPublished ? 'Webinar unpublished.' : 'Webinar published!')
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm(`Delete "${webinar.title}"? This cannot be undone.`)) return
    setDeleting(true)
    const res = await fetch(`/api/v1/webinars/${webinar.id}`, { method: 'DELETE' })
    setDeleting(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError((data as { error?: { message?: string } }).error?.message ?? 'Delete failed')
      return
    }
    toast.success('Webinar deleted.')
    router.push('/admin/webinars')
    router.refresh()
  }

  const cardStyle: React.CSSProperties = { background: '#ffffff', border: '1px solid #DBEAFE', borderRadius: 12, padding: 24 }
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #dbeafe', borderRadius: 8, fontSize: 14, color: '#172554', background: '#fff', outline: 'none', boxSizing: 'border-box' }
  const selectStyle: React.CSSProperties = { ...inputStyle, appearance: 'none', WebkitAppearance: 'none', background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%2364748b'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\") no-repeat right 12px center #fff", backgroundSize: '16px', paddingRight: '36px', cursor: 'pointer' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }
  const sectionHeadStyle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#172554', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #EFF6FF' }

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <Link href="/admin/webinars" className="admin-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back to Webinars
        </Link>
      </div>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563EB', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172554', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>{webinar.title}</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Edit webinar details</p>
      </div>

      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626' }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Left column */}
          <div style={{ flex: '1 1 400px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={cardStyle}>
              <p style={sectionHeadStyle}>Webinar Content</p>
              <div style={{ display: 'grid', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Webinar Title <span style={{ color: '#ef4444' }}>*</span></label>
                  <input name="title" type="text" required defaultValue={webinar.title} style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea name="description" rows={10} placeholder="What will attendees learn?" defaultValue={webinar.description ?? ''}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ width: 288, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>

            {/* Status badge */}
            <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: webinar.isPublished ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                color: webinar.isPublished ? '#16a34a' : '#a16207',
                border: `1px solid ${webinar.isPublished ? 'rgba(34,197,94,0.25)' : 'rgba(234,179,8,0.25)'}`,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: webinar.isPublished ? '#22c55e' : '#eab308', display: 'inline-block' }} />
                {webinar.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>

            {/* Actions card */}
            <div style={cardStyle}>
              <p style={sectionHeadStyle}>Actions</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button type="submit" disabled={saving || deleting}
                  style={{ background: '#2563eb', color: '#fff', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: saving ? 0.7 : 1, width: '100%' }}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button type="button" onClick={handlePublish} disabled={publishing || saving || deleting}
                  style={{ background: webinar.isPublished ? '#fff' : '#16a34a', border: webinar.isPublished ? '1px solid #dbeafe' : 'none', color: webinar.isPublished ? '#374151' : '#fff', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: publishing ? 0.7 : 1, width: '100%' }}>
                  {publishing ? 'Updating…' : webinar.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <Link href="/admin/webinars"
                  style={{ background: '#fff', border: '1px solid #dbeafe', color: '#374151', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 500, textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                  Cancel
                </Link>
              </div>
            </div>

            {/* Schedule & Settings card */}
            <div style={cardStyle}>
              <p style={sectionHeadStyle}>Schedule &amp; Settings</p>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Platform</label>
                  <select name="platform" defaultValue={webinar.platform ?? ''} style={selectStyle}>
                    <option value="">Select platform</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Google Meet">Google Meet</option>
                    <option value="YouTube Live">YouTube Live</option>
                    <option value="Teams">Microsoft Teams</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Duration (minutes)</label>
                  <input name="durationMinutes" type="number" min="15" placeholder="e.g. 60" defaultValue={webinar.durationMinutes ?? ''} style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
                <div>
                  <label style={labelStyle}>Scheduled Date &amp; Time</label>
                  <input name="scheduledAt" type="datetime-local" defaultValue={toDatetimeLocal(webinar.scheduledAt)} style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
                <div>
                  <label style={labelStyle}>Registration URL</label>
                  <input name="registrationUrl" type="url" placeholder="https://..." defaultValue={webinar.registrationUrl ?? ''} style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div style={{ ...cardStyle, border: '1px solid rgba(239,68,68,0.2)' }}>
              <p style={{ ...sectionHeadStyle, color: '#dc2626', borderBottomColor: 'rgba(239,68,68,0.15)' }}>Danger Zone</p>
              <button type="button" onClick={handleDelete} disabled={deleting || saving}
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%', opacity: deleting ? 0.7 : 1 }}>
                {deleting ? 'Deleting…' : 'Delete Webinar'}
              </button>
            </div>

          </div>
        </div>
      </form>
    </>
  )
}
