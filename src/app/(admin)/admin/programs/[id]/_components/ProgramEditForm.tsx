'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/Toast'
import type { Prisma } from '@prisma/client'

type ProgramRecord = Prisma.ProgramGetPayload<{ include: { stacks: { include: { stack: true } } } }>

interface Props { program: ProgramRecord }

export default function ProgramEditForm({ program }: Props) {
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
    const body = {
      title:           (fd.get('title') as string).trim(),
      trackCode:       (fd.get('trackCode') as string) || undefined,
      duration:        (fd.get('duration') as string).trim() || undefined,
      deliveryMode:    (fd.get('deliveryMode') as string) || undefined,
      summary:         (fd.get('summary') as string).trim() || undefined,
      descriptionHtml: (fd.get('descriptionHtml') as string).trim() || undefined,
      isFeatured:      fd.get('isFeatured') === 'on',
    }
    const res = await fetch(`/api/v1/programs/${program.id}`, {
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
    toast.success('Program saved!')
    router.refresh()
  }

  async function handlePublish() {
    setPublishing(true)
    setError(null)
    const action = program.isPublished ? 'unpublish' : 'publish'
    const res = await fetch(`/api/v1/programs/${program.id}/${action}`, { method: 'POST' })
    setPublishing(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError((data as { error?: { message?: string } }).error?.message ?? `${action} failed`)
      return
    }
    toast.success(program.isPublished ? 'Program unpublished.' : 'Program published!')
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm(`Delete "${program.title}"? This cannot be undone.`)) return
    setDeleting(true)
    const res = await fetch(`/api/v1/programs/${program.id}`, { method: 'DELETE' })
    setDeleting(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError((data as { error?: { message?: string } }).error?.message ?? 'Delete failed')
      return
    }
    toast.success('Program deleted.')
    router.push('/admin/programs')
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
        <Link href="/admin/programs" className="admin-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back to Programs
        </Link>
      </div>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563EB', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172554', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>{program.title}</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Edit program details</p>
      </div>

      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626' }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="admin-form-grid">

          {/* Left column */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={cardStyle}>
              <p style={sectionHeadStyle}>Program Content</p>
              <div style={{ display: 'grid', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Title <span style={{ color: '#ef4444' }}>*</span></label>
                  <input name="title" type="text" required defaultValue={program.title} style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
                <div>
                  <label style={labelStyle}>Summary</label>
                  <input name="summary" type="text" placeholder="One-line overview" defaultValue={program.summary ?? ''} style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea name="descriptionHtml" rows={10} placeholder="Describe the program..." defaultValue={program.descriptionHtml ?? ''}
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
                background: program.isPublished ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                color: program.isPublished ? '#16a34a' : '#a16207',
                border: `1px solid ${program.isPublished ? 'rgba(34,197,94,0.25)' : 'rgba(234,179,8,0.25)'}`,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: program.isPublished ? '#22c55e' : '#eab308', display: 'inline-block' }} />
                {program.isPublished ? 'Published' : 'Draft'}
              </span>
              {program.slug && (
                <a href={`/programs/${program.slug}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none', marginLeft: 'auto' }}>
                  View ↗
                </a>
              )}
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
                  style={{ background: program.isPublished ? '#fff' : '#16a34a', border: program.isPublished ? '1px solid #dbeafe' : 'none', color: program.isPublished ? '#374151' : '#fff', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: publishing ? 0.7 : 1, width: '100%' }}>
                  {publishing ? 'Updating…' : program.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <Link href="/admin/programs"
                  style={{ background: '#fff', border: '1px solid #dbeafe', color: '#374151', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 500, textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                  Cancel
                </Link>
              </div>
            </div>

            {/* Settings card */}
            <div style={cardStyle}>
              <p style={sectionHeadStyle}>Settings</p>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select name="trackCode" defaultValue={program.trackCode ?? ''} style={selectStyle}>
                    <option value="">Select category</option>
                    <option value="placement-prep">Placement Prep</option>
                    <option value="cloud-devops">Cloud &amp; DevOps</option>
                    <option value="generative-ai">Generative AI</option>
                    <option value="cybersecurity">Cybersecurity</option>
                    <option value="corporate">Corporate</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Delivery Mode</label>
                  <select name="deliveryMode" defaultValue={program.deliveryMode ?? ''} style={selectStyle}>
                    <option value="">Select mode</option>
                    <option value="on_campus">On Campus</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Duration</label>
                  <input name="duration" type="text" placeholder="e.g. 3 days / 40 hours" defaultValue={program.duration ?? ''} style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#374151', fontWeight: 600 }}>
                  <input type="checkbox" name="isFeatured" defaultChecked={program.isFeatured} style={{ width: 16, height: 16, accentColor: '#2563EB' }} />
                  Featured Program
                </label>
              </div>
            </div>

            {/* Danger zone */}
            <div style={{ ...cardStyle, border: '1px solid rgba(239,68,68,0.2)' }}>
              <p style={{ ...sectionHeadStyle, color: '#dc2626', borderBottomColor: 'rgba(239,68,68,0.15)' }}>Danger Zone</p>
              <button type="button" onClick={handleDelete} disabled={deleting || saving}
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%', opacity: deleting ? 0.7 : 1 }}>
                {deleting ? 'Deleting…' : 'Delete Program'}
              </button>
            </div>

          </div>
        </div>
      </form>
    </>
  )
}
