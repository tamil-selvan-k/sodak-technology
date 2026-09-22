import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export const metadata = { title: 'Dashboard — SODAK Admin' }

export default async function AdminDashboardPage() {
  await auth()

  const [trainers, leads, posts, institutions] = await Promise.all([
    db.trainer.count({ where: { isPublished: true, deletedAt: null } }),
    db.lead.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 86400_000) } } }),
    db.blogPost.count({ where: { status: 'in_review', deletedAt: null } }),
    db.institution.count({ where: { isPublished: true, deletedAt: null } }),
  ])

  // TODO: Implement Admin Dashboard — wireframe: admin/dashboard.html
  // Cards: Published trainers, New leads (7d), Posts in review, Published institutions
  // Charts: Lead funnel, monthly traffic
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold text-navy-900">Dashboard</h1>
      <pre className="text-xs">{JSON.stringify({ trainers, leads, postsInReview: posts, institutions }, null, 2)}</pre>
    </div>
  )
}
