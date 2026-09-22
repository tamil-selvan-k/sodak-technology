import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { listPhotos, createPhoto } from '@/modules/gallery/gallery.service'
import { createPhotoSchema } from '@/modules/gallery/gallery.schema'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const { data, pagination } = await listPhotos({
    institutionId: searchParams.get('institution') ?? undefined,
    year: searchParams.get('year') ? Number(searchParams.get('year')) : undefined,
  })
  return NextResponse.json({ data, meta: pagination })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || !hasRole(session, 'contributor')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }
  const body = await req.json()
  const parsed = createPhotoSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION', details: parsed.error.flatten() } }, { status: 400 })
  const photo = await createPhoto(parsed.data)
  return NextResponse.json({ data: photo }, { status: 201 })
}
