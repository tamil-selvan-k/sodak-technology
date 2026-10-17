'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TagInput from '@/components/ui/TagInput'
import { useToast } from '@/components/ui/Toast'

interface TrainerOption { id: string; name: string }

export default function BlogPostForm({ trainers }: { trainers: TrainerOption[] }) {
  const router  = useRouter()
  const { toast } = useToast()
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [authorId, setAuthorId]   = useState('')
  const [authorOpen, setAuthorOpen] = useState(false)
  const authorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (authorRef.current && !authorRef.current.contains(e.target as Node)) setAuthorOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const tagsRaw = (fd.get('tags') as string).trim()
    const body = {
      title:              (fd.get('title') as string).trim(),
      authorId:           authorId || undefined,
      category:           (fd.get('category') as string).trim() || undefined,
      excerpt:            (fd.get('excerpt') as string).trim() || undefined,
      bodyHtml:           (fd.get('bodyHtml') as string).trim() || undefined,
      tags:               tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [],
      readingTimeMinutes: fd.get('readingTimeMinutes') ? Number(fd.get('readingTimeMinutes')) : undefined,
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
    toast.success('Draft saved!')
    router.push('/admin/blog')
    router.refresh()
  }

  const cardStyle: React.CSSProperties  = { background: '#ffffff', border: '1px solid #DBEAFE', borderRadius: 12, padding: 24 }
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #dbeafe', borderRadius: 8, fontSize: 14, color: '#172554', background: '#fff', outline: 'none', boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }
  const headStyle: React.CSSProperties  = { fontSize: 13, fontWeight: 700, color: '#172554', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #EFF6FF' }

  const selectedAuthor = trainers.find(t => t.id === authorId)

  return (
    <>
      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626' }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

          {/* ── Left: primary content ── */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={cardStyle}>
              <p style={headStyle}>Post Content</p>
              <div style={{ display: 'grid', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Post Title <span style={{ color: '#ef4444' }}>*</span></label>
                  <input name="title" type="text" required placeholder="e.g. Top 10 Placement Tips for 2025" style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
                <div>
                  <label style={labelStyle}>Body <span style={{ color: '#ef4444' }}>*</span></label>
                  <textarea name="bodyHtml" rows={18} required placeholder="Write your post content here (HTML supported)..."
                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: sidebar ── */}
          <div style={{ width: 288, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>

            {/* Actions */}
            <div style={cardStyle}>
              <p style={headStyle}>Actions</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button type="submit" disabled={saving}
                  style={{ background: '#2563eb', color: '#fff', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: saving ? 0.7 : 1, width: '100%' }}>
                  {saving ? 'Saving…' : 'Save as Draft'}
                </button>
                <Link href="/admin/blog"
                  style={{ background: '#fff', border: '1px solid #dbeafe', color: '#374151', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 500, textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                  Cancel
                </Link>
              </div>
            </div>

            {/* Post settings */}
            <div style={cardStyle}>
              <p style={headStyle}>Post Settings</p>
              <div style={{ display: 'grid', gap: 16 }}>

                {/* Custom author dropdown */}
                <div>
                  <label style={labelStyle}>Author</label>
                  <div ref={authorRef} style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setAuthorOpen(o => !o)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', border: `1px solid ${authorOpen ? '#2563eb' : '#dbeafe'}`,
                        borderRadius: 8, fontSize: 14, background: '#fff',
                        color: selectedAuthor ? '#172554' : '#94a3b8',
                        cursor: 'pointer', outline: 'none', transition: 'border-color 0.15s',
                      }}
                    >
                      <span>{selectedAuthor?.name ?? 'Select author'}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#94a3b8"
                        style={{ flexShrink: 0, transform: authorOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                        <path d="M7 10l5 5 5-5z"/>
                      </svg>
                    </button>

                    {authorOpen && (
                      <div style={{
                        position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 100,
                        background: '#fff', border: '1px solid #dbeafe', borderRadius: 10,
                        boxShadow: '0 8px 24px rgba(37,99,235,0.12)', overflow: 'hidden',
                      }}>
                        {/* "No author" option */}
                        <button
                          type="button"
                          onClick={() => { setAuthorId(''); setAuthorOpen(false) }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            width: '100%', padding: '10px 14px', border: 'none', cursor: 'pointer',
                            fontSize: 13, textAlign: 'left',
                            fontWeight: authorId === '' ? 600 : 400,
                            color: authorId === '' ? '#2563eb' : '#64748b',
                            background: authorId === '' ? '#eff6ff' : 'transparent',
                          }}
                          onMouseEnter={e => { if (authorId !== '') e.currentTarget.style.background = '#f8fafc' }}
                          onMouseLeave={e => { if (authorId !== '') e.currentTarget.style.background = 'transparent' }}
                        >
                          <span style={{
                            width: 28, height: 28, borderRadius: '50%', background: '#e2e8f0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700, color: '#64748b', flexShrink: 0,
                          }}>—</span>
                          <span>No author</span>
                          {authorId === '' && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#2563eb" style={{ marginLeft: 'auto', flexShrink: 0 }}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                          )}
                        </button>

                        <div style={{ height: 1, background: '#f1f5f9' }} />

                        {trainers.map(t => {
                          const initials = t.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
                          const selected = authorId === t.id
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => { setAuthorId(t.id); setAuthorOpen(false) }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                width: '100%', padding: '10px 14px', border: 'none', cursor: 'pointer',
                                fontSize: 13, textAlign: 'left',
                                fontWeight: selected ? 600 : 400,
                                color: selected ? '#172554' : '#334155',
                                background: selected ? '#eff6ff' : 'transparent',
                              }}
                              onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#f8fafc' }}
                              onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}
                            >
                              <span style={{
                                width: 28, height: 28, borderRadius: '50%', background: '#dbeafe',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 700, color: '#2563eb', flexShrink: 0,
                              }}>{initials}</span>
                              <span>{t.name}</span>
                              {selected && (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="#2563eb" style={{ marginLeft: 'auto', flexShrink: 0 }}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Category</label>
                  <input name="category" type="text" placeholder="e.g. Career Tips, Tech, Industry" style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
                <TagInput
                  name="tags"
                  placeholder="e.g. placement, coding…"
                  label="Tags"
                  labelStyle={labelStyle}
                />
                <div>
                  <label style={labelStyle}>Reading Time (min)</label>
                  <input name="readingTimeMinutes" type="number" min={1} max={60} placeholder="e.g. 5" style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
                </div>
              </div>
            </div>

            {/* Excerpt */}
            <div style={cardStyle}>
              <p style={headStyle}>Excerpt</p>
              <textarea name="excerpt" rows={4} placeholder="A short summary shown in post listings..."
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                onBlur={e  => (e.currentTarget.style.borderColor = '#dbeafe')} />
            </div>
          </div>

        </div>
      </form>
    </>
  )
}
