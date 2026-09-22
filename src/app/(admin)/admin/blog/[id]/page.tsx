import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getPostById } from '@/modules/blog/blog.service'

interface Props { params: { id: string } }

export default async function AdminEditPostPage({ params }: Props) {
  await auth()
  const post = await getPostById(params.id)
  if (!post) notFound()
  // TODO: Implement Blog post editor — wireframe: admin/blog-form.html
  return <pre className="text-xs">{JSON.stringify(post, null, 2)}</pre>
}
