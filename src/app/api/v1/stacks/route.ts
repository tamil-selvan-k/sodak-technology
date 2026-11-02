import { NextRequest, NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import * as stacksService from '@/modules/stacks/stacks.service'
import { createStackSchema } from '@/modules/stacks/stacks.schema'
import { writeAuditLog } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stacks = await stacksService.listStacks()
    return NextResponse.json({ data: stacks })
  } catch (err) {
    console.error('[stacks/GET] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !hasRole(session, 'editor')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Forbidden.' } }, { status: 403 })
    }
    const body = await req.json()
    const parsed = createStackSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input.', details: parsed.error.flatten() } }, { status: 422 })
    }
    const stack = await stacksService.createStack(parsed.data)
    if (!stack) return NextResponse.json({ error: { code: 'INTERNAL', message: 'Failed to create stack.' } }, { status: 500 })
    await writeAuditLog({ actorId: session.user.id, action: 'CREATE', entityType: 'stack', entityId: stack.id, newValue: stack })
    return NextResponse.json({ data: stack }, { status: 201 })
  } catch (err) {
    console.error('[stacks/POST] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
