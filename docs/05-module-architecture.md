# Module Architecture — SODAK Technology

---

## 1. Directory Layout

```
src/
  app/
    (public)/       ← ISR/SSG public pages
    (admin)/        ← Admin panel, isolated layout + auth middleware
    api/
      v1/           ← All REST endpoints; sole cross-module composition point
  modules/          ← One directory per domain
    trainers/       trainers.service.ts  trainers.schema.ts  trainers.types.ts
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
  lib/              ← Shared infrastructure only
    db.ts           Prisma singleton
    auth.ts         NextAuth + RBAC helpers
    cache.ts        Redis cache primitives
    redis.ts        KV abstraction (Upstash in prod, ioredis in dev)
    storage.ts      AWS S3 wrapper
    email.ts        Resend wrapper
    image.ts        Sharp pipeline
    events.ts       In-process event emitter
    notification-handlers.ts  Side-effect subscriptions
    audit.ts        writeAuditLog helper
    rate-limit.ts   Upstash rate limiter
    upload-progress.ts  SSE progress tracking
    paginate.ts     parsePagination / buildMeta
    slugify.ts
  components/
    ui/             Shared primitives (public + admin)
    layout/         Navbar, Footer, FloatButtons
```

---

## 2. Module Isolation Rule

**A service file may only import from:**
1. Its own `types.ts` and `schema.ts`
2. `src/lib/*`
3. Node/npm packages

**A service file must never import another module's service.**

```typescript
// CORRECT — in api/v1/trainers/[id]/route.ts (API route is the composition layer)
const trainer  = await trainersService.getById(id)
const colleges = await institutionsService.getByTrainerId(id)

// WRONG — inside trainers.service.ts
import { blogService } from '../blog/blog.service'   // forbidden
```

Each `*.service.ts` file carries a comment at line 1 reiterating this constraint.

---

## 3. API Routes as the Composition Layer

Only files under `src/app/api/v1/` may call across modules. They:

1. Authenticate the session
2. Validate input with Zod
3. Call one or more service functions
4. Combine results and return the response envelope
5. Call `writeAuditLog` for mutations

No business logic lives in route files — all DB access is delegated to services.

---

## 4. Event-Driven Side Effects

Cross-module side effects use a thin in-process event emitter (`src/lib/events.ts`).

```typescript
// trainers.service.ts — emits after successful publish
emit('trainer.published', { trainerId: id })

// src/lib/notification-handlers.ts — subscribes
on('trainer.published', async ({ trainerId }) => {
  // 1. Log trainer profile live notification
  // 2. Trigger ISR revalidation of /trainers via internal fetch
})
```

**Serverless constraint:** The `listeners` Map lives in Node module memory. It resets on each cold start and is not shared across Vercel lambda instances. To ensure handlers are registered before `emit()` fires, routes that emit an event import `notification-handlers.ts` as a side-effect at the top of the file:

```typescript
import '@/lib/notification-handlers'   // registers all handlers
```

This is reliable for warm-path execution. For strict delivery guarantees, migrate to Upstash QStash.

**Current events**

| Event | Emitter | Handler effect |
|-------|---------|----------------|
| `trainer.published` | `trainers.service.ts` | Log + trigger ISR revalidation for `/trainers` |

---

## 5. Redis Cache

Implementation: `src/lib/cache.ts` wraps `src/lib/redis.ts`.

- **Production**: Upstash Redis REST (`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`)
- **Development**: Local `ioredis` at `redis://localhost:6379`

**Cache is used only for admin-path and API queries; public ISR pages rely on Next.js CDN caching.**

### TTLs

| Constant | Value | Used for |
|----------|-------|----------|
| `LIST_TTL` | 120 s | List query results |
| `RECORD_TTL` | 300 s | Single-record lookups by ID or slug |

### Key Convention

| Pattern | Example | Description |
|---------|---------|-------------|
| `{module}:list:v{n}:{params}` | `trainers:list:v4:p1:pp20:...` | List result for given filter combination |
| `{module}:id:{id}` | `trainers:id:cld123` | Single record by ID |
| `{module}:slug:{slug}` | `trainers:slug:rajan-kumar` | Single record by slug |
| `{module}:v` | `trainers:v` | Integer version counter (no TTL) |

### Version-Key Invalidation

`SCAN` / `KEYS` are not available on Upstash free tier. Instead, each module maintains a version counter. On any mutation (create / update / delete / publish):

1. `cacheInvalidateLists(versionKey)` — atomically increments the counter via `INCR`.
2. Old list keys contain the old version number, so they are never matched again. They expire naturally via `LIST_TTL`.
3. Specific record keys (`id:` / `slug:`) are deleted explicitly with `cacheDel`.

### Modules with Caching

| Module | List cache | Record cache | Version key |
|--------|-----------|--------------|-------------|
| `trainers` | Yes | Yes (by id + slug) | `trainers:v` |

Other modules do not yet cache — they query Prisma directly. Add cache using the same pattern when needed.

### Upload Progress

`upload:progress:{jobId}` — set by the bulk upload worker, read by the SSE endpoint (`/api/v1/photos/upload-progress`). TTL: 120 s. Payload: `{ done: number, total: number, errors: string[] }`.

---

## 6. RBAC — Roles and Permissions

Defined in `src/lib/auth.ts`.

```typescript
export const ROLES = {
  super_admin: ['super_admin'],
  editor:      ['super_admin', 'editor'],
  contributor: ['super_admin', 'editor', 'contributor'],
  sales:       ['super_admin', 'sales'],
}
```

`hasRole(session, required)` returns `true` if the session user's role is in `ROLES[required]`.

**Permission matrix**

| Action | visitor | sales | contributor | editor | super_admin |
|--------|---------|-------|-------------|--------|-------------|
| Read published public content | ✓ | ✓ | ✓ | ✓ | ✓ |
| Submit public forms | ✓ | ✓ | ✓ | ✓ | ✓ |
| Read leads, update lead status, add notes | — | ✓ | — | — | ✓ |
| Export leads CSV | — | ✓ | — | — | ✓ |
| Create blog draft | — | — | ✓ | ✓ | ✓ |
| Edit own blog post / trainer profile | — | — | ✓ | ✓ | ✓ |
| Submit blog post for review | — | — | ✓ | ✓ | ✓ |
| Upload media / photos | — | — | ✓ | ✓ | ✓ |
| Create/update all content | — | — | — | ✓ | ✓ |
| Publish/unpublish all content | — | — | — | ✓ | ✓ |
| Delete content (soft) | — | — | — | ✓ | ✓ |
| Bulk photo delete | — | — | — | — | ✓ |
| Hard-delete trainers | — | — | — | — | ✓ |
| Manage users (`/api/v1/users/[id]`) | — | — | — | — | ✓ |
| Manage site settings | — | — | — | — | ✓ |
| Manage redirects | — | — | — | — | ✓ |
| View audit log | — | — | — | — | ✓ |

**Enforcement layers:**
1. **Middleware** (`src/app/(admin)/layout.tsx` or `middleware.ts`) — rejects unauthenticated requests with HTTP 401 before DB queries run.
2. **API route** — calls `hasRole(session, required)` and returns 403 for insufficient role.
3. **Service layer** — consent gates (`ConsentError`, `AltTextError`) enforced at DB write time regardless of caller.

UI hiding alone is never sufficient.

---

## 7. Image Processing Pipeline

Implemented in `src/lib/image.ts` using Sharp.

On image upload via `POST /api/v1/media`, `processAndUploadImage(buffer, name)` produces:

| Variant | Format | Max width |
|---------|--------|-----------|
| `original` | source format | unchanged |
| `lg` | WebP (q82) | 1200 px |
| `md` | WebP (q82) | 800 px |
| `sm` | WebP (q82) | 400 px |
| `thumb` | WebP (q82) | 200 px |
| `lg_avif` | AVIF (q60) | 1200 px |
| `md_avif` | AVIF (q60) | 800 px |

`withoutEnlargement: true` — images smaller than a variant's width are not upscaled.

All variants are stored at `images/{uuid}/{variant}.{ext}` in S3. The `MediaFile.variants` JSON column maps variant names to public URLs.

---

## 8. Email Templates

Defined inline in `src/lib/email.ts` using Resend. Templates use a shared dark-themed HTML layout.

| Template key | Subject | Trigger |
|-------------|---------|---------|
| `lead-notification` | New enquiry received | `POST /api/v1/forms/enquiry` → admin |
| `lead-acknowledgement` | Thanks for reaching out | `POST /api/v1/forms/enquiry` → submitter |
| `trainer-live` | Your profile is now live | `trainer.published` event (future) |
| `password-reset` | Reset your password | (future) |
| `webinar-acknowledgement` | You're registered | `POST /api/v1/forms/webinar` → registrant |
| `internship-acknowledgement` | Application received | `POST /api/v1/forms/internship` → applicant |
| `brochure-download` | Your program brochure | `POST /api/v1/programs/[id]/brochure` → requester |

All template data is HTML-escaped via the internal `h()` helper before rendering.
