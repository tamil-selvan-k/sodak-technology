// Event emitter for intra-request side effects.
//
// SERVERLESS CONSTRAINT: Node.js module state (including this Map) resets on every cold start
// and is NOT shared across concurrent Vercel lambda instances. This emitter is therefore only
// reliable for side effects that are registered AND fired within the same module import chain
// in the same request.
//
// Handlers that must survive across cold starts (e.g., email on publish) should be registered
// synchronously at the top of the API route file that fires the event, OR moved to a durable
// queue (Upstash QStash) when reliability > simplicity.
//
// Current usage: trainers/[id]/publish imports this module and `src/lib/notification-handlers`
// in the same module chain, so warm-path execution is reliable. Cold starts are rare and
// acceptable for a low-traffic site on Vercel Hobby.

type Handler<T = unknown> = (payload: T) => void | Promise<void>

const listeners = new Map<string, Handler[]>()

export function emit<T>(event: string, payload: T): void {
  const handlers = listeners.get(event) ?? []
  for (const handler of handlers) {
    Promise.resolve(handler(payload as unknown)).catch(err =>
      console.error(`[events] handler error for "${event}":`, err),
    )
  }
}

export function on<T>(event: string, handler: Handler<T>): () => void {
  const existing = listeners.get(event) ?? []
  listeners.set(event, [...existing, handler as Handler])
  return () => {
    const current = listeners.get(event) ?? []
    listeners.set(event, current.filter(h => h !== handler))
  }
}
