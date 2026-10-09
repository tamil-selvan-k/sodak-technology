import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getTrainerById } from '@/modules/trainers/trainers.service'
import { getProgramById } from '@/modules/programs/programs.service'
import { getPostById } from '@/modules/blog/blog.service'

interface Props { params: { type: string; id: string } }

const BACK_LINKS: Record<string, { href: string; label: string }> = {
  trainer: { href: '/admin/trainers', label: 'Back to Trainers' },
  program: { href: '/admin/programs', label: 'Back to Programs' },
  post:    { href: '/admin/blog',     label: 'Back to Blog' },
}

export default async function AdminPreviewPage({ params }: Props) {
  await auth()
  let entity: unknown = null

  if (params.type === 'trainer') entity = await getTrainerById(params.id)
  else if (params.type === 'program') entity = await getProgramById(params.id)
  else if (params.type === 'post') entity = await getPostById(params.id)
  else notFound()

  if (!entity) notFound()

  const back = BACK_LINKS[params.type]

  // TODO: Implement Admin Preview page — render a read-only view of the unpublished entity
  return (
    <main className="admin-main">
      {back && (
        <div style={{ marginBottom: 20 }}>
          <Link href={back.href} className="admin-back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            {back.label}
          </Link>
        </div>
      )}
      <pre className="text-xs">{JSON.stringify(entity, null, 2)}</pre>
    </main>
  )
}
