import { NextRequest, NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import * as trainersService from '@/modules/trainers/trainers.service'
import { createTrainerSchema } from '@/modules/trainers/trainers.schema'
import { writeAuditLog } from '@/lib/audit'

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams)
  const result = await trainersService.listTrainers({
    stack:    params['stack'],
    company:  params['company'],
    search:   params['search'],
    isMentor: params['isMentor'] === 'true' ? true : params['isMentor'] === 'false' ? false : undefined,
    page:     params['page']    ? Number(params['page'])    : undefined,
    perPage:  params['perPage'] ? Number(params['perPage']) : undefined,
  })
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !hasRole(session.user.role, 'editor')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Insufficient permissions.' } }, { status: 403 })
  }

  const body   = await req.json()
  const parsed = createTrainerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input.', details: parsed.error.flatten() } }, { status: 422 })
  }

  const trainer = await trainersService.createTrainer(parsed.data)
  await writeAuditLog({ actorId: session.user.id, action: 'created', entityType: 'trainer', entityId: trainer.id, newValue: trainer })

  return NextResponse.json({ data: trainer }, { status: 201 })
}
