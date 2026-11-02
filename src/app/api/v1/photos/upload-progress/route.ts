import { auth, hasRole } from '@/lib/auth'
import { kv } from '@/lib/redis'
import type { UploadProgress } from '@/lib/upload-progress'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session || !hasRole(session, 'contributor')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const jobId = searchParams.get('jobId')
    if (!jobId) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'jobId required' } },
        { status: 400 },
      )
    }

    // Ownership check — read the job before starting the SSE stream so we can
    // reject mismatched callers early instead of leaking progress events.
    const initialProgress = await kv.get<UploadProgress>(`upload:progress:${jobId}`)
    if (initialProgress !== null && initialProgress.uploaderId !== session.user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'You do not have access to this upload job.' } },
        { status: 403 },
      )
    }

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        let ticks = 0
        const MAX_TICKS = 120

        const interval = setInterval(async () => {
          ticks++
          try {
            const progress = await kv.get<UploadProgress>(`upload:progress:${jobId}`)

            // Guard against a race where the job is re-created by a different user
            // after the initial ownership check above.
            if (progress !== null && progress.uploaderId !== session.user.id) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'FORBIDDEN' })}\n\n`))
              clearInterval(interval)
              controller.close()
              return
            }

            const payload  = progress ?? { uploaderId: session.user.id, done: 0, total: 0, errors: [] }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))

            const done = progress && progress.total > 0 && progress.done >= progress.total
            if (done || ticks >= MAX_TICKS) {
              clearInterval(interval)
              controller.close()
            }
          } catch {
            clearInterval(interval)
            controller.close()
          }
        }, 500)
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type':  'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection':    'keep-alive',
      },
    })
  } catch (err) {
    console.error('[photos/upload-progress/GET] error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
