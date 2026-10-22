'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/Toast'

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

interface Course {
  id: string
  title: string
  slug: string
  category: string | null
  level: string | null
  duration: string | null
  coverImageUrl: string | null
  descriptionHtml: string | null
  outcomes: string[]
  isFeatured: boolean
  isPublished: boolean
  displayOrder: number
}

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [level, setLevel] = useState('')
  const [duration, setDuration] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [descriptionHtml, setDescriptionHtml] = useState('')
  const [outcomesRaw, setOutcomesRaw] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [displayOrder, setDisplayOrder] = useState(0)

  useEffect(() => {
    fetch(`/api/v1/courses/${id}`)
      .then(r => r.json())
      .then(res => {
        const c: Course = res.data
        setCourse(c)
        setTitle(c.title)
        setCategory(c.category ?? '')
        setLevel(c.level ?? '')
        setDuration(c.duration ?? '')
        setCoverImageUrl(c.coverImageUrl ?? '')
        setDescriptionHtml(c.descriptionHtml ?? '')
        setOutcomesRaw((c.outcomes ?? []).join('\n'))
        setIsFeatured(c.isFeatured)
        setIsPublished(c.isPublished)
        setDisplayOrder(c.displayOrder)
      })
      .catch(() => setError('Failed to load course.'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess('')
    const res = await fetch(`/api/v1/courses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        category: category || null,
        level: level || null,
        duration: duration || null,
        coverImageUrl: coverImageUrl || null,
        descriptionHtml: descriptionHtml || null,
        outcomes: outcomesRaw.split('\n').map(s => s.trim()).filter(Boolean),
        isFeatured,
        displayOrder,
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data?.error?.message ?? 'Save failed.'); toast.error(data?.error?.message ?? 'Save failed.') }
    else { toast.success('Course saved!'); router.push('/admin/courses') }
    setSaving(false)
  }

  async function handlePublishToggle() {
    setPublishing(true)
    setError('')
    const action = isPublished ? 'unpublish' : 'publish'
    const res = await fetch(`/api/v1/courses/${id}/${action}`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok) { setError(data?.error?.message ?? `${action} failed.`); toast.error(data?.error?.message ?? `Failed to ${action}.`) }
    else { setIsPublished(!isPublished); isPublished ? toast.info('Course unpublished.') : toast.success('Course published!') }
    setPublishing(false)
  }

  if (loading) return (
    <main className="admin-main">
      <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #DBEAFE', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </main>
  )
  if (!course) return <main className="admin-main"><p style={{ color: '#ef4444' }}>Course not found.</p></main>

  const labelStyle = { fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6, display: 'block' }
  const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #dbeafe', fontSize: 14, color: '#172554', background: '#ffffff', boxSizing: 'border-box' as const, outline: 'none' }
  const selectStyle = { ...inputStyle, appearance: 'none' as const, WebkitAppearance: 'none' as const, background: "#ffffff url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%2364748b'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\") no-repeat right 12px center", backgroundSize: '16px', paddingRight: '36px', cursor: 'pointer' as const }
  const cardStyle = { background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 12, padding: '24px 28px', marginBottom: 20 }

  return (
    <main className="admin-main">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Link href="/admin/courses" style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
          ← Back to Courses
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#172554' }}>Edit Course</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{course.title}</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleSave} disabled={saving} style={{ padding: '9px 22px', fontSize: 13, fontWeight: 700, background: '#2563EB', color: '#fff', borderRadius: '2rem', border: 'none', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button onClick={handlePublishToggle} disabled={publishing} style={{ padding: '9px 22px', fontSize: 13, fontWeight: 700, background: isPublished ? '#f1f5f9' : '#16a34a', color: isPublished ? '#334155' : '#fff', borderRadius: '2rem', border: '1px solid #dbeafe', cursor: 'pointer', opacity: publishing ? 0.6 : 1 }}>
              {publishing ? '…' : isPublished ? 'Unpublish' : 'Publish'}
            </button>
          </div>
        </div>
        {error   && <p style={{ marginTop: 10, color: '#ef4444', fontSize: 13 }}>{error}</p>}
        {success && <p style={{ marginTop: 10, color: '#16a34a', fontSize: 13 }}>{success}</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
        {/* Main */}
        <div>
          <div style={cardStyle}>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Title</label>
              <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Description (HTML)</label>
              <textarea style={{ ...inputStyle, minHeight: 140, resize: 'vertical' }} value={descriptionHtml} onChange={e => setDescriptionHtml(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Outcomes (one per line)</label>
              <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} value={outcomesRaw} onChange={e => setOutcomesRaw(e.target.value)} placeholder="Students will be able to..." />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div style={cardStyle}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Status</label>
              <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: isPublished ? '#dcfce7' : '#fef9c3', color: isPublished ? '#16a34a' : '#b45309', border: isPublished ? '1px solid #bbf7d0' : '1px solid #fde68a' }}>
                {isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Category</label>
              <input style={inputStyle} value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Web Development" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Level</label>
              <select style={selectStyle} value={level} onChange={e => setLevel(e.target.value)}>
                <option value="">— Select —</option>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Duration</label>
              <input style={inputStyle} value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 45 hours" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Cover Image URL</label>
              <input style={inputStyle} value={coverImageUrl} onChange={e => setCoverImageUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Display Order</label>
              <input type="number" style={inputStyle} value={displayOrder} onChange={e => setDisplayOrder(Number(e.target.value))} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="featured" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#2563eb' }} />
              <label htmlFor="featured" style={{ fontSize: 13, color: '#334155', cursor: 'pointer' }}>Featured course</label>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
