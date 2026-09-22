# SODAK Technology — CLAUDE.md

## Project Overview

Converting a static HTML wireframe (`C:/Users/DELL/Docs/wireframe/`) into a production-grade, CMS-driven multi-page web platform for SODAK Technology — a campus placement training company based in Chennai.

**Reference documents:**
- SRS: `C:/Users/DELL/Docs/sodakedutech/docs/02-SODAK-EduTech-SRS-v1.md`
- Wireframe: `C:/Users/DELL/Docs/wireframe/` (approved visual reference — deviations need explicit approval)

**Scope:** 35 public pages + 7 admin pages (with 10 more admin sections to build), REST API, Prisma/PostgreSQL, media pipeline, email notifications, lead management.

**Not in scope (deferred):** student login, course delivery, video hosting, online payments, Tamil localisation.

---

## Technology Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14+ (App Router, ISR) |
| Language | TypeScript — strict mode, zero `any` |
| ORM | Prisma 5 |
| DB | PostgreSQL via Supabase (pgbouncer pooler at runtime, direct for migrations) |
| Auth | NextAuth.js v5 — database sessions, Argon2id password hashing |
| Media | AWS S3 + optional CloudFront CDN + Sharp (server-side resize) |
| Email | Resend |
| Spam | Cloudflare Turnstile + honeypot field |
| Rate limiting | Upstash Redis |
| Styling | Tailwind CSS (tokens mapped from `style.css`) |
| Validation | Zod (schema-first, API + form layers) |
| Deployment | Vercel Hobby (free tier) |

---

## Project Directory Structure

```
src/
  app/
    (public)/           ← public-facing pages
    (admin)/            ← admin panel, separate layout + auth
    api/
      v1/               ← all REST endpoints
  modules/              ← ONE directory per domain
    trainers/
      trainers.service.ts
      trainers.schema.ts
      trainers.types.ts
    programs/
    institutions/
    gallery/
    blog/
    leads/
    careers/
    webinars/
    internships/
    stacks/
    settings/
  lib/                  ← shared infrastructure only
    db.ts               ← Prisma client singleton
    storage.ts          ← Cloudflare R2 wrapper
    email.ts            ← Resend wrapper
    auth.ts             ← NextAuth session helper
    slugify.ts
    paginate.ts
    image.ts            ← Sharp resize pipeline
  components/
    ui/                 ← shared primitive components (both public + admin)
    layout/             ← Navbar, Footer, FloatButtons
```

---

## Architecture Rules (Mandatory — Do Not Violate)

### 1. Module Isolation

Each domain module lives in `src/modules/[domain]/`. A service file may **only** import from:
1. Its own `types.ts` and `schema.ts`
2. `src/lib/db.ts`
3. `src/lib/storage.ts`
4. `src/lib/email.ts`
5. Node/npm utilities

**A service file must never import from another module's service.**

```typescript
// CORRECT — in api/trainers/[id]/route.ts
const trainer  = await trainersService.getById(id);
const colleges = await institutionsService.getByTrainerId(id);
const posts    = await blogService.getByAuthor(id);
return { trainer, colleges, posts };

// WRONG — inside trainers.service.ts
import { blogService } from '../blog/blog.service'; // forbidden
```

### 2. API Routes Are the Composition Layer

Only `/api/v1/[resource]/route.ts` files may call across modules. They assemble results from multiple services and return a combined response.

### 3. Event-Driven Side Effects

Cross-module side effects (e.g., "publish trainer → send email") use a thin event emitter, not direct service-to-service calls.

```typescript
// trainers.service.ts
emit('trainer.published', { trainerId: id });

// notifications/handlers.ts (subscribes independently)
on('trainer.published', async ({ trainerId }) => { ... });
```

### 4. Frontend Module Boundary

Each Next.js page under `app/(public)/[domain]/` fetches data only from its own domain's API endpoint. Pages do not share React state with each other.

### 5. Admin Panel Isolation

`app/(admin)/` has its own layout, auth middleware, and API calls. It shares only `src/components/ui/` with the public site.

---

## API Conventions

Base path: `/api/v1/`

| Method | Pattern | Auth |
|---|---|---|
| `GET /api/v1/[resource]` | list + pagination + filters | public |
| `GET /api/v1/[resource]/[id]` | single record | public |
| `POST /api/v1/[resource]` | create | admin only |
| `PATCH /api/v1/[resource]/[id]` | partial update | admin only |
| `DELETE /api/v1/[resource]/[id]` | soft delete | admin only |
| `POST /api/v1/[resource]/[id]/publish` | publish | editor+ |
| `POST /api/v1/[resource]/[id]/unpublish` | unpublish | editor+ |

**Response envelope:**
```json
// list
{ "data": [...], "pagination": { "total": 48, "page": 1, "perPage": 20, "pages": 3 } }
// single
{ "data": { ... } }
// error
{ "error": { "code": "NOT_FOUND", "message": "Trainer not found" } }
```

---

## User Roles (RBAC)

| Role | Permissions |
|---|---|
| `super_admin` | All CRUD, user management, settings, audit log, delete |
| `editor` | Create/edit/publish content and media; no user management |
| `contributor` | Edit own trainer/mentor profile; submit blog drafts; no publish |
| `sales` | Read/update leads and pipeline status; no content access |
| `visitor` | Read published pages; submit forms |

RBAC is enforced at API middleware level. UI hiding alone is insufficient. Admin middleware rejects unauthenticated requests with HTTP 401 before any DB query runs.

---

## Consent Gates (Enforced at Service Layer)

- `trainers.consent_on_file = false` → blocks `is_published = true`
- `institutions.logo_permission = false` → never render logo (render text name instead)
- `photos.has_student_faces = true` → requires `student_consent_ref` before publishing
- `photos.alt_text = null` → blocks publishing

These are hard constraints enforced in service code, not just UI toggles.

---

## Design System (from wireframe `style.css`)

### Colour Tokens
```css
--navy-950: #0a0f1e    /* page background, footer */
--navy-900: #0f1729
--navy-800: #1a2342
--gold-500: #c8a035    /* primary CTA, admin accent */
--gold-400: #d4b04a
--slate-50:  #ffffff
--slate-100: #f1f5f9
--slate-400: #94a3b8   /* muted text */
--slate-800: #1e293b   /* body text */
--green:  #22c55e
--amber:  #eab308
--red:    #ef4444
--blue:   #3b82f6
```

### Key UI Patterns
- **Glass cards:** `background: rgba(255,255,255,0.72); backdrop-filter: blur(20px); border: 1px solid rgba(7,88,146,0.18)`
- **Dark hero sections:** `linear-gradient(160deg, #0a1628, #0c2040)`
- **Card border-radius:** 16px (cards), 8px (buttons), 10px (admin tables)
- **Nav height:** 64px, sticky, white background
- **Hamburger breakpoint:** ≤960px
- **Typography:** Open Sans (body), Instrument Sans (headings) — served as local `@font-face`, no CDN dependency
- **Float buttons:** WhatsApp + Call, always visible
- **Stat counters:** `data-countup` + `data-suffix` attributes, Intersection Observer trigger
- **Company marquee:** CSS-only animation, no JS, items duplicated for seamless loop

### Admin Panel UI Patterns
- Left sidebar: 220px wide, `--navy-950` background, gold (`#c8a035`) left-border + background tint on active item
- `admin-table`: white bg, `#f1f5f9` header row, `border-collapse`, 10px radius, row hover `#f8fafc`
- `stat-card-admin`: white card, 32px bold number, 12px uppercase label
- `upload-area`: 2px dashed `#cbd5e1` border, hover turns gold

---

## Public Pages (35 total)

| Route | Wireframe file |
|---|---|
| `/` | `index.html` |
| `/about` | `about.html` |
| `/trainers` | `trainers.html` |
| `/trainers/[slug]` | `trainer-profile.html` |
| `/mentors` | `mentors.html` |
| `/mentors/[slug]` | `mentor-profile.html` |
| `/courses` | `courses.html` |
| `/programs` | `programs.html` |
| `/programs/[slug]` | `program-detail.html` |
| `/training` | `training.html` |
| `/training/[slug]` | `training-cloud.html` |
| `/institutions` | `institutions.html` |
| `/institutions/[slug]` | `institution-detail.html` |
| `/gallery` | `gallery.html` |
| `/platform` | `platform.html` |
| `/platform/ctf` | `platform-ctf.html` |
| `/platform/lms` | `platform-lms.html` |
| `/platform/assessments` | `platform-assessments.html` |
| `/webinars` | `webinars.html` |
| `/internships` | `internships.html` |
| `/corporate` | `corporate.html` |
| `/insights` | `insights.html` |
| `/insights/[slug]` | `insights-post.html` |
| `/careers` | `careers.html` |
| `/careers/[slug]` | `career-detail.html` |
| `/contact` | `contact.html` |
| `/privacy` | `privacy.html` |
| `/terms` | `terms.html` |

---

## Admin Pages

**Wireframe exists:**

| Route | Wireframe file |
|---|---|
| `/admin` | `admin/dashboard.html` |
| `/admin/trainers` | `admin/trainers.html` |
| `/admin/mentors` | `admin/mentors.html` |
| `/admin/courses` | `admin/courses.html` |
| `/admin/enquiries` | `admin/enquiries.html` |
| `/admin/leads` | `admin/leads.html` |
| `/admin/media` | `admin/media.html` |

**To be designed + built (consistent with admin style):**

`/admin/programs`, `/admin/institutions`, `/admin/gallery`, `/admin/webinars`, `/admin/internships`, `/admin/blog`, `/admin/careers`, `/admin/settings`, `/admin/users`, `/admin/audit-log`

---

## Key Functional Details

- **ISR revalidation:** ≤60s for trainers/programs/institutions after admin save
- **Enquiry form spam protection:** Cloudflare Turnstile + honeypot field `website_url` + rate limit 5/IP/hour via Upstash
- **UTM tracking:** `utm_source`, `utm_medium`, `utm_campaign`, `document.referrer` stored in `lead_meta` JSONB on every submission
- **Blog workflow:** `draft → in_review` (contributor) → `published` (editor only); contributor cannot self-publish
- **Soft delete:** `deleted_at` timestamp; hard-delete cron after 30 days
- **Audit log:** every create/update/delete/publish/unpublish writes to `audit_log` table
- **Image pipeline (Sharp):** `original`, `lg` 1200px, `md` 800px, `sm` 400px, `thumb` 200px — all WebP; AVIF for lg and md
- **Bulk photo upload:** up to 20 images per request, progress via Server-Sent Events
- **Gallery lightbox:** vanilla JS, keyboard nav (←/→/Esc), swipe on mobile
- **FAQ accordion:** `<button>` with `aria-expanded` + `aria-controls`, `.faq-item.open` class toggle
- **Brochure download:** signed R2 URL via `GET /api/v1/programs/[id]/brochure`
- **Related posts:** 3 posts sharing the most tags, computed at publish time, stored in `post_related` join table
- **Redirects:** DB table `redirects`, exported to `next.config.js` at build time; handles `/#trainers → /trainers` style migrations

---

## Non-Functional Targets

- Lighthouse mobile ≥ 90 (all four categories) on Home, Trainers, Programs
- LCP < 2.5s on simulated 4G
- Hero image ≤ 200 KB WebP served via CDN
- First JS bundle < 100 KB gzip
- All public pages statically generated or ISR-cached (DB never in critical path for public requests)
- WCAG 2.1 Level AA throughout
- HTTPS + HSTS (`max-age=31536000; includeSubDomains`)
- CSP: `default-src 'self'` + known CDNs allowlisted
- All DB queries via Prisma parameterised — no raw string interpolation
- Sensitive env vars in Vercel environment variables — never committed to repo

---

## Infrastructure (Free Tiers Only — ₹0 Recurring)

| Service | Limit |
|---|---|
| Vercel Hobby | 100 GB bandwidth/mo |
| Supabase Free | 500 MB DB, 1 GB file storage, 50,000 MAU |
| AWS S3 (Free Tier yr 1) | 5 GB storage, 20,000 GET, 2,000 PUT/mo |
| AWS CloudFront (optional) | 1 TB data transfer/mo free tier |
| Resend | 3,000 emails/mo |
| Upstash Redis | 10,000 req/day (rate limiting + SSE progress) |

**DB connection strings (Supabase pgbouncer):**
- `DATABASE_URL` → pooler on port `6543` (transaction mode) — used at runtime
- `DIRECT_URL` → direct on port `5432` — used by `prisma migrate deploy` only

---

## Environments

| Env | Host | DB |
|---|---|---|
| `local` | `localhost:3000` | Local PostgreSQL or Docker |
| `preview` | Vercel preview URL | Neon dev branch |
| `production` | `sodakedutech.in` | Neon main branch |

CI/CD: GitHub Actions (lint → type-check → test → build on every PR) → Vercel auto-deploy on `main`. Prisma migrations run as a deploy step (`prisma migrate deploy`).

---

## Acceptance Criteria (Key Gates)

- Editor publishes trainer → live on `/trainers/[slug]` within 2 min, no deploy
- `consent_on_file = false` → API `PATCH is_published: true` returns 422
- Photo published without `alt_text` → API returns 422
- Enquiry from mobile → in admin inbox + notification email within 60s
- All old `/#anchor` routes return HTTP 301 to clean URLs
- RBAC: sales session → 403 on trainer CRUD endpoints
- Bulk upload of 20 photos completes with SSE progress feedback
- FAQ cards on mentors page: click `.faq-header` → `.faq-item.open` class added
- Audit log records every publish action with actor + timestamp

