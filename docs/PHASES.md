# SODAK Technology — Development Phases

> **Engineering lead reference.** Each phase has a clear entry condition, a bounded deliverable set, an exit gate, and an explicit dependency on the phase before it. No phase begins until the exit gate of the previous phase passes.

---

## Phase Map

```
Phase 0 ──► Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4
BOILERPLATE  DB & AUTH   ADMIN CMS   PUBLIC       PUBLIC
  ✅ DONE               (core)     (high-traffic) (secondary)

                              │
                              ▼
                         Phase 5 ──► Phase 6 ──► Phase 7 ──► Phase 8
                         FORMS &     ADMIN CMS   INTEGRA-    QUALITY
                         INTERACT.   (full)      TIONS       GATES
                              │
                              ▼
                         Phase 9 ──► Phase 10
                         LAUNCH      POST-LAUNCH
                         PREP        & ITERATE
```

---

## Phase 0 — Boilerplate & Architecture ✅ COMPLETE

**Goal:** Establish the full codebase skeleton so every subsequent phase writes *into* a consistent structure with no rewrites.

### Deliverables

| Area | Status |
|---|---|
| `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts` | ✅ |
| Prisma schema (24 models, 6 enums, Supabase two-URL config) | ✅ |
| Lib layer: `db`, `auth`, `storage` (AWS S3), `email`, `audit`, `image`, `events`, `rate-limit`, `paginate`, `slugify` | ✅ |
| 11 domain modules — `service.ts` + `schema.ts` + `types.ts` each | ✅ |
| UI components: Button, Badge, Card, Avatar, Input, Select, Textarea, Accordion, Pagination, Breadcrumb, StatCounter, FilterBar | ✅ |
| Layout: Navbar, Footer, FloatButtons | ✅ |
| 28 public page stubs with `generateMetadata()` + service data wiring | ✅ |
| 18 admin page stubs + login page | ✅ |
| Full REST API: 40+ route files covering all CRUD + publish/unpublish + forms + bulk + SSE + export | ✅ |
| RBAC (`hasRole`), consent gates, soft-delete, audit log patterns | ✅ |
| All 10 code-review bugs resolved (RBAC fix, S3 migration, Supabase setup, consent bypass, SSE Redis, etc.) | ✅ |

### Exit Gate
- `npx tsc --noEmit` passes with zero errors
- `next build` completes without warnings on missing exports

---

## Phase 1 — Database, Auth & Seed

**Entry condition:** Phase 0 exit gate passed.

**Goal:** Live, queryable database with real tables and a working admin login. Everything else is blocked until this works.

### Deliverables

#### 1.1 Supabase Project Setup
- Create Supabase project (region: `ap-south-1`)
- Copy `DATABASE_URL` (pooler, port 6543) and `DIRECT_URL` (direct, port 5432) into `.env.local`
- Verify Prisma can connect: `npx prisma db pull` returns no errors

#### 1.2 Migrations
- Run `npx prisma migrate dev --name init` — generates SQL from schema
- Verify all 24 tables created in Supabase dashboard
- Commit migration file to `prisma/migrations/`

#### 1.3 Seed Data
Create `prisma/seed.ts`:
- 1 `super_admin` user (`admin@sodakedutech.in`, hashed password via Argon2id)
- 6 `Stack` records matching wireframe (Cloud, Cybersecurity, Data, DevOps, Web, Networking)
- Default `Settings` row (site name, contact info, social links)
- 2–3 sample `Trainer` records (for smoke-testing the public pages)
- 1 sample `Program` per track code (A–E)

Run: `npx prisma db seed`

#### 1.4 Admin Login
- `/admin/login` page: credentials form → `signIn('credentials')` → redirect `/admin`
- Session persists (NextAuth database strategy — `Session` + `Account` tables in use)
- `/admin` dashboard loads with `auth()` returning the seeded user
- Logout button in admin sidebar calls `signOut()`

#### 1.5 AWS S3 Bucket
- Create S3 bucket (`sodakedutech-media`, region `ap-south-1`)
- IAM user with `AmazonS3FullAccess` on that bucket only
- Copy `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `AWS_REGION` into `.env.local`
- Smoke test: `uploadFile('test/ping.txt', Buffer.from('ok'), 'text/plain')` returns a URL

### Exit Gate
- `POST /api/v1/forms/enquiry` returns `{ data: { ok: true } }` (end-to-end DB write)
- `GET /api/v1/trainers` returns seeded trainers JSON
- `/admin/login` → valid credentials → lands on `/admin` dashboard
- S3 upload smoke test passes

---

## Phase 2 — Admin CMS (Core Content)

**Entry condition:** Phase 1 exit gate passed.

**Goal:** Editors can create, edit, and publish the three highest-priority content types — Trainers, Programs, Institutions — from the admin panel. These power the most traffic-critical public pages.

### Deliverables

#### 2.1 Trainers Admin (implement `/admin/trainers`)
Reference: `admin/trainers.html`

- **List view:** `admin-table` with columns Name, Company, Stacks, Status (published/draft), Consent, Actions
- **Filter bar:** search by name, filter by stack, filter by status
- **New/Edit form** (`/admin/trainers/new`, `/admin/trainers/[id]`):
  - Fields: Name, Designation, Current Company, Bio (rich-text or textarea), Photo upload (triggers Sharp pipeline → S3), Expertise tags (comma-separated or tag input), Stack assignment (multi-select), LinkedIn URL, GitHub URL, `isMentor` toggle, `isFeatured` toggle
  - Consent checkbox: `consentOnFile` — required before publish button activates
  - Publish / Unpublish button (calls `/api/v1/trainers/[id]/publish`)
  - Soft delete (calls `DELETE /api/v1/trainers/[id]`)
- Photo upload: `POST /api/v1/media` → Sharp generates 5 variants → stores in S3 → `photoUrl` saved on trainer

#### 2.2 Programs Admin (implement `/admin/programs`)

- List view + filter by track code
- New/Edit form: Title, Track code (A–E), Summary, Duration (weeks), Outcomes (textarea), Syllabus modules (JSON or repeater), Brochure PDF upload (S3), Stack assignment
- Publish / Unpublish

#### 2.3 Institutions Admin (implement `/admin/institutions`)

- List view + filter by type (Engineering College / University / Polytechnic / Others)
- New/Edit form: Name, Type, City, State, Logo upload, `logoPermission` checkbox (required if logo uploaded), Website URL, Short Description, `showOnHome` toggle
- Publish / Unpublish (service enforces `logoPermission` gate)

#### 2.4 Media Library (implement `/admin/media`)
Reference: `admin/media.html`

- Grid of uploaded files (image thumbnails + PDF icon)
- Upload area (`upload-area` pattern from design system) — drag & drop or click
- Delete (soft delete via `DELETE /api/v1/media/[id]`)
- Copy URL to clipboard

#### 2.5 Gallery Admin (implement `/admin/gallery`)

- Grid view with bulk select
- Bulk upload (up to 20 images) with SSE progress bar (Upstash Redis)
- Per-photo metadata form: Alt text (required), Caption, Institution assignment, Student faces toggle + consent ref
- Bulk publish / unpublish (consent-gated per-row)

### Exit Gate
- Super admin can create a trainer with photo, assign stacks, tick consent, and publish
- Published trainer appears in `GET /api/v1/trainers?published=true`
- Photo variants (lg/md/sm/thumb) visible in S3 bucket
- `consent_on_file = false` → publish API returns 422
- `alt_text = null` → gallery publish API returns 422
- Bulk photo upload SSE streams progress to browser

---

## Phase 3 — Public Pages (High-Traffic Core)

**Entry condition:** Phase 2 exit gate passed (real data available to render).

**Goal:** The five pages that account for ~80% of organic traffic are pixel-accurate to the wireframe and server-side rendered with real data.

### Pages to Implement

| Page | Wireframe | Priority |
|---|---|---|
| `/` — Home | `index.html` | P0 |
| `/trainers` — Listing | `trainers.html` | P0 |
| `/trainers/[slug]` — Profile | `trainer-profile.html` | P0 |
| `/programs` — Listing | `programs.html` | P1 |
| `/programs/[slug]` — Detail | `program-detail.html` | P1 |
| `/institutions` — Listing | `institutions.html` | P1 |
| `/institutions/[slug]` — Detail | `institution-detail.html` | P1 |

### Per-Page Implementation Checklist

**Home (`/`)**
- Hero section: headline, subheadline, two CTAs, background gradient (`#0a1628 → #0c2040`)
- Stats bar: 4 counters (`data-countup`, IntersectionObserver trigger from `StatCounter` component)
- Company logo marquee (CSS-only, items duplicated for seamless loop)
- Featured trainers grid (max 8, `isFeatured = true`)
- Training stacks section (6 stack cards)
- Institutions strip (`showOnHome = true`)
- Gallery preview (3 photos)
- Blog preview (3 latest posts)
- CTA banner ("Book a Program")

**Trainers Listing (`/trainers`)**
- `FilterBar`: stack filter, company filter, search — all URL-serialised via `useSearchParams`
- Trainer cards: photo (img srcset for WebP variants), name, designation, company, stack badges
- Pagination (URL-based)
- Trust bar: company logos

**Trainer Profile (`/trainers/[slug]`)**
- Bio section, expertise tag cloud, stack badges
- Institutions trained (via `getByTrainerId`, with engagement dates)
- Authored blog posts (via `getByAuthor`)
- Breadcrumb

**Programs (`/programs`, `/programs/[slug]`)**
- Track filter tabs (A / B / C / D / E)
- Program cards with duration and outcomes preview
- Detail: syllabus accordion (aria-expanded), duration, outcomes, Brochure download CTA (opens modal with lead-capture form)

**Institutions (`/institutions`, `/institutions/[slug]`)**
- Type filter, state filter
- Institution cards with logo (only if `logoPermission = true`) or text fallback
- Detail: engagement history, gallery photos

### Shared Implementation Notes
- All pages use ISR with `export const revalidate = 60`
- All images use `next/image` with `sizes` prop and WebP srcset
- Server components — no `'use client'` unless strictly necessary (FilterBar, Accordion)
- Open Graph metadata via `generateMetadata()` on every dynamic page

### Exit Gate
- All 7 pages render with real seeded data at `localhost:3000`
- Lighthouse mobile score ≥ 85 on Home (target 90 by Phase 8)
- No broken image references (all S3 URLs resolve)
- Filter and pagination work end-to-end on Trainers page
- ISR: update a trainer in admin → `/trainers` reflects the change within 60 s (no deploy)

---

## Phase 4 — Public Pages (Secondary)

**Entry condition:** Phase 3 exit gate passed.

**Goal:** All remaining public pages implemented. Site is complete for public visitors.

### Pages to Implement

| Page | Wireframe |
|---|---|
| `/about` | `about.html` |
| `/mentors` + `/mentors/[slug]` | `mentors.html`, `mentor-profile.html` |
| `/courses` | `courses.html` |
| `/training` + `/training/[slug]` | `training.html`, `training-cloud.html` |
| `/gallery` | `gallery.html` (lightbox) |
| `/platform`, `/platform/ctf`, `/platform/lms`, `/platform/assessments` | `platform*.html` |
| `/webinars` | `webinars.html` |
| `/internships` | `internships.html` |
| `/corporate` | `corporate.html` |
| `/insights` + `/insights/[slug]` | `insights.html`, `insights-post.html` |
| `/careers` + `/careers/[slug]` | `careers.html`, `career-detail.html` |
| `/privacy`, `/terms` | Static long-form |

### Key Implementation Notes

**Gallery (`/gallery`)**
- Masonry or uniform grid (match wireframe)
- Lightbox: vanilla JS (no library), keyboard nav ← / → / Esc, swipe on mobile (touch events)
- Filter: institution dropdown + year select (URL-serialised)

**Insights (`/insights/[slug]`)**
- `bodyHtml` rendered via `dangerouslySetInnerHTML` (content is admin-authored, trusted source)
- Related posts: 3 posts from `post_related` join table
- Table of contents (optional, from `<h2>` / `<h3>` headings)
- OG image populated from `ogImageUrl` field

**Mentors (`/mentors`)**
- FAQ accordion: `<button aria-expanded aria-controls>`, toggle `.faq-item.open` class on click
- Booking interest form (leads to enquiry CTA)

### Exit Gate
- All 21 pages render without errors
- Gallery lightbox: keyboard nav and swipe confirmed in Chrome DevTools mobile emulation
- FAQ accordion: `.faq-item.open` class toggled on click (CLAUDE.md acceptance criterion)
- `sitemap.xml` auto-generated (all public routes)

---

## Phase 5 — Forms & Interactive Flows

**Entry condition:** Phase 4 exit gate passed.

**Goal:** Every user-facing form is live with spam protection, rate limiting, validation feedback, and email confirmation. These are the lead-capture touchpoints.

### Deliverables

#### 5.1 Enquiry / Contact Form (`/contact`)
Reference: `contact.html`

- Fields: Name, Email, Phone, Institution, Message, Program interest (dropdown)
- Honeypot field `website_url` (hidden, `tabIndex=-1`, `aria-hidden`)
- Cloudflare Turnstile widget (client-side render, verify token server-side)
- Zod validation — inline error messages on blur
- Rate limit: 5/IP/hour (Upstash) → friendly "Try again later" message
- On success: `createLead()` → notification email to team + acknowledgement to visitor
- UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `document.referrer`) captured client-side and sent with form payload

#### 5.2 Brochure Download (on `/programs/[slug]`)
- Inline CTA button: "Download Brochure"
- Opens a modal with: Name, Email, Institution (optional)
- On submit: `POST /api/v1/programs/[id]/brochure` → creates lead → returns signed S3 URL → auto-download
- Rate limited, honeypot protected

#### 5.3 Webinar Registration (on `/webinars`)
- Register button on each webinar card → modal
- Fields: Name, Email, Phone
- `POST /api/v1/forms/webinar` → `WebinarRegistration` created → acknowledgement email

#### 5.4 Internship Application (on `/internships/[slug]`)
- Apply Now button → `/careers/[slug]` style page or modal
- Fields: Name, Email, Phone, College, CGPA
- `POST /api/v1/forms/internship` → `InternshipApplication` created → acknowledgement email

#### 5.5 Job Application (on `/careers/[slug]`)
- Apply button → modal with Name, Email, Phone, Resume upload (PDF → S3), Cover letter (optional URL)
- `POST /api/v1/forms/careers` → `JobApplication` created

### Exit Gate
- Enquiry from mobile (Chrome DevTools, throttled 4G) → appears in `GET /api/v1/leads` within 5 s
- Notification email received by `NOTIFICATION_EMAIL` within 60 s
- Turnstile token verified server-side (disable JS → form submission blocked)
- Honeypot: submitting with `website_url` filled → HTTP 200 but no DB write (silent accept)
- Rate limit: 6th submission from same IP within an hour → HTTP 429
- UTM params stored in lead `meta` JSON field

---

## Phase 6 — Admin CMS (Full)

**Entry condition:** Phase 5 exit gate passed.

**Goal:** Every content domain is manageable from the admin panel. No content type requires direct DB access.

### Deliverables

#### 6.1 Blog / Insights Admin (`/admin/blog`)
Reference: `admin/blog.html` (to be designed per admin style guide)

- List: columns Title, Author, Status (draft/in_review/published), Published date, Actions
- New/Edit form: Title, Body (rich-text editor — use `<textarea>` in Phase 6, upgrade to Tiptap/Prosemirror later), Excerpt, Cover image, Tags, Meta title, Meta description, OG image, Author assignment
- Workflow buttons: **Save Draft** → **Submit for Review** (sets `in_review`, only contributor) → **Publish** (editor only, sets `published`, `publishedAt`)
- Unpublish button (editor)
- Related posts: select up to 3 posts (stored in `post_related`)

#### 6.2 Leads CRM (`/admin/leads`)
Reference: `admin/leads.html`

- Table with columns: Name, Email, Phone, Institution, Source, Status (pipeline stage), Created
- Row click → drawer/detail view: full lead data + notes timeline
- Status updater (drag or dropdown): `new → contacted → qualified → proposal → won / lost`
- Add note (text area → `POST /api/v1/leads/[id]/notes`)
- CSV export button (`GET /api/v1/leads/export?from=&to=`)
- Filter by status, source, date range

#### 6.3 Webinars Admin (`/admin/webinars`)
- List + create/edit form: Title, Presenter (trainer picker), Scheduled date/time, Description, Meeting link, Cover image, capacity
- Publish / Unpublish
- Registrations count badge

#### 6.4 Internships Admin (`/admin/internships`)
- List + create/edit: Company name, Role title, Stack tags, Duration, Stipend, Application deadline, Description
- Publish / Unpublish

#### 6.5 Careers Admin (`/admin/careers`)
- List + create/edit: Job title, Department, Employment type, Location (remote/onsite), Experience, JD
- Applications tab per job: list of applicants, status update, resume download (signed S3 URL)

#### 6.6 Enquiries Admin (`/admin/enquiries`)
Reference: `admin/enquiries.html`

- Same table as Leads but filtered to `source = enquiry_form`
- Quick-reply button (opens email draft modal → sends via Resend)

#### 6.7 Settings Admin (`/admin/settings`)
- Form: Site name, Tagline, Phone, WhatsApp number, Email, Address, Social links (LinkedIn, YouTube, Instagram, Twitter)
- `PATCH /api/v1/settings` → updates DB → ISR revalidation for footer/navbar data

#### 6.8 Users Admin (`/admin/users`)
- List: Name, Email, Role, Active, Created
- Invite user (email + role assignment) — creates hashed placeholder password + sends password reset email
- Deactivate / reactivate toggle
- Role change dropdown (super_admin only)

#### 6.9 Audit Log (`/admin/audit-log`)
- Table: Actor, Action, Entity type, Entity ID, Timestamp
- Filter by entity type, actor, date range
- Paginated, read-only

### Exit Gate
- Full blog publish cycle: contributor creates draft → submits for review → editor publishes → live on `/insights/[slug]`
- Contributor cannot self-publish (Submit for Review button visible; Publish button absent)
- Lead status update via pipeline drag → `PATCH /api/v1/leads/[id]/status` → reflected in table
- CSV export downloads a valid `.csv` with correct headers
- Audit log shows `PUBLISH` action with actor + timestamp after trainer publish

---

## Phase 7 — Integrations & Infrastructure

**Entry condition:** Phase 6 exit gate passed.

**Goal:** All cross-cutting infrastructure features are production-grade — not scaffolded, but fully wired.

### Deliverables

#### 7.1 Email Templates (Resend)
All 7 templates in `src/lib/email.ts` have complete, styled HTML:
- `lead-notification` — internal team alert
- `lead-acknowledgement` — visitor confirmation
- `trainer-live` — trainer notified when profile goes live
- `password-reset` — admin password reset link
- `webinar-acknowledgement` — registration confirmation
- `internship-acknowledgement` — application received
- `brochure-download` — PDF link email

Each email uses the SODAK Technology brand (navy/gold, logo, footer with unsubscribe notice).

#### 7.2 ISR Revalidation API Route
Create `src/app/api/revalidate/route.ts`:
- `POST` with `x-revalidate-secret` header guard
- Accepts `tag` query param: `trainers`, `programs`, `institutions`, `gallery`, `blog`
- Calls `revalidateTag(tag)` (Next.js cache tag invalidation)
- Called by `notification-handlers.ts` after every publish action

Tag pages: `export const revalidate = 60` + `unstable_cache` with matching tags on each RSC data-fetch call.

#### 7.3 Redirects Management
- `/admin/settings` — Redirects tab: list of `source → destination + permanent` rules, add/delete
- `next.config.ts` `getRedirects()` already loads from DB at build time
- **Also:** add a `middleware.ts` runtime redirect for the top 5 legacy anchor URLs (`/#trainers`, `/#programs`, etc.) so they work between deploys without a rebuild

#### 7.4 Soft-Delete Cron
Create `src/app/api/cron/cleanup/route.ts`:
- Vercel Cron Job (`vercel.json` schedule: `0 2 * * *` — 2 AM daily)
- Hard-deletes all records where `deletedAt < NOW() - 30 days` across all soft-delete models
- Writes audit log entry: `action = 'HARD_DELETE'`
- Protected by `CRON_SECRET` env var

#### 7.5 Sitemap & Robots
- `src/app/sitemap.ts` — dynamic sitemap: all published trainer/program/institution/blog slugs queried from DB
- `src/app/robots.ts` — `Disallow: /admin`

#### 7.6 OG Image Generation
- `src/app/og/route.tsx` — Edge runtime, returns a `ImageResponse` (Satori)
- Dynamic OG image for blog posts and trainer profiles
- Used in `generateMetadata` `openGraph.images`

### Exit Gate
- `POST /api/revalidate?tag=trainers` with correct secret → `/trainers` ISR cache flushed (verify with `Cache-Control: stale-while-revalidate` response header)
- All 7 email templates render correctly in Resend test dashboard
- `GET /sitemap.xml` returns valid XML with at least one trainer slug
- Cron endpoint returns 200 with count of hard-deleted rows (test with `deletedAt = NOW() - 31 days` seed)
- OG image renders for a blog post URL

---

## Phase 8 — Quality Gates

**Entry condition:** Phase 7 exit gate passed.

**Goal:** The codebase meets all non-functional requirements from CLAUDE.md before launch.

### Deliverables

#### 8.1 TypeScript Zero-Error Pass
- `npx tsc --noEmit` — zero errors, zero `any`, zero `@ts-ignore`
- `eslint --max-warnings 0` passes

#### 8.2 Lighthouse CI
Install `@lhci/cli`. Target pages: `/`, `/trainers`, `/programs`.

| Metric | Target |
|---|---|
| Performance | ≥ 90 |
| Accessibility | ≥ 90 |
| Best Practices | ≥ 90 |
| SEO | ≥ 90 |
| LCP | < 2.5 s |

Fixes if needed: hero image ≤ 200 KB WebP, `next/image` `priority` prop on LCP images, font `display: swap`, JS bundle analysis (`@next/bundle-analyzer`).

#### 8.3 WCAG 2.1 AA Audit
Key checks:
- All interactive elements have visible focus rings
- Colour contrast ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- All images have meaningful `alt` text (enforced at DB layer already)
- Accordion/FAQ: `aria-expanded` + `aria-controls` wired
- Form labels associated with inputs (`htmlFor`)
- Skip-to-main-content link in Navbar

Run `axe-core` automated scan; fix all critical/serious findings.

#### 8.4 Security Headers
Add `next.config.ts` headers:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; img-src 'self' *.amazonaws.com data: blob:; ...
```

#### 8.5 E2E Tests (Playwright)
Critical path coverage only:

| Test | Description |
|---|---|
| `login.spec.ts` | Admin login → dashboard loads |
| `publish-trainer.spec.ts` | Create trainer → publish → verify public page |
| `enquiry-form.spec.ts` | Fill contact form → lead created in DB |
| `consent-gate.spec.ts` | Publish trainer without consent → 422 |
| `rbac.spec.ts` | Sales user → 403 on trainer CRUD |

#### 8.6 CI Pipeline (GitHub Actions)
`.github/workflows/ci.yml`:
```
lint → tsc → test:unit → test:e2e → lhci → build
```
Runs on every PR. Merge blocked until all pass.

### Exit Gate
- `tsc --noEmit` and `eslint` both return exit code 0
- Lighthouse CI passes ≥ 90 on all four categories for Home, Trainers, Programs
- Axe scan: zero critical/serious violations on all Phase 3 pages
- All 5 Playwright specs pass against a preview Vercel deployment
- Security headers present in production response (`curl -I https://sodakedutech.in`)

---

## Phase 9 — Launch Preparation

**Entry condition:** Phase 8 exit gate passed.

**Goal:** Production environment configured, domain live, team onboarded. Ready for public traffic.

### Deliverables

#### 9.1 Vercel Production Config
- Connect GitHub repo → Vercel project → auto-deploy on `main` branch
- Set all environment variables (Supabase, AWS S3, Resend, Upstash, Turnstile, Auth)
- `vercel.json` with cron schedule for cleanup job
- Custom domain `sodakedutech.in` → Vercel nameservers → SSL auto-provisioned

#### 9.2 Supabase Production Instance
- Separate production project (not dev)
- Run `npx prisma migrate deploy` via Vercel deploy hook
- Row Level Security (RLS) policies: public read on published tables, write blocked from outside
- Enable Supabase Point-in-Time Recovery (PITR) if on paid plan, else nightly pg_dump to S3

#### 9.3 AWS S3 Production Bucket
- Separate bucket `sodakedutech-media-prod`
- Bucket policy: public-read on `images/*` and `media/*` prefixes only
- Optional: CloudFront distribution → custom domain `media.sodakedutech.in`
- CORS policy allowing `sodakedutech.in` origin

#### 9.4 Content Seeding (Production)
- Migrate real trainer data (with consent sign-off from each trainer)
- Upload real program content + brochure PDFs
- Upload institution logos (with `logoPermission = true` for each)
- Configure settings (address, phone, social links)

#### 9.5 Monitoring
- Vercel Analytics enabled (Core Web Vitals, real traffic)
- Sentry or Axiom for error tracking (optional at Hobby tier)
- Uptime monitor (Uptime Robot free tier — 5-minute checks on `/` and `/admin`)

### Exit Gate
- `https://sodakedutech.in` loads, HTTPS green, no mixed content
- `https://sodakedutech.in/sitemap.xml` returns all published slugs
- First real lead submitted via contact form → email received by team
- Admin login works for seeded super_admin user on production

---

## Phase 10 — Post-Launch & Iteration

**Entry condition:** Phase 9 exit gate passed (site is live and stable for ≥ 7 days).

**Goal:** Sustain, iterate, and close remaining deferred items.

### Ongoing Deliverables

| Item | Trigger |
|---|---|
| Add redirects for legacy anchor URLs (`/#trainers → /trainers`) | On go-live |
| Blog rich-text editor upgrade (Tiptap/Prosemirror) | After first 5 posts published |
| Trainer profile claim flow (self-edit by trainer) | When `contributor` users onboarded |
| Related posts auto-computation at publish time | After 10+ posts exist |
| Gallery lightbox: AVIF src + WebP fallback | After AVIF variants confirmed in S3 |
| ISR upgrade to `on-demand revalidation` per tag | When publish latency > 60 s SLA |
| Tamil localisation | Explicitly deferred — new phase |
| Student login + course delivery | Explicitly out of scope |
| Online payments | Explicitly out of scope |

### Metrics to Watch (Weekly)
- Lighthouse mobile score stays ≥ 90
- Lead conversion rate (form views → submissions)
- Most-viewed trainer profiles (prioritise featured content)
- Broken link scan (automated weekly)

---

## Dependency Summary

```
Phase 1 (DB) ←── ALL other phases depend on this
Phase 2 (Admin CMS core) ←── Phase 3 depends on real data
Phase 3 (Public core) ←── Phase 4 can start in parallel after Phase 3 starts
Phase 5 (Forms) ←── Can start after Phase 4 public pages that host forms
Phase 6 (Admin full) ←── Can be parallelised with Phase 5
Phase 7 (Integrations) ←── Requires Phase 5 (forms) and Phase 6 (CMS)
Phase 8 (Quality) ←── Must be last before launch
Phase 9 (Launch) ←── All gates passed
```

**Phases 3 + 4 can run in parallel across two developers.**
**Phases 5 + 6 can run in parallel across two developers.**

---

## Time Estimates (Solo Developer)

| Phase | Estimated Effort |
|---|---|
| 0 — Boilerplate | ✅ Done |
| 1 — DB & Auth | 1–2 days |
| 2 — Admin CMS (core) | 5–7 days |
| 3 — Public Pages (core) | 5–7 days |
| 4 — Public Pages (secondary) | 4–5 days |
| 5 — Forms & Interactions | 2–3 days |
| 6 — Admin CMS (full) | 4–5 days |
| 7 — Integrations | 2–3 days |
| 8 — Quality Gates | 3–4 days |
| 9 — Launch Prep | 1–2 days |
| **Total** | **~27–38 working days** |

> These are implementation days (not calendar days). Phase 2 and Phase 3 are the longest because they involve the most pixel-accurate UI work referencing the wireframes.
