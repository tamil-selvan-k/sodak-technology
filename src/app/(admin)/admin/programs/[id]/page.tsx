import { notFound } from 'next/navigation'
import { getProgramById } from '@/modules/programs/programs.service'
import ProgramEditForm from './_components/ProgramEditForm'

interface Props { params: { id: string } }

export default async function AdminEditProgramPage({ params }: Props) {
  const program = await getProgramById(params.id).catch(() => null)
  if (!program) notFound()

  return (
    <main className="admin-main">
      <ProgramEditForm program={program} />
    </main>
  )
}
