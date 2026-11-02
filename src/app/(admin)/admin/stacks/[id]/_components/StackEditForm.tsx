'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/Toast'
import type { StackWithTechnologies } from '@/modules/stacks/stacks.types'

interface Props { stack: StackWithTechnologies }

export default function StackEditForm({ stack }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Technology management state
  const [techName, setTechName] = useState('')
  const [addingTech, setAddingTech] = useState(false)
  const [techError, setTechError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const body = {
      name:         (fd.get('name') as string).trim(),
      summary:      (fd.get('summary') as string).trim() || undefined,
      colorToken:   (fd.get('colorToken') as string).trim() || undefined,
      displayOrder: fd.get('displayOrder') ? Number(fd.get('displayOrder')) : 0,
    }
    const res = await fetch(`/api/v1/stacks/${stack.id}`, {
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
    toast.success('Stack saved!')
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm(`Delete "${stack.name}"? This cannot be undone.`)) return
    setDeleting(true)
    const res = await fetch(`/api/v1/stacks/${stack.id}`, { method: 'DELETE' })
    setDeleting(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError((data as { error?: { message?: string } }).error?.message ?? 'Delete failed')
      return
    }
    toast.success('Stack deleted.')
    router.push('/admin/stacks')
    router.refresh()
  }

  async function handleAddTech(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!techName.trim()) return
    setAddingTech(true)
    setTechError(null)
    const res = await fetch(`/api/v1/stacks/${stack.id}/technologies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: techName.trim() }),
    })
    setAddingTech(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setTechError((data as { error?: { message?: string } }).error?.message ?? 'Failed to add technology')
      return
    }
    toast.success('Technology added.')
    setTechName('')
    router.refresh()
  }

  async function handleDeleteTech(techId: string, name: string) {
    if (!confirm(`Remove "${name}" from this stack?`)) return
    const res = await fetch(`/api/v1/stacks/${stack.id}/technologies/${techId}`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error('Failed to remove technology.')
      return
    }
    toast.success('Technology removed.')
    router.refresh()
  }

  const cardStyle: React.CSSProperties = { background: '#ffffff', border: '1px solid #DBEAFE', borderRadius: 12, padding: 24 }
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #dbeafe', borderRadius: 8, fontSize: 14, color: '#172554', background: '#fff', outline: 'none', boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }
  const sectionHeadStyle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#172554', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #EFF6FF' }

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <Link href="/admin/stacks" className="admin-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back to Stacks
        </Link>
      </div>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563EB', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172554', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>{stack.name}</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Edit stack details and technologies</p>
      </div>

      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626' }}>{error}</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Section 1: Edit stack */}
        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">

            {/* Left column */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={cardStyle}>
                <p style={sectionHeadStyle}>Stack Details</p>
                <div style={{ display: 'grid', gap: 20 }}>
                  <div>
                    <label style={labelStyle}>Name <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      name="name"
                      type="text"
                      required
                      defaultValue={stack.name}
                      style={inputStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                      onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Summary</label>
                    <textarea
                      name="summary"
                      rows={3}
                      placeholder="Brief description of this stack…"
                      defaultValue={stack.summary ?? ''}
                      style={{ ...inputStyle, resize: 'vertical' }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                      onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Slug</label>
                    <div style={{ ...inputStyle, background: '#f8fafc', color: '#94a3b8', fontSize: 13, fontFamily: 'monospace', cursor: 'not-allowed' }}>
                      {stack.slug}
                    </div>
                    <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Auto-regenerated when name changes.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="admin-form-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>
              {/* Actions */}
              <div style={cardStyle}>
                <p style={sectionHeadStyle}>Actions</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    type="submit"
                    disabled={saving || deleting}
                    style={{ background: '#2563eb', color: '#fff', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: saving ? 0.7 : 1, width: '100%' }}
                  >
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <Link
                    href="/admin/stacks"
                    style={{ background: '#fff', border: '1px solid #dbeafe', color: '#374151', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 500, textDecoration: 'none', textAlign: 'center', display: 'block' }}
                  >
                    Cancel
                  </Link>
                </div>
              </div>

              {/* Settings */}
              <div style={cardStyle}>
                <p style={sectionHeadStyle}>Settings</p>
                <div style={{ display: 'grid', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Color Token</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="color"
                        defaultValue={stack.colorToken ?? '#2563EB'}
                        style={{ width: 40, height: 40, padding: 2, border: '1px solid #dbeafe', borderRadius: 8, cursor: 'pointer', background: 'none' }}
                        onChange={e => {
                          const textInput = document.getElementById(`colorTokenText-${stack.id}`) as HTMLInputElement | null
                          if (textInput) textInput.value = e.target.value
                        }}
                      />
                      <input
                        id={`colorTokenText-${stack.id}`}
                        name="colorToken"
                        type="text"
                        placeholder="#2563EB or blue-600"
                        defaultValue={stack.colorToken ?? ''}
                        style={{ ...inputStyle, flex: 1 }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                        onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Display Order</label>
                    <input
                      name="displayOrder"
                      type="number"
                      min={0}
                      defaultValue={stack.displayOrder}
                      style={inputStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                      onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')}
                    />
                  </div>
                </div>
              </div>

              {/* Danger zone */}
              <div style={{ ...cardStyle, border: '1px solid rgba(239,68,68,0.2)' }}>
                <p style={{ ...sectionHeadStyle, color: '#dc2626', borderBottomColor: 'rgba(239,68,68,0.15)' }}>Danger Zone</p>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting || saving}
                  style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%', opacity: deleting ? 0.7 : 1 }}
                >
                  {deleting ? 'Deleting…' : 'Delete Stack'}
                </button>
              </div>
            </div>

          </div>
        </form>

        {/* Section 2: Manage Technologies */}
        <div style={cardStyle}>
          <p style={sectionHeadStyle}>Technologies</p>

          {techError && (
            <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626' }}>{techError}</div>
          )}

          {/* Existing technologies */}
          {stack.technologies.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 20, border: '1px solid #dbeafe', borderRadius: 8, overflow: 'hidden' }}>
              {stack.technologies.map((tech, idx) => (
                <div
                  key={tech.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    fontSize: 13,
                    color: '#172554',
                    borderTop: idx > 0 ? '1px solid #dbeafe' : undefined,
                    background: '#fff',
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{tech.name}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteTech(tech.id, tech.name)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 12, fontWeight: 600, padding: '4px 8px', borderRadius: 6 }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>No technologies yet. Add some below.</p>
          )}

          {/* Add technology form */}
          <form onSubmit={handleAddTech} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="text"
              value={techName}
              onChange={e => setTechName(e.target.value)}
              placeholder="Technology name, e.g. React"
              style={{ ...inputStyle, flex: 1, padding: '9px 12px', fontSize: 13 }}
              onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
              onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')}
            />
            <button
              type="submit"
              disabled={addingTech || !techName.trim()}
              style={{ padding: '9px 18px', fontSize: 13, fontWeight: 700, background: '#2563EB', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap', opacity: addingTech ? 0.7 : 1 }}
            >
              {addingTech ? 'Adding…' : '+ Add'}
            </button>
          </form>
        </div>

      </div>
    </>
  )
}
