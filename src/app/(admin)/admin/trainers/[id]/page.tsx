import { notFound } from 'next/navigation'
import Link from 'next/link'
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
    <main className="admin-main">
      {/* Back navigation */}
      <div style={{ marginBottom: 20 }}>
        <Link href="/admin/trainers" className="admin-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back to Trainers
        </Link>
      </div>

      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4865ad', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>Edit Trainer</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{trainer.name}</p>
      </div>
      <TrainerForm trainer={trainer} stacks={stacks} />
    </main>
  )
}
