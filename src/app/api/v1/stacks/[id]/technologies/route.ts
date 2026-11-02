import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth, hasRole } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAuditLog } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const addTechSchema = z.object({
  name:         z.string().min(1).max(100),
  displayOrder: z.number().int().default(0),
})

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const technologies = await db.technology.findMany({
      where: { stackId: params.id },
      orderBy: { displayOrder: 'asc' },
    })
    return NextResponse.json({ data: technologies })
  } catch (err) {
    console.error('[stacks/[id]/technologies/GET] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || !hasRole(session, 'editor')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Forbidden.' } }, { status: 403 })
    }
    const body = await req.json()
    const parsed = addTechSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input.', details: parsed.error.flatten() } }, { status: 422 })
    }

    // Verify stack exists
    const stack = await db.stack.findUnique({ where: { id: params.id }, select: { id: true } })
    if (!stack) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Stack not found' } }, { status: 404 })
    }

    const technology = await db.technology.create({
      data: {
        name:         parsed.data.name,
        displayOrder: parsed.data.displayOrder,
        stackId:      params.id,
      },
    })
    await writeAuditLog({ actorId: session.user.id, action: 'CREATE', entityType: 'technology', entityId: technology.id, newValue: technology })
    return NextResponse.json({ data: technology }, { status: 201 })
  } catch (err) {
    console.error('[stacks/[id]/technologies/POST] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
