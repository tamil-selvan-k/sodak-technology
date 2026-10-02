# Deployment Runbook — SODAK Technology

---

## 1. Environment Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables. Mark sensitive values as **Secret**. Never commit them to the repo.

### Required — Database

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase pgbouncer pooler — **port 6543**, transaction mode. Used at runtime by all Prisma queries. | `postgresql://postgres.[ref]:[pass]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Supabase direct Postgres — **port 5432**. Used only by `prisma migrate deploy`. DDL statements require a non-pooled connection. | `postgresql://postgres.[ref]:[pass]@db.[ref].supabase.co:5432/postgres` |

### Required — Auth

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_SECRET` | 32+ char random string. Used to sign JWT session tokens. |
| `AUTH_SECRET` | Same value as `NEXTAUTH_SECRET` (NextAuth v5 uses both names). |
| `NEXTAUTH_URL` | Full public URL, e.g. `https://sodakedutech.in` (omit trailing slash). |

### Required — AWS S3 / CloudFront

| Variable | Description |
|----------|-------------|
| `AWS_REGION` | e.g. `ap-south-1` |
| `AWS_S3_BUCKET` | Bucket name, e.g. `sodakedutech-media` |
| `AWS_ACCESS_KEY_ID` | IAM user access key (scoped to this bucket only) |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `AWS_CLOUDFRONT_DOMAIN` | Optional. CloudFront distribution domain (no `https://`). When set, all public S3 URLs use this CDN domain. |

### Required — Email

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Resend API key (`re_…`) |
| `RESEND_FROM` | Sender address, e.g. `SODAK Technology <hello@sodakedutech.in>` |

### Required — Spam Protection

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key (public; embedded in frontend) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key (server-side verification) |

### Required — Rate Limiting

| Variable | Description |
|----------|-------------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SITE_URL` | Full public URL (used in emails and ISR revalidation calls) | `https://sodakedutech.in` |
| `REVALIDATE_SECRET` | Secret header value for `/api/revalidate` ISR endpoint | (empty string, unprotected) |
| `NOTIFICATION_EMAIL` | Override admin notification email address | Value in `SiteSetting.notificationEmail` |
| `REDIS_URL` | Local ioredis URL (dev only; ignored in production) | `redis://localhost:6379` |

---

## 2. GitHub Secrets Required

These secrets are consumed by `.github/workflows/ci.yml`.

| Secret | Used in |
|--------|---------|
| `DATABASE_URL` | Job 2 (`db-check`) — Prisma migrate |
| `DIRECT_URL` | Job 2 (`db-check`) — Prisma migrate |
| `VERCEL_TOKEN` | Job 3 (`deploy`) — `vercel --prod` |
| `VERCEL_ORG_ID` | Job 3 (`deploy`) |
| `VERCEL_PROJECT_ID` | Job 3 (`deploy`) |

Jobs 1 (`lint-typecheck-build`) uses hardcoded stub values — no secrets needed.

---

## 3. CI/CD Pipeline

File: `.github/workflows/ci.yml`

Triggered on: every push/PR to `main`.

```
push/PR to main
  │
  ├─ Job 1: lint-typecheck-build  (ubuntu-latest, Node 20, pnpm 9)
  │    Steps: checkout → pnpm install → prisma generate → lint → tsc --noEmit → build
  │    Uses stub env vars (no real secrets needed)
  │
  ├─ Job 2: db-check              (runs in parallel with Job 1)
  │    Steps: checkout → pnpm install → prisma generate → prisma validate → prisma migrate deploy → prisma migrate status
  │    Skipped gracefully if DIRECT_URL secret is not set or is a localhost URL
  │
  └─ Job 3: deploy                (runs only on push to main, after Jobs 1 & 2 pass)
       Steps: checkout → npm install -g vercel → vercel --prod --yes --token=$VERCEL_TOKEN
```

Vercel auto-deploys preview builds on every push (configured separately in the Vercel dashboard). The CI pipeline handles **production** deploys only when triggered by a push to `main`.

---

## 4. Running Database Migrations

### Production

```bash
# Uses DIRECT_URL (direct Postgres connection, not pgbouncer)
DIRECT_URL="postgresql://..." pnpm prisma migrate deploy
```

This runs in CI Job 2 automatically. To run manually:

```bash
export DIRECT_URL="<supabase-direct-url>"
pnpm prisma migrate deploy
pnpm prisma migrate status   # verify all migrations applied
```

### Local Development

```bash
# Assumes local Postgres or Docker
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sodak_dev" \
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/sodak_dev" \
pnpm prisma migrate dev
```

### Generating Prisma Client (required after schema changes)

```bash
pnpm prisma generate
```

This is also run in CI before linting/type-checking because TypeScript type-checks against the generated client.

---

## 5. Vercel Setup Steps

1. **Create project** in Vercel dashboard → import GitHub repo.
2. **Framework preset**: Next.js (auto-detected).
3. **Root directory**: leave as `/` (monorepo packages field is configured in `pnpm-workspace.yaml`).
4. **Build command**: `pnpm build` (or `next build` — Vercel detects pnpm automatically).
5. **Output directory**: `.next` (default).
6. **Set environment variables** (see Section 1). Set for `Production`, `Preview`, and `Development` environments as appropriate. Sensitive values should use the **Secret** type.
7. **Domains**: add `sodakedutech.in` and `www.sodakedutech.in`, configure DNS records as instructed by Vercel.
8. **Vercel Hobby tier limits**: 100 GB bandwidth/month, serverless function timeout 10 s. No changes required for current scope.

### Retrieving `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`

```bash
npx vercel link           # links local dir to Vercel project
cat .vercel/project.json  # contains orgId and projectId
```

---

## 6. Post-Deploy Checklist

After every production deployment, verify:

- [ ] `https://sodakedutech.in` returns HTTP 200 and renders the homepage
- [ ] `https://sodakedutech.in/api/v1/stacks` returns `{ data: [...] }` (smoke test DB connection)
- [ ] Admin login at `https://sodakedutech.in/admin` works with a valid `super_admin` account
- [ ] Submit a test enquiry via the contact form; confirm lead appears in `/admin/leads` and notification email arrives
- [ ] Publish a trainer; confirm ISR revalidation fires within 60 s and the trainer appears on `/trainers`
- [ ] Check Vercel Function Logs for any runtime errors

### First Deploy Only

- [ ] Run `pnpm prisma migrate deploy` against production DB (Job 2 handles this in CI, but verify `prisma migrate status` shows no pending migrations)
- [ ] Create the initial `super_admin` user directly via Prisma Studio or SQL:
  ```sql
  INSERT INTO users (id, email, "passwordHash", role, "isActive", "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), 'admin@sodakedutech.in', '<argon2id-hash>', 'super_admin', true, now(), now());
  ```
- [ ] Seed `site_settings` row (PK = 1) if not seeded by a migration
- [ ] Verify `redirects` table is populated (or empty if no legacy redirects needed)

---

## 7. Local Development Setup

```bash
# 1. Clone and install
git clone <repo>
cd sodakedutech
pnpm install

# 2. Copy and fill env
cp .env.example .env.local
# Fill DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, AWS_*, RESEND_*, UPSTASH_*, TURNSTILE_*

# 3. Generate Prisma client and migrate
pnpm prisma generate
pnpm prisma migrate dev

# 4. Start dev server
pnpm dev        # http://localhost:3000

# 5. (Optional) Prisma Studio — visual DB browser
pnpm prisma studio
```

For local Redis (used for cache + rate limiting in dev):

```bash
docker run -d -p 6379:6379 redis:7-alpine
# REDIS_URL=redis://localhost:6379 (default in lib/redis.ts)
```

---

## 8. Environments Summary

| Environment | Host | DB | Purpose |
|-------------|------|----|---------|
| `local` | `localhost:3000` | Local PostgreSQL / Docker | Development |
| `preview` | Vercel preview URL | Staging DB (configure separately) | PR review |
| `production` | `sodakedutech.in` | Supabase (pgbouncer pooler) | Live site |
