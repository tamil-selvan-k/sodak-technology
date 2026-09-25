'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface Photo {
  id: string
  url: string
  altText: string | null
  caption: string | null
  title: string | null
  tags: string[]
  hasStudentFaces: boolean
  studentConsentRef: string | null
  isPublished: boolean
  createdAt: string
}

interface Institution {
  id: string
  name: string
}

interface Props {
  photos: Photo[]
  institutions: Institution[]
  total: number
  page: number
  pages: number
  institutionFilter?: string
}

const btnEdit    = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[rgba(96,165,250,0.25)] bg-[rgba(96,165,250,0.08)] text-[#60a5fa] hover:bg-[rgba(96,165,250,0.14)] transition-colors'
const btnPublish = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[rgba(74,222,128,0.25)] bg-[rgba(74,222,128,0.08)] text-[#4ade80] hover:bg-[rgba(74,222,128,0.14)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
const btnDelete  = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.08)] text-[#f87171] hover:bg-[rgba(248,113,113,0.14)] transition-colors'
const btnDefault = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.06)] text-[#94a3b8] hover:bg-[rgba(255,255,255,0.1)] transition-colors'

function canPublish(p: Photo) {
  if (!p.altText) return false
  if (p.hasStudentFaces && !p.studentConsentRef) return false
  return true
}

export default function GalleryManager({ photos: initialPhotos, institutions, total, page, pages, institutionFilter }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editAlt, setEditAlt] = useState<Record<string, string>>({})
  const [editCaption, setEditCaption] = useState<Record<string, string>>({})
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null)
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const photos = initialPhotos

  function toggleSelect(id: string) {
    setSelected(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  function toggleSelectAll() {
    if (selected.size === photos.length) setSelected(new Set())
    else setSelected(new Set(photos.map(p => p.id)))
  }

  async function patchPhoto(id: string, data: Record<string, unknown>) {
    const res = await fetch(`/api/v1/photos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      alert((body as { error?: { message?: string } }).error?.message ?? 'Update failed')
      return false
    }
    startTransition(() => router.refresh())
    return true
  }

  async function handleSaveAlt(id: string) {
    const alt = editAlt[id]
    if (alt === undefined) return
    await patchPhoto(id, { altText: alt })
    setEditAlt(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  async function handlePublish(id: string) {
    const res = await fetch(`/api/v1/photos/${id}/publish`, { method: 'POST' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      alert((body as { error?: { message?: string } }).error?.message ?? 'Publish failed')
      return
    }
    startTransition(() => router.refresh())
  }

  async function handleUnpublish(id: string) {
    await patchPhoto(id, { isPublished: false })
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this photo? It will be soft-deleted.')) return
    const res = await fetch(`/api/v1/photos/${id}`, { method: 'DELETE' })
    if (!res.ok) { alert('Delete failed'); return }
    startTransition(() => router.refresh())
  }

  async function bulkPublish() {
    if (selected.size === 0) return
    const res = await fetch('/api/v1/photos/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(selected), action: 'publish' }),
    })
    const body = await res.json().catch(() => ({}))
    const failed = (body as { data?: { failed?: { id: string; error: string }[] } }).data?.failed ?? []
    if (failed.length > 0) {
      alert(`${failed.length} photo(s) could not be published:\n${failed.map((f: { id: string; error: string }) => f.error).join('\n')}`)
    }
    setSelected(new Set())
    startTransition(() => router.refresh())
  }

  // Upload: file → POST /api/v1/media → POST /api/v1/photos
  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    const files = Array.from(fileList).slice(0, 20)
    setUploadErrors([])
    setUploadProgress({ done: 0, total: files.length })
    const errors: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]!
      try {
        // 1. Upload to media library
        const fd = new FormData()
        fd.append('file', file)
        const mediaRes = await fetch('/api/v1/media', { method: 'POST', body: fd })
        if (!mediaRes.ok) throw new Error(`Media upload failed: ${file.name}`)
        const { data: mediaFile } = await mediaRes.json() as { data: { url: string } }

        // 2. Create photo record
        const photoRes = await fetch('/api/v1/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: mediaFile.url, altText: null }),
        })
        if (!photoRes.ok) throw new Error(`Photo record failed: ${file.name}`)
      } catch (e) {
        errors.push(e instanceof Error ? e.message : `Failed: ${file.name}`)
      }
      setUploadProgress({ done: i + 1, total: files.length })
    }

    setUploadErrors(errors)
    if (errors.length === 0) setUploadProgress(null)
    startTransition(() => router.refresh())
  }

  function changeInstitution(val: string) {
    const params = new URLSearchParams()
    if (val) params.set('institution', val)
    router.push(`/admin/gallery${params.toString() ? '?' + params.toString() : ''}`)
  }

  return (
    <>
      {/* Upload + Filter bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, marginBottom: 24, alignItems: 'start' }}>
        {/* Upload area */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc', marginBottom: 12 }}>Bulk Upload Photos (max 20)</p>
          {uploadProgress && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>
                <span>Uploading…</span>
                <span>{uploadProgress.done} / {uploadProgress.total}</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%', background: '#c8a035', borderRadius: 3,
                    width: `${Math.round((uploadProgress.done / uploadProgress.total) * 100)}%`,
                    transition: 'width 0.2s',
                  }}
                />
              </div>
            </div>
          )}
          {uploadErrors.length > 0 && (
            <div style={{ fontSize: 11, color: '#f87171', marginBottom: 8 }}>
              {uploadErrors.map((e, i) => <div key={i}>{e}</div>)}
            </div>
          )}
          <div
            style={{ border: '2px dashed rgba(255,255,255,0.2)', borderRadius: 10, padding: '32px 24px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.03)' }}
            onClick={() => inputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); void handleUpload(e.dataTransfer.files) }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#c8a035' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.2)' }}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              style={{ display: 'none' }}
              onChange={e => void handleUpload(e.target.files)}
            />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M9 3L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.17L15 3H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3z"/></svg></div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>Drop photos or click to browse</p>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>JPG, PNG, WEBP — up to 20 files, 10 MB each</p>
          </div>
        </div>

        {/* Filters + bulk actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 220 }}>
          <select
            value={institutionFilter ?? ''}
            onChange={e => changeInstitution(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, fontSize: 13, color: '#e2e8f0', background: 'rgba(255,255,255,0.06)' }}
          >
            <option value="">All Institutions</option>
            {institutions.map(i => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>
          {selected.size > 0 && (
            <button
              onClick={() => void bulkPublish()}
              style={{
                padding: '8px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: '#c8a035', color: '#0a0f1e', border: 'none',
              }}
            >
              Publish {selected.size} selected
            </button>
          )}
        </div>
      </div>

      {/* Photo grid */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.03)', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.06)' }}>
              <th style={{ padding: '10px 14px', textAlign: 'center', width: 40 }}>
                <input
                  type="checkbox"
                  checked={selected.size > 0 && selected.size === photos.length}
                  onChange={toggleSelectAll}
                />
              </th>
              {['Photo','Alt Text','Category','Flags','Status','Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {photos.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '40px 14px', textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
                  No photos yet. Upload some using the area above.
                </td>
              </tr>
            )}
            {photos.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = ''}
              >
                <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} />
                </td>
                <td style={{ padding: '11px 14px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.altText ?? ''} style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 5, display: 'block', background: '#e2e8f0' }} />
                </td>
                <td style={{ padding: '11px 14px', minWidth: 200 }}>
                  {editAlt[p.id] !== undefined ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        type="text"
                        value={editAlt[p.id]}
                        onChange={e => setEditAlt(prev => ({ ...prev, [p.id]: e.target.value }))}
                        style={{ flex: 1, padding: '5px 8px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 5, fontSize: 12, color: '#e2e8f0', background: 'rgba(255,255,255,0.06)' }}
                        onFocus={e => (e.target.style.borderColor = '#c8a035')}
                        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                      />
                      <button onClick={() => void handleSaveAlt(p.id)} className={btnPublish}>Save</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: p.altText ? '#e2e8f0' : '#64748b' }}>
                        {p.altText ?? '⚠ No alt text'}
                      </span>
                      <button
                        className={btnEdit}
                        onClick={() => setEditAlt(prev => ({ ...prev, [p.id]: p.altText ?? '' }))}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </td>
                <td style={{ padding: '11px 14px', fontSize: 12, color: '#94a3b8' }}>
                  {p.title ?? (p.tags.length > 0 ? p.tags.join(', ') : '—')}
                </td>
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {p.hasStudentFaces && (
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                        Student Faces
                      </span>
                    )}
                    {p.hasStudentFaces && !p.studentConsentRef && (
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}>
                        No Consent Ref
                      </span>
                    )}
                    {!p.altText && (
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}>
                        No Alt Text
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '11px 14px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
                    borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: p.isPublished ? 'rgba(74,222,128,0.12)' : 'rgba(251,191,36,0.1)',
                    color: p.isPublished ? '#4ade80' : '#fbbf24',
                    border: `1px solid ${p.isPublished ? 'rgba(74,222,128,0.25)' : 'rgba(251,191,36,0.25)'}`,
                  }}>
                    {p.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {p.isPublished ? (
                      <button className={btnDefault} onClick={() => void handleUnpublish(p.id)}>Unpublish</button>
                    ) : (
                      <button
                        className={canPublish(p) ? btnPublish : btnDefault + ' opacity-40 cursor-not-allowed'}
                        disabled={!canPublish(p)}
                        title={!p.altText ? 'Alt text required' : p.hasStudentFaces && !p.studentConsentRef ? 'Consent ref required' : undefined}
                        onClick={() => { if (canPublish(p)) void handlePublish(p.id) }}
                      >
                        Publish
                      </button>
                    )}
                    <button className={btnDelete} onClick={() => void handleDelete(p.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ marginTop: 16, padding: '10px 14px', fontSize: 12, color: '#94a3b8' }}>
          Page {page} of {pages} — {total} photos
        </div>
      )}
    </>
  )
}
