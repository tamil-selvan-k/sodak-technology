import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getTrainerById } from '@/modules/trainers/trainers.service'
import { listStacks } from '@/modules/stacks/stacks.service'
import TrainerForm from '../_components/TrainerForm'

interface Props { params: { id: string } }

export default async function AdminEditTrainerPage({ params }: Props) {
  await auth()
  const [trainer, stacks] = await Promise.all([
    getTrainerById(params.id),
    listStacks(),
  ])
  if (!trainer) notFound()

  return (
    <main className="flex-1 min-w-0" style={{ padding: '32px 40px', maxWidth: 'calc(100vw - 220px)', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4865ad', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>Edit Trainer</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{trainer.name}</p>
      </div>
      <TrainerForm trainer={trainer} stacks={stacks} />
    </main>
  )
}
