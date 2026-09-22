// Register all event-driven side effects here.
//
// Import this file at the TOP of any API route that calls emit() so that
// handlers are registered before the emit fires — within the same lambda invocation.
//
// Pattern: import '@/lib/notification-handlers'  (side-effect import)
//
// See events.ts for the serverless constraint explanation.

import { on } from './events'
import { sendEmail } from './email'
import { db } from './db'

on<{ trainerId: string }>('trainer.published', async ({ trainerId }) => {
  const trainer = await db.trainer.findUnique({ where: { id: trainerId }, select: { name: true, slug: true } })
  if (!trainer) return
  // Future: notify the trainer via email when we have trainer email stored
  console.info(`[notify] trainer.published: ${trainer.name} → /trainers/${trainer.slug}`)
})

on<{ trainerId: string }>('trainer.published', async ({ trainerId }) => {
  // Trigger ISR revalidation for the trainer list page
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    await fetch(`${siteUrl}/api/revalidate?tag=trainers`, {
      method: 'POST',
      headers: { 'x-revalidate-secret': process.env.REVALIDATE_SECRET ?? '' },
    })
  } catch (err) {
    console.error('[notify] ISR revalidation failed:', err)
  }
})
