// Rule: only imports from own types/schema, src/lib/*, npm packages.
import { db } from '@/lib/db'
import { slugify, makeUniqueSlug } from '@/lib/slugify'
import { parsePagination, buildMeta } from '@/lib/paginate'
import type { Prisma } from '@prisma/client'
import type { PaginationMeta } from '@/lib/paginate'
import type { BlogFilters, CreatePostInput, UpdatePostInput } from './blog.types'

const WITH_AUTHOR = { author: true } as const

// Include object for slug lookups (detail view with related posts).
const WITH_AUTHOR_AND_RELATED = {
  author: true,
  relatedTo: {
    include: {
      relatedPost: { include: { author: true } },
    },
  },
} as const

type PostWithAuthor = Prisma.BlogPostGetPayload<{ include: typeof WITH_AUTHOR }>
type PostDetail     = Prisma.BlogPostGetPayload<{ include: typeof WITH_AUTHOR_AND_RELATED }>

// ── Service functions ─────────────────────────────────────────────────────────

export async function listPosts(filters: BlogFilters = {}): Promise<{ data: PostWithAuthor[]; pagination: PaginationMeta }> {
  const { skip, take, page, perPage } = parsePagination(filters)

  const where = {
    ...(filters.includeUnpublished
      ? filters.status ? { status: filters.status } : {}
      : { status: 'published' as const }),
    deletedAt: null,
    ...(filters.category && { category: filters.category }),
    ...(filters.tag      && { tags: { has: filters.tag } }),
    ...(filters.authorId && { authorId: filters.authorId }),
    ...(filters.search   && { title: { contains: filters.search, mode: 'insensitive' as const } }),
  }
  const [posts, total] = await Promise.all([
    db.blogPost.findMany({ where, include: WITH_AUTHOR, orderBy: { publishedAt: 'desc' }, skip, take }),
    db.blogPost.count({ where }),
  ])
  return { data: posts, pagination: buildMeta(total, page, perPage) }
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  return db.blogPost.findFirst({
    where: { slug, status: 'published', deletedAt: null },
    include: WITH_AUTHOR_AND_RELATED,
  })
}

export async function getPostById(id: string): Promise<PostWithAuthor | null> {
  return db.blogPost.findFirst({ where: { id, deletedAt: null }, include: WITH_AUTHOR })
}

export async function getByAuthor(authorId: string, limit = 50) {
  return db.blogPost.findMany({ where: { authorId, status: 'published', deletedAt: null }, include: WITH_AUTHOR, orderBy: { publishedAt: 'desc' }, take: limit })
}

export async function createPost(input: CreatePostInput) {
  const wordCount = (input.bodyHtml?.replace(/<[^>]+>/g, '') ?? '').split(/\s+/).length
  return db.blogPost.create({
    data: { ...input, slug: await makeUniqueSlug(input.title, (c) =>
      db.blogPost.findFirst({ where: { slug: c, deletedAt: null }, select: { id: true } }).then(Boolean),
    ), readingTimeMinutes: Math.max(1, Math.round(wordCount / 200)) },
    include: WITH_AUTHOR,
  })
}

export async function updatePost(id: string, input: UpdatePostInput) {
  return db.blogPost.update({
    where: { id, deletedAt: null },
    data: { ...input, ...(input.title && { slug: await makeUniqueSlug(input.title, (c) =>
      db.blogPost.findFirst({ where: { slug: c, id: { not: id }, deletedAt: null }, select: { id: true } }).then(Boolean),
    ) }) },
    include: WITH_AUTHOR,
  })
}

export async function submitForReview(id: string) {
  return db.blogPost.update({ where: { id }, data: { status: 'in_review' } })
}

export async function publishPost(id: string) {
  return db.blogPost.update({ where: { id }, data: { status: 'published', publishedAt: new Date() } })
}

export async function unpublishPost(id: string) {
  return db.blogPost.update({ where: { id }, data: { status: 'draft', publishedAt: null } })
}

export async function softDeletePost(id: string) {
  return db.blogPost.update({ where: { id }, data: { deletedAt: new Date() } })
}
