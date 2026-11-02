import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import * as stacksService from '@/modules/stacks/stacks.service'
import { updateStackSchema } from '@/modules/stacks/stacks.schema'
import { writeAuditLog } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const stacks = await stacksService.listStacks()
    const stack = stacks.find(s => s.id === params.id)
    if (!stack) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Stack not found' } }, { status: 404 })
    return NextResponse.json({ data: stack })
  } catch (err) {
    console.error('[stacks/[id]/GET] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || !hasRole(session, 'editor')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Forbidden.' } }, { status: 403 })
    }
    const body = await req.json()
    const parsed = updateStackSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: { code: 'VALIDATION', details: parsed.error.flatten() } }, { status: 400 })
    }
    const stack = await stacksService.updateStack(params.id, parsed.data)
    await writeAuditLog({ actorId: session.user.id, action: 'UPDATE', entityType: 'stack', entityId: params.id, newValue: parsed.data })
    return NextResponse.json({ data: stack })
  } catch (err) {
    console.error('[stacks/[id]/PATCH] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || !hasRole(session, 'editor')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Forbidden.' } }, { status: 403 })
    }
    await stacksService.deleteStack(params.id)
    await writeAuditLog({ actorId: session.user.id, action: 'DELETE', entityType: 'stack', entityId: params.id })
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('[stacks/[id]/DELETE] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
