import { NextResponse } from 'next/server'
import { auth, hasRole } from '@/lib/auth'
import { db } from '@/lib/db'
import { publishPhoto, unpublishPhoto } from '@/modules/gallery/gallery.service'
import { writeAuditLog } from '@/lib/audit'
import { AltTextError, ConsentError } from '@/modules/gallery/gallery.service'
import { z } from 'zod'

const bulkSchema = z.object({
  ids:    z.array(z.string().cuid()).min(1).max(50),
  action: z.enum(['publish', 'unpublish', 'delete']),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session || !hasRole(session, 'editor')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }

  const body   = await req.json()
  const parsed = bulkSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'VALIDATION', details: parsed.error.flatten() } }, { status: 400 })
  }

  const { ids, action } = parsed.data

  if (action === 'delete' && !hasRole(session, 'super_admin')) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }

  const results: { id: string; ok: boolean; error?: string }[] = []

  if (action === 'publish') {
    // Enforce consent gates per-row — publishPhoto() throws AltTextError / ConsentError.
    // NOTE: db.$transaction is NOT used here because publishPhoto() uses the global db client
    // internally, meaning a transaction context would not be honoured.  Each publish is
    // committed immediately; per-row consent errors are reported without aborting the batch.
    for (const id of ids) {
      try {
        await publishPhoto(id)
        await writeAuditLog({ actorId: session.user.id, action: 'PUBLISH', entityType: 'photo', entityId: id })
        results.push({ id, ok: true })
      } catch (err) {
        if (err instanceof AltTextError || err instanceof ConsentError) {
          results.push({ id, ok: false, error: (err as Error).message })
        } else {
          throw err
        }
      }
    }
  } else if (action === 'unpublish') {
    for (const id of ids) {
      await unpublishPhoto(id)
      await writeAuditLog({ actorId: session.user.id, action: 'UNPUBLISH', entityType: 'photo', entityId: id })
      results.push({ id, ok: true })
    }
  } else {
    // soft delete
    await db.photo.updateMany({ where: { id: { in: ids } }, data: { deletedAt: new Date() } })
    await Promise.all(ids.map(id =>
      writeAuditLog({ actorId: session.user.id, action: 'DELETE', entityType: 'photo', entityId: id }),
    ))
    ids.forEach(id => results.push({ id, ok: true }))
  }

  const failed = results.filter(r => !r.ok)
  return NextResponse.json({
    data: { affected: results.filter(r => r.ok).length, failed },
  }, { status: failed.length > 0 && results.every(r => !r.ok) ? 422 : 200 })
}
