'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TagInput from '@/components/ui/TagInput'
import { useToast } from '@/components/ui/Toast'
import type { Internship } from '@prisma/client'

interface Props { internship: Internship }

function toDateInput(date: Date | null): string {
  if (!date) return ''
  const d = new Date(date)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function InternshipEditForm({ internship }: Props) {
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
    const deadline = fd.get('applicationDeadline') as string
    const body = {
      companyName:         (fd.get('companyName') as string).trim(),
      roleTitle:           (fd.get('roleTitle') as string).trim(),
      location:            (fd.get('location') as string).trim() || undefined,
      duration:            (fd.get('duration') as string).trim() || undefined,
      stipendRange:        (fd.get('stipendRange') as string).trim() || undefined,
      description:         (fd.get('description') as string).trim() || undefined,
      stackTags:           ((fd.get('stackTags') as string) || '').split(',').map((t: string) => t.trim()).filter(Boolean),
      applicationDeadline: deadline ? new Date(deadline).toISOString() : undefined,
    }
    const res = await fetch(`/api/v1/internships/${internship.id}`, {
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
    toast.success('Internship saved!')
    router.push('/admin/internships')
  }

  async function handlePublish() {
    setPublishing(true)
    setError(null)
    const action = internship.isPublished ? 'unpublish' : 'publish'
    const res = await fetch(`/api/v1/internships/${internship.id}/${action}`, { method: 'POST' })
    setPublishing(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError((data as { error?: { message?: string } }).error?.message ?? `${action} failed`)
      return
    }
    toast.success(internship.isPublished ? 'Internship unpublished.' : 'Internship published!')
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm(`Delete "${internship.companyName} — ${internship.roleTitle}"? This cannot be undone.`)) return
    setDeleting(true)
    const res = await fetch(`/api/v1/internships/${internship.id}`, { method: 'DELETE' })
    setDeleting(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError((data as { error?: { message?: string } }).error?.message ?? 'Delete failed')
      return
    }
    toast.success('Internship deleted.')
    router.push('/admin/internships')
    router.refresh()
  }

  const cardStyle: React.CSSProperties = { background: '#ffffff', border: '1px solid #DBEAFE', borderRadius: 12, padding: 24 }
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #dbeafe', borderRadius: 8, fontSize: 14, color: '#172554', background: '#fff', outline: 'none', boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }
  const sectionHeadStyle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#172554', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #EFF6FF' }

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <Link href="/admin/internships" className="admin-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back to Internships
        </Link>
      </div>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563EB', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172554', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>{internship.companyName}</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{internship.roleTitle}</p>
      </div>

      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626' }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="admin-form-grid">

          {/* Left column */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={cardStyle}>
              <p style={sectionHeadStyle}>Internship Details</p>
              <div style={{ display: 'grid', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Company Name <span style={{ color: '#ef4444' }}>*</span></label>
                    <input name="companyName" type="text" required defaultValue={internship.companyName} style={inputStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                      onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                  </div>
                  <div>
                    <label style={labelStyle}>Role Title <span style={{ color: '#ef4444' }}>*</span></label>
                    <input name="roleTitle" type="text" required defaultValue={internship.roleTitle} style={inputStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                      onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea name="description" rows={9} placeholder="Describe the internship role..." defaultValue={internship.description ?? ''}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="admin-form-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>

            {/* Status badge */}
            <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: internship.isPublished ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                color: internship.isPublished ? '#16a34a' : '#a16207',
                border: `1px solid ${internship.isPublished ? 'rgba(34,197,94,0.25)' : 'rgba(234,179,8,0.25)'}`,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: internship.isPublished ? '#22c55e' : '#eab308', display: 'inline-block' }} />
                {internship.isPublished ? 'Published' : 'Draft'}
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
                  style={{ background: internship.isPublished ? '#fff' : '#16a34a', border: internship.isPublished ? '1px solid #dbeafe' : 'none', color: internship.isPublished ? '#374151' : '#fff', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: publishing ? 0.7 : 1, width: '100%' }}>
                  {publishing ? 'Updating…' : internship.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <Link href="/admin/internships"
                  style={{ background: '#fff', border: '1px solid #dbeafe', color: '#374151', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 500, textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                  Cancel
                </Link>
              </div>
            </div>

            {/* Details card */}
            <div style={cardStyle}>
              <p style={sectionHeadStyle}>Details</p>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Location</label>
                  <input name="location" type="text" placeholder="e.g. Chennai, Remote" defaultValue={internship.location ?? ''} style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
                <div>
                  <label style={labelStyle}>Duration</label>
                  <input name="duration" type="text" placeholder="e.g. 3 months" defaultValue={internship.duration ?? ''} style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
                <div>
                  <label style={labelStyle}>Stipend Range</label>
                  <input name="stipendRange" type="text" placeholder="e.g. ₹8,000–₹15,000/month" defaultValue={internship.stipendRange ?? ''} style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
                <div>
                  <label style={labelStyle}>Application Deadline</label>
                  <input name="applicationDeadline" type="date" defaultValue={toDateInput(internship.applicationDeadline)} style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
                <TagInput
                  name="stackTags"
                  placeholder="React, Python, SQL…"
                  label="Tech Stack Tags"
                  labelStyle={labelStyle}
                  defaultValue={internship.stackTags ?? []}
                />
              </div>
            </div>

            {/* Danger zone */}
            <div style={{ ...cardStyle, border: '1px solid rgba(239,68,68,0.2)' }}>
              <p style={{ ...sectionHeadStyle, color: '#dc2626', borderBottomColor: 'rgba(239,68,68,0.15)' }}>Danger Zone</p>
              <button type="button" onClick={handleDelete} disabled={deleting || saving}
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%', opacity: deleting ? 0.7 : 1 }}>
                {deleting ? 'Deleting…' : 'Delete Internship'}
              </button>
            </div>

          </div>
        </div>
      </form>
    </>
  )
}
