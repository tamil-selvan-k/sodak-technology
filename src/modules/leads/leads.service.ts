// Rule: only imports from own types/schema, src/lib/*, npm packages.
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { parsePagination, buildMeta } from '@/lib/paginate'
import type { LeadStatus } from '@prisma/client'
import type { CreateLeadInput, LeadFilters } from './leads.types'

export async function createLead(input: CreateLeadInput) {
  const lead = await db.lead.create({ data: input })

  await Promise.all([
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
  ])

  return lead
}

export async function listLeads(filters: LeadFilters = {}) {
  const { skip, take, page, perPage } = parsePagination(filters)
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
  return { data: leads, pagination: buildMeta(total, page, perPage) }
}

export async function getLeadById(id: string) {
  return db.lead.findUnique({ where: { id }, include: { notes: { include: { author: { select: { id: true, name: true } } } } } })
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  return db.lead.update({ where: { id }, data: { status } })
}

export async function addNote(leadId: string, authorId: string, body: string) {
  return db.leadNote.create({ data: { leadId, authorId, body } })
}
