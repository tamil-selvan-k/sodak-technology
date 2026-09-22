import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getTrainerById } from '@/modules/trainers/trainers.service'
import { getProgramById } from '@/modules/programs/programs.service'
import { getPostById } from '@/modules/blog/blog.service'

interface Props { params: { type: string; id: string } }

export default async function AdminPreviewPage({ params }: Props) {
  await auth()
  let entity: unknown = null

  if (params.type === 'trainer') entity = await getTrainerById(params.id)
  else if (params.type === 'program') entity = await getProgramById(params.id)
  else if (params.type === 'post') entity = await getPostById(params.id)
  else notFound()

  if (!entity) notFound()

  // TODO: Implement Admin Preview page — render a read-only view of the unpublished entity
  return <pre className="text-xs">{JSON.stringify(entity, null, 2)}</pre>
}
