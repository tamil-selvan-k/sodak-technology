'use client'

import { useState, useRef, useCallback, useEffect, type DragEvent, type ChangeEvent } from 'react'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const DEFAULT_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'

interface MediaFile {
  id: string
  url: string
  originalName: string
  mimeType: string
  sizeBytes: number
  createdAt: string
}

interface ImageUploadProps {
  value?: string
  onChange: (url: string | null) => void
  label?: string
  accept?: string
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Image',
  accept = DEFAULT_ACCEPT,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const [pickerOpen, setPickerOpen] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const [mediaPage, setMediaPage] = useState(1)
  const [mediaTotalPages, setMediaTotalPages] = useState(1)

  const handleFile = useCallback(
    async (file: File) => {
      setError(null)

      const allowed = accept.split(',').map(t => t.trim())
      if (!allowed.includes(file.type)) {
        setError('File type not allowed. Please upload a JPEG, PNG, WebP, or GIF image.')
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        setError('File exceeds 10 MB limit.')
        return
      }

      setUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/v1/media', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({})) as { error?: { message?: string } }
          throw new Error(data.error?.message ?? `Upload failed (${res.status})`)
        }

        const { data } = (await res.json()) as { data: { url: string } }
        onChange(data.url)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setUploading(false)
        if (inputRef.current) inputRef.current.value = ''
      }
    },
    [accept, onChange],
  )

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
  }

  function handleRemove() {
    onChange(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  // --- Media picker ---
  const fetchMedia = useCallback(async (page: number) => {
    setMediaLoading(true)
    try {
      const res = await fetch(`/api/v1/media?page=${page}`)
      if (!res.ok) return
      const json = (await res.json()) as { data: MediaFile[]; meta: { pages: number } }
      const images = json.data.filter(f => f.mimeType.startsWith('image/'))
      setMediaFiles(images)
      setMediaTotalPages(json.meta.pages)
    } finally {
      setMediaLoading(false)
    }
  }, [])

  useEffect(() => {
    if (pickerOpen) {
      fetchMedia(mediaPage)
    }
  }, [pickerOpen, mediaPage, fetchMedia])

  function openPicker() {
    setMediaPage(1)
    setPickerOpen(true)
  }

  function selectMedia(url: string) {
    onChange(url)
    setPickerOpen(false)
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 6,
  }

  const zoneStyle: React.CSSProperties = {
    position: 'relative',
    border: `2px dashed ${dragOver ? '#2563eb' : '#dbeafe'}`,
    borderRadius: 8,
    padding: 20,
    textAlign: 'center',
    cursor: uploading ? 'default' : 'pointer',
    background: dragOver ? 'rgba(37,99,235,0.04)' : '#fff',
    transition: 'border-color 0.15s, background 0.15s',
  }

  const previewContainerStyle: React.CSSProperties = {
    position: 'relative',
    border: '1px solid #dbeafe',
    borderRadius: 8,
    padding: 8,
    background: '#fff',
    display: 'inline-block',
  }

  const smallBtnStyle: React.CSSProperties = {
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 6,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    border: '1px solid #dbeafe',
    background: '#eff6ff',
    color: '#2563eb',
  }

  return (
    <div>
      {label && <span style={labelStyle}>{label}</span>}

      {value ? (
        /* ---- Preview mode ---- */
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={previewContainerStyle}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Uploaded preview"
              style={{
                display: 'block',
                maxWidth: 160,
                maxHeight: 160,
                borderRadius: 6,
                objectFit: 'cover',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              type="button"
              onClick={handleRemove}
              style={{
                ...smallBtnStyle,
                color: '#dc2626',
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.25)',
              }}
            >
              Remove
            </button>
            <button type="button" onClick={openPicker} style={smallBtnStyle}>
              Change
            </button>
          </div>
        </div>
      ) : (
        /* ---- Upload / select options ---- */
        <div>
          <div
            style={zoneStyle}
            onClick={() => !uploading && inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                inputRef.current?.click()
              }
            }}
          >
            {uploading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ animation: 'spin 1s linear infinite' }}
                >
                  <circle cx="12" cy="12" r="10" stroke="#dbeafe" strokeWidth="3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                <span style={{ fontSize: 13, color: '#64748b' }}>Uploading...</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span style={{ fontSize: 13, color: '#64748b' }}>
                  Click or drag an image to upload
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>
                  JPEG, PNG, WebP, or GIF (max 10 MB)
                </span>
              </div>
            )}
          </div>
          {!uploading && (
            <button
              type="button"
              onClick={openPicker}
              style={{
                marginTop: 8,
                padding: '7px 16px',
                fontSize: 13,
                fontWeight: 600,
                color: '#2563eb',
                background: '#eff6ff',
                border: '1px solid #dbeafe',
                borderRadius: 6,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              Select from Media Library
            </button>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />

      {error && (
        <p style={{ marginTop: 6, fontSize: 12, color: '#dc2626' }}>{error}</p>
      )}

      {/* ---- Media Picker Modal ---- */}
      {pickerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
          }}
          onClick={() => setPickerOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 12,
              width: '90%',
              maxWidth: 720,
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            }}
          >
            {/* Modal header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#172554' }}>
                Select from Media Library
              </span>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 20, color: '#94a3b8', lineHeight: 1, padding: 4,
                }}
              >
                &times;
              </button>
            </div>

            {/* Modal body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              {mediaLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 }}>
                  <div style={{ width: 28, height: 28, border: '3px solid #DBEAFE', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : mediaFiles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#64748b', fontSize: 14 }}>
                  No images found in the media library.
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: 12,
                }}>
                  {mediaFiles.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => selectMedia(f.url)}
                      style={{
                        padding: 0,
                        border: '2px solid #dbeafe',
                        borderRadius: 8,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: '#f8fafc',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#2563eb'
                        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(37,99,235,0.15)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#dbeafe'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={f.url}
                        alt={f.originalName}
                        style={{
                          width: '100%',
                          height: 100,
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                      <div style={{
                        padding: '6px 8px',
                        fontSize: 11,
                        color: '#475569',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'left',
                      }}>
                        {f.originalName}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal footer — pagination */}
            {mediaTotalPages > 1 && (
              <div style={{
                padding: '12px 20px',
                borderTop: '1px solid #dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                fontSize: 13,
                color: '#64748b',
              }}>
                <button
                  type="button"
                  disabled={mediaPage <= 1}
                  onClick={() => setMediaPage(p => p - 1)}
                  style={{
                    background: 'none', border: 'none', cursor: mediaPage <= 1 ? 'default' : 'pointer',
                    color: mediaPage <= 1 ? '#cbd5e1' : '#2563eb', fontWeight: 600, fontSize: 13,
                  }}
                >
                  &larr; Prev
                </button>
                <span>Page {mediaPage} of {mediaTotalPages}</span>
                <button
                  type="button"
                  disabled={mediaPage >= mediaTotalPages}
                  onClick={() => setMediaPage(p => p + 1)}
                  style={{
                    background: 'none', border: 'none', cursor: mediaPage >= mediaTotalPages ? 'default' : 'pointer',
                    color: mediaPage >= mediaTotalPages ? '#cbd5e1' : '#2563eb', fontWeight: 600, fontSize: 13,
                  }}
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
