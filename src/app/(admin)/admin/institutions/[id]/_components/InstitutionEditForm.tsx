'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/Toast'
import type { Institution } from '@prisma/client'

interface Props { institution: Institution }

export default function InstitutionEditForm({ institution }: Props) {
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
      name:           (fd.get('name') as string).trim(),
      city:           (fd.get('city') as string).trim() || undefined,
      state:          (fd.get('state') as string).trim() || undefined,
      type:           (fd.get('type') as string) || undefined,
      affiliation:    (fd.get('affiliation') as string).trim() || undefined,
      website:        (fd.get('website') as string).trim() || undefined,
      shortDescription: (fd.get('shortDescription') as string).trim() || undefined,
      displayOrder:   fd.get('displayOrder') ? Number(fd.get('displayOrder')) : undefined,
      logoPermission: fd.get('logoPermission') === 'on',
      showOnHome:     fd.get('showOnHome') === 'on',
    }
    const res = await fetch(`/api/v1/institutions/${institution.id}`, {
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
    toast.success('Institution saved!')
    router.refresh()
  }

  async function handlePublish() {
    setPublishing(true)
    setError(null)
    const res = await fetch(`/api/v1/institutions/${institution.id}/publish`, { method: 'POST' })
    setPublishing(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError((data as { error?: { message?: string } }).error?.message ?? 'Publish failed')
      return
    }
    toast.success('Institution published!')
    router.refresh()
  }

  async function handleUnpublish() {
    setPublishing(true)
    setError(null)
    const res = await fetch(`/api/v1/institutions/${institution.id}/unpublish`, { method: 'POST' })
    setPublishing(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError((data as { error?: { message?: string } }).error?.message ?? 'Unpublish failed')
      return
    }
    toast.success('Institution unpublished.')
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm(`Delete "${institution.name}"? This cannot be undone.`)) return
    setDeleting(true)
    const res = await fetch(`/api/v1/institutions/${institution.id}`, { method: 'DELETE' })
    setDeleting(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError((data as { error?: { message?: string } }).error?.message ?? 'Delete failed')
      return
    }
    toast.success('Institution deleted.')
    router.push('/admin/institutions')
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
        <Link href="/admin/institutions" className="admin-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back to Institutions
        </Link>
      </div>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563EB', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172554', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>{institution.name}</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Edit institution details</p>
      </div>

      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626' }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Left column — primary content */}
          <div style={{ flex: '1 1 400px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={cardStyle}>
              <p style={sectionHeadStyle}>Institution Info</p>
              <div style={{ display: 'grid', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Institution Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input name="name" type="text" required defaultValue={institution.name} style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>City</label>
                    <input name="city" type="text" placeholder="e.g. Chennai" defaultValue={institution.city ?? ''} style={inputStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                      onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                  </div>
                  <div>
                    <label style={labelStyle}>State</label>
                    <input name="state" type="text" placeholder="e.g. Tamil Nadu" defaultValue={institution.state ?? ''} style={inputStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                      onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Affiliation</label>
                  <input name="affiliation" type="text" placeholder="e.g. Anna University" defaultValue={institution.affiliation ?? ''} style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
                <div>
                  <label style={labelStyle}>Website URL</label>
                  <input name="website" type="url" placeholder="https://..." defaultValue={institution.website ?? ''} style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
                <div>
                  <label style={labelStyle}>Short Description</label>
                  <textarea name="shortDescription" rows={4} placeholder="Brief description..." defaultValue={institution.shortDescription ?? ''}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar — metadata + actions */}
          <div style={{ width: 288, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>

            {/* Status badge */}
            <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: institution.isPublished ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                color: institution.isPublished ? '#16a34a' : '#a16207',
                border: `1px solid ${institution.isPublished ? 'rgba(34,197,94,0.25)' : 'rgba(234,179,8,0.25)'}`,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: institution.isPublished ? '#22c55e' : '#eab308', display: 'inline-block' }} />
                {institution.isPublished ? 'Published' : 'Draft'}
              </span>
              {institution.slug && (
                <a href={`/institutions/${institution.slug}`} target="_blank" rel="noopener noreferrer"
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
                {!institution.isPublished ? (
                  <button type="button" onClick={handlePublish} disabled={publishing || saving || deleting}
                    style={{ background: '#16a34a', color: '#fff', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: publishing ? 0.7 : 1, width: '100%' }}>
                    {publishing ? 'Publishing…' : 'Publish'}
                  </button>
                ) : (
                  <button type="button" onClick={handleUnpublish} disabled={publishing || saving || deleting}
                    style={{ background: '#fff', border: '1px solid #dbeafe', color: '#374151', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: publishing ? 0.7 : 1, width: '100%' }}>
                    {publishing ? 'Updating…' : 'Unpublish'}
                  </button>
                )}
                <Link href="/admin/institutions"
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
                  <label style={labelStyle}>Type</label>
                  <select name="type" defaultValue={institution.type ?? ''} style={selectStyle}>
                    <option value="">Select type</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Arts">Arts &amp; Science</option>
                    <option value="Polytechnic">Polytechnic</option>
                    <option value="University">University</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Display Order</label>
                  <input name="displayOrder" type="number" min={0} defaultValue={institution.displayOrder ?? 0} style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
              </div>
            </div>

            {/* Visibility card */}
            <div style={cardStyle}>
              <p style={sectionHeadStyle}>Visibility</p>
              <div style={{ display: 'grid', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#374151', fontWeight: 600 }}>
                  <input type="checkbox" name="logoPermission" defaultChecked={institution.logoPermission} style={{ width: 16, height: 16, accentColor: '#2563EB' }} />
                  Logo Permission Granted
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#374151', fontWeight: 600 }}>
                  <input type="checkbox" name="showOnHome" defaultChecked={institution.showOnHome} style={{ width: 16, height: 16, accentColor: '#2563EB' }} />
                  Show on Homepage
                </label>
              </div>
            </div>

            {/* Danger zone */}
            <div style={{ ...cardStyle, border: '1px solid rgba(239,68,68,0.2)' }}>
              <p style={{ ...sectionHeadStyle, color: '#dc2626', borderBottomColor: 'rgba(239,68,68,0.15)' }}>Danger Zone</p>
              <button type="button" onClick={handleDelete} disabled={deleting || saving}
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%', opacity: deleting ? 0.7 : 1 }}>
                {deleting ? 'Deleting…' : 'Delete Institution'}
              </button>
            </div>

          </div>
        </div>
      </form>
    </>
  )
}
