import { auth } from '@/lib/auth'
import { listTrainers } from '@/modules/trainers/trainers.service'

export const metadata = { title: 'New Post — SODAK Admin' }

export default async function AdminNewPostPage() {
  await auth()
  const { data: trainers } = await listTrainers({ includeUnpublished: true, perPage: 100 })
  // TODO: Implement Blog post editor — wireframe: admin/blog-form.html
  return <pre className="text-xs">{JSON.stringify(trainers, null, 2)}</pre>
}
