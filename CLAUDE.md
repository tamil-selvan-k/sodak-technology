# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

CMS-driven multi-page web platform for SODAK Technology, a campus placement training company (Chennai). Public website + role-based admin panel, backed by a REST API, PostgreSQL, and S3 media storage.

Production domain: `sodakedutech.in`

## Commands

```bash
pnpm install          # install deps (runs prisma generate via postinstall)
pnpm dev              # dev server at localhost:3000
pnpm build            # production build (vercel runs: prisma generate && next build)
pnpm lint             # ESLint (next/core-web-vitals config)
pnpm type-check       # tsc --noEmit (strict mode + noUncheckedIndexedAccess)

# Database
pnpm db:generate      # regenerate Prisma client after schema changes
pnpm db:migrate       # create + apply a dev migration
pnpm db:push          # push schema without creating a migration file
pnpm db:studio        # open Prisma Studio GUI
pnpm db:seed          # seed database (tsx prisma/seed.ts)
pnpm db:deploy        # apply migrations in production (prisma migrate deploy)
```

CI runs lint, type-check, and build on every PR to `main` (see `.github/workflows/ci.yml`). No test runner is configured.

## Tech Stack

- **Next.js 14** (App Router, ISR) with **TypeScript strict mode**
- **Prisma 5** on **PostgreSQL** (Supabase — pgbouncer pooler at runtime port 6543, direct connection port 5432 for migrations)
- **NextAuth.js v5** (database sessions, Argon2id password hashing via `@node-rs/argon2`)
- **Tailwind CSS** with custom design tokens in `tailwind.config.ts`
- **Zod** for schema-first validation (API + forms)
- **AWS S3** for media storage, optional CloudFront CDN, **Sharp** for image processing
- **Nodemailer** (SMTP) for transactional email
- **Upstash Redis** for rate limiting; **Cloudflare Turnstile** + honeypot for spam protection
- **pnpm** as the package manager; **Node.js >=22**

## Architecture

### Route Groups

- `src/app/(public)/` — public-facing pages (SSR/ISR)
- `src/app/(admin)/` — admin panel with its own layout + auth middleware
- `src/app/api/v1/` — all REST API endpoints
- `src/app/api/auth/` — NextAuth.js routes

### Module System (`src/modules/`)

Each business domain has its own directory with three files:
- `{domain}.service.ts` — DB operations and business logic
- `{domain}.schema.ts` — Zod validation schemas
- `{domain}.types.ts` — TypeScript types

**Hard rule: services never import from other module services.** Cross-module data assembly happens only in API route handlers (`src/app/api/v1/[resource]/route.ts`), which call multiple services and compose the response.

Cross-module side effects (e.g., "publish trainer → send email") use the event emitter in `src/lib/events.ts`, not direct service-to-service calls. Handlers register in `src/lib/notification-handlers.ts`.

### Shared Infrastructure (`src/lib/`)

| File | Purpose |
|---|---|
| `db.ts` | Prisma client singleton |
| `auth.ts` | NextAuth session helper |
| `storage.ts` | AWS S3 wrapper |
| `email.ts` | Nodemailer SMTP wrapper |
| `image.ts` | Sharp resize pipeline (WebP + AVIF variants) |
| `cache.ts` | Redis cache layer |
| `redis.ts` | Redis client |
| `rate-limit.ts` | Upstash rate limiting |
| `turnstile.ts` | Cloudflare Turnstile verification |
| `events.ts` | In-process event emitter (serverless-aware) |
| `audit.ts` | Audit log writer |
| `paginate.ts` | Pagination helper |
| `slugify.ts` | Slug generation |
| `upload-progress.ts` | SSE progress for bulk uploads |

### Components (`src/components/`)

- `ui/` — shared primitives (Button, Card, Input, etc.) used by both public and admin
- `layout/` — Navbar, Footer, FloatButtons (public site chrome)

Barrel export via `src/components/ui/index.ts`.

### Middleware

`src/middleware.ts` runs in Edge Runtime. It protects:
- All `/admin/*` routes (redirects to `/admin/login` if no JWT)
- All non-GET `/api/v1/*` requests (returns 401 JSON if no JWT)

Public GET API routes and the admin login page are always accessible.

Auth secret resolution: middleware reads `AUTH_SECRET ?? NEXTAUTH_SECRET` — either env var works, but `AUTH_SECRET` takes precedence.

## API Conventions

Base path: `/api/v1/`

Standard CRUD pattern: `GET` (list/detail) = public, `POST/PATCH/DELETE` = admin-authenticated.

Response envelope:
- Success: `{ "data": ... }` (with `"pagination"` object for lists)
- Error: `{ "error": { "code": "...", "message": "..." } }`

Public form submissions go to `/api/v1/forms/{enquiry,careers,internship,webinar}`.

## Auth & RBAC

Five roles: `super_admin`, `editor`, `contributor`, `sales`, `visitor`. Defined as a Prisma enum (`UserRole`). RBAC is enforced at the API middleware level — UI hiding alone is never sufficient.

## Consent Gates (Service Layer)

These are hard constraints enforced in service code, not UI toggles:
- `Trainer.consentOnFile = false` → blocks publishing
- `Institution.logoPermission = false` → render text name, never logo
- `Photo.hasStudentFaces = true` → requires `studentConsentRef` before publishing
- `Photo.altText = null` → blocks publishing

## Design Tokens

Custom Tailwind tokens in `tailwind.config.ts`. Key conventions:
- Blue-based palette (navy, gold tokens map to blues, not literal gold/navy)
- Font families: `font-sans` (Inter), `font-heading` (Plus Jakarta Sans) — loaded via `next/font/google` in root layout with CSS variables `--font-inter` and `--font-plus-jakarta`
- **Known issue:** `tailwind.config.ts` references `--font-open-sans` and `--font-instrument-sans` but `src/app/layout.tsx` generates `--font-inter` and `--font-plus-jakarta` — these CSS variable names don't match
- Glass card effect: `backdrop-blur-glass` + semi-transparent backgrounds
- Max content width: `max-w-container` (1280px)

## Database

Schema: `prisma/schema.prisma`. All models use `@@map()` for snake_case table names.

Connection strings (both required):
- `DATABASE_URL` — pooler (port 6543) for runtime
- `DIRECT_URL` — direct (port 5432) for migrations only

Soft delete pattern: `deletedAt DateTime?` on most content models. Always filter `deletedAt IS NULL` in queries.

## Environment

Copy `.env.example` to `.env.local` for local development. Required variable groups: Database, Auth (`AUTH_SECRET`/`NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `REVALIDATE_SECRET`), SMTP (`SMTP_HOST/PORT/USER/PASS/FROM`), Notification (`NOTIFICATION_EMAIL`), AWS S3, Upstash Redis, Cloudflare Turnstile, Site (`NEXT_PUBLIC_SITE_URL`).

Note: The README and CI stubs reference Resend (`RESEND_API_KEY`) but the actual codebase uses Nodemailer SMTP — the Resend references are stale.

The `next.config.mjs` dynamically loads redirects from the DB `redirects` table at build time, sets security headers (CSP, HSTS), and externalizes native binaries (`@node-rs/argon2`, `sharp`) from the webpack server bundle.

## Deployment

Vercel Hobby (free tier). GitHub Actions CI runs on PRs; production deploys from `main` via Vercel CLI with `VERCEL_TOKEN` secret. Build command: `prisma generate && next build`.

## Path Alias

`@/*` maps to `./src/*` (configured in `tsconfig.json`).
