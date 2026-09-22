# SODAK Technology — Software Requirements Specification

**Document ID:** SODAK-EduTech-SRS  
**Version:** 1.0  
**Status:** Draft for Review  
**Author:** Tamil Selvan K (based on BRD by Rajendhira Prasath S)  
**Reference BRD:** `01-SODAK-EduTech-BRD.md` v1.0  
**Wireframe:** `C:/Users/DELL/Docs/wireframe/` (35 public pages, 7 admin pages)  
**Date:** 2026-09-15

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Architecture](#3-system-architecture)
4. [Frontend Specification](#4-frontend-specification)
5. [Functional Requirements](#5-functional-requirements)
6. [Admin Panel Requirements](#6-admin-panel-requirements)
7. [External Interface Requirements](#7-external-interface-requirements)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Data Model](#9-data-model)
10. [API Specification](#10-api-specification)
11. [Deployment & Infrastructure](#11-deployment--infrastructure)
12. [Acceptance Criteria](#12-acceptance-criteria)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the complete technical requirements for converting sodakedutech.in from a static HTML wireframe into a production-grade, CMS-driven multi-page web platform. It translates the business objectives in the BRD into software deliverables a developer can implement directly.

### 1.2 Scope

The system comprises:
- A public-facing marketing website (35 pages)
- A role-gated admin panel (7+ sections)
- A REST API backend
- A relational database
- A media processing pipeline
- An email notification system
- A lead management inbox

The system does **not** include: student login, course delivery, video hosting, online payments, or Tamil localisation (all deferred to later phases per the BRD).

### 1.3 Definitions

| Term | Meaning |
|---|---|
| **BRD** | Business Requirements Document (`01-SODAK-EduTech-BRD.md`) |
| **SRS** | This document |
| **TPO** | Training & Placement Officer — primary external persona |
| **Wireframe** | Static HTML/CSS prototype in `C:/Users/DELL/Docs/wireframe/` |
| **Module** | A self-contained unit of functionality with a defined boundary and no hidden dependencies on other modules |
| **Low coupling** | Design principle: modules interact only through narrow, explicit interfaces; changing one module's internals does not break others |
| **ISR** | Incremental Static Regeneration — pages rebuilt in the background when data changes, cached copy served until then |
| **CMS** | Content Management System — the admin panel in this project |
| **slug** | URL-safe identifier, e.g. `amazon-trainer-arjun` |

### 1.4 References

| Ref | Document |
|---|---|
| [BRD] | `01-SODAK-EduTech-BRD.md` — Business objectives, personas, scope |
| [WIRE] | `C:/Users/DELL/Docs/wireframe/` — Approved visual wireframe |
| [WCAG] | WCAG 2.1 Level AA — Accessibility standard |
| [DPDP] | Digital Personal Data Protection Act, 2023 (India) |
| [IEEE830] | IEEE Std 830-1998 — SRS format reference |

### 1.5 Overview

Section 2 describes the product at a high level. Section 3 establishes the architecture and the low-coupling contract between modules. Sections 4–6 specify the frontend, functional requirements, and admin panel. Sections 7–10 cover interfaces, non-functional requirements, data model, and APIs. Sections 11–12 cover deployment and launch criteria.

---

## 2. Overall Description

### 2.1 Product Perspective

SODAK Technology's website is the primary lead-generation channel for campus placement training. The current state is a static HTML wireframe. The target state is a dynamic platform where:
- Content editors publish trainers, programs, and photos without code changes.
- TPOs and faculty arrive via search or WhatsApp referral, evaluate SODAK's credibility, and submit an enquiry.
- The sales team works that enquiry through a pipeline to a signed program contract.

The website links outward to three separate SODAK products (CTF, LMS, Assessment Engine) but does not embed them.

### 2.2 Product Functions (summary)

| Domain | Public-facing | Admin-facing |
|---|---|---|
| Trainers | Directory, filters, individual profiles | CRUD, photo upload, consent flag |
| Mentors | Directory, 1-on-1 booking interest, FAQ | CRUD, availability toggle |
| Programs | Listing, track filters, detail + syllabus | CRUD, PDF brochure upload |
| Courses | Domain-based catalogue | CRUD, stack tagging |
| Training stacks | 6 stack pages with technology lists | CRUD, icon/colour tokens |
| Institutions | Partner directory, per-college case page | CRUD, logo upload, permission flag |
| Gallery | Photo grid, lightbox, institution/year filters | Upload (bulk), tag, alt text gate |
| Webinars | Listing, registration interest form | CRUD, schedule |
| Internships | Listing with company + role cards, apply form | CRUD |
| Blog/Insights | Listing, post detail | Draft→Review→Publish workflow |
| Careers | Job listing, role detail, application form | CRUD, open/close flag |
| Platform | CTF / LMS / Assessment overview pages | Static (edited in code; low-churn) |
| Leads | — | Inbox, pipeline status, CSV export |
| Media Library | — | Upload, search, alt-text edit, reuse |
| Analytics | — | Page views, lead sources, click-throughs |
| Settings | — | Site metadata, social links, stat counters |

### 2.3 User Roles

Refer to BRD §4 for the full role table. From a software access-control perspective:

| Role | Capabilities |
|---|---|
| `super_admin` | All CRUD, user management, settings, audit log, delete |
| `editor` | Create/edit/publish content and media; no user management |
| `contributor` | Edit own trainer/mentor profile; submit blog drafts; no publish |
| `sales` | Read/update leads and pipeline status; no content access |
| `visitor` | Read published pages; submit forms |

### 2.4 Constraints

- **Cost:** ₹0 recurring beyond domain. Infrastructure must use free tiers (Vercel/Netlify + PlanetScale/Neon/Supabase or Railway free tier).
- **No vendor lock-in for content:** structured data in a relational DB, not a proprietary headless CMS.
- **Static-first delivery:** pages rendered at build or ISR; DB is never in the critical path for a public request.
- **Consent gates:** a trainer/institution record cannot be published without consent flags set.

### 2.5 Assumptions

- Next.js 14+ (App Router) is the selected framework; its built-in ISR satisfies the static-first constraint.
- Prisma ORM over PostgreSQL.
- Email via Resend (free tier: 3,000 emails/month).
- Image optimisation via Next.js `<Image>` + Cloudflare R2 (free tier) for storage.
- All wireframe pages in `C:/Users/DELL/Docs/wireframe/` are the approved visual reference; any deviation must be approved.

---

## 3. System Architecture

### 3.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Public Internet                         │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Vercel Edge CDN   │  (static pages + ISR cache)
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
  ┌──────▼──────┐      ┌───────▼───────┐     ┌──────▼──────┐
  │ Next.js RSC │      │  /api routes  │     │  /admin/*   │
  │  (pages)   │      │  (REST API)   │     │  (protected)│
  └──────┬──────┘      └───────┬───────┘     └──────┬──────┘
         │                     │                     │
         └─────────────────────▼─────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Service Layer     │  ← low-coupling boundary
                    │  (one file/module   │
                    │   per domain)       │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
  ┌──────▼──────┐      ┌───────▼───────┐     ┌──────▼──────┐
  │  Prisma ORM │      │  Cloudflare   │     │   Resend    │
  │ (PostgreSQL)│      │  R2 (media)   │     │  (email)    │
  └─────────────┘      └───────────────┘     └─────────────┘
```

### 3.2 Low Coupling Design Principles

Low coupling is the primary architectural constraint on the software layer. The following rules are mandatory:

#### 3.2.1 Module Isolation Rule

Every domain (trainers, programs, institutions, gallery, blog, leads, careers, internships, webinars, platform) is implemented as an isolated module with:

```
src/
  modules/
    trainers/
      trainers.service.ts      ← all DB logic for this domain
      trainers.schema.ts       ← Zod validation schemas
      trainers.types.ts        ← TypeScript interfaces
    programs/
      programs.service.ts
      programs.schema.ts
      programs.types.ts
    institutions/
      ...
    gallery/
      ...
    leads/
      ...
    ...
```

**Rule:** A service file may only import from:
1. Its own module's `types.ts` and `schema.ts`
2. `src/lib/db.ts` (Prisma client singleton)
3. `src/lib/storage.ts` (R2 client singleton)
4. `src/lib/email.ts` (Resend client singleton)
5. Node/npm utilities

A service file **must not** import from another module's service. Cross-module reads use the other module's exported types only (never the service function itself — the API route composes them).

#### 3.2.2 API as Composition Layer

API route handlers (`/api/trainers/route.ts`, etc.) are the only place that composes across modules. Example: a trainer profile page may need trainer data + institutions they've trained at + blog posts they authored. The API route calls `trainers.service.getById()`, `institutions.service.getByTrainerId()`, and `blog.service.getByAuthor()` — three separate calls, assembled in the route handler.

```
// CORRECT
// api/trainers/[id]/route.ts
const trainer   = await trainersService.getById(id);
const colleges  = await institutionsService.getByTrainerId(id);
const posts     = await blogService.getByAuthor(id);
return { trainer, colleges, posts };

// WRONG — cross-module import inside a service
// trainers.service.ts
import { blogService } from '../blog/blog.service';   // ← forbidden
```

#### 3.2.3 Shared Kernel (lib/)

Infrastructure code that is genuinely shared lives in `src/lib/` and has no domain logic:

| File | Purpose |
|---|---|
| `db.ts` | Prisma client singleton |
| `storage.ts` | R2 upload/URL helper |
| `email.ts` | Resend send helper |
| `auth.ts` | Session/JWT validation helper |
| `slugify.ts` | Slug generation utility |
| `paginate.ts` | Cursor/offset pagination helper |
| `image.ts` | Sharp-based resize pipeline |

#### 3.2.4 Frontend Module Boundary

Each Next.js page under `app/(public)/[domain]/` imports only:
1. Its own domain's API data via `fetch('/api/[domain]/...')`
2. Shared UI components from `src/components/ui/`
3. Layout components from `src/components/layout/`

Pages do not share state with each other. A trainer profile page does not "know" it is linked from the trainers directory — it only knows its own data.

#### 3.2.5 Event-Driven Side Effects

When an action in one module must trigger side effects in another (e.g., publishing a trainer sends a notification email), use a thin event emitter rather than a direct service call:

```
// trainers.service.ts
await db.trainer.update({ where: { id }, data: { published: true } });
emit('trainer.published', { trainerId: id });   // ← event, not a call

// notifications/handlers.ts  (subscribes to events, not imported by trainers)
on('trainer.published', async ({ trainerId }) => {
  await emailService.send({ template: 'trainer-live', ... });
});
```

This removes the dependency between `trainers.service` and `email.ts` entirely.

#### 3.2.6 Admin Panel Isolation

The admin panel is a separate Next.js route group `app/(admin)/`. It has its own layout, its own auth middleware, and its own API calls. It does not share React components with the public site except from the shared `src/components/ui/` kit.

### 3.3 Technology Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14+ (App Router) | ISR, RSC, API routes, built-in image optimisation |
| Language | TypeScript (strict) | Type-safe module contracts enforce the coupling rules |
| ORM | Prisma 5 | Type-safe DB access, migration tooling |
| DB | PostgreSQL (Neon free tier) | Serverless-compatible, free |
| Auth | NextAuth.js v5 | Handles sessions, CSRF, role callbacks |
| Media storage | Cloudflare R2 | S3-compatible, free egress |
| Image processing | Sharp (server-side) | Resize/format conversion at upload time |
| Email | Resend | Generous free tier, simple API |
| Spam protection | Cloudflare Turnstile | Free, no CAPTCHA UX |
| Styling | Tailwind CSS | Utility-first, purges unused CSS, consistent with wireframe tokens |
| Validation | Zod | Schema-first, works in API and form layers |
| Deployment | Vercel | Free hobby tier, edge caching, ISR support |

---

## 4. Frontend Specification

### 4.1 Wireframe Pages (approved visual reference)

All 35 public pages and 7 admin pages in `C:/Users/DELL/Docs/wireframe/` are the approved layout reference. Implementations must match the wireframe layout, spacing, component types, and typography. Content is placeholder and will be replaced.

#### 4.1.1 Public Pages

| Route | Wireframe file | Key sections |
|---|---|---|
| `/` | `index.html` | Hero, logo marquee, trainers carousel, stack cards, institution wall, stats, gallery preview, blog preview, CTA |
| `/about` | `about.html` | Mission, story, team, certifications, stat counters |
| `/trainers` | `trainers.html` | Filter bar, trainer card grid, pagination |
| `/trainers/[slug]` | `trainer-profile.html` | Bio, expertise tags, institutions trained, posts authored |
| `/mentors` | `mentors.html` | Mentor cards, how-it-works steps, FAQ (collapsible), booking-interest form |
| `/mentors/[slug]` | `mentor-profile.html` | Profile detail |
| `/courses` | `courses.html` | Domain-based course catalogue, filter |
| `/programs` | `programs.html` | Track cards (A–E), filter, CTA |
| `/programs/[slug]` | `program-detail.html` | Syllabus accordion, duration, outcomes, brochure download, enquiry CTA |
| `/training` | `training.html` | 6 stack overview cards |
| `/training/[slug]` | `training-cloud.html` | Stack detail, tech list, modules |
| `/institutions` | `institutions.html` | Logo grid with search |
| `/institutions/[slug]` | `institution-detail.html` | Program timeline, photo gallery, testimonial |
| `/gallery` | `gallery.html` | Lightbox grid, institution/year filter |
| `/platform` | `platform.html` | Platform overview |
| `/platform/ctf` | `platform-ctf.html` | CTF platform detail |
| `/platform/lms` | `platform-lms.html` | LMS detail |
| `/platform/assessments` | `platform-assessments.html` | Assessment engine detail |
| `/webinars` | `webinars.html` | Webinar listing, registration |
| `/internships` | `internships.html` | Company cards, role details, apply form |
| `/corporate` | `corporate.html` | Corporate & FDP training |
| `/insights` | `insights.html` | Blog listing, category filter |
| `/insights/[slug]` | `insights-post.html` | Post body, author card, related posts |
| `/careers` | `careers.html` | Job listing, department filter |
| `/careers/[slug]` | `career-detail.html` | Role detail, application form |
| `/contact` | `contact.html` | Enquiry form, contact info, map |
| `/privacy` | `privacy.html` | Privacy policy |
| `/terms` | `terms.html` | Terms of service |

#### 4.1.2 Admin Pages

| Route | Wireframe file | Purpose |
|---|---|---|
| `/admin` | `admin/dashboard.html` | Stats overview, recent leads, quick actions |
| `/admin/trainers` | `admin/trainers.html` | Trainer list, create/edit/publish/delete |
| `/admin/mentors` | `admin/mentors.html` | Mentor list, manage |
| `/admin/courses` | `admin/courses.html` | Course list, manage |
| `/admin/enquiries` | `admin/enquiries.html` | Enquiry/contact form submissions |
| `/admin/leads` | `admin/leads.html` | Lead pipeline, status management |
| `/admin/media` | `admin/media.html` | Media library, upload, alt text |

**Admin pages still to be built:**

| Route | Purpose |
|---|---|
| `/admin/programs` | Manage campus programs |
| `/admin/institutions` | Manage partner institutions |
| `/admin/gallery` | Bulk photo upload, tagging |
| `/admin/webinars` | Schedule and manage webinars |
| `/admin/internships` | Manage internship listings |
| `/admin/blog` | Post list, draft/publish workflow |
| `/admin/careers` | Job posts and applications |
| `/admin/settings` | Site metadata, stat counters, social links |
| `/admin/users` | User management (super_admin only) |
| `/admin/audit-log` | Action history |

### 4.2 Design Tokens

Implemented in `style.css` CSS custom properties. Values used throughout:

| Token | Value | Usage |
|---|---|---|
| `--dm-blue` | `#075892` | Primary CTA, headings, accent |
| `--dm-blue-hover` | `#0669ab` | Button hover |
| `--dm-dark` | `#0d1726` | Body text |
| `--surface` | `#f0f7ff` | Page background |
| `--white` | `#ffffff` | Cards, sections |
| `--navy-950` | `#060d1f` | Dark sections, footer |
| Glass card | `rgba(255,255,255,0.72)` + `blur(20px)` | `.card-light` |
| Border radius | `16px` (cards), `8px` (buttons) | |
| Nav height | `64px` | |

### 4.3 Shared Layout Components

Delivered via `layout.js` (injected on `DOMContentLoaded`):
- **Navbar** — sticky, white bg, DM blue accents, 7 items, 3 dropdowns (Learn/Platform/Careers), hamburger at ≤960px
- **Footer** — dark navy, brand section + 5 link columns + bottom bar, "Book a Program" CTA
- **Float buttons** — WhatsApp + Call, always visible, mobile-sticky

---

## 5. Functional Requirements

Requirements carry over from BRD §6, expanded with implementation detail.

### FR-1 Home Page

| ID | Requirement | Implementation note |
|---|---|---|
| FR-1.1 | Hero: headline, subhead, two CTAs, background — editable from admin | `site_settings.hero_*` fields; ISR revalidates on save |
| FR-1.2 | Company logo marquee driven by `companies` table | CSS marquee, no JS; companies ordered by `display_order` |
| FR-1.3 | Featured trainers carousel — `is_featured = true`, ordered by `display_order` | Max 8, scrollable; links to `/trainers/[slug]` |
| FR-1.4 | Six stack cards linked to stack detail pages | Pull from `stacks` table |
| FR-1.5 | Institution logo wall — `show_on_home = true` | Responsive CSS grid; fall back to text if no `logo_permission` |
| FR-1.6 | Animated stat counters from `site_stats` | `data-countup` attribute; Intersection Observer (already in `layout.js`) |
| FR-1.7 | Latest 3 gallery photos + latest 3 blog posts | Two separate queries, composed in the page's server component |
| FR-1.8 | Enquiry CTA block | Links to `/contact` |

### FR-2 Trainer / Mentor Module

| ID | Requirement |
|---|---|
| FR-2.1 | Trainer fields: name, slug (auto from name), photo, current_company, designation, expertise_tags[], bio_rich, years_experience, linkedin_url, github_url, stacks[], display_order, is_featured, is_published, consent_on_file |
| FR-2.2 | Mentor fields (extends trainer): is_mentor boolean, mentor_bio, session_types[], availability_status (Available/Limited/Full), booking_url (optional) |
| FR-2.3 | Photo upload: JPG/PNG/WebP ≤ 5 MB; Sharp generates 400×400 and 800×800 WebP variants at upload; originals retained in R2 |
| FR-2.4 | `consent_on_file = false` blocks `is_published = true`; enforced at service layer, not just UI |
| FR-2.5 | Placeholder avatar SVG rendered server-side when no photo — never a third-party stock image |
| FR-2.6 | Public trainer directory: filter by `company`, `stack`, `expertise_tag`; URL-serialised filters for shareability |
| FR-2.7 | Public trainer profile: bio, expertise tags, institutions trained (with dates), authored blog posts |
| FR-2.8 | Mentor FAQ: stored as JSON array in `site_settings`; rendered as collapsible FAQ cards (`.faq-item` component, JS toggle in `layout.js`) |

### FR-3 Institution Module

| ID | Requirement |
|---|---|
| FR-3.1 | Institution fields: name, slug, logo (R2), city, state, type (Engineering/Arts/Polytechnic/University/Corporate), affiliation, website, short_description, is_published, show_on_home, display_order, logo_permission |
| FR-3.2 | Engagement record (many-to-one institution): program_delivered, stacks[], start_date, end_date, batch_size, year_of_students, delivery_mode, outcome_notes, testimonial_text, testimonial_source |
| FR-3.3 | Gallery photos are tagged with `institution_id`; institution page renders its own gallery from the photos module |
| FR-3.4 | `logo_permission = false`: render `institution.name` as styled text, never show logo |

### FR-4 Gallery Module

| ID | Requirement |
|---|---|
| FR-4.1 | Photo fields: title, alt_text (required to publish), caption, institution_id (nullable), event_id (nullable), date_taken, tags[], display_order, is_published, has_student_faces, student_consent_ref |
| FR-4.2 | Bulk upload: up to 20 images per request; server processes sequentially with progress events (Server-Sent Events) |
| FR-4.3 | Lightbox: vanilla JS, keyboard nav (←/→/Esc), swipe on mobile |
| FR-4.4 | Alt text gate: publishing blocked at API level if `alt_text` is null or empty |
| FR-4.5 | `has_student_faces = true` requires `student_consent_ref` to be set before publishing |

### FR-5 Programs & Stacks Module

| ID | Requirement |
|---|---|
| FR-5.1 | Stack fields: name, slug, icon (SVG/emoji), summary, color_token, technologies[], display_order |
| FR-5.2 | Technology: name, logo_url, stack_id (FK), display_order |
| FR-5.3 | Program fields: title, slug, track_code (A–E), summary, description_rich, duration, delivery_mode, target_audience, prerequisites, syllabus_json (ordered modules), outcomes[], related_stacks[], brochure_pdf_url, is_featured, is_published |
| FR-5.4 | Syllabus rendered as accordion (`.accordion-item` component); brochure PDF downloadable link |

### FR-6 Lead Capture

| ID | Requirement |
|---|---|
| FR-6.1 | Enquiry form fields: name, role (TPO/HoD/Student/Corporate/Other), institution_or_company, email, phone, city, program_of_interest, batch_size, preferred_timeline, message, consent (required checkbox) |
| FR-6.2 | Internship apply form fields: name, email, phone, college, degree, graduating_year, role_interest, resume_url (optional), message |
| FR-6.3 | Webinar registration: name, email, phone, role |
| FR-6.4 | Careers application: name, email, phone, years_experience, cover_note, resume (PDF ≤ 5 MB upload to R2) |
| FR-6.5 | Spam protection: Cloudflare Turnstile widget + honeypot hidden field `website_url` (bots fill it; humans don't) + rate limit 5 submissions / IP / hour |
| FR-6.6 | On submission: persist to `leads`, send notification email to `settings.notification_email`, send acknowledgement to submitter |
| FR-6.7 | UTM params (`utm_source`, `utm_medium`, `utm_campaign`) and `document.referrer` captured with every lead; stored in `lead_meta` JSONB column |
| FR-6.8 | Admin lead inbox: list with filters (status, source, date range), pipeline statuses: `new → contacted → proposal_sent → won → lost`, internal notes (append-only), CSV export |

### FR-7 Blog / Insights Module

| ID | Requirement |
|---|---|
| FR-7.1 | Post fields: title, slug, cover_image_url, excerpt, body_rich (Tiptap/Lexical), author_id (→ trainers), category, tags[], reading_time_minutes (auto-calculated), published_at, status (draft/in_review/published), meta_title, meta_description, og_image_url |
| FR-7.2 | Status workflow: `draft → in_review` (contributor action) → `published` (editor action); contributor cannot self-publish |
| FR-7.3 | Related posts: 3 posts sharing the most tags; computed at publish time, stored in `post_related` join table |

### FR-8 Careers Module

| ID | Requirement |
|---|---|
| FR-8.1 | Job post fields: title, slug, department, location, employment_type, experience_min, experience_max, description_rich, responsibilities[], requirements[], is_open, closes_on, is_published |
| FR-8.2 | Application: applicant_name, email, phone, years_experience, cover_note, resume_url (R2), applied_at, status (new/reviewed/shortlisted/rejected) |

### FR-9 Webinars & Internships Module

| ID | Requirement |
|---|---|
| FR-9.1 | Webinar fields: title, slug, description, presenter_id (→ trainers), scheduled_at, duration_minutes, platform (Zoom/Meet/Teams), registration_url (external link or internal form), is_published |
| FR-9.2 | Internship fields: company_name, company_logo_url, role_title, location, duration, stipend_range, stack_tags[], description, requirements[], application_deadline, is_published |
| FR-9.3 | Apply form for internships: captured as `leads` with `source = 'internship'` and `meta.internship_id` set |

### FR-10 SEO & Structured Data

| ID | Requirement |
|---|---|
| FR-10.1 | Every page has editable `<title>`, `<meta name="description">`, canonical `<link>`, OG `<meta>` tags via `generateMetadata()` in each Next.js page component |
| FR-10.2 | `sitemap.xml` auto-generated from published records; `robots.txt` served from `app/robots.ts` |
| FR-10.3 | JSON-LD schemas: `Organization` (site-wide), `EducationalOrganization` (about), `Course` (each program), `Person` (each trainer/mentor), `BlogPosting` (each post), `BreadcrumbList` (all pages), `FAQPage` (mentors page) |
| FR-10.4 | Redirect table: `redirects` DB table, exported to `next.config.js` redirects array at build time; handles old SPA anchor routes (`/#trainers → /trainers`) |

---

## 6. Admin Panel Requirements

### 6.1 Authentication & Authorization

| ID | Requirement |
|---|---|
| AP-1.1 | Email + password login; Argon2id hashing (not bcrypt — Argon2 is OWASP-recommended as of 2024) |
| AP-1.2 | Session via NextAuth.js with database sessions (not JWTs); session invalidated after 8h idle |
| AP-1.3 | RBAC enforced at API middleware level; UI hiding alone is insufficient |
| AP-1.4 | `/admin` routes protected by Next.js middleware checking session + role before any page renders |
| AP-1.5 | "Forgot password" flow: time-limited token (15 min) sent by email, single-use |
| AP-1.6 | Super admin can create/deactivate accounts and assign roles; deactivated accounts cannot log in |

### 6.2 Content Workflows

| ID | Requirement |
|---|---|
| AP-2.1 | Every content record has `status ∈ {draft, published}` (and `in_review` for blog); draft records are invisible to public pages |
| AP-2.2 | Editors can preview draft content at `/admin/preview/[type]/[id]` — a server component that bypasses the published gate |
| AP-2.3 | Soft delete: records moved to `deleted_at` timestamp; hard-delete only after 30 days (cron job) |
| AP-2.4 | Consent gates: `consent_on_file` (trainers), `logo_permission` (institutions), `student_consent_ref` (gallery) — checked in service layer before `is_published` can be set |

### 6.3 Media Library

| ID | Requirement |
|---|---|
| AP-3.1 | Centralised media library at `/admin/media`; all uploads go through it |
| AP-3.2 | Upload: JPG/PNG/WebP/GIF (images), PDF (documents); max 10 MB per file |
| AP-3.3 | Image processing pipeline (Sharp, server-side): `original`, `lg` (1200px), `md` (800px), `sm` (400px), `thumb` (200px); all converted to WebP; AVIF generated for lg and md |
| AP-3.4 | Alt text editable after upload; required before an image can be used on a published record |
| AP-3.5 | Reuse: media picker shows library thumbnails; selecting reuses the existing R2 object rather than re-uploading |
| AP-3.6 | Search by filename, alt text, upload date |

### 6.4 Audit Log

Every create/update/delete/publish/unpublish action writes an `audit_log` record:

```
audit_log {
  id, actor_id (→ users), action, entity_type, entity_id,
  old_value (JSONB), new_value (JSONB), created_at
}
```

Viewable by `super_admin` at `/admin/audit-log`. Retained for 1 year.

### 6.5 Dashboard

| Widget | Data source |
|---|---|
| Total leads (7d / 30d) | `leads` table |
| Lead status breakdown | Grouped count by `status` |
| Top pages by view | Analytics (Plausible / Umami self-hosted) |
| Recent enquiries | `leads` latest 5 |
| Unpublished trainers awaiting consent | `trainers WHERE consent_on_file = false` |
| Pending blog drafts | `blog_posts WHERE status = 'in_review'` |

---

## 7. External Interface Requirements

### 7.1 User Interface

The wireframe in `C:/Users/DELL/Docs/wireframe/` is the approved UI specification. Deviations require explicit approval. Key UI contracts:

- Navigation: sticky white nav, 64px height, 7 items, hamburger at ≤960px
- Cards: glassmorphism (`rgba(255,255,255,0.72)`, `blur(20px)`, `border: 1px solid rgba(7,88,146,0.18)`)
- Primary button: `#075892` background, white text, 8px border-radius
- Typography: Open Sans (body), Instrument Sans (headings) — both served as local `@font-face` (no CDN dependency)
- Dark sections: `linear-gradient(160deg, #0a1628, #0c2040)`
- Light sections: `#ffffff` background

### 7.2 API Interface

All API routes follow REST conventions under `/api/v1/`:

- `GET /api/v1/[resource]` — list with pagination and filters
- `GET /api/v1/[resource]/[id]` — single record
- `POST /api/v1/[resource]` — create (admin only)
- `PATCH /api/v1/[resource]/[id]` — partial update (admin only)
- `DELETE /api/v1/[resource]/[id]` — soft delete (admin only)
- `POST /api/v1/[resource]/[id]/publish` — publish action (editor+)
- `POST /api/v1/[resource]/[id]/unpublish` — unpublish (editor+)

Public `GET` endpoints require no auth. Write endpoints require a valid session and role check. See §10 for per-resource endpoints.

### 7.3 Third-Party Integrations

| Service | Integration point | Coupling |
|---|---|---|
| Cloudflare R2 | `src/lib/storage.ts` — single upload/get/delete wrapper | Isolated: swap to S3 by editing one file |
| Resend | `src/lib/email.ts` — `sendEmail(template, to, data)` wrapper | Isolated: swap to Nodemailer by editing one file |
| Cloudflare Turnstile | Client-side widget + `POST /api/v1/verify-turnstile` server validation | Form-specific; no cross-module dependency |
| Plausible Analytics | `<script>` in `_app` layout — no server coupling | Zero coupling |
| NextAuth.js | `src/lib/auth.ts` + `app/api/auth/[...nextauth]/route.ts` | Isolated in lib + single route |

---

## 8. Non-Functional Requirements

### 8.1 Performance

| ID | Requirement | Target |
|---|---|---|
| NFR-P1 | Lighthouse (mobile) — all four categories | ≥ 90 |
| NFR-P2 | LCP | < 2.5s on simulated 4G |
| NFR-P3 | Hero image | ≤ 200 KB (WebP), served via CDN |
| NFR-P4 | All images below fold | Lazy-loaded (`loading="lazy"`) |
| NFR-P5 | First JS bundle | < 100 KB gzip |
| NFR-P6 | All public pages | Statically generated or ISR-cached |
| NFR-P7 | ISR revalidation | ≤ 60s for trainers/programs/institutions after admin save |

### 8.2 Security

| ID | Requirement |
|---|---|
| NFR-S1 | HTTPS enforced; HSTS header (`max-age=31536000; includeSubDomains`) |
| NFR-S2 | Content Security Policy header: `default-src 'self'`; allowlist only known CDNs |
| NFR-S3 | All DB queries via Prisma parameterised (no raw string interpolation) |
| NFR-S4 | File upload validation: MIME type checked server-side (not just extension); files stored in R2 with random UUIDs as keys |
| NFR-S5 | Admin routes: middleware rejects unauthenticated requests with HTTP 401 before any DB query |
| NFR-S6 | Sensitive env vars (DB URL, R2 secret, Resend API key) in Vercel environment variables; never committed to repo |
| NFR-S7 | Rate limiting on form endpoints: 5 submissions / IP / hour via Upstash Redis (free tier) or Vercel Edge Config |
| NFR-S8 | Audit log on all admin writes (§6.4) |

### 8.3 Reliability & Availability

| ID | Requirement |
|---|---|
| NFR-R1 | ≥ 99% uptime for public pages (achieved by ISR — pages served from CDN even if DB is down) |
| NFR-R2 | Admin panel availability: best-effort; acceptable to be degraded when DB is unreachable |
| NFR-R3 | Nightly automated DB dump to private GitHub repo or R2 bucket; retained 30 days |
| NFR-R4 | Media backed up separately: R2 versioning enabled |

### 8.4 Accessibility

| ID | Requirement |
|---|---|
| NFR-A1 | WCAG 2.1 Level AA throughout |
| NFR-A2 | All images have `alt` text (enforced at CMS publish gate) |
| NFR-A3 | Colour contrast ≥ 4.5:1 for body text; ≥ 3:1 for large text (verified against `#075892` on white: passes) |
| NFR-A4 | Keyboard navigable: all interactive elements reachable by Tab; `focus-visible` styles present |
| NFR-A5 | FAQ collapsible uses `<button>` elements with `aria-expanded` and `aria-controls` attributes |
| NFR-A6 | Hamburger menu: `aria-label="Open menu"` / `"Close menu"` toggled in JS |

### 8.5 SEO

| ID | Requirement |
|---|---|
| NFR-SEO1 | All pages have unique `<title>` and `<meta description>` |
| NFR-SEO2 | Canonical URLs on all pages |
| NFR-SEO3 | Open Graph tags and OG image on all published records |
| NFR-SEO4 | JSON-LD structured data per FR-10.3 |
| NFR-SEO5 | `sitemap.xml` auto-generated; submitted to Google Search Console at launch |
| NFR-SEO6 | All old `/#anchor` routes redirect 301 to new clean URLs |

### 8.6 Privacy (DPDP Act 2023)

| ID | Requirement |
|---|---|
| NFR-PR1 | Enquiry forms have explicit consent checkbox with stated purpose before submission is accepted |
| NFR-PR2 | Privacy Policy and Terms of Service live at `/privacy` and `/terms`; linked in footer (already in wireframe) |
| NFR-PR3 | Personal data (trainer photos, leads) deletable on request via soft-delete + hard-delete pipeline |
| NFR-PR4 | Lead data retention policy: hard-deleted after 2 years if status remains `lost` |

---

## 9. Data Model

### 9.1 Core Entities

```sql
-- Users (admin)
users {
  id uuid PK
  name text
  email text UNIQUE
  password_hash text
  role enum(super_admin, editor, contributor, sales)
  is_active boolean DEFAULT true
  created_at, updated_at
}

-- Trainers / Mentors
trainers {
  id uuid PK
  name text
  slug text UNIQUE
  photo_url text          -- R2 object key
  current_company text
  designation text
  expertise_tags text[]
  bio_html text           -- rich text rendered to HTML
  years_experience int
  linkedin_url text
  github_url text
  display_order int
  is_featured boolean DEFAULT false
  is_mentor boolean DEFAULT false
  is_published boolean DEFAULT false
  consent_on_file boolean DEFAULT false
  created_at, updated_at, deleted_at
}

-- Institutions
institutions {
  id uuid PK
  name text
  slug text UNIQUE
  logo_url text
  city text
  state text
  type enum(Engineering, Arts, Polytechnic, University, Corporate)
  affiliation text
  website text
  short_description text
  is_published boolean
  show_on_home boolean
  display_order int
  logo_permission boolean DEFAULT false
  created_at, updated_at, deleted_at
}

-- Institution engagements
institution_engagements {
  id uuid PK
  institution_id uuid FK → institutions
  program_delivered text
  stacks text[]
  start_date date
  end_date date
  batch_size int
  year_of_students text
  delivery_mode enum(on_campus, hybrid, online)
  outcome_notes text
  testimonial_text text
  testimonial_source text
}

-- Stacks
stacks {
  id uuid PK
  name text
  slug text UNIQUE
  icon text
  summary text
  color_token text
  display_order int
}

-- Technologies
technologies {
  id uuid PK
  name text
  logo_url text
  stack_id uuid FK → stacks
  display_order int
}

-- Programs
programs {
  id uuid PK
  title text
  slug text UNIQUE
  track_code char(1)       -- A–E
  summary text
  description_html text
  duration text
  delivery_mode text
  target_audience text
  prerequisites text
  syllabus_json jsonb      -- [{module, topics[]}]
  outcomes text[]
  brochure_pdf_url text
  is_featured boolean
  is_published boolean
  created_at, updated_at, deleted_at
}

-- program_stacks join
program_stacks { program_id, stack_id }

-- trainer_stacks join
trainer_stacks { trainer_id, stack_id }

-- Gallery photos
photos {
  id uuid PK
  title text
  alt_text text            -- required before publishing
  caption text
  url text                 -- R2 object key
  institution_id uuid FK → institutions (nullable)
  date_taken date
  tags text[]
  display_order int
  is_published boolean
  has_student_faces boolean DEFAULT false
  student_consent_ref text
  created_at, uploaded_by uuid FK → users
}

-- Blog posts
blog_posts {
  id uuid PK
  title text
  slug text UNIQUE
  cover_image_url text
  excerpt text
  body_html text
  author_id uuid FK → trainers
  category text
  tags text[]
  reading_time_minutes int
  published_at timestamptz
  status enum(draft, in_review, published)
  meta_title text
  meta_description text
  og_image_url text
  created_at, updated_at, deleted_at
}

-- Leads
leads {
  id uuid PK
  name text
  role text
  institution_or_company text
  email text
  phone text
  city text
  program_of_interest text
  batch_size int
  preferred_timeline text
  message text
  source text              -- form page slug or utm_source
  status enum(new, contacted, proposal_sent, won, lost) DEFAULT new
  meta jsonb               -- UTM params, referrer, internship_id, etc.
  created_at timestamptz
}

-- Lead notes (append-only)
lead_notes {
  id uuid PK
  lead_id uuid FK → leads
  author_id uuid FK → users
  body text
  created_at timestamptz
}

-- Careers
job_posts {
  id uuid PK
  title text
  slug text UNIQUE
  department text
  location text
  employment_type text
  experience_min int
  experience_max int
  description_html text
  responsibilities text[]
  requirements text[]
  is_open boolean DEFAULT true
  closes_on date
  is_published boolean
  created_at, updated_at, deleted_at
}

-- Job applications
job_applications {
  id uuid PK
  job_post_id uuid FK → job_posts
  applicant_name text
  email text
  phone text
  years_experience int
  cover_note text
  resume_url text
  status enum(new, reviewed, shortlisted, rejected) DEFAULT new
  applied_at timestamptz
}

-- Webinars
webinars {
  id uuid PK
  title text
  slug text UNIQUE
  description text
  presenter_id uuid FK → trainers
  scheduled_at timestamptz
  duration_minutes int
  platform text
  registration_url text
  is_published boolean
  created_at, updated_at, deleted_at
}

-- Internships
internships {
  id uuid PK
  company_name text
  company_logo_url text
  role_title text
  location text
  duration text
  stipend_range text
  stack_tags text[]
  description text
  requirements text[]
  application_deadline date
  is_published boolean
  created_at, updated_at, deleted_at
}

-- Audit log
audit_log {
  id uuid PK
  actor_id uuid FK → users
  action text              -- created | updated | deleted | published | unpublished
  entity_type text
  entity_id uuid
  old_value jsonb
  new_value jsonb
  created_at timestamptz
}

-- Site settings (single row)
site_settings {
  id int DEFAULT 1 CHECK (id = 1)
  hero_headline text
  hero_subhead text
  hero_image_url text
  notification_email text
  stats jsonb              -- {stacks:6, technologies:50, seats:100, questions:2100}
  social_links jsonb
  updated_at timestamptz
}

-- Redirects
redirects {
  id uuid PK
  source text UNIQUE       -- e.g. /#trainers
  destination text         -- e.g. /trainers
  is_permanent boolean DEFAULT true
}
```

---

## 10. API Specification

### 10.1 Authentication

```
POST /api/v1/auth/login         { email, password } → { session_token }
POST /api/v1/auth/logout        → 200
POST /api/v1/auth/forgot        { email } → 200
POST /api/v1/auth/reset         { token, new_password } → 200
GET  /api/v1/auth/me            → { user }
```

### 10.2 Resource Endpoints (standard CRUD pattern)

Each resource below follows the standard REST pattern (§7.2). Listed with any non-standard endpoints:

```
/api/v1/trainers
  POST /:id/publish | unpublish

/api/v1/mentors           (virtual subset of trainers where is_mentor=true)

/api/v1/institutions
  POST /:id/publish | unpublish

/api/v1/institution-engagements

/api/v1/stacks
/api/v1/technologies

/api/v1/programs
  POST /:id/publish | unpublish
  GET /:id/brochure        → redirect to R2 signed URL

/api/v1/photos
  POST /bulk               multipart, up to 20 files
  GET /sse/bulk-progress   SSE stream for bulk upload progress
  POST /:id/publish | unpublish

/api/v1/blog
  POST /:id/submit-review  (contributor → in_review)
  POST /:id/publish        (editor only)
  POST /:id/unpublish

/api/v1/leads
  GET  /                   role: sales+ only
  PATCH /:id/status        { status } — role: sales+
  POST /:id/notes          { body }   — role: sales+
  GET  /export             CSV download — role: sales+

/api/v1/jobs
/api/v1/job-applications

/api/v1/webinars
/api/v1/internships

/api/v1/media
  POST /upload             single file
  GET  /:id/url            signed download URL

/api/v1/settings           GET / PATCH (super_admin only)

/api/v1/redirects

/api/v1/audit-log          GET (super_admin only)

/api/v1/forms/enquiry      POST — public, Turnstile + honeypot
/api/v1/forms/internship   POST — public
/api/v1/forms/webinar      POST — public
/api/v1/forms/careers      POST — public (file upload)
/api/v1/verify-turnstile   POST — internal use by form handlers
```

### 10.3 Response Format

```json
// List
{
  "data": [...],
  "pagination": { "total": 48, "page": 1, "perPage": 20, "pages": 3 }
}

// Single
{ "data": { ... } }

// Error
{ "error": { "code": "NOT_FOUND", "message": "Trainer not found" } }
```

---

## 11. Deployment & Infrastructure

### 11.1 Environments

| Environment | Host | DB | Purpose |
|---|---|---|---|
| `local` | `localhost:3000` | Local PostgreSQL or Docker | Development |
| `preview` | Vercel preview URL | Neon dev branch | PR review |
| `production` | `sodakedutech.in` | Neon main branch | Live site |

### 11.2 CI/CD

- GitHub Actions: lint → type-check → test → build on every PR
- Vercel: auto-deploys on push to `main`; preview deployments on PRs
- Prisma migrations run as a deploy step (`prisma migrate deploy`)
- Env vars managed in Vercel dashboard; never in git

### 11.3 Free-Tier Stack

| Service | Free tier limit | Risk |
|---|---|---|
| Vercel Hobby | 100 GB bandwidth/mo, 100 ISR calls/sec | Very low for this traffic level |
| Neon PostgreSQL | 512 MB storage, 1 compute unit | Low; content DB is small |
| Cloudflare R2 | 10 GB storage, 1M Class B ops/mo | Low for initial content volume |
| Resend | 3,000 emails/mo | Low; notification volume is minimal |
| Upstash Redis | 10,000 req/day | Low; rate-limiting only |

---

## 12. Acceptance Criteria

From BRD §10, expanded with software specifics:

| # | Criterion | Test method |
|---|---|---|
| AC-1 | Editor creates trainer with photo; live within 2 min, no deploy | Admin UI → publish; verify `/trainers/[slug]` updates within ISR window |
| AC-2 | Trainer with `consent_on_file = false` cannot be published | API PATCH `is_published: true` → expect 422 |
| AC-3 | Enquiry submitted from mobile arrives in admin inbox and notification email within 60s | End-to-end test with phone + email monitoring |
| AC-4 | Image published without alt text is rejected | API `POST /photos/:id/publish` with null alt → expect 422 |
| AC-5 | Mobile Lighthouse ≥ 90 on Home, Trainers, Programs | `lighthouse` CLI with mobile preset |
| AC-6 | All old anchor redirects return HTTP 301 | `curl -I /#trainers` → expect 301 to `/trainers` |
| AC-7 | Nightly backup runs 7 consecutive days | Check backup storage timestamps |
| AC-8 | Privacy policy and Terms linked in footer on every page | Automated link checker |
| AC-9 | RBAC: sales user cannot access trainer CRUD endpoints | API calls with sales session → expect 403 |
| AC-10 | Bulk photo upload of 20 images completes with progress feedback | Admin UI test; all 20 appear in library |
| AC-11 | FAQ cards on mentors page open/close on click (JS toggle) | Browser test: click `.faq-header`, verify `.faq-item.open` class added |
| AC-12 | Admin audit log records every publish action with actor and timestamp | Publish trainer; check `audit_log` table |

---

*End of SRS v1.0*

*This document was derived from BRD v1.0 and the approved wireframe at `C:/Users/DELL/Docs/wireframe/`. The wireframe is authoritative for all visual/layout decisions. This SRS is authoritative for all software/API/data decisions.*
