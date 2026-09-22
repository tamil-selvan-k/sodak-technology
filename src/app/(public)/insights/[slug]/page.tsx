import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPostBySlug } from '@/modules/blog/blog.service'

export const revalidate = 60

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  return {
    title: post?.metaTitle ?? post?.title ?? 'Insight',
    description: post?.metaDescription ?? post?.excerpt ?? '',
  }
}

export default async function InsightPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 18 }}>
            <Link href="/"><span>Home</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <Link href="/insights"><span>Insights</span></Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="active">{post.title}</span>
          </div>
          {post.category && <span className="badge badge-gold" style={{ marginBottom: 14 }}>{post.category}</span>}
          <h1 className="t-h1 c-white" style={{ marginBottom: 12, maxWidth: 760 }}>{post.title}</h1>
          {post.excerpt && <p className="t-lg c-muted" style={{ maxWidth: 620 }}>{post.excerpt}</p>}
          <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            {post.author && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div className="avatar avatar-sm" style={{ background: 'rgba(0,160,255,0.2)', fontSize: 14 }}>
                  {post.author.name.charAt(0)}
                </div>
                <span className="t-sm c-white">{post.author.name}</span>
              </div>
            )}
            {post.publishedAt && (
              <span className="t-sm c-muted">
                {new Date(post.publishedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            )}
            {post.readingTimeMinutes && (
              <span className="t-sm c-muted">{post.readingTimeMinutes} min read</span>
            )}
          </div>
        </div>
      </div>

      <section className="s-light">
        <div className="container-sm">
          {post.bodyHtml ? (
            <div className="prose" dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />
          ) : (
            <p className="t-body c-body">Content coming soon.</p>
          )}

          {/* Tags */}
          {(post.tags ?? []).length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(7,88,146,0.1)' }}>
              <span className="t-sm c-body" style={{ marginRight: 4 }}>Tagged:</span>
              {(post.tags as string[]).map(tag => (
                <span key={tag} className="badge badge-light">{tag}</span>
              ))}
            </div>
          )}

          {/* Related posts */}
          {post.relatedTo && post.relatedTo.length > 0 && (
            <div style={{ marginTop: 48 }}>
              <h2 className="t-h3 c-heading" style={{ marginBottom: 20 }}>Related Articles</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                {post.relatedTo.slice(0, 3).map((rel) => (
                  <Link key={rel.relatedPost.id} href={`/insights/${rel.relatedPost.slug}`} style={{ textDecoration: 'none' }}>
                    <div className="card card-ghost">
                      <p className="t-sm c-heading fw-600">{rel.relatedPost.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="cta-gold">
        <div className="container">
          <div>
            <h2>Found This Useful?</h2>
            <p>Share it with a student preparing for placements, or book a session with our trainers.</p>
          </div>
          <Link href="/contact" className="btn-cta">Book a Session →</Link>
        </div>
      </div>
    </>
  )
}
