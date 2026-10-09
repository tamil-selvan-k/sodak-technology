'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

const ROLES = [
  { value: 'super_admin', label: 'Super Admin',  desc: 'Full access — all CRUD, users, settings, audit log' },
  { value: 'editor',      label: 'Editor',        desc: 'Create/edit/publish content and media' },
  { value: 'contributor', label: 'Contributor',   desc: 'Edit own profile, submit blog drafts' },
  { value: 'sales',       label: 'Sales',         desc: 'Read/update leads only' },
]

interface User {
  id: string
  name: string | null
  email: string
  role: string
  isActive: boolean
}

export default function EditUserPage() {
  const params  = useParams<{ id: string }>()
  const router  = useRouter()
  const [, startTransition] = useTransition()

  const [user,    setUser]    = useState<User | null>(null)
  const [name,    setName]    = useState('')
  const [role,    setRole]    = useState('')
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch(`/api/v1/users/${params.id}`)
      .then(r => r.json())
      .then((json: { data?: User; error?: { message: string } }) => {
        if (json.data) {
          setUser(json.data)
          setName(json.data.name ?? '')
          setRole(json.data.role)
        } else {
          setError(json.error?.message ?? 'User not found.')
        }
        setLoading(false)
      })
      .catch(() => { setError('Failed to load user.'); setLoading(false) })
  }, [params.id])

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess(false)
    const res = await fetch(`/api/v1/users/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() || null, role }),
    })
    const json = await res.json().catch(() => ({})) as { error?: { message: string } }
    if (!res.ok) {
      setError(json.error?.message ?? 'Save failed.')
    } else {
      setSuccess(true)
      setTimeout(() => startTransition(() => router.push('/admin/users')), 800)
    }
    setSaving(false)
  }

  const INPUT: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    background: '#EFF6FF', border: '1px solid #DBEAFE',
    borderRadius: '1.5rem', color: '#172554', fontSize: 13,
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <main className="admin-main">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Link href="/admin/users" style={{ fontSize: 13, color: '#2563EB', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back to Users
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#172554', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>Edit User</h1>
        {user && <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{user.email}</p>}
      </div>

      {loading && <p style={{ fontSize: 13, color: '#64748b' }}>Loading…</p>}

      {!loading && user && (
        <div style={{ maxWidth: 520 }}>
          <div style={{ background: '#ffffff', border: '1px solid #DBEAFE', borderRadius: '1.5rem', padding: '28px 32px' }}>

            {/* Name */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#172554', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Display Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Full name"
                style={INPUT}
              />
            </div>

            {/* Email (read-only) */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#172554', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
              <input type="email" value={user.email} readOnly style={{ ...INPUT, background: '#EFF6FF', color: '#64748b', cursor: 'not-allowed' }} />
            </div>

            {/* Role */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#172554', marginBottom: 10, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ROLES.map(r => (
                  <label key={r.value} style={{ cursor: 'pointer' }}>
                    <div style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '12px 14px', borderRadius: '1rem',
                      border: `1.5px solid ${role === r.value ? '#2563EB' : '#DBEAFE'}`,
                      background: role === r.value ? '#EFF6FF' : '#ffffff',
                      transition: 'border-color 0.15s, background 0.15s',
                    }}>
                      <input
                        type="radio" name="role" value={r.value}
                        checked={role === r.value}
                        onChange={() => setRole(r.value)}
                        style={{ marginTop: 2, accentColor: '#2563EB', flexShrink: 0 }}
                      />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#172554' }}>{r.label}</p>
                        <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{r.desc}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error   && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}
            {success && <p style={{ color: '#16a34a', fontSize: 13, marginBottom: 12 }}>Saved — redirecting…</p>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ padding: '10px 24px', fontSize: 13, fontWeight: 600, background: '#2563EB', color: '#fff', borderRadius: '2rem', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <Link href="/admin/users" style={{ padding: '10px 24px', fontSize: 13, fontWeight: 600, background: 'transparent', color: '#64748b', borderRadius: '2rem', border: '1px solid #DBEAFE', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                Cancel
              </Link>
            </div>
          </div>
        </div>
      )}

      {!loading && !user && error && (
        <p style={{ color: '#dc2626', fontSize: 13 }}>{error}</p>
      )}
    </main>
  )
}
