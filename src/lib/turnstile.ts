/**
 * Server-side Cloudflare Turnstile token verification.
 *
 * Returns true when the token is valid, false when it is invalid or absent.
 * Throws only if the Cloudflare API is unreachable (caller should handle).
 *
 * Set TURNSTILE_SECRET_KEY in Vercel environment variables before deploying.
 */
export async function verifyTurnstile(
  token: string | undefined,
  ip: string,
): Promise<boolean> {
  // Skip verification in local development so forms work without a real token.
  if (process.env.NODE_ENV === 'development') return true

  if (!token) return false

  // Guard against a missing secret key instead of silently sending an empty JSON body.
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    console.error('[verifyTurnstile] TURNSTILE_SECRET_KEY is not set. Rejecting request.')
    return false
  }

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
    })
    const json = await res.json() as { success: boolean; 'error-codes'?: string[] }
    if (!json.success) {
      console.warn('[verifyTurnstile] Cloudflare rejected token:', json['error-codes'])
    }
    return json.success
  } catch (err) {
    // If Cloudflare is unreachable, fail closed to prevent bypassing protection.
    console.error('[verifyTurnstile] Cloudflare API unreachable:', err)
    throw err // Let the caller's catch return 500 — user should retry.
  }
}
