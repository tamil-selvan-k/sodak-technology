import type { NextAuthConfig } from 'next-auth'

// Edge-safe config — no argon2, no Prisma adapter, no DB imports.
// Used by middleware only. Full auth config is in src/lib/auth.ts.
export const authConfig = {
  pages: { signIn: '/admin/login' },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      if (nextUrl.pathname === '/admin/login') return true
      return !!auth?.user
    },
  },
} satisfies NextAuthConfig
