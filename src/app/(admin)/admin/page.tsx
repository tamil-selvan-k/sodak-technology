import Link from 'next/link'
import { db } from '@/lib/db'

export const metadata = { title: 'Dashboard — SODAK Admin' }

const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
}

const STATUS_MAP: Record<string, { bg: string; color: string; label: string }> = {
  new:       { bg: 'rgba(34,197,94,0.15)',    color: '#4ade80',  label: 'New' },
  contacted: { bg: 'rgba(59,130,246,0.15)',   color: '#60a5fa',  label: 'Contacted' },
  converted: { bg: 'rgba(200,160,53,0.15)',   color: '#fbbf24',  label: 'Converted' },
  closed:    { bg: 'rgba(148,163,184,0.10)',  color: '#64748b',  label: 'Closed' },
}

const ACTION_DOT: Record<string, string> = {
  create:    '#22c55e',
  update:    '#3b82f6',
  delete:    '#ef4444',
  publish:   '#c8a035',
  unpublish: '#eab308',
}

export default async function AdminDashboardPage() {
  const [totalLeads, pendingLeads, activePrograms, institutions, recentLeads, recentActivity] = await Promise.all([
    db.lead.count(),
    db.lead.count({ where: { status: 'new' } }),
    db.program.count({ where: { isPublished: true, deletedAt: null } }),
    db.institution.count({ where: { isPublished: true, deletedAt: null } }),
    db.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, institutionOrCompany: true, role: true, programOfInterest: true, createdAt: true, status: true },
    }),
    db.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { actor: { select: { name: true } } },
    }),
  ])

  const leadsThisMonth = await db.lead.count({
    where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
  })

  const STATS = [
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>,
      label: 'Total Leads', value: totalLeads,
      trend: `+${leadsThisMonth} this month`, trendColor: '#4ade80',
      iconBg: 'rgba(200,160,53,0.15)',
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2v6l2 2-2 2v6h12v-6l-2-2 2-2V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-5l-4-4V4h8v3.5l-4 4z"/></svg>,
      label: 'Pending Enquiries', value: pendingLeads,
      trend: pendingLeads > 0 ? 'Needs follow-up' : 'All clear', trendColor: pendingLeads > 0 ? '#fbbf24' : '#4ade80',
      iconBg: 'rgba(234,179,8,0.15)',
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>,
      label: 'Active Programs', value: activePrograms,
      trend: 'Published', trendColor: '#60a5fa',
      iconBg: 'rgba(59,130,246,0.15)',
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L2 9v1h20V9L12 3zM4 11v6H2v2h20v-2h-2v-6h-2v6h-4v-6h-2v6H8v-6H4z"/></svg>,
      label: 'Colleges Onboarded', value: institutions,
      trend: 'Across Tamil Nadu', trendColor: '#94a3b8',
      iconBg: 'rgba(34,197,94,0.15)',
    },
  ]

  const QUICK_ACTIONS = [
    { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>, label: 'Add Trainer',     href: '/admin/trainers/new' },
    { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>, label: 'Review Leads',    href: '/admin/leads' },
    { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 3L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.17L15 3H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3z"/></svg>, label: 'Upload Media',    href: '/admin/media' },
    { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>, label: 'Write Blog Post', href: '/admin/blog/new' },
  ]

  return (
    <main style={{
      flex: 1,
      minWidth: 0,
      padding: '40px 44px',
      maxWidth: 'calc(100vw - 220px)',
      background: 'linear-gradient(160deg, #0a1628 0%, #0c2040 100%)',
      minHeight: '100vh',
    }}>

      {/* ── Top bar ── */}
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c8a035', marginBottom: 6 }}>
          SODAK Technology
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-instrument-sans)', lineHeight: 1.2 }}>
          Admin Dashboard
        </h1>
        <p style={{ fontSize: 13, color: '#475569', marginTop: 6 }}>
          Welcome back — here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 28 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ ...GLASS, padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                {s.icon}
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: s.trendColor, textAlign: 'right', maxWidth: 100 }}>{s.trend}</span>
            </div>
            <div style={{ fontSize: 38, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Recent Leads table ── */}
      <div style={{ ...GLASS, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Recent Leads</p>
          <Link href="/admin/leads" style={{ fontSize: 12, color: '#c8a035', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.02em' }}>
            View all →
          </Link>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
              {['Name', 'Institution', 'Program Interest', 'Date', 'Status'].map(h => (
                <th key={h} style={{ padding: '10px 24px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', textAlign: 'left' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentLeads.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px 24px', textAlign: 'center', fontSize: 13, color: '#475569' }}>
                  No leads yet — enquiries from the contact form will appear here.
                </td>
              </tr>
            ) : recentLeads.map(lead => {
              const s = STATUS_MAP[lead.status] ?? STATUS_MAP.new!
              return (
                <tr key={lead.id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '13px 24px', fontSize: 13 }}>
                    <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{lead.name}</span>
                    {lead.role && <><br /><span style={{ fontSize: 11, color: '#475569' }}>{lead.role}</span></>}
                  </td>
                  <td style={{ padding: '13px 24px', fontSize: 13, color: '#94a3b8' }}>{lead.institutionOrCompany ?? '—'}</td>
                  <td style={{ padding: '13px 24px', fontSize: 13, color: '#94a3b8', maxWidth: 200 }}>{lead.programOfInterest ?? '—'}</td>
                  <td style={{ padding: '13px 24px', fontSize: 12, color: '#475569', whiteSpace: 'nowrap' }}>
                    {lead.createdAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '13px 24px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Activity + Quick Actions ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Activity log */}
        <div style={{ ...GLASS, padding: 24 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 18 }}>Recent Activity</p>
          {recentActivity.length === 0 ? (
            <p style={{ fontSize: 13, color: '#475569' }}>No activity recorded yet.</p>
          ) : recentActivity.map((log, i) => (
            <div key={log.id} style={{ display: 'flex', gap: 14, paddingBottom: 14, marginBottom: i < recentActivity.length - 1 ? 14 : 0, borderBottom: i < recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ flexShrink: 0, marginTop: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: ACTION_DOT[log.action] ?? '#c8a035' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{log.actor?.name ?? 'System'}</span>
                  {' '}<span style={{ color: '#94a3b8' }}>{log.action}</span>{' '}
                  <span style={{ color: '#64748b' }}>{log.entityType}</span>
                </p>
                <p style={{ fontSize: 11, color: '#475569', marginTop: 3 }}>
                  {log.createdAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}{' '}
                  {log.createdAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ ...GLASS, padding: 24 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 18 }}>Quick Actions</p>
          {QUICK_ACTIONS.map(a => (
            <Link key={a.label} href={a.href} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 18px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10,
              color: '#e2e8f0', fontSize: 13, fontWeight: 600,
              textDecoration: 'none', marginBottom: 10,
            }}>
              <span style={{ fontSize: 18, width: 26, textAlign: 'center' }}>{a.icon}</span>
              {a.label}
            </Link>
          ))}

          {pendingLeads > 0 && (
            <div style={{ padding: 16, background: 'rgba(200,160,53,0.08)', border: '1px solid rgba(200,160,53,0.2)', borderRadius: 10, marginTop: 4 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', marginBottom: 4 }}>
                {pendingLeads} Pending {pendingLeads === 1 ? 'Enquiry' : 'Enquiries'}
              </p>
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
                Review and follow up with colleges awaiting a response.
              </p>
              <Link href="/admin/leads" style={{ fontSize: 12, color: '#c8a035', fontWeight: 600, display: 'inline-block', marginTop: 10, textDecoration: 'none' }}>
                View pending →
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
