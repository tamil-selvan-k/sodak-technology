import { NextRequest, NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import * as programsService from '@/modules/programs/programs.service'
import { createProgramSchema } from '@/modules/programs/programs.schema'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const p = Object.fromEntries(req.nextUrl.searchParams)
    const result = await programsService.listPrograms({ trackCode: p['track'], stack: p['stack'], search: p['search'], page: p['page'] ? Number(p['page']) : undefined })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[programs/GET] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !hasRole(session.user.role, 'editor')) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Forbidden.' } }, { status: 403 })
    const body = await req.json()
    const parsed = createProgramSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input.', details: parsed.error.flatten() } }, { status: 422 })
    const program = await programsService.createProgram(parsed.data)
    return NextResponse.json({ data: program }, { status: 201 })
  } catch (err) {
    console.error('[programs/POST] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
