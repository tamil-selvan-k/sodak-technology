import { notFound } from 'next/navigation'
import { listStacks } from '@/modules/stacks/stacks.service'
import StackEditForm from './_components/StackEditForm'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props) {
  const stacks = await listStacks()
  const stack = stacks.find(s => s.id === params.id)
  return { title: stack ? `${stack.name} — SODAK Admin` : 'Edit Stack — SODAK Admin' }
}

export default async function AdminEditStackPage({ params }: Props) {
  const stacks = await listStacks()
  const stack = stacks.find(s => s.id === params.id) ?? null
  if (!stack) notFound()

  return (
    <main className="admin-main">
      <StackEditForm stack={stack} />
    </main>
  )
}
