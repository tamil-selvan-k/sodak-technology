import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { getProgramById, updateProgram, softDeleteProgram } from '@/modules/programs/programs.service'
import { updateProgramSchema } from '@/modules/programs/programs.schema'
import { writeAuditLog } from '@/lib/audit'
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const program = await getProgramById(params.id)
    if (!program) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Program not found' } }, { status: 404 })
    return NextResponse.json({ data: program })
  } catch (err) {
    console.error('[programs/[id]/GET] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || !hasRole(session, 'editor')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
    }
    const body = await req.json()
    const parsed = updateProgramSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION', details: parsed.error.flatten() } }, { status: 400 })
    const program = await updateProgram(params.id, parsed.data)
    await writeAuditLog({ actorId: session.user.id, action: 'UPDATE', entityType: 'program', entityId: params.id, newValue: parsed.data })
    return NextResponse.json({ data: program })
  } catch (err) {
    console.error('[programs/[id]/PATCH] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || !hasRole(session, 'editor')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
    }
    await softDeleteProgram(params.id)
    await writeAuditLog({ actorId: session.user.id, action: 'DELETE', entityType: 'program', entityId: params.id })
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('[programs/[id]/DELETE] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
