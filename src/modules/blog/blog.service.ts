// Rule: only imports from own types/schema, src/lib/*, npm packages.
import { db } from '@/lib/db'
import { slugify } from '@/lib/slugify'
import { parsePagination, buildMeta } from '@/lib/paginate'
import type { BlogFilters, CreatePostInput, UpdatePostInput } from './blog.types'

const WITH_AUTHOR = { author: true } as const

export async function listPosts(filters: BlogFilters = {}) {
  const { skip, take, page, perPage } = parsePagination(filters)
  const where = {
    // When includeUnpublished is false, always lock to published regardless of any caller-
    // supplied status, to prevent accidental draft exposure via the public API.
    ...(filters.includeUnpublished
      ? filters.status ? { status: filters.status as never } : {}
      : { status: 'published' as never }),
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

export async function getPostBySlug(slug: string) {
  return db.blogPost.findFirst({
    where: { slug, status: 'published', deletedAt: null },
    include: { author: true, relatedTo: { include: { relatedPost: { include: { author: true } } } } },
  })
}

export async function getPostById(id: string) {
  return db.blogPost.findFirst({ where: { id, deletedAt: null }, include: WITH_AUTHOR })
}

export async function getByAuthor(authorId: string) {
  return db.blogPost.findMany({ where: { authorId, status: 'published', deletedAt: null }, include: WITH_AUTHOR, orderBy: { publishedAt: 'desc' } })
}

export async function createPost(input: CreatePostInput) {
  const wordCount = (input.bodyHtml?.replace(/<[^>]+>/g, '') ?? '').split(/\s+/).length
  return db.blogPost.create({
    data: { ...input, slug: slugify(input.title), readingTimeMinutes: Math.max(1, Math.round(wordCount / 200)) },
    include: WITH_AUTHOR,
  })
}

export async function updatePost(id: string, input: UpdatePostInput) {
  return db.blogPost.update({
    where: { id },
    data: { ...input, ...(input.title && { slug: slugify(input.title) }) },
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
