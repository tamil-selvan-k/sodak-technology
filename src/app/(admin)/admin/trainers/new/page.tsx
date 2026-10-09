import Link from 'next/link'
import { auth } from '@/lib/auth'
import { listStacks } from '@/modules/stacks/stacks.service'
import TrainerForm from '../_components/TrainerForm'

export const metadata = { title: 'New Trainer — SODAK Admin' }

export default async function AdminNewTrainerPage() {
  await auth()
  const stacks = await listStacks()
  return (
    <main className="admin-main">
      <div style={{ marginBottom: 20 }}>
        <Link href="/admin/trainers" className="admin-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back to Trainers
        </Link>
      </div>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563EB', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172554', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>Add Trainer</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Create a new trainer profile</p>
      </div>
      <TrainerForm stacks={stacks} />
    </main>
  )
}
