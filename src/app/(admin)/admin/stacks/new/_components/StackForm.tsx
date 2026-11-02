'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/Toast'

export default function StackForm() {
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
      name:         (fd.get('name') as string).trim(),
      summary:      (fd.get('summary') as string).trim() || undefined,
      colorToken:   (fd.get('colorToken') as string).trim() || undefined,
      displayOrder: fd.get('displayOrder') ? Number(fd.get('displayOrder')) : 0,
    }
    const res = await fetch('/api/v1/stacks', {
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
    const result = (await res.json()) as { data: { id: string } }
    toast.success('Stack created!')
    router.push(`/admin/stacks/${result.data.id}`)
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
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172554', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>New Stack</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Create a new technology stack</p>
      </div>

      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626' }}>{error}</div>
      )}

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
                    placeholder="e.g. Full-Stack Development"
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')}
                  />
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Slug will be auto-generated from the name.</p>
                </div>
                <div>
                  <label style={labelStyle}>Summary</label>
                  <textarea
                    name="summary"
                    rows={3}
                    placeholder="Brief description of this stack…"
                    style={{ ...inputStyle, resize: 'vertical' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')}
                  />
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
                  disabled={saving}
                  style={{ background: '#2563eb', color: '#fff', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: saving ? 0.7 : 1, width: '100%' }}
                >
                  {saving ? 'Saving…' : 'Save Stack'}
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
                      id="colorPicker"
                      defaultValue="#2563EB"
                      style={{ width: 40, height: 40, padding: 2, border: '1px solid #dbeafe', borderRadius: 8, cursor: 'pointer', background: 'none' }}
                      onChange={e => {
                        const textInput = document.getElementById('colorTokenText') as HTMLInputElement | null
                        if (textInput) textInput.value = e.target.value
                      }}
                    />
                    <input
                      id="colorTokenText"
                      name="colorToken"
                      type="text"
                      placeholder="#2563EB or blue-600"
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
                    defaultValue={0}
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </form>
    </>
  )
}
