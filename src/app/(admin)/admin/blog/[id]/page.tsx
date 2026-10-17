import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getPostById } from '@/modules/blog/blog.service'
import { listTrainers } from '@/modules/trainers/trainers.service'
import BlogEditForm from './_components/BlogEditForm'

interface Props { params: { id: string } }

export default async function AdminEditPostPage({ params }: Props) {
  await auth()
  const [post, trainersResult] = await Promise.all([
    getPostById(params.id),
    listTrainers({ includeUnpublished: true, perPage: 100 }).catch(() => ({ data: [] as { id: string; name: string }[] })),
  ])
  const { data: trainers } = trainersResult
  if (!post) notFound()

  const trainerOptions = trainers.map(t => ({ id: t.id, name: t.name }))

  return (
    <main className="admin-main">
      <div style={{ marginBottom: 20 }}>
        <Link href="/admin/blog" className="admin-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back to Blog
        </Link>
      </div>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563EB', marginBottom: 6 }}>SODAK Technology</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172554', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>Edit Post</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{post.title}</p>
      </div>
      <BlogEditForm post={post} trainers={trainerOptions} />
    </main>
  )
}
