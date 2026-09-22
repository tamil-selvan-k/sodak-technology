import type { Metadata } from 'next'
import Link from 'next/link'
import { listPosts } from '@/modules/blog/blog.service'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'Insights — SODAK Technology',
  description: 'Placement tips, technical tutorials, and career advice from SODAK trainers.',
}

export default async function InsightsPage() {
  const { data: posts } = await listPosts({ status: 'published', perPage: 30 }).catch(() => ({ data: [] }))

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 18 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">Insights</span>
          </div>
          <h1 className="t-page c-white" style={{ marginBottom: 12 }}>Insights & Resources</h1>
          <p className="t-lg c-muted" style={{ maxWidth: 540 }}>
            Placement tips, technical tutorials, and career advice — written by working engineers who train for a living.
          </p>
        </div>
      </div>

      <section className="s-dark">
        <div className="container">
          {posts.length === 0 ? (
            <div className="text-center" style={{ padding: '60px 0' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📝</div>
              <h2 className="t-h2 c-white" style={{ marginBottom: 10 }}>Articles coming soon</h2>
              <p className="t-body c-muted">Our trainers are writing the first batch of articles. Check back soon.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {posts.map((post: { id: string; slug: string; title: string; excerpt: string | null; publishedAt: Date | null; tags?: string[] }) => (
                <Link key={post.id} href={`/insights/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="card card-dark" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <p className="t-card c-white">{post.title}</p>
                    {post.excerpt && <p className="t-sm c-muted" style={{ flex: 1 }}>{post.excerpt}</p>}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {(post.tags ?? []).slice(0, 3).map(tag => (
                        <span key={tag} className="badge badge-dark">{tag}</span>
                      ))}
                    </div>
                    {post.publishedAt && (
                      <p className="t-micro c-muted" style={{ marginTop: 4 }}>
                        {new Date(post.publishedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
