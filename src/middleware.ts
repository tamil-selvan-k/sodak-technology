import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isAdminLoginPage = pathname === '/admin/login'
  const isAdminRoute     = pathname.startsWith('/admin')
  const isWriteApiRoute  = pathname.startsWith('/api/v1') && req.method !== 'GET'

  // Always allow the login page through
  if (isAdminLoginPage) return NextResponse.next()

  // For protected routes, check JWT token (works in Edge Runtime)
  if (isAdminRoute || isWriteApiRoute) {
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      if (isAdminRoute) {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } },
        { status: 401 },
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/v1/:path*'],
}
