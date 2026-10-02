import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth, hasRole } from '@/lib/auth'
import { db } from '@/lib/db'
export const dynamic = 'force-dynamic'

const VALID_ROLES = ['super_admin', 'editor', 'contributor', 'sales'] as const

const patchSchema = z.object({
  isActive: z.boolean().optional(),
  name:     z.string().min(1).max(120).nullable().optional(),
  role:     z.enum(VALID_ROLES).optional(),
})

const USER_SELECT = { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } as const

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || !hasRole(session, 'super_admin')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Forbidden.' } }, { status: 403 })
  }

  const user = await db.user.findUnique({ where: { id: params.id }, select: USER_SELECT })
  if (!user) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'User not found.' } }, { status: 404 })
  }

  return NextResponse.json({ data: user })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || !hasRole(session, 'super_admin')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Forbidden.' } }, { status: 403 })
  }

  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input.' } }, { status: 422 })
  }

  const user = await db.user.findUnique({ where: { id: params.id } })
  if (!user) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'User not found.' } }, { status: 404 })
  }

  // Prevent super_admin from deactivating themselves
  if (params.id === session.user.id && parsed.data.isActive === false) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'You cannot deactivate your own account.' } }, { status: 403 })
  }

  // Prevent super_admin from downgrading their own role
  if (params.id === session.user.id && parsed.data.role && parsed.data.role !== 'super_admin') {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'You cannot change your own role.' } }, { status: 403 })
  }

  const updated = await db.user.update({
    where: { id: params.id },
    data: parsed.data,
    select: USER_SELECT,
  })

  return NextResponse.json({ data: updated })
}
