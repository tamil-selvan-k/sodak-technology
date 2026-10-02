# API Reference — SODAK Technology

Base path: `/api/v1/`

All responses use the standard envelope (see SRS §API Conventions). Auth is via NextAuth JWT session cookie. All write endpoints return `{ error: { code, message } }` on failure.

**Common error codes**

| HTTP | Code | Meaning |
|------|------|---------|
| 401 | `UNAUTHORIZED` | No valid session |
| 403 | `FORBIDDEN` | Role insufficient |
| 404 | `NOT_FOUND` | Record not found |
| 400/422 | `VALIDATION_ERROR` / `VALIDATION` | Zod parse failed; `details` field contains flatten output |
| 429 | `RATE_LIMITED` | 5 form submissions per IP per hour (Upstash sliding window) |
| 422 | `CONSENT_REQUIRED` | `consentOnFile = false` (trainers) |
| 422 | `CONSENT_VIOLATION` | `altText = null` or `studentConsentRef` missing (photos) |
| 422 | `TURNSTILE_FAILED` | Cloudflare Turnstile verification failed |

---

## Trainers

### `GET /api/v1/trainers`

List published trainers. **Auth: public**

**Query params**

| Param | Type | Description |
|-------|------|-------------|
| `stack` | `string` | Filter by stack slug |
| `company` | `string` | Case-insensitive company name contains |
| `search` | `string` | Case-insensitive name contains |
| `isMentor` | `"true"` \| `"false"` | Filter mentors vs. trainers |
| `page` | `number` | Default 1 |
| `perPage` | `number` | Default 20 |

**Response `200`**

```json
{
  "data": [ { ...trainer, "stacks": [ { "stack": { "id": "", "name": "", "slug": "" } } ] } ],
  "pagination": { "total": 48, "page": 1, "perPage": 20, "pages": 3 }
}
```

Results are served from Redis cache (TTL 120 s, version-key invalidated on mutations).

---

### `POST /api/v1/trainers`

Create a trainer. **Auth: editor+**

**Request body**

| Field | Type | Required |
|-------|------|----------|
| `name` | `string` (2–120) | Yes |
| `currentCompany` | `string` (≤120) | No |
| `designation` | `string` (≤120) | No |
| `expertiseTags` | `string[]` | No (default `[]`) |
| `bioHtml` | `string` | No |
| `yearsExperience` | `integer` (0–60) | No |
| `linkedinUrl` | `string` (URL) | No |
| `githubUrl` | `string` (URL) | No |
| `displayOrder` | `integer` | No (default `0`) |
| `isFeatured` | `boolean` | No (default `false`) |
| `isMentor` | `boolean` | No (default `false`) |
| `stackIds` | `string[]` (CUID) | No (default `[]`) |
| `mentorBio` | `string` | No |
| `sessionTypes` | `string[]` | No |
| `availabilityStatus` | `string` | No |
| `bookingUrl` | `string` (URL) | No |

**Response `201`** `{ "data": { ...trainer } }`

Slug is auto-generated from `name`. Writes audit log (`created / trainer`).

---

### `GET /api/v1/trainers/[id]`

Get single trainer by ID. **Auth: public**

**Response `200`** `{ "data": { ...trainer, stacks } }`

Includes unpublished trainers (admin use). Results cached by ID (TTL 300 s).

---

### `PATCH /api/v1/trainers/[id]`

Partial update. **Auth: editor+**

Body: same fields as POST, all optional. If `name` changes, slug is regenerated. Cache invalidated on save. Writes audit log.

**Response `200`** `{ "data": { ...trainer } }`

---

### `DELETE /api/v1/trainers/[id]`

Soft delete (sets `deletedAt`). **Auth: super_admin**

**Response `204`** No content. Writes audit log.

---

### `POST /api/v1/trainers/[id]/publish`

Publish a trainer. **Auth: editor+**

**Consent gate:** returns `422 CONSENT_REQUIRED` if `consentOnFile = false`.

On success, emits `trainer.published` event (triggers ISR revalidation of `/trainers`). Writes audit log.

**Response `200`** `{ "data": { ...trainer } }`

---

### `POST /api/v1/trainers/[id]/unpublish`

Unpublish a trainer. **Auth: editor+**

**Response `200`** `{ "data": { ...trainer } }`

---

## Programs

### `GET /api/v1/programs`

List published programs. **Auth: public**

**Query params**: `track` (trackCode), `stack` (slug), `search`, `page`

**Response `200`** `{ "data": [...], "pagination": { ... } }`

---

### `POST /api/v1/programs`

Create a program. **Auth: editor+**

| Field | Type | Required |
|-------|------|----------|
| `title` | `string` (2–200) | Yes |
| `trackCode` | `string` (1 char) | No |
| `summary` | `string` (≤500) | No |
| `descriptionHtml` | `string` | No |
| `duration` | `string` | No |
| `deliveryMode` | `string` | No |
| `targetAudience` | `string` | No |
| `prerequisites` | `string` | No |
| `syllabusJson` | `unknown` | No |
| `outcomes` | `string[]` | No |
| `isFeatured` | `boolean` | No |
| `stackIds` | `string[]` | No |

**Response `201`** `{ "data": { ...program } }`

---

### `POST /api/v1/programs/[id]/publish`

Publish a program. **Auth: editor+**

**Response `200`** `{ "data": { ...program } }`. Writes audit log.

---

### `POST /api/v1/programs/[id]/brochure`

Request signed S3 download URL for program brochure. **Auth: public (rate limited)**

Creates a lead record and emails the requester a `brochure-download` email containing a 1-hour signed URL.

| Field | Type | Required |
|-------|------|----------|
| `name` | `string` (2–100) | Yes |
| `email` | `string` (email) | Yes |
| `institution` | `string` (2–200) | No |
| `website_url` | `string` | No (honeypot) |

**Response `200`** `{ "data": { "url": "<signed-s3-url>" } }`

Returns `404` if program has no `brochureKey`.

---

## Institutions

### `GET /api/v1/institutions`

List published institutions. **Auth: public**

**Query params**: `type` (InstitutionType enum), `search`, `showOnHome` (`"true"`)

**Response `200`** `{ "data": [...], "pagination": { ... } }`

---

### `POST /api/v1/institutions`

Create an institution. **Auth: editor+**

| Field | Type | Required |
|-------|------|----------|
| `name` | `string` (2–200) | Yes |
| `logoUrl` | `string` (URL) | No |
| `city` | `string` | No |
| `state` | `string` | No |
| `type` | `InstitutionType` enum | No |
| `affiliation` | `string` | No |
| `website` | `string` (URL) | No |
| `shortDescription` | `string` (≤500) | No |
| `showOnHome` | `boolean` | No |
| `displayOrder` | `integer` | No |
| `logoPermission` | `boolean` | No |

**Response `201`** `{ "data": { ...institution } }`

---

### `POST /api/v1/institutions/[id]/publish`

Publish an institution. **Auth: editor+**

**Response `200`** `{ "data": { ...institution } }`. Writes audit log.

---

## Blog

### `GET /api/v1/blog`

List published blog posts. **Auth: public**

**Query params**: `category`, `tag`, `search`, `page`

**Response `200`** `{ "data": [...], "pagination": { ... } }`

---

### `POST /api/v1/blog`

Create a blog post (status = `draft`). **Auth: contributor+**

| Field | Type | Required |
|-------|------|----------|
| `title` | `string` (2–300) | Yes |
| `coverImageUrl` | `string` (URL) | No |
| `excerpt` | `string` (≤500) | No |
| `bodyHtml` | `string` | No |
| `authorId` | `string` | No |
| `category` | `string` | No |
| `tags` | `string[]` | No |
| `metaTitle` | `string` (≤60) | No |
| `metaDescription` | `string` (≤160) | No |
| `ogImageUrl` | `string` (URL) | No |

**Response `201`** `{ "data": { ...post } }`

---

### `GET /api/v1/blog/[id]`

Get single post by ID. **Auth: public**

**Response `200`** `{ "data": { ...post } }`

---

### `PATCH /api/v1/blog/[id]`

Update a post. **Auth: contributor+**

Contributors may only edit their own posts. Editors+ may edit any post. Body same as POST, all optional. Writes audit log.

**Response `200`** `{ "data": { ...post } }`

---

### `DELETE /api/v1/blog/[id]`

Soft delete a post. **Auth: editor+**

**Response `204`** No content. Writes audit log.

---

### `POST /api/v1/blog/[id]/submit-review`

Move a post from `draft` → `in_review`. **Auth: contributor+**

Contributors may only submit their own posts.

**Response `200`** `{ "data": { ...post } }`. Writes audit log.

---

### `POST /api/v1/blog/[id]/publish`

Publish a post (`in_review` → `published`). **Auth: editor+**

Sets `publishedAt`, `status = published`. Writes audit log.

**Response `200`** `{ "data": { ...post } }`

---

### `POST /api/v1/blog/[id]/unpublish`

Unpublish a post. **Auth: editor+**

**Response `200`** `{ "data": { ...post } }`

---

## Leads

### `GET /api/v1/leads`

List leads. **Auth: sales+**

**Query params**: `status` (LeadStatus enum), `source`, `page`

**Response `200`** `{ "data": [...], "pagination": { ... } }`

---

### `PATCH /api/v1/leads/[id]/status`

Update lead pipeline status. **Auth: sales+**

| Field | Type | Required |
|-------|------|----------|
| `status` | `"new"` \| `"contacted"` \| `"proposal_sent"` \| `"won"` \| `"lost"` | Yes |

**Response `200`** `{ "data": { ...lead } }`. Writes audit log.

---

### `POST /api/v1/leads/[id]/notes`

Add a note to a lead. **Auth: sales+**

| Field | Type | Required |
|-------|------|----------|
| `body` | `string` (1–5000) | Yes |

**Response `201`** `{ "data": { ...note } }`

---

### `GET /api/v1/leads/export`

Export leads as CSV. **Auth: sales+**

**Query params**: `from` (ISO 8601 datetime), `to` (ISO 8601 datetime)

**Response `200`** `text/csv` with filename `leads.csv`.

Columns: `id, name, email, phone, institution, status, source, createdAt`

Writes audit log (`EXPORT / lead / bulk`).

---

## Public Forms

All form endpoints are **public** (no auth), rate-limited to **5 submissions per IP per hour** (Upstash sliding window, `sodak:form` prefix). All accept a `website_url` honeypot field — if non-empty, returns `{ data: { ok: true } }` silently.

---

### `POST /api/v1/forms/enquiry`

Submit a contact enquiry. Creates a `Lead` record, sends `lead-notification` email to admin and `lead-acknowledgement` to submitter.

| Field | Type | Required |
|-------|------|----------|
| `name` | `string` (2–120) | Yes |
| `email` | `string` (email) | Yes |
| `turnstileToken` | `string` | Yes |
| `consent` | `true` (literal) | Yes |
| `role` | `"TPO"` \| `"HoD"` \| `"Student"` \| `"Corporate"` \| `"Other"` | No |
| `institutionOrCompany` | `string` (≤200) | No |
| `phone` | `string` (10–15) | No |
| `city` | `string` (≤100) | No |
| `programOfInterest` | `string` (≤200) | No |
| `batchSize` | `integer` (≥1) | No |
| `preferredTimeline` | `string` | No |
| `message` | `string` (≤2000) | No |
| `website_url` | `string` | No (honeypot) |
| `utm` | `object` | No (stored in `meta.utm`) |
| `referrer` | `string` | No (stored in `meta.referrer`) |

**Response `201`** `{ "data": { "id": "<lead-cuid>" } }`

---

### `POST /api/v1/forms/webinar`

Register for a webinar. Creates a `WebinarRegistration`, sends `webinar-acknowledgement` email.

| Field | Type | Required |
|-------|------|----------|
| `name` | `string` (2–100) | Yes |
| `email` | `string` (email) | Yes |
| `phone` | `string` (phone) | Yes |
| `webinarId` | `string` (CUID) | Yes |
| `website_url` | `string` | No (honeypot) |
| `cfTurnstileToken` | `string` | No |

**Response `200`** `{ "data": { "ok": true } }`

---

### `POST /api/v1/forms/internship`

Apply for an internship. Creates an `InternshipApplication`, sends `internship-acknowledgement` email.

| Field | Type | Required |
|-------|------|----------|
| `name` | `string` (2–100) | Yes |
| `email` | `string` (email) | Yes |
| `phone` | `string` (phone) | Yes |
| `internshipId` | `string` (CUID) | Yes |
| `collegeName` | `string` (2–200) | No |
| `cgpa` | `number` (0–10) | No |
| `website_url` | `string` | No (honeypot) |

**Response `200`** `{ "data": { "ok": true } }`

---

### `POST /api/v1/forms/careers`

Apply for a job. Creates a `JobApplication` record.

| Field | Type | Required |
|-------|------|----------|
| `jobId` | `string` (CUID) | Yes |
| `name` | `string` (2–100) | Yes |
| `email` | `string` (email) | Yes |
| `phone` | `string` (phone) | Yes |
| `resumeFileKey` | `string` | Yes |
| `coverLetterUrl` | `string` (URL) | No |
| `website_url` | `string` | No (honeypot) |

**Response `201`** `{ "data": { ...application } }`

---

## Gallery (Photos)

### `GET /api/v1/photos`

List published photos. **Auth: public**

**Query params**: `institution` (institutionId), `year`

**Response `200`** `{ "data": [...], "meta": { pagination } }`

---

### `POST /api/v1/photos`

Create a photo record (metadata only; file must already be uploaded to S3). **Auth: contributor+**

| Field | Type | Required |
|-------|------|----------|
| `r2Key` | `string` | Yes |
| `url` | `string` (URL) | Yes |
| `altText` | `string` (≤500) | No |
| `caption` | `string` (≤500) | No |
| `institutionId` | `string` | No |
| `tags` | `string[]` | No |
| `dateTaken` | `string` (ISO 8601) | No |
| `hasStudentFaces` | `boolean` | No (default `false`) |
| `studentConsentRef` | `string` | No |
| `displayOrder` | `integer` | No |

**Response `201`** `{ "data": { ...photo } }`

---

### `GET /api/v1/photos/[id]`

Get single photo by ID. **Auth: public**

**Response `200`** `{ "data": { ...photo } }`

---

### `PATCH /api/v1/photos/[id]`

Update photo metadata. **Auth: editor+**

Updatable fields: `title`, `altText`, `caption`, `institutionId`, `tags`, `displayOrder`, `hasStudentFaces`, `studentConsentRef`. Writes audit log.

**Response `200`** `{ "data": { ...photo } }`

---

### `DELETE /api/v1/photos/[id]`

Soft delete a photo. **Auth: super_admin**

**Response `204`** No content. Writes audit log.

---

### `POST /api/v1/photos/[id]/publish`

Publish a photo. **Auth: editor+**

**Consent gates (both enforced in `gallery.service`):**
- `altText = null` → `422 CONSENT_VIOLATION`
- `hasStudentFaces = true` and `studentConsentRef = null` → `422 CONSENT_VIOLATION`

**Response `200`** `{ "data": { ...photo } }`. Writes audit log.

---

### `POST /api/v1/photos/bulk`

Bulk publish / unpublish / soft-delete up to 50 photos. **Auth: editor+ (delete requires super_admin)**

| Field | Type | Required |
|-------|------|----------|
| `ids` | `string[]` (CUID, 1–50) | Yes |
| `action` | `"publish"` \| `"unpublish"` \| `"delete"` | Yes |

Publish: per-row consent gates enforced; failures reported individually, batch is not aborted.

**Response `200`** `{ "data": { "affected": 5, "failed": [ { "id": "...", "ok": false, "error": "..." } ] } }`

Returns `422` if **all** rows failed.

---

### `GET /api/v1/photos/upload-progress`

Server-Sent Events stream of bulk upload progress. **Auth: contributor+**

**Query params**: `jobId` (required)

Polls Redis key `upload:progress:{jobId}` every 500 ms. Closes when `done >= total` or after 60 s (120 ticks × 500 ms).

**Response**: `text/event-stream` — each event is JSON `{ done: number, total: number, errors: string[] }`.

---

## Media

### `GET /api/v1/media`

List uploaded media files (paginated, 40 per page). **Auth: any authenticated user**

**Query params**: `page`

**Response `200`** `{ "data": [...], "meta": { total, page, perPage, pages } }`

---

### `POST /api/v1/media`

Upload a file. **Auth: contributor+**

**Request**: `multipart/form-data` with a `file` field.

- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `application/pdf`
- Max size: 10 MB
- Images are processed through Sharp pipeline (original + lg/md/sm/thumb WebP + lg/md AVIF)

**Response `201`** `{ "data": { ...mediaFile, "variants": { "original": "...", "lg": "...", ... } } }`

---

### `DELETE /api/v1/media/[id]`

Soft delete + physical deletion from S3. **Auth: editor+**

**Response `204`** No content. Writes audit log.

---

## Webinars

### `GET /api/v1/webinars`

List published webinars. **Auth: public**

**Query params**: `upcoming` (`"true"`)

**Response `200`** `{ "data": [...], "meta": { pagination } }`

---

### `POST /api/v1/webinars`

Create a webinar. **Auth: editor+**

| Field | Type | Required |
|-------|------|----------|
| `title` | `string` (2–200) | Yes |
| `description` | `string` | No |
| `presenterId` | `string` (CUID) | No |
| `scheduledAt` | `string` (ISO 8601) | No |
| `durationMinutes` | `integer` (≥1) | No |
| `platform` | `"Zoom"` \| `"Meet"` \| `"Teams"` | No |
| `registrationUrl` | `string` (URL) | No |

**Response `201`** `{ "data": { ...webinar } }`

---

### `GET /api/v1/webinars/[id]`

Get single webinar (includes presenter). **Auth: public**

**Response `200`** `{ "data": { ...webinar, "presenter": {...} } }`

---

### `PATCH /api/v1/webinars/[id]`

Update a webinar. **Auth: editor+**

Same fields as POST, all optional. Writes audit log.

**Response `200`** `{ "data": { ...webinar } }`

---

### `DELETE /api/v1/webinars/[id]`

Soft delete. **Auth: editor+**

**Response `204`** Writes audit log.

---

### `POST /api/v1/webinars/[id]/publish`

Publish a webinar. **Auth: editor+**

**Response `200`** `{ "data": { ...webinar } }`. Writes audit log.

---

### `POST /api/v1/webinars/[id]/unpublish`

Unpublish a webinar. **Auth: editor+**

**Response `200`** `{ "data": { ...webinar } }`

---

## Internships

### `GET /api/v1/internships`

List published internships. **Auth: public**

**Query params**: `stack`

**Response `200`** `{ "data": [...], "meta": { pagination } }`

---

### `POST /api/v1/internships`

Create an internship. **Auth: editor+**

| Field | Type | Required |
|-------|------|----------|
| `companyName` | `string` (2–200) | Yes |
| `roleTitle` | `string` (2–200) | Yes |
| `companyLogoUrl` | `string` (URL) | No |
| `location` | `string` | No |
| `duration` | `string` | No |
| `stipendRange` | `string` | No |
| `stackTags` | `string[]` | No |
| `description` | `string` | No |
| `requirements` | `string[]` | No |
| `applicationDeadline` | `string` (ISO 8601) | No |

**Response `201`** `{ "data": { ...internship } }`

---

### `GET /api/v1/internships/[id]`

Get single internship. **Auth: public**

**Response `200`** `{ "data": { ...internship } }`

---

### `PATCH /api/v1/internships/[id]`

Update an internship. **Auth: editor+**

All fields optional. Writes audit log.

**Response `200`** `{ "data": { ...internship } }`

---

### `DELETE /api/v1/internships/[id]`

Soft delete. **Auth: editor+**

**Response `204`**. Writes audit log.

---

### `POST /api/v1/internships/[id]/publish`

Publish an internship. **Auth: editor+**

**Response `200`** `{ "data": { ...internship } }`

---

### `POST /api/v1/internships/[id]/unpublish`

Unpublish an internship. **Auth: editor+**

**Response `200`** `{ "data": { ...internship } }`

---

## Careers

### `GET /api/v1/careers`

List job posts. **Auth: public**

**Query params**: `department`, `open` (default `true`)

**Response `200`** `{ "data": [...], "meta": { pagination } }`

---

### `POST /api/v1/careers`

Create a job post. **Auth: editor+**

| Field | Type | Required |
|-------|------|----------|
| `title` | `string` (2–200) | Yes |
| `department` | `string` | No |
| `location` | `string` | No |
| `employmentType` | `string` | No |
| `experienceMin` | `integer` (≥0) | No |
| `experienceMax` | `integer` (≥0) | No |
| `descriptionHtml` | `string` | No |
| `responsibilities` | `string[]` | No |
| `requirements` | `string[]` | No |
| `isOpen` | `boolean` | No (default `true`) |
| `closesOn` | `string` (ISO 8601) | No |

**Response `201`** `{ "data": { ...jobPost } }`

---

### `GET /api/v1/careers/[id]`

Get single job post. **Auth: public**

**Response `200`** `{ "data": { ...jobPost } }`

---

### `PATCH /api/v1/careers/[id]`

Update a job post. **Auth: editor+**

All fields optional. Writes audit log.

**Response `200`** `{ "data": { ...jobPost } }`

---

### `DELETE /api/v1/careers/[id]`

Soft delete. **Auth: editor+**

**Response `204`**. Writes audit log.

---

### `POST /api/v1/careers/[id]/publish`

Publish a job post. **Auth: editor+**

**Response `200`** `{ "data": { ...jobPost } }`

---

## Stacks

### `GET /api/v1/stacks`

List all stacks with their technologies. **Auth: public**

No query params. Returns all stacks; no pagination.

**Response `200`** `{ "data": [ { ...stack, "technologies": [...] } ] }`

---

## Users

### `GET /api/v1/users/[id]`

Get a user profile (non-sensitive fields only). **Auth: super_admin**

**Response `200`** `{ "data": { "id", "name", "email", "role", "isActive", "createdAt" } }`

---

### `PATCH /api/v1/users/[id]`

Update user role / active state. **Auth: super_admin**

| Field | Type | Required |
|-------|------|----------|
| `role` | `"super_admin"` \| `"editor"` \| `"contributor"` \| `"sales"` | No |
| `isActive` | `boolean` | No |
| `name` | `string` (1–120) \| `null` | No |

Guards: cannot deactivate own account; cannot downgrade own role.

**Response `200`** `{ "data": { ...user } }`

---

## Settings

### `GET /api/v1/settings`

Get site settings (single row). **Auth: any authenticated user**

**Response `200`** `{ "data": { ...siteSetting } }`

---

### `PATCH /api/v1/settings`

Update site settings. **Auth: super_admin**

| Field | Type |
|-------|------|
| `heroHeadline` | `string` (≤200) |
| `heroSubhead` | `string` (≤400) |
| `heroImageUrl` | `string` (URL) |
| `notificationEmail` | `string` (email) |
| `stats` | `Record<string, number>` |
| `socialLinks` | `Record<string, string>` |

All optional. **Response `200`** `{ "data": { ...siteSetting } }`

---

## Audit Log

### `GET /api/v1/audit-log`

Paginated audit log. **Auth: super_admin**

**Query params**: `entity` (entityType filter), `actor` (actorId filter), `page`

**Response `200`**

```json
{
  "data": [
    {
      "id": "...",
      "actorId": "...",
      "action": "published",
      "entityType": "trainer",
      "entityId": "...",
      "oldValue": null,
      "newValue": { ... },
      "createdAt": "...",
      "actor": { "id": "...", "name": "...", "email": "..." }
    }
  ],
  "meta": { "total": 200, "page": 1, "perPage": 20, "pages": 10 }
}
```

---

## Redirects

### `GET /api/v1/redirects`

List all redirect rules. **Auth: public**

**Response `200`** `{ "data": [ { "id", "source", "destination", "isPermanent" } ] }`

These are also exported to `next.config.mjs` at build time.

---

### `POST /api/v1/redirects`

Create a redirect rule. **Auth: super_admin**

| Field | Type | Required |
|-------|------|----------|
| `source` | `string` (must start with `/`) | Yes |
| `destination` | `string` (must start with `/`) | Yes |
| `isPermanent` | `boolean` | No (default `false`) |

**Response `201`** `{ "data": { ...redirect } }`. Writes audit log.

---

### `DELETE /api/v1/redirects`

Delete a redirect rule. **Auth: super_admin**

**Request body**: `{ "id": "<redirect-id>" }`

**Response `204`**. Writes audit log.
