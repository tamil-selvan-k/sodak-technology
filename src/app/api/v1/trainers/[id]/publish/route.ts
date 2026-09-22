import { NextRequest, NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import * as trainersService from '@/modules/trainers/trainers.service'
import { ConsentError } from '@/modules/trainers/trainers.service'
import { writeAuditLog } from '@/lib/audit'
import '@/lib/notification-handlers' // register event handlers before emit fires

type Params = { params: { id: string } }

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session || !hasRole(session.user.role, 'editor')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Insufficient permissions.' } }, { status: 403 })
  }

  try {
    const trainer = await trainersService.publishTrainer(params.id)
    await writeAuditLog({ actorId: session.user.id, action: 'published', entityType: 'trainer', entityId: params.id, newValue: trainer })
    return NextResponse.json({ data: trainer })
  } catch (err) {
    if (err instanceof ConsentError) {
      return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: 422 })
    }
    throw err
  }
}
