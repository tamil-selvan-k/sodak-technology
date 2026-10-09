import Link from 'next/link'
import { auth } from '@/lib/auth'
import { listPosts } from '@/modules/blog/blog.service'
import BlogTable from './_components/BlogTable'

export const metadata = { title: 'Blog — SODAK Admin' }

interface Props {
  searchParams: { status?: string; search?: string; page?: string }
}

export default async function AdminBlogPage({ searchParams }: Props) {
  await auth()

  const { data, pagination } = await listPosts({
    status:             searchParams.status as never,
    search:             searchParams.search,
    page:               searchParams.page ? Number(searchParams.page) : 1,
    includeUnpublished: true,
  })

  const published  = data.filter(p => p.status === 'published').length
  const inReview   = data.filter(p => p.status === 'in_review').length
  const drafts     = data.filter(p => p.status === 'draft').length

  return (
    <main className="admin-main">
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563EB', marginBottom: 6 }}>SODAK Technology</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#172554', fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>Blog Management</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Manage insights posts, author assignments and publication workflow</p>
          </div>
          <Link
            href="/admin/blog/new"
            style={{ padding: '9px 20px', fontSize: 13, fontWeight: 700, background: '#2563EB', color: '#ffffff', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            + New Post
          </Link>
        </div>
      </div>

      <div className="admin-stat-grid-4">
        {[
          { label: 'Total Posts',  value: pagination.total },
          { label: 'Published',    value: published },
          { label: 'In Review',    value: inReview },
          { label: 'Drafts',       value: drafts },
        ].map(c => (
          <div key={c.label} style={{ background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: 12, padding: '20px 24px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{c.label}</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: '#334155', lineHeight: 1 }}>{c.value}</p>
          </div>
        ))}
      </div>

      <BlogTable
        posts={data.map(p => ({
          id:           p.id,
          title:        p.title,
          slug:         p.slug,
          status:       p.status,
          category:     p.category ?? null,
          authorName:   p.author?.name ?? null,
          publishedAt:  p.publishedAt?.toISOString() ?? null,
          updatedAt:    p.updatedAt.toISOString(),
        }))}
        pagination={pagination}
        search={searchParams.search}
        status={searchParams.status}
      />
    </main>
  )
}
