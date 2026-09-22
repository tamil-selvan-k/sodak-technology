import { NextRequest, NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import * as leadsService from '@/modules/leads/leads.service'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || !hasRole(session.user.role, 'sales')) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Forbidden.' } }, { status: 403 })
  const p = Object.fromEntries(req.nextUrl.searchParams)
  const result = await leadsService.listLeads({ status: p['status'] as never, source: p['source'], page: p['page'] ? Number(p['page']) : undefined })
  return NextResponse.json(result)
}
