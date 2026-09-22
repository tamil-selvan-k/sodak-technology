import { NextRequest, NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import * as trainersService from '@/modules/trainers/trainers.service'
import { updateTrainerSchema } from '@/modules/trainers/trainers.schema'
import { writeAuditLog } from '@/lib/audit'

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const trainer = await trainersService.getTrainerById(params.id)
  if (!trainer) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Trainer not found.' } }, { status: 404 })
  return NextResponse.json({ data: trainer })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session || !hasRole(session.user.role, 'editor')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Insufficient permissions.' } }, { status: 403 })
  }

  const body   = await req.json()
  const parsed = updateTrainerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input.', details: parsed.error.flatten() } }, { status: 422 })
  }

  const before  = await trainersService.getTrainerById(params.id)
  const trainer = await trainersService.updateTrainer(params.id, parsed.data)
  await writeAuditLog({ actorId: session.user.id, action: 'updated', entityType: 'trainer', entityId: params.id, oldValue: before, newValue: trainer })

  return NextResponse.json({ data: trainer })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session || !hasRole(session.user.role, 'super_admin')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Insufficient permissions.' } }, { status: 403 })
  }

  const before = await trainersService.getTrainerById(params.id)
  await trainersService.softDeleteTrainer(params.id)
  await writeAuditLog({ actorId: session.user.id, action: 'deleted', entityType: 'trainer', entityId: params.id, oldValue: before, newValue: null })

  return new NextResponse(null, { status: 204 })
}
