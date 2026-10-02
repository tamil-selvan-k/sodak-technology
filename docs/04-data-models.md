# Data Models — SODAK Technology

Source: `prisma/schema.prisma`. All IDs are CUID strings unless noted. Timestamps are UTC.

---

## Enums

### `UserRole`
| Value | Description |
|-------|-------------|
| `super_admin` | Full access, user management, settings, delete |
| `editor` | Content CRUD + publish; no user management |
| `contributor` | Edit own trainer profile, submit blog drafts |
| `sales` | Read/update leads; no content access |

### `InstitutionType`
`Engineering` | `Arts` | `Polytechnic` | `University` | `Corporate`

### `DeliveryMode`
`on_campus` | `hybrid` | `online`

### `LeadStatus`
`new` | `contacted` | `proposal_sent` | `won` | `lost`

### `BlogStatus`
`draft` | `in_review` | `published`

### `JobApplicationStatus`
`new` | `reviewed` | `shortlisted` | `rejected`

---

## Auth Models (NextAuth v5)

### `User` (`users`)

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `String` | No | `cuid()` | PK |
| `name` | `String?` | Yes | — | |
| `email` | `String` | No | — | Unique |
| `emailVerified` | `DateTime?` | Yes | — | |
| `image` | `String?` | Yes | — | |
| `passwordHash` | `String?` | Yes | — | Argon2id hash |
| `role` | `UserRole` | No | `editor` | |
| `isActive` | `Boolean` | No | `true` | Deactivated users cannot log in |
| `createdAt` | `DateTime` | No | `now()` | |
| `updatedAt` | `DateTime` | No | auto | |

Relations: `accounts[]`, `sessions[]`, `leadNotes[]`, `auditLogs[]`, `photos[]`, `mediaFiles[]`

---

### `Account` (`accounts`)

NextAuth OAuth account links. Fields: `userId`, `type`, `provider`, `providerAccountId` (unique together), token fields. Cascade-deletes with User.

### `Session` (`sessions`)

| Column | Type |
|--------|------|
| `sessionToken` | `String` unique |
| `userId` | `String` FK → User |
| `expires` | `DateTime` |

### `VerificationToken` (`verification_tokens`)

| Column | Type |
|--------|------|
| `identifier` | `String` |
| `token` | `String` unique |
| `expires` | `DateTime` |

---

## Trainers & Mentors

### `Trainer` (`trainers`)

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `String` | No | `cuid()` | PK |
| `name` | `String` | No | — | |
| `slug` | `String` | No | — | Unique; auto-generated from name |
| `photoUrl` | `String?` | Yes | — | |
| `currentCompany` | `String?` | Yes | — | |
| `designation` | `String?` | Yes | — | |
| `expertiseTags` | `String[]` | No | `[]` | PostgreSQL text array |
| `bioHtml` | `String?` | Yes | — | Long text |
| `yearsExperience` | `Int?` | Yes | — | |
| `linkedinUrl` | `String?` | Yes | — | |
| `githubUrl` | `String?` | Yes | — | |
| `displayOrder` | `Int` | No | `0` | |
| `isFeatured` | `Boolean` | No | `false` | |
| `isMentor` | `Boolean` | No | `false` | Shared table; mentor-only fields below |
| `isPublished` | `Boolean` | No | `false` | |
| `consentOnFile` | `Boolean` | No | `false` | **Consent gate** — must be `true` before publishing |
| `mentorBio` | `String?` | Yes | — | |
| `sessionTypes` | `String[]` | No | `[]` | |
| `availabilityStatus` | `String?` | Yes | — | |
| `bookingUrl` | `String?` | Yes | — | |
| `createdAt` | `DateTime` | No | `now()` | |
| `updatedAt` | `DateTime` | No | auto | |
| `deletedAt` | `DateTime?` | Yes | — | Soft delete |

Relations: `stacks` (TrainerStack[]), `blogPosts` (BlogPost[]), `webinars` (Webinar[])

**Consent gate:** `publishTrainer()` throws `ConsentError` (HTTP 422) when `consentOnFile = false`.

---

### `Stack` (`stacks`)

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | `String` | No | `cuid()` |
| `name` | `String` | No | — |
| `slug` | `String` | No | — | Unique |
| `icon` | `String?` | Yes | — |
| `summary` | `String?` | Yes | — |
| `colorToken` | `String?` | Yes | — |
| `displayOrder` | `Int` | No | `0` |

Relations: `technologies[]`, `trainerStacks[]`, `programStacks[]`

---

### `Technology` (`technologies`)

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | `String` | No | `cuid()` |
| `name` | `String` | No | — | Unique per stack |
| `logoUrl` | `String?` | Yes | — |
| `stackId` | `String` | No | — | FK → Stack |
| `displayOrder` | `Int` | No | `0` |

Composite unique: `[name, stackId]`

---

### `TrainerStack` (`trainer_stacks`)

Junction table. PK: `[trainerId, stackId]`. Cascade-deletes with Trainer or Stack.

---

## Programs

### `Program` (`programs`)

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | `String` | No | `cuid()` |
| `title` | `String` | No | — |
| `slug` | `String` | No | — | Unique |
| `trackCode` | `String?` | Yes | — | Single char; groups related programs |
| `summary` | `String?` | Yes | — |
| `descriptionHtml` | `String?` | Yes | — | Long text |
| `duration` | `String?` | Yes | — |
| `deliveryMode` | `String?` | Yes | — | Free-form (not the enum) |
| `targetAudience` | `String?` | Yes | — |
| `prerequisites` | `String?` | Yes | — |
| `syllabusJson` | `Json?` | Yes | — | Arbitrary syllabus structure |
| `outcomes` | `String[]` | No | `[]` | |
| `brochurePdfUrl` | `String?` | Yes | — | Public URL |
| `brochureKey` | `String?` | Yes | — | S3 key; used to generate signed URL |
| `isFeatured` | `Boolean` | No | `false` | |
| `isPublished` | `Boolean` | No | `false` | |
| `createdAt` / `updatedAt` / `deletedAt` | — | — | — | Standard timestamps |

Relations: `stacks` (ProgramStack[])

### `ProgramStack` (`program_stacks`)

Junction table. PK: `[programId, stackId]`.

---

## Gallery

### `Photo` (`photos`)

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `String` | No | `cuid()` | |
| `title` | `String?` | Yes | — | |
| `altText` | `String?` | Yes | — | **Consent gate** — must not be null before publishing |
| `caption` | `String?` | Yes | — | |
| `r2Key` | `String?` | Yes | — | S3/R2 object key |
| `url` | `String` | No | — | Public URL |
| `institutionId` | `String?` | Yes | — | FK → Institution |
| `dateTaken` | `DateTime?` | Yes | — | |
| `tags` | `String[]` | No | `[]` | |
| `displayOrder` | `Int` | No | `0` | |
| `isPublished` | `Boolean` | No | `false` | |
| `hasStudentFaces` | `Boolean` | No | `false` | |
| `studentConsentRef` | `String?` | Yes | — | **Consent gate** — required when `hasStudentFaces = true` |
| `uploadedById` | `String?` | Yes | — | FK → User |
| `createdAt` | `DateTime` | No | `now()` | |
| `deletedAt` | `DateTime?` | Yes | — | Soft delete |

**Consent gates (service layer):**
- `altText = null` → publish blocked (`AltTextError`)
- `hasStudentFaces = true` AND `studentConsentRef = null` → publish blocked (`ConsentError`)

### `MediaFile` (`media_files`)

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | `String` | No | |
| `key` | `String` | No | Unique S3 key |
| `url` | `String` | No | Public URL |
| `mimeType` | `String` | No | |
| `sizeBytes` | `Int` | No | |
| `originalName` | `String` | No | |
| `variants` | `Json?` | Yes | `{ "original": "...", "lg": "...", "md": "...", "sm": "...", "thumb": "...", "lg_avif": "...", "md_avif": "..." }` |
| `uploadedById` | `String?` | Yes | FK → User |
| `createdAt` | `DateTime` | No | |
| `deletedAt` | `DateTime?` | Yes | Soft delete |

---

## Blog

### `BlogPost` (`blog_posts`)

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | `String` | No | `cuid()` |
| `title` | `String` | No | — |
| `slug` | `String` | No | — | Unique |
| `coverImageUrl` | `String?` | Yes | — |
| `excerpt` | `String?` | Yes | — |
| `bodyHtml` | `String?` | Yes | — | Long text |
| `authorId` | `String?` | Yes | — | FK → Trainer |
| `category` | `String?` | Yes | — |
| `tags` | `String[]` | No | `[]` |
| `readingTimeMinutes` | `Int?` | Yes | — |
| `publishedAt` | `DateTime?` | Yes | — |
| `status` | `BlogStatus` | No | `draft` |
| `metaTitle` | `String?` | Yes | — |
| `metaDescription` | `String?` | Yes | — |
| `ogImageUrl` | `String?` | Yes | — |
| `createdAt` / `updatedAt` / `deletedAt` | — | — | — |

Relations: `author` (Trainer?), `relatedFrom[]`, `relatedTo[]` (PostRelated)

**Workflow:** `draft → in_review` (contributor submits) → `published` (editor only). Contributors cannot self-publish.

### `PostRelated` (`post_related`)

Junction table tracking related post pairs. PK: `[postId, relatedPostId]`. Populated at publish time (top-3 posts sharing the most tags).

---

## Leads

### `Lead` (`leads`)

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | `String` | No | `cuid()` |
| `name` | `String` | No | — |
| `role` | `String?` | Yes | — | TPO / HoD / Student / Corporate / Other |
| `institutionOrCompany` | `String?` | Yes | — |
| `email` | `String` | No | — |
| `phone` | `String?` | Yes | — |
| `city` | `String?` | Yes | — |
| `programOfInterest` | `String?` | Yes | — |
| `batchSize` | `Int?` | Yes | — |
| `preferredTimeline` | `String?` | Yes | — |
| `message` | `String?` | Yes | — | Long text |
| `source` | `String?` | Yes | — | `enquiry-form`, `brochure_download`, etc. |
| `status` | `LeadStatus` | No | `new` |
| `meta` | `Json?` | Yes | — | `{ utm: {...}, referrer: "..." }` |
| `createdAt` | `DateTime` | No | `now()` |

Relations: `notes` (LeadNote[])

No `deletedAt` — leads are never soft-deleted.

### `LeadNote` (`lead_notes`)

| Column | Type | Notes |
|--------|------|-------|
| `id` | `String` | |
| `leadId` | `String` | FK → Lead (cascade delete) |
| `authorId` | `String` | FK → User |
| `body` | `String` | Long text |
| `createdAt` | `DateTime` | |

---

## Careers

### `JobPost` (`job_posts`)

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | `String` | No | `cuid()` |
| `title` | `String` | No | — |
| `slug` | `String` | No | — | Unique |
| `department` | `String?` | Yes | — |
| `location` | `String?` | Yes | — |
| `employmentType` | `String?` | Yes | — |
| `experienceMin` | `Int?` | Yes | — |
| `experienceMax` | `Int?` | Yes | — |
| `descriptionHtml` | `String?` | Yes | — |
| `responsibilities` | `String[]` | No | `[]` |
| `requirements` | `String[]` | No | `[]` |
| `isOpen` | `Boolean` | No | `true` |
| `closesOn` | `DateTime?` | Yes | — |
| `isPublished` | `Boolean` | No | `false` |
| `createdAt` / `updatedAt` / `deletedAt` | — | — | — |

Relations: `applications` (JobApplication[])

### `JobApplication` (`job_applications`)

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | `String` | No | `cuid()` |
| `jobPostId` | `String` | No | — | FK → JobPost (cascade delete) |
| `applicantName` | `String` | No | — |
| `email` | `String` | No | — |
| `phone` | `String?` | Yes | — |
| `yearsExperience` | `Int?` | Yes | — |
| `coverNote` | `String?` | Yes | — |
| `resumeUrl` | `String?` | Yes | — | S3 key stored here |
| `status` | `JobApplicationStatus` | No | `new` |
| `appliedAt` | `DateTime` | No | `now()` |

---

## Webinars

### `Webinar` (`webinars`)

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | `String` | No | `cuid()` |
| `title` | `String` | No | — |
| `slug` | `String` | No | — | Unique |
| `description` | `String?` | Yes | — |
| `presenterId` | `String?` | Yes | — | FK → Trainer |
| `scheduledAt` | `DateTime?` | Yes | — |
| `durationMinutes` | `Int?` | Yes | — |
| `platform` | `String?` | Yes | — | Zoom / Meet / Teams |
| `registrationUrl` | `String?` | Yes | — |
| `isPublished` | `Boolean` | No | `false` |
| `createdAt` / `updatedAt` / `deletedAt` | — | — | — |

Relations: `presenter` (Trainer?), `registrations` (WebinarRegistration[])

### `WebinarRegistration` (`webinar_registrations`)

| Column | Type | Nullable |
|--------|------|----------|
| `id` | `String` | No |
| `webinarId` | `String` | No | FK → Webinar (cascade delete) |
| `name` | `String` | No |
| `email` | `String` | No |
| `phone` | `String?` | Yes |
| `createdAt` | `DateTime` | No |

---

## Internships

### `Internship` (`internships`)

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | `String` | No | `cuid()` |
| `companyName` | `String` | No | — |
| `companyLogoUrl` | `String?` | Yes | — |
| `roleTitle` | `String` | No | — |
| `location` | `String?` | Yes | — |
| `duration` | `String?` | Yes | — |
| `stipendRange` | `String?` | Yes | — |
| `stackTags` | `String[]` | No | `[]` |
| `description` | `String?` | Yes | — |
| `requirements` | `String[]` | No | `[]` |
| `applicationDeadline` | `DateTime?` | Yes | — |
| `isPublished` | `Boolean` | No | `false` |
| `createdAt` / `updatedAt` / `deletedAt` | — | — | — |

Relations: `applications` (InternshipApplication[])

### `InternshipApplication` (`internship_applications`)

| Column | Type | Nullable |
|--------|------|----------|
| `id` | `String` | No |
| `internshipId` | `String` | No | FK → Internship (cascade delete) |
| `name` | `String` | No |
| `email` | `String` | No |
| `phone` | `String?` | Yes |
| `collegeName` | `String?` | Yes |
| `cgpa` | `Float?` | Yes |
| `createdAt` | `DateTime` | No |

---

## Institutions

### `Institution` (`institutions`)

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `String` | No | `cuid()` | |
| `name` | `String` | No | — | |
| `slug` | `String` | No | — | Unique |
| `logoUrl` | `String?` | Yes | — | |
| `city` | `String?` | Yes | — | |
| `state` | `String?` | Yes | — | |
| `type` | `InstitutionType?` | Yes | — | |
| `affiliation` | `String?` | Yes | — | |
| `website` | `String?` | Yes | — | |
| `shortDescription` | `String?` | Yes | — | |
| `isPublished` | `Boolean` | No | `false` | |
| `showOnHome` | `Boolean` | No | `false` | |
| `displayOrder` | `Int` | No | `0` | |
| `logoPermission` | `Boolean` | No | `false` | **Consent gate** — logo must not be rendered when `false`; render text name instead |
| `createdAt` / `updatedAt` / `deletedAt` | — | — | — | |

Relations: `engagements` (InstitutionEngagement[]), `photos` (Photo[])

### `InstitutionEngagement` (`institution_engagements`)

| Column | Type | Nullable |
|--------|------|----------|
| `id` | `String` | No |
| `institutionId` | `String` | No | FK → Institution (cascade delete) |
| `programDelivered` | `String?` | Yes |
| `stacks` | `String[]` | No |
| `startDate` / `endDate` | `DateTime?` | Yes |
| `batchSize` | `Int?` | Yes |
| `yearOfStudents` | `String?` | Yes |
| `deliveryMode` | `DeliveryMode?` | Yes |
| `outcomeNotes` | `String?` | Yes | Long text |
| `testimonialText` | `String?` | Yes | Long text |
| `testimonialSource` | `String?` | Yes |

---

## Audit Log

### `AuditLog` (`audit_log`)

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | `String` | No | `cuid()` |
| `actorId` | `String` | No | FK → User |
| `action` | `String` | No | `created`, `updated`, `deleted`, `published`, `unpublished`, `EXPORT`, etc. |
| `entityType` | `String` | No | `trainer`, `blog_post`, `lead`, `photo`, `media`, etc. |
| `entityId` | `String` | No | ID of the affected row (`"bulk"` for batch operations) |
| `oldValue` | `Json?` | Yes | State before change |
| `newValue` | `Json?` | Yes | State after change |
| `createdAt` | `DateTime` | No | `now()` |

---

## Site Settings

### `SiteSetting` (`site_settings`)

Single-row table; PK is always `1`.

| Column | Type | Nullable |
|--------|------|----------|
| `id` | `Int` | No | Always `1` |
| `heroHeadline` | `String?` | Yes |
| `heroSubhead` | `String?` | Yes |
| `heroImageUrl` | `String?` | Yes |
| `notificationEmail` | `String?` | Yes |
| `stats` | `Json?` | Yes | `Record<string, number>` |
| `socialLinks` | `Json?` | Yes | `Record<string, string>` |
| `updatedAt` | `DateTime` | No |

---

## Redirects

### `Redirect` (`redirects`)

| Column | Type | Default |
|--------|------|---------|
| `id` | `String` | `cuid()` |
| `source` | `String` | — | Unique; relative path starting with `/` |
| `destination` | `String` | — | Relative path starting with `/` |
| `isPermanent` | `Boolean` | `true` |

Exported to `next.config.mjs` at build time via `getRedirects()`.

---

## Soft Delete Convention

Models with a `deletedAt` field: `Trainer`, `Institution`, `Program`, `Photo`, `MediaFile`, `BlogPost`, `JobPost`, `Webinar`, `Internship`.

All service queries filter `where: { deletedAt: null }`. Hard-delete cron after 30 days is planned but not yet implemented.
