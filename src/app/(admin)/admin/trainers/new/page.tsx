import { auth } from '@/lib/auth'
import { listStacks } from '@/modules/stacks/stacks.service'
import TrainerForm from '../_components/TrainerForm'

export const metadata = { title: 'New Trainer — SODAK Admin' }

export default async function AdminNewTrainerPage() {
  await auth()
  const stacks = await listStacks()
  return (
    <main className="flex-1 min-w-0" style={{ padding: '32px 40px', maxWidth: 'calc(100vw - 220px)', minHeight: '100vh', background: 'linear-gradient(160deg, #0a1628 0%, #0c2040 100%)' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c8a035', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-instrument-sans)' }}>Add Trainer</h1>
        <p style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>Create a new trainer profile</p>
      </div>
      <TrainerForm stacks={stacks} />
    </main>
  )
}
