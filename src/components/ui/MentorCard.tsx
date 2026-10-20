'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'

interface Mentor {
  name: string
  slug: string
  photoUrl?: string | null
  designation?: string | null
  currentCompany?: string | null
  bioHtml?: string | null
  expertiseTags?: string[]
  sessionTypes?: string[]
  bookingUrl?: string | null
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

function MentorAvatar({ name, photoUrl, size }: { name: string; photoUrl?: string | null; size: 'card' | 'popup' }) {
  const dim = size === 'card' ? 72 : 56
  const fontSize = size === 'card' ? 28 : 24
  const cls = size === 'card' ? 'avatar avatar-lg' : 'popup-avatar'

  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        width={dim}
        height={dim}
        className={cls}
        style={{ objectFit: 'cover', borderRadius: '50%', width: dim, height: dim }}
      />
    )
  }

  return <div className={cls} style={{ fontSize }}>{name.charAt(0)}</div>
}

export default function MentorCard({ mentor }: { mentor: Mentor }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const openedAt = useRef(0)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current) }, [])

  useEffect(() => {
    const track = cardRef.current?.closest('.mentor-marquee-track') as HTMLElement | null
    if (!track) return
    if (open) {
      track.style.animationPlayState = 'paused'
      openedAt.current = Date.now()
    } else {
      track.style.animationPlayState = ''
    }
    return () => { track.style.animationPlayState = '' }
  }, [open])

  const cancelClose = useCallback(() => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null }
  }, [])

  const close = useCallback(() => { cancelClose(); setOpen(false) }, [cancelClose])

  const scheduleClose = useCallback((ms = 400) => {
    cancelClose()
    closeTimer.current = setTimeout(close, ms)
  }, [cancelClose, close])

  const m = mentor
  const bio = m.bioHtml ? stripHtml(m.bioHtml) : null
  const hasExtraDetails = !!(bio || (m.expertiseTags && m.expertiseTags.length > 0) || (m.sessionTypes && m.sessionTypes.length > 0))

  const GRACE_MS = 800

  return (
    <div
      ref={cardRef}
      className="mentor-card"
      onMouseEnter={() => { cancelClose(); setOpen(true) }}
      onMouseLeave={() => scheduleClose(500)}
    >
      <MentorAvatar name={m.name} photoUrl={m.photoUrl} size="card" />
      <p className="t-card c-white" style={{ marginBottom: 4 }}>{m.name}</p>
      <p className="t-sm" style={{ color: '#bfdbfe' }}>{m.designation}</p>
      {m.currentCompany && (
        <p className="t-micro" style={{ marginTop: 6, color: '#93c5fd', fontWeight: 600 }}>{m.currentCompany}</p>
      )}

      {mounted && open && createPortal(
        <div
          className="mentor-modal-overlay"
          onClick={close}
          onMouseMove={(e) => {
            if (e.target === e.currentTarget && Date.now() - openedAt.current > GRACE_MS) {
              scheduleClose(300)
            }
          }}
        >
          <div
            className="mentor-popup"
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={cancelClose}
            onMouseLeave={() => scheduleClose(200)}
          >
            <button className="popup-close" onClick={close} aria-label="Close">&times;</button>
            <div className="popup-top">
              <MentorAvatar name={m.name} photoUrl={m.photoUrl} size="popup" />
              <div>
                <p className="popup-name">{m.name}</p>
                <p className="popup-designation">
                  {m.designation}{m.currentCompany ? ` at ${m.currentCompany}` : ''}
                </p>
              </div>
            </div>
            {hasExtraDetails && (
              <div className="popup-body">
                {bio && (
                  <div className="popup-detail-row">
                    <span className="popup-label">About</span>
                    <p className="popup-bio">{bio}</p>
                  </div>
                )}
                {m.expertiseTags && m.expertiseTags.length > 0 && (
                  <div className="popup-detail-row">
                    <span className="popup-label">Expertise</span>
                    <div className="popup-tags">
                      {m.expertiseTags.slice(0, 5).map((tag) => (
                        <span key={tag} className="badge badge-light">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                {m.sessionTypes && m.sessionTypes.length > 0 && (
                  <div className="popup-detail-row">
                    <span className="popup-label">Sessions Offered</span>
                    <div className="popup-sessions">
                      {m.sessionTypes.map((s) => (
                        <span key={s} className="badge badge-gold">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="popup-footer">
              <Link href={`/mentors/${m.slug}`} className="btn btn-gold btn-sm popup-view-more">
                View More →
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
