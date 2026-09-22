import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { getPhotoById, updatePhoto, deletePhoto } from '@/modules/gallery/gallery.service'
import { updatePhotoSchema } from '@/modules/gallery/gallery.schema'
import { writeAuditLog } from '@/lib/audit'
import { ConsentError, AltTextError } from '@/modules/gallery/gallery.service'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const photo = await getPhotoById(params.id)
  if (!photo) return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 })
  return NextResponse.json({ data: photo })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || !hasRole(session, 'editor')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }
  const body = await req.json()
  const parsed = updatePhotoSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION', details: parsed.error.flatten() } }, { status: 400 })
  const photo = await updatePhoto(params.id, parsed.data)
  await writeAuditLog({ actorId: session.user.id, action: 'UPDATE', entityType: 'photo', entityId: params.id, newValue: parsed.data })
  return NextResponse.json({ data: photo })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || !hasRole(session, 'super_admin')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }
  await deletePhoto(params.id)
  await writeAuditLog({ actorId: session.user.id, action: 'DELETE', entityType: 'photo', entityId: params.id })
  return new NextResponse(null, { status: 204 })
}
