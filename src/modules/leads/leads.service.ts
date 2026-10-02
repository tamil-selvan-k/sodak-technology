// Rule: only imports from own types/schema, src/lib/*, npm packages.
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { parsePagination, buildMeta } from '@/lib/paginate'
import { cacheGet, cacheSet, cacheInvalidateLists, LIST_TTL } from '@/lib/cache'
import type { Lead } from '@prisma/client'
import type { PaginationMeta } from '@/lib/paginate'
import type { LeadStatus } from '@prisma/client'
import type { CreateLeadInput, LeadFilters } from './leads.types'

// ── Cache types ───────────────────────────────────────────────────────────────

type LeadListResult = { data: Lead[]; pagination: PaginationMeta }

// ── Cache helpers ─────────────────────────────────────────────────────────────

const VERSION_KEY = 'leads:v'

function buildListKey(version: number, filters: LeadFilters): string {
  const { page = 1, perPage = 20, status, source, from, to } = filters
  return (
    `leads:list:v${version}:p${page}:pp${perPage}` +
    `:s${status ?? ''}` +
    `:src${source ?? ''}` +
    `:f${from?.getTime() ?? 0}` +
    `:t${to?.getTime() ?? 0}`
  )
}

/** Bump the version counter — all old list cache keys become orphaned. */
async function invalidateLeadCache(): Promise<void> {
  await cacheInvalidateLists(VERSION_KEY)
}

// ── Service functions ─────────────────────────────────────────────────────────

export async function createLead(input: CreateLeadInput) {
  const lead = await db.lead.create({ data: input })

  // Fire-and-forget: email failure must not reject createLead or the caller
  // will 500, the user retries, and a duplicate lead is inserted.
  Promise.all([
    sendEmail({
      to: process.env.NOTIFICATION_EMAIL!,
      template: 'lead-notification',
      data: { name: lead.name, email: lead.email, message: lead.message ?? '' },
    }),
    sendEmail({
      to: lead.email,
      template: 'lead-acknowledgement',
      data: { name: lead.name },
    }),
  ]).catch(err => console.error('[email] lead notification failed:', err))

  // Invalidate list cache — new lead must appear immediately in admin inbox.
  await invalidateLeadCache()

  return lead
}

export async function listLeads(filters: LeadFilters = {}): Promise<LeadListResult> {
  const { skip, take, page, perPage } = parsePagination(filters)

  const version = await cacheGet<number>(VERSION_KEY).then(v => v ?? 0)
  const key = buildListKey(version, { ...filters, page, perPage })
  const cached = await cacheGet<LeadListResult>(key)
  if (cached !== null) return cached

  const where = {
    ...(filters.status && { status: filters.status }),
    ...(filters.source && { source: filters.source }),
    ...(filters.from   && { createdAt: { gte: filters.from } }),
    ...(filters.to     && { createdAt: { lte: filters.to } }),
  }
  const [leads, total] = await Promise.all([
    db.lead.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    db.lead.count({ where }),
  ])
  const result: LeadListResult = { data: leads, pagination: buildMeta(total, page, perPage) }

  await cacheSet(key, result, LIST_TTL)
  return result
}

export async function getLeadById(id: string) {
  return db.lead.findUnique({ where: { id }, include: { notes: { include: { author: { select: { id: true, name: true } } } } } })
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const result = await db.lead.update({ where: { id }, data: { status } })
  await invalidateLeadCache()
  return result
}

export async function addNote(leadId: string, authorId: string, body: string) {
  const result = await db.leadNote.create({ data: { leadId, authorId, body } })
  // Invalidate leads list so the updated note count/preview is reflected.
  await invalidateLeadCache()
  return result
}
