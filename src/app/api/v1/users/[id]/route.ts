import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth, hasRole } from '@/lib/auth'
import { db } from '@/lib/db'

const patchSchema = z.object({
  isActive: z.boolean().optional(),
})

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

  const updated = await db.user.update({
    where: { id: params.id },
    data: parsed.data,
    select: { id: true, name: true, email: true, role: true, isActive: true },
  })

  return NextResponse.json({ data: updated })
}
