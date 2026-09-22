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
    <main className="flex-1 p-8 min-w-0">
      <div className="mb-7">
        <h1 className="text-[22px] font-bold text-slate-900">Edit Trainer</h1>
        <p className="text-sm text-slate-500 mt-0.5">{trainer.name}</p>
      </div>
      <TrainerForm trainer={trainer} stacks={stacks} />
    </main>
  )
}
