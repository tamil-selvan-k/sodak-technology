import { auth } from '@/lib/auth'
import { listStacks } from '@/modules/stacks/stacks.service'
import { db } from '@/lib/db'
import StacksTable from './_components/StacksTable'

export const metadata = { title: 'Stacks — SODAK Admin' }

interface Props {
  searchParams: { search?: string }
}

export default async function AdminStacksPage({ searchParams }: Props) {
  await auth()

  const [stacks, linkedCount] = await Promise.all([
    listStacks(),
    db.stack.count({ where: { programStacks: { some: {} } } }),
  ])

  const totalTechnologies = stacks.reduce((sum, s) => sum + s.technologies.length, 0)
  const avgTechCount = stacks.length > 0
    ? (totalTechnologies / stacks.length).toFixed(1)
    : '0'

  const search = searchParams.search ?? ''
  const filtered = search
    ? stacks.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.summary ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : stacks

  return (
    <main className="admin-main">
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563EB', marginBottom: 6 }}>SODAK Technology</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172554', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>Stacks</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Manage technology stacks</p>
          </div>
          <a href="/admin/stacks/new" style={{ padding: '9px 20px', fontSize: 13, fontWeight: 700, background: '#2563EB', color: '#ffffff', borderRadius: '2rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            + Add Stack
          </a>
        </div>
      </div>

      {/* Stat cards */}
      <div className="admin-stat-grid-4">
        {[
          { label: 'Total Stacks',       value: stacks.length },
          { label: 'Total Technologies', value: totalTechnologies },
          { label: 'Linked to Programs', value: linkedCount },
          { label: 'Avg Tech Count',     value: avgTechCount },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: '#ffffff', border: '1px solid #dbeafe', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#334155' }}>{value}</div>
          </div>
        ))}
      </div>

      <StacksTable stacks={filtered} />
    </main>
  )
}
