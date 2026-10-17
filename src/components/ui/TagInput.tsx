'use client'

import { useState, useRef, KeyboardEvent, ClipboardEvent } from 'react'

interface Props {
  name: string
  defaultValue?: string[]
  placeholder?: string
  label?: string
  labelStyle?: React.CSSProperties
}

export default function TagInput({ name, defaultValue = [], placeholder = 'Type and press comma…', label, labelStyle }: Props) {
  const [tags, setTags]     = useState<string[]>(defaultValue)
  const [input, setInput]   = useState('')
  const inputRef            = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)

  function addTag(raw: string) {
    const trimmed = raw.trim().replace(/,$/, '').trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed])
    }
    setInput('')
  }

  function removeTag(idx: number) {
    setTags(prev => prev.filter((_, i) => i !== idx))
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === ',' || e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      setTags(prev => prev.slice(0, -1))
    }
  }

  function onChange(val: string) {
    // If user types a comma mid-string, split immediately
    if (val.includes(',')) {
      const parts = val.split(',')
      parts.slice(0, -1).forEach(p => { if (p.trim()) setTags(prev => [...prev, p.trim()].filter((t, i, a) => a.indexOf(t) === i)) })
      setInput(parts[parts.length - 1] ?? '')
    } else {
      setInput(val)
    }
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text')
    pasted.split(',').forEach(p => {
      const t = p.trim()
      if (t) setTags(prev => [...prev, t].filter((v, i, a) => a.indexOf(v) === i))
    })
    setInput('')
  }

  return (
    <div>
      {label && <label style={labelStyle}>{label}</label>}

      {/* Hidden input carries the comma-joined value for FormData */}
      <input type="hidden" name={name} value={tags.join(',')} />

      {/* Chip container — looks like an input field */}
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
          minHeight: 42, padding: '6px 10px',
          border: `1px solid ${focused ? '#2563eb' : '#dbeafe'}`,
          borderRadius: 8, background: '#fff', cursor: 'text',
          transition: 'border-color 0.15s',
        }}
      >
        {tags.map((tag, i) => (
          <span key={tag + i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: '#dbeafe', color: '#1e40af',
            borderRadius: 6, padding: '3px 8px 3px 10px',
            fontSize: 12, fontWeight: 600, lineHeight: 1,
            userSelect: 'none',
          }}>
            {tag}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); removeTag(i) }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 14, height: 14, borderRadius: '50%',
                background: 'rgba(30,64,175,0.15)', border: 'none', cursor: 'pointer',
                color: '#1e40af', padding: 0, lineHeight: 1,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(30,64,175,0.3)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(30,64,175,0.15)')}
              aria-label={`Remove ${tag}`}
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); if (input.trim()) addTag(input) }}
          placeholder={tags.length === 0 ? placeholder : ''}
          style={{
            flex: '1 1 80px', minWidth: 80, border: 'none', outline: 'none',
            fontSize: 13, color: '#172554', background: 'transparent', padding: '2px 4px',
          }}
        />
      </div>

      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
        Press <kbd style={{ fontSize: 10, padding: '1px 4px', borderRadius: 3, background: '#f1f5f9', border: '1px solid #e2e8f0', fontFamily: 'monospace' }}>,</kbd> or <kbd style={{ fontSize: 10, padding: '1px 4px', borderRadius: 3, background: '#f1f5f9', border: '1px solid #e2e8f0', fontFamily: 'monospace' }}>Enter</kbd> to add · Backspace to remove last
      </p>
    </div>
  )
}
