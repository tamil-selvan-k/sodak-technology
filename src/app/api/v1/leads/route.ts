import { NextRequest, NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import * as leadsService from '@/modules/leads/leads.service'
import type { LeadStatus } from '@prisma/client'
export const dynamic = 'force-dynamic'

const VALID_LEAD_STATUSES: ReadonlySet<string> = new Set<LeadStatus>([
  'new', 'contacted', 'proposal_sent', 'won', 'lost',
])

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !hasRole(session.user.role, 'sales')) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Forbidden.' } }, { status: 403 })
    const p = Object.fromEntries(req.nextUrl.searchParams)
    const rawStatus = p['status']
    const status: LeadStatus | undefined = rawStatus && VALID_LEAD_STATUSES.has(rawStatus) ? rawStatus as LeadStatus : undefined
    const result = await leadsService.listLeads({ status, source: p['source'], page: p['page'] ? Number(p['page']) : undefined })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[leads/GET] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
