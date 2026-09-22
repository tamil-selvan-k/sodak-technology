import { auth } from '@/lib/auth'
import { listPosts } from '@/modules/blog/blog.service'

export const metadata = { title: 'Blog — SODAK Admin' }

interface Props { searchParams: { status?: string; page?: string } }

export default async function AdminBlogPage({ searchParams }: Props) {
  await auth()
  const { data, pagination } = await listPosts({ status: searchParams.status as never, page: searchParams.page ? Number(searchParams.page) : 1, includeUnpublished: true })
  // TODO: Implement Blog list — wireframe: admin/blog.html
  return <pre className="text-xs">{JSON.stringify({ data, pagination }, null, 2)}</pre>
}
