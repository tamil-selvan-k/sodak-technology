import { auth } from '@/lib/auth'
import { listStacks } from '@/modules/stacks/stacks.service'
import TrainerForm from '../_components/TrainerForm'

export const metadata = { title: 'New Trainer — SODAK Admin' }

export default async function AdminNewTrainerPage() {
  await auth()
  const stacks = await listStacks()
  return (
    <main className="admin-main">
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4865ad', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>Add Trainer</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Create a new trainer profile</p>
      </div>
      <TrainerForm stacks={stacks} />
    </main>
  )
}
