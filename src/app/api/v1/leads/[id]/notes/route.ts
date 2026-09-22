import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { addNote } from '@/modules/leads/leads.service'
import { z } from 'zod'

const schema = z.object({ body: z.string().min(1).max(5000) })

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || !hasRole(session, 'sales')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION', details: parsed.error.flatten() } }, { status: 400 })

  const note = await addNote(params.id, session.user.id, parsed.data.body)
  return NextResponse.json({ data: note }, { status: 201 })
}
