'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface MediaFile {
  id: string
  url: string
  originalName: string
  mimeType: string
  sizeBytes: number
  createdAt: string
}

interface Props {
  files: MediaFile[]
  total: number
  page: number
  pages: number
}

const TABS = ['All', 'Images', 'Documents', 'Videos'] as const
type Tab = (typeof TABS)[number]

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function tabFilter(file: MediaFile, tab: Tab) {
  if (tab === 'All') return true
  if (tab === 'Images') return file.mimeType.startsWith('image/')
  if (tab === 'Documents') return file.mimeType === 'application/pdf'
  if (tab === 'Videos') return file.mimeType.startsWith('video/')
  return true
}

function fileIcon(mimeType: string) {
  if (mimeType === 'application/pdf') return 'PDF'
  if (mimeType.startsWith('video/')) return 'VID'
  return 'IMG'
}

export default function MediaLibrary({ files, total, page, pages }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('All')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const visible = files.filter(f => tabFilter(f, activeTab))
  const counts: Record<Tab, number> = {
    All: files.length,
    Images: files.filter(f => f.mimeType.startsWith('image/')).length,
    Documents: files.filter(f => f.mimeType === 'application/pdf').length,
    Videos: files.filter(f => f.mimeType.startsWith('video/')).length,
  }

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    setUploading(true)
    setUploadError('')
    try {
      for (const file of Array.from(fileList)) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/v1/media', { method: 'POST', body: fd })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error((body as { error?: { message?: string } }).error?.message ?? 'Upload failed')
        }
      }
      startTransition(() => router.refresh())
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    const res = await fetch(`/api/v1/media/${id}`, { method: 'DELETE' })
    if (!res.ok) { alert('Delete failed'); return }
    startTransition(() => router.refresh())
  }

  function copyUrl(id: string, url: string) {
    void navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  function goTo(p: number) {
    router.push(`/admin/media?page=${p}`)
  }

  return (
    <>
      {/* Upload section */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc', marginBottom: 14 }}>Upload New File</p>
        {uploadError && (
          <p style={{ fontSize: 12, color: '#f87171', marginBottom: 8 }}>{uploadError}</p>
        )}
        <div
          style={{
            border: '2px dashed rgba(255,255,255,0.2)', borderRadius: 10, padding: 48,
            textAlign: 'center', background: 'rgba(255,255,255,0.03)', cursor: 'pointer',
            transition: 'border-color 0.15s, background 0.15s',
          }}
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); void handleUpload(e.dataTransfer.files) }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLDivElement).style.borderColor = '#c8a035'
            ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(200,160,53,0.05)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.2)'
            ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4"
            multiple
            style={{ display: 'none' }}
            onChange={e => void handleUpload(e.target.files)}
          />
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M9 3L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.17L15 3H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3z"/></svg></div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>
            {uploading ? 'Uploading…' : 'Drop files here or click to upload'}
          </p>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>
            Accepts JPG, PNG, WEBP, PDF, MP4 — max 10 MB per file
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid rgba(255,255,255,0.08)', marginBottom: 24 }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 18px', fontSize: 13,
              fontWeight: activeTab === tab ? 600 : 500,
              color: activeTab === tab ? '#c8a035' : '#94a3b8',
              cursor: 'pointer',
              marginBottom: -2, background: 'none', border: 'none',
              borderBottomWidth: 2, borderBottomStyle: 'solid',
              borderBottomColor: activeTab === tab ? '#c8a035' : 'transparent',
              transition: 'color 0.15s',
            }}
          >
            {tab} ({counts[tab]})
          </button>
        ))}
      </div>

      {/* Media grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {visible.length === 0 && (
          <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '40px 0' }}>
            No files found.
          </p>
        )}
        {visible.map(f => (
          <div key={f.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
            {/* Thumbnail */}
            {f.mimeType.startsWith('image/') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={f.url}
                alt={f.originalName}
                style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block', background: 'rgba(255,255,255,0.08)', cursor: 'pointer' }}
                onClick={() => window.open(f.url, '_blank')}
              />
            ) : (
              <div
                style={{
                  height: 160, background: 'rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 8, color: '#94a3b8',
                  fontSize: 36, cursor: 'pointer',
                }}
                onClick={() => window.open(f.url, '_blank')}
              >
                <span>{fileIcon(f.mimeType)}</span>
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {f.mimeType.split('/').pop()}
                </span>
              </div>
            )}

            {/* Card body */}
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f8fafc', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {f.originalName}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>
                Uploaded: {formatDate(f.createdAt)} — {formatBytes(f.sizeBytes)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => handleDelete(f.id, f.originalName)}
                  style={{
                    padding: '5px 11px', borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    border: '1px solid rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.08)', color: '#f87171',
                  }}
                >
                  Delete
                </button>
                <button
                  onClick={() => copyUrl(f.id, f.url)}
                  style={{
                    padding: '5px 11px', borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#94a3b8',
                    marginLeft: 'auto',
                  }}
                >
                  {copiedId === f.id ? 'Copied!' : 'Copy URL'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ marginTop: 20, padding: '10px 14px', fontSize: 12, color: '#94a3b8' }}>
          Showing {files.length} of {total} files —{' '}
          {page > 1 && (
            <button onClick={() => goTo(page - 1)} style={{ color: '#c8a035', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              ← Prev
            </button>
          )}
          {' '}Page {page} of {pages}{' '}
          {page < pages && (
            <button onClick={() => goTo(page + 1)} style={{ color: '#c8a035', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              Next →
            </button>
          )}
        </div>
      )}
    </>
  )
}
