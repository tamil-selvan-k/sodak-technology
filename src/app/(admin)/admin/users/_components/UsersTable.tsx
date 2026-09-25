'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Badge from '@/components/ui/Badge'

const btnEdit   = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[rgba(96,165,250,0.25)] bg-[rgba(96,165,250,0.08)] text-[#60a5fa] hover:bg-[rgba(96,165,250,0.14)] transition-colors'
const btnDelete = 'px-3 py-1.5 rounded-[5px] text-[11px] font-semibold cursor-pointer border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.08)] text-[#f87171] hover:bg-[rgba(248,113,113,0.14)] transition-colors'

interface SerializedUser {
  id: string
  name: string | null
  email: string
  role: string
  isActive: boolean
  createdAt: string
}

const ROLE_BADGE: Record<string, { label: string; variant: 'plum' | 'blue' | 'amber' | 'dark' }> = {
  super_admin:  { label: 'Super Admin',  variant: 'plum' },
  editor:       { label: 'Editor',       variant: 'blue' },
  contributor:  { label: 'Contributor',  variant: 'amber' },
  sales:        { label: 'Sales',        variant: 'dark' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function initials(name: string | null, email: string) {
  if (name) return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return email.slice(0, 2).toUpperCase()
}

export default function UsersTable({ users }: { users: SerializedUser[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  async function toggleActive(user: SerializedUser) {
    const action = user.isActive ? 'Deactivate' : 'Activate'
    if (!window.confirm(`${action} user "${user.email}"?`)) return
    const res = await fetch(`/api/v1/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !user.isActive }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      alert((body as { error?: { message?: string } }).error?.message ?? 'Request failed')
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.06)' }}>
            {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
              <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', textAlign: 'left' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: '40px 14px', textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
                No users found.
              </td>
            </tr>
          )}
          {users.map(u => {
            const rb = ROLE_BADGE[u.role] ?? { label: u.role, variant: 'dark' as const }
            return (
              <tr key={u.id} className="hover:bg-[rgba(255,255,255,0.04)]" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <td style={{ padding: '11px 14px', fontSize: 13, color: '#e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: '#1a2342', color: '#c8a035',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, flexShrink: 0,
                    }}>
                      {initials(u.name, u.email)}
                    </div>
                    <span style={{ fontWeight: 600, color: '#f8fafc' }}>{u.name ?? '—'}</span>
                  </div>
                </td>
                <td style={{ padding: '11px 14px', fontSize: 13, color: '#94a3b8' }}>{u.email}</td>
                <td style={{ padding: '11px 14px' }}>
                  <Badge variant={rb.variant}>{rb.label}</Badge>
                </td>
                <td style={{ padding: '11px 14px' }}>
                  <Badge variant={u.isActive ? 'green' : 'red'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                </td>
                <td style={{ padding: '11px 14px', fontSize: 13, color: '#94a3b8' }}>{formatDate(u.createdAt)}</td>
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <a href={`/admin/users/${u.id}`} className={btnEdit}>Edit Role</a>
                    <button
                      className={u.isActive ? btnDelete : btnEdit}
                      onClick={() => toggleActive(u)}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
