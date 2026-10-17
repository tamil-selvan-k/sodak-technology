'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/Toast'
import type { JobPost } from '@prisma/client'

interface Props { job: JobPost }

function toDateInput(date: Date | null): string {
  if (!date) return ''
  const d = new Date(date)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function CareerEditForm({ job }: Props) {
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
    const closesOn = fd.get('closesOn') as string
    const body = {
      title:           (fd.get('title') as string).trim(),
      department:      (fd.get('department') as string).trim() || undefined,
      location:        (fd.get('location') as string).trim() || undefined,
      employmentType:  (fd.get('employmentType') as string) || undefined,
      descriptionHtml: (fd.get('descriptionHtml') as string).trim() || undefined,
      isOpen:          fd.get('isOpen') === 'on',
      closesOn:        closesOn ? new Date(closesOn).toISOString() : undefined,
    }
    const res = await fetch(`/api/v1/careers/${job.id}`, {
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
    toast.success('Job opening saved!')
    router.refresh()
  }

  async function handlePublish() {
    setPublishing(true)
    setError(null)
    const action = job.isPublished ? 'unpublish' : 'publish'
    const res = await fetch(`/api/v1/careers/${job.id}/${action}`, { method: 'POST' })
    setPublishing(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError((data as { error?: { message?: string } }).error?.message ?? `${action} failed`)
      return
    }
    toast.success(job.isPublished ? 'Job opening unpublished.' : 'Job opening published!')
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm(`Delete "${job.title}"? This cannot be undone.`)) return
    setDeleting(true)
    const res = await fetch(`/api/v1/careers/${job.id}`, { method: 'DELETE' })
    setDeleting(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError((data as { error?: { message?: string } }).error?.message ?? 'Delete failed')
      return
    }
    toast.success('Job opening deleted.')
    router.push('/admin/careers')
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
        <Link href="/admin/careers" className="admin-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back to Careers
        </Link>
      </div>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563EB', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172554', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>{job.title}</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Edit job opening details</p>
      </div>

      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626' }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Left column */}
          <div style={{ flex: '1 1 400px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={cardStyle}>
              <p style={sectionHeadStyle}>Job Details</p>
              <div style={{ display: 'grid', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Job Title <span style={{ color: '#ef4444' }}>*</span></label>
                  <input name="title" type="text" required defaultValue={job.title} style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
                <div>
                  <label style={labelStyle}>Job Description</label>
                  <textarea name="descriptionHtml" rows={10} placeholder="Describe the role, responsibilities, and requirements..." defaultValue={job.descriptionHtml ?? ''}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ width: 288, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>

            {/* Status badges */}
            <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: job.isPublished ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                color: job.isPublished ? '#16a34a' : '#a16207',
                border: `1px solid ${job.isPublished ? 'rgba(34,197,94,0.25)' : 'rgba(234,179,8,0.25)'}`,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: job.isPublished ? '#22c55e' : '#eab308', display: 'inline-block' }} />
                {job.isPublished ? 'Published' : 'Draft'}
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: job.isOpen ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.1)',
                color: job.isOpen ? '#1d4ed8' : '#dc2626',
                border: `1px solid ${job.isOpen ? 'rgba(59,130,246,0.25)' : 'rgba(239,68,68,0.25)'}`,
              }}>
                {job.isOpen ? 'Open' : 'Closed'}
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
                  style={{ background: job.isPublished ? '#fff' : '#16a34a', border: job.isPublished ? '1px solid #dbeafe' : 'none', color: job.isPublished ? '#374151' : '#fff', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: publishing ? 0.7 : 1, width: '100%' }}>
                  {publishing ? 'Updating…' : job.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <Link href="/admin/careers"
                  style={{ background: '#fff', border: '1px solid #dbeafe', color: '#374151', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 500, textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                  Cancel
                </Link>
              </div>
            </div>

            {/* Metadata card */}
            <div style={cardStyle}>
              <p style={sectionHeadStyle}>Metadata</p>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Department</label>
                  <input name="department" type="text" placeholder="e.g. Engineering" defaultValue={job.department ?? ''} style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
                <div>
                  <label style={labelStyle}>Location</label>
                  <input name="location" type="text" placeholder="e.g. Chennai / Remote" defaultValue={job.location ?? ''} style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
                <div>
                  <label style={labelStyle}>Employment Type</label>
                  <select name="employmentType" defaultValue={job.employmentType ?? ''} style={selectStyle}>
                    <option value="">Select type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Closes On</label>
                  <input name="closesOn" type="date" defaultValue={toDateInput(job.closesOn)} style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#374151', fontWeight: 600 }}>
                  <input type="checkbox" name="isOpen" defaultChecked={job.isOpen} style={{ width: 16, height: 16, accentColor: '#2563EB' }} />
                  Job is Open (accepting applications)
                </label>
              </div>
            </div>

            {/* Danger zone */}
            <div style={{ ...cardStyle, border: '1px solid rgba(239,68,68,0.2)' }}>
              <p style={{ ...sectionHeadStyle, color: '#dc2626', borderBottomColor: 'rgba(239,68,68,0.15)' }}>Danger Zone</p>
              <button type="button" onClick={handleDelete} disabled={deleting || saving}
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%', opacity: deleting ? 0.7 : 1 }}>
                {deleting ? 'Deleting…' : 'Delete Job Opening'}
              </button>
            </div>

          </div>
        </div>
      </form>
    </>
  )
}
