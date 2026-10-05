// Rule: only imports from own types/schema, src/lib/*, npm packages.
import { db } from '@/lib/db'
import { slugify } from '@/lib/slugify'
import { parsePagination, buildMeta } from '@/lib/paginate'
import {
  cacheGet,
  cacheSet,
  cacheDel,
  cacheInvalidateLists,
  LIST_TTL,
  RECORD_TTL,
} from '@/lib/cache'
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

// ── Cache types ───────────────────────────────────────────────────────────────

type PostWithAuthor       = Prisma.BlogPostGetPayload<{ include: typeof WITH_AUTHOR }>
type PostDetail           = Prisma.BlogPostGetPayload<{ include: typeof WITH_AUTHOR_AND_RELATED }>
type PostListResult       = { data: PostWithAuthor[]; pagination: PaginationMeta }

// ── Cache helpers ─────────────────────────────────────────────────────────────

const VERSION_KEY = 'blog:v'

function buildListKey(version: number, filters: BlogFilters): string {
  const {
    page = 1, perPage = 20,
    includeUnpublished, status,
    category, tag, authorId, search,
  } = filters
  return (
    `blog:list:v${version}:p${page}:pp${perPage}` +
    `:incl${includeUnpublished ? 1 : 0}` +
    `:st${status ?? ''}` +
    `:cat${category ?? ''}` +
    `:tag${tag ?? ''}` +
    `:auth${authorId ?? ''}` +
    `:q${search ?? ''}`
  )
}

function idKey(id: string): string    { return `blog:id:${id}` }
function slugCacheKey(slug: string): string { return `blog:slug:${slug}` }

async function invalidate(id: string, slug: string): Promise<void> {
  await Promise.all([
    cacheInvalidateLists(VERSION_KEY),
    cacheDel(idKey(id), slugCacheKey(slug)),
  ])
}

// ── Service functions ─────────────────────────────────────────────────────────

export async function listPosts(filters: BlogFilters = {}): Promise<PostListResult> {
  const { skip, take, page, perPage } = parsePagination(filters)

  const version = await cacheGet<number>(VERSION_KEY).then(v => v ?? 0)
  const key = buildListKey(version, { ...filters, page, perPage })
  const cached = await cacheGet<PostListResult>(key)
  if (cached !== null) return cached

  const where = {
    // When includeUnpublished is false, always lock to published regardless of any caller-
    // supplied status, to prevent accidental draft exposure via the public API.
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
  const result: PostListResult = { data: posts, pagination: buildMeta(total, page, perPage) }
  await cacheSet(key, result, LIST_TTL)
  return result
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const key = slugCacheKey(slug)
  const cached = await cacheGet<PostDetail>(key)
  if (cached !== null) return cached

  const post = await db.blogPost.findFirst({
    where: { slug, status: 'published', deletedAt: null },
    include: WITH_AUTHOR_AND_RELATED,
  })
  await cacheSet(key, post, RECORD_TTL)
  return post
}

export async function getPostById(id: string): Promise<PostWithAuthor | null> {
  const key = idKey(id)
  const cached = await cacheGet<PostWithAuthor>(key)
  if (cached !== null) return cached

  const post = await db.blogPost.findFirst({ where: { id, deletedAt: null }, include: WITH_AUTHOR })
  await cacheSet(key, post, RECORD_TTL)
  return post
}

export async function getByAuthor(authorId: string, limit = 50) {
  return db.blogPost.findMany({ where: { authorId, status: 'published', deletedAt: null }, include: WITH_AUTHOR, orderBy: { publishedAt: 'desc' }, take: limit })
}

export async function createPost(input: CreatePostInput) {
  const wordCount = (input.bodyHtml?.replace(/<[^>]+>/g, '') ?? '').split(/\s+/).length
  const post = await db.blogPost.create({
    data: { ...input, slug: slugify(input.title), readingTimeMinutes: Math.max(1, Math.round(wordCount / 200)) },
    include: WITH_AUTHOR,
  })
  await cacheInvalidateLists(VERSION_KEY)
  return post
}

export async function updatePost(id: string, input: UpdatePostInput) {
  const post = await db.blogPost.update({
    where: { id, deletedAt: null },
    data: { ...input, ...(input.title && { slug: slugify(input.title) }) },
    include: WITH_AUTHOR,
  })
  await invalidate(id, post.slug)
  return post
}

export async function submitForReview(id: string) {
  const post = await db.blogPost.update({ where: { id }, data: { status: 'in_review' } })
  // Status change should be reflected in admin list view immediately.
  await Promise.all([
    cacheInvalidateLists(VERSION_KEY),
    cacheDel(idKey(id), slugCacheKey(post.slug)),
  ])
  return post
}

export async function publishPost(id: string) {
  const post = await db.blogPost.update({ where: { id }, data: { status: 'published', publishedAt: new Date() } })
  await invalidate(id, post.slug)
  return post
}

export async function unpublishPost(id: string) {
  const post = await db.blogPost.update({ where: { id }, data: { status: 'draft', publishedAt: null } })
  await invalidate(id, post.slug)
  return post
}

export async function softDeletePost(id: string) {
  const result = await db.blogPost.update({ where: { id }, data: { deletedAt: new Date() } })
  await Promise.all([
    cacheInvalidateLists(VERSION_KEY),
    cacheDel(idKey(id), slugCacheKey(result.slug)),
  ])
  return result
}
