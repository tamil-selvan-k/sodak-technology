import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { listPhotos, createPhoto } from '@/modules/gallery/gallery.service'
import { createPhotoSchema } from '@/modules/gallery/gallery.schema'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const { data, pagination } = await listPhotos({
      institutionId: searchParams.get('institution') ?? undefined,
      year: searchParams.get('year') ? Number(searchParams.get('year')) : undefined,
    })
    return NextResponse.json({ data, meta: pagination })
  } catch (err) {
    console.error('[photos/GET] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || !hasRole(session, 'contributor')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
    }
    const body = await req.json()
    const parsed = createPhotoSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION', details: parsed.error.flatten() } }, { status: 400 })
    const photo = await createPhoto(parsed.data)
    return NextResponse.json({ data: photo }, { status: 201 })
  } catch (err) {
    console.error('[photos/POST] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
