import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { db } from '@/lib/db'
import { deleteFile } from '@/lib/storage'
import { writeAuditLog } from '@/lib/audit'

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || !hasRole(session, 'editor')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }
  const file = await db.mediaFile.findUnique({ where: { id: params.id } })
  if (!file) return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 })

  await deleteFile(file.key)
  await db.mediaFile.update({ where: { id: params.id }, data: { deletedAt: new Date() } })
  await writeAuditLog({ actorId: session.user.id, action: 'DELETE', entityType: 'media', entityId: params.id })
  return new NextResponse(null, { status: 204 })
}
