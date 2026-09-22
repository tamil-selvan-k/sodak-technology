import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { verify } from '@node-rs/argon2'
import { db } from './db'
import { authConfig } from '../auth.config'
import type { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: { id: string; email: string; name: string | null; role: UserRole }
  }
  interface User {
    role: UserRole
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // JWT sessions: credentials provider cannot use database sessions in Edge middleware.
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.passwordHash || !user.isActive) return null

        const valid = await verify(user.passwordHash, credentials.password as string)
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id   = user.id
        token.role = (user as { role: UserRole }).role
      }
      return token
    },
    session({ session, token }) {
      session.user.id   = token.id as string
      session.user.role = token.role as UserRole
      return session
    },
  },
})

export type Role = UserRole

export const ROLES = {
  super_admin: ['super_admin'],
  editor:      ['super_admin', 'editor'],
  contributor: ['super_admin', 'editor', 'contributor'],
  sales:       ['super_admin', 'sales'],
} satisfies Record<string, Role[]>

export function hasRole(
  sessionOrRole: Role | { user: { role: Role } } | null | undefined,
  required: keyof typeof ROLES,
): boolean {
  if (sessionOrRole == null) return false
  const role: Role =
    typeof sessionOrRole === 'string' ? sessionOrRole : sessionOrRole.user.role
  return (ROLES[required] as Role[]).includes(role)
}
