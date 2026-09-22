import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { updateLeadStatus } from '@/modules/leads/leads.service'
import { z } from 'zod'
import { writeAuditLog } from '@/lib/audit'

const schema = z.object({ status: z.enum(['new', 'contacted', 'proposal_sent', 'won', 'lost']) })

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || !hasRole(session, 'sales')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION', details: parsed.error.flatten() } }, { status: 400 })

  const lead = await updateLeadStatus(params.id, parsed.data.status)
  await writeAuditLog({ actorId: session.user.id, action: 'UPDATE', entityType: 'lead', entityId: params.id, newValue: parsed.data })
  return NextResponse.json({ data: lead })
}
