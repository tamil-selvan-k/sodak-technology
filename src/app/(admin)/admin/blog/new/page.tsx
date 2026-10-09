import Link from 'next/link'
import { auth } from '@/lib/auth'
import { listTrainers } from '@/modules/trainers/trainers.service'

export const metadata = { title: 'New Post — SODAK Admin' }

export default async function AdminNewPostPage() {
  await auth()
  const { data: trainers } = await listTrainers({ includeUnpublished: true, perPage: 100 })
  // TODO: Implement Blog post editor — wireframe: admin/blog-form.html
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
      <pre className="text-xs">{JSON.stringify(trainers, null, 2)}</pre>
    </main>
  )
}
