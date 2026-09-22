import { auth } from '@/lib/auth'
import { listStacks } from '@/modules/stacks/stacks.service'
import TrainerForm from '../_components/TrainerForm'

export const metadata = { title: 'New Trainer — SODAK Admin' }

export default async function AdminNewTrainerPage() {
  await auth()
  const stacks = await listStacks()
  return (
    <main className="flex-1 p-8 min-w-0">
      <div className="mb-7">
        <h1 className="text-[22px] font-bold text-slate-900">Add Trainer</h1>
        <p className="text-sm text-slate-500 mt-0.5">Create a new trainer profile</p>
      </div>
      <TrainerForm stacks={stacks} />
    </main>
  )
}
