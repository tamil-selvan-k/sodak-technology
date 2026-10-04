# SODAK Technology

A production-ready, CMS-driven technology and campus placement training platform built with Next.js, TypeScript, Prisma, PostgreSQL, Redis, AWS S3, Resend, and NextAuth.

SODAK Technology is a full-stack web platform for managing technology training programs, trainers, mentors, partner institutions, internships, webinars, careers, insights, leads, and media through a public website and a role-based admin CMS.

## Features

- Public-facing corporate website
- Role-based admin CMS
- Trainer and mentor management
- Technology stack management
- Training program management
- Institution and partnership management
- Blog and insights management
- Internship listings and applications
- Career listings and applications
- Webinar management and registrations
- Lead management and sales pipeline
- Media library and gallery
- Image optimization with Sharp
- AWS S3 media storage
- CloudFront CDN support
- Transactional emails with Resend
- PostgreSQL database with Prisma ORM
- Redis caching and rate limiting
- NextAuth authentication
- Role-based authorization
- Cloudflare Turnstile protection
- Audit logging
- Consent-based publishing
- Vercel deployment
- GitHub Actions CI/CD

## Tech Stack

### Frontend

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Next.js App Router
- React Server Components

### Backend

- Next.js Route Handlers
- REST API
- Prisma ORM
- PostgreSQL
- Zod

### Authentication

- NextAuth.js v5
- Argon2
- Prisma Adapter
- Role-Based Access Control

### Infrastructure

- Supabase PostgreSQL
- Upstash Redis
- AWS S3
- AWS CloudFront
- Resend
- Cloudflare Turnstile
- Vercel
- GitHub Actions

## Architecture

                         ┌───────────────────┐
                         │      Visitors     │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │     Next.js       │
                         │   App Router      │
                         └─────────┬─────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
        Public Website          REST API            Admin CMS
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │  Service Layer    │
                         └─────────┬─────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
         PostgreSQL              Redis                S3
         + Prisma           Cache/Rate Limit       Media
                                                        │
                                                        ▼
                                                   CloudFront
                                   │
                                   ▼
                                Resend

## User Roles

| Role | Capabilities |
|---|---|
| super_admin | Full platform access, user management, settings, audit logs and destructive operations |
| editor | Create, edit and publish platform content |
| contributor | Create/edit permitted content and submit blog posts for review |
| sales | Manage leads, pipeline status, notes and exports |
| Visitor | Browse published content and submit public forms |

Authorization is enforced on the server side and is not dependent on frontend UI visibility.

## Main Modules

src/modules/
├── blog/
├── careers/
├── gallery/
├── institutions/
├── internships/
├── leads/
├── programs/
├── settings/
├── stacks/
├── trainers/
└── webinars/

Each module contains:

module/
├── module.service.ts
├── module.schema.ts
└── module.types.ts

Shared infrastructure is located in:

src/lib/

## Public Website

The public platform provides:

- Home
- About
- Training
- Programs
- Trainers
- Mentors
- Institutions
- Internships
- Webinars
- Gallery
- Insights
- Careers
- Contact
- Platform
  - LMS
  - CTF
  - Assessments

## Admin CMS

The admin panel provides:

/admin
├── Dashboard
├── Trainers
├── Programs
├── Institutions
├── Internships
├── Webinars
├── Blog
├── Gallery
├── Media
├── Leads
├── Careers
├── Users
├── Settings
└── Audit Log

## Publishing Workflow

Content can move through controlled publishing states:

Draft
  │
  ▼
In Review
  │
  ▼
Published

Publishing operations can trigger cache invalidation and application events.

Trainer publishing additionally requires the appropriate consent flag.

## REST API

All application APIs use the /api/v1 prefix.

### Content APIs

/api/v1/trainers
/api/v1/programs
/api/v1/institutions
/api/v1/blog
/api/v1/careers
/api/v1/internships
/api/v1/webinars
/api/v1/photos
/api/v1/media
/api/v1/stacks

### Management APIs

/api/v1/leads
/api/v1/users
/api/v1/settings
/api/v1/audit-log
/api/v1/redirects

### Public Forms

POST /api/v1/forms/enquiry
POST /api/v1/forms/careers
POST /api/v1/forms/internship
POST /api/v1/forms/webinar

### Example

GET /api/v1/trainers

Filter trainers:

GET /api/v1/trainers?stack=full-stack-web&isMentor=false&page=1&perPage=20

Create a trainer:

POST /api/v1/trainers
Content-Type: application/json

## API Response Format

Successful responses use a standard data envelope:

{
  "data": {}
}

Paginated responses:

{
  "data": [],
  "pagination": {
    "total": 100,
    "page": 1,
    "perPage": 20,
    "pages": 5
  }
}

Errors:

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request"
  }
}

Common error codes:

- UNAUTHORIZED
- FORBIDDEN
- NOT_FOUND
- VALIDATION_ERROR
- RATE_LIMITED
- CONSENT_REQUIRED
- CONSENT_VIOLATION
- TURNSTILE_FAILED

## Image Processing

Uploaded images are processed using Sharp.

| Variant | Format | Max Width |
|---|---|---:|
| original | Original | Original |
| lg | WebP | 1200px |
| md | WebP | 800px |
| sm | WebP | 400px |
| thumb | WebP | 200px |
| lg_avif | AVIF | 1200px |
| md_avif | AVIF | 800px |

Images are stored in AWS S3 and can optionally be served through CloudFront.

## Redis

Redis is used for:

- API caching
- Cache invalidation
- Rate limiting
- Request counters
- Temporary application state

Production: Upstash Redis

Development: ioredis

## Email

Transactional email is handled through Resend.

Supported email flows include:

- New enquiry notification
- Enquiry acknowledgement
- Webinar registration acknowledgement
- Internship application acknowledgement
- Program brochure delivery

## Database

The application uses PostgreSQL with Prisma ORM.

Major database entities include:

- User
- Account
- Session
- Trainer
- Stack
- Technology
- Institution
- InstitutionEngagement
- Program
- Photo
- MediaFile
- BlogPost
- Lead
- LeadNote
- JobPost
- JobApplication
- Webinar
- WebinarRegistration
- Internship
- InternshipApplication
- AuditLog
- SiteSetting
- Redirect

Production database infrastructure uses Supabase PostgreSQL.

DATABASE_URL
    │
    └── Runtime connection / connection pooler

DIRECT_URL
    │
    └── Prisma migrations / direct PostgreSQL connection

## Project Structure

sodak-technology/
│
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   ├── (admin)/
│   │   └── api/
│   │       └── v1/
│   │
│   ├── components/
│   │   ├── layout/
│   │   └── ui/
│   │
│   ├── modules/
│   │   ├── blog/
│   │   ├── careers/
│   │   ├── gallery/
│   │   ├── institutions/
│   │   ├── internships/
│   │   ├── leads/
│   │   ├── programs/
│   │   ├── settings/
│   │   ├── stacks/
│   │   ├── trainers/
│   │   └── webinars/
│   │
│   ├── lib/
│   └── auth.config.ts
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
│
├── docs/
│   ├── 02-SoDak-EduTech-SRS-v1.md
│   ├── 03-api-reference.md
│   ├── 04-data-models.md
│   ├── 05-module-architecture.md
│   ├── 06-deployment-runbook.md
│   └── PHASES.md
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
├── package.json
└── .env.example

## Prerequisites

Make sure you have:

- Node.js 20+
- pnpm 9+
- PostgreSQL / Supabase PostgreSQL
- Redis for local development
- AWS S3 bucket
- Resend account
- Cloudflare Turnstile credentials

## Installation

### 1. Clone

git clone https://github.com/tamil-selvan-k/sodak-technology.git
cd sodak-technology

### 2. Install dependencies

pnpm install

### 3. Configure environment variables

cp .env.example .env.local

Configure the required variables.

### 4. Generate Prisma Client

pnpm prisma generate

### 5. Run migrations

pnpm prisma migrate dev

### 6. Seed the database

pnpm db:seed

### 7. Start development server

pnpm dev

Application:

http://localhost:3000

## Available Scripts

| Command | Description |
|---|---|
| pnpm dev | Start development server |
| pnpm build | Build production application |
| pnpm start | Start production server |
| pnpm lint | Run ESLint |
| pnpm type-check | Run TypeScript type checking |
| pnpm db:generate | Generate Prisma Client |
| pnpm db:migrate | Run Prisma development migrations |
| pnpm db:push | Push Prisma schema to database |
| pnpm db:studio | Open Prisma Studio |
| pnpm db:deploy | Deploy production migrations |
| pnpm db:seed | Seed database |

## Local Redis

Run Redis with Docker:

docker run -d \
  --name sodak-redis \
  -p 6379:6379 \
  redis:7-alpine

Configure:

REDIS_URL=redis://localhost:6379

## Environment Variables

### Database

DATABASE_URL=
DIRECT_URL=

### Authentication

AUTH_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

### AWS S3

AWS_REGION=
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_CLOUDFRONT_DOMAIN=

### Email

RESEND_API_KEY=
RESEND_FROM=

### Redis

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
REDIS_URL=

### Cloudflare Turnstile

NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

See .env.example for the complete configuration.

## CI/CD

GitHub Actions performs:

Push / Pull Request
        │
        ▼
Install Dependencies
        │
        ▼
Prisma Generate
        │
        ├── Lint
        ├── Type Check
        └── Production Build
                │
                ▼
        Database Validation
                │
                ▼
          Production Deploy

Production deployment is configured through Vercel.

## Vercel Deployment

The repository contains:

vercel.json

The build process generates Prisma Client before running the Next.js production build.

Configure all production environment variables in the Vercel project settings.

## Security

The platform implements multiple security layers:

- NextAuth authentication
- Role-based authorization
- Argon2 password hashing
- Zod server-side validation
- Cloudflare Turnstile
- Redis-backed rate limiting
- Audit logging
- Consent gates
- Soft deletion
- Signed S3 URLs
- Environment-based secret management

Never commit:

DATABASE_URL
DIRECT_URL
AUTH_SECRET
NEXTAUTH_SECRET
AWS_SECRET_ACCESS_KEY
RESEND_API_KEY
UPSTASH_REDIS_REST_TOKEN
TURNSTILE_SECRET_KEY

## Documentation

Detailed technical documentation is available in docs/.

- 02-SoDak-EduTech-SRS-v1.md — Software Requirements Specification
- 03-api-reference.md — REST API documentation
- 04-data-models.md — Database model documentation
- 05-module-architecture.md — Module and architecture guidelines
- 06-deployment-runbook.md — Deployment and production operations
- PHASES.md — Project implementation phases

## Engineering Principles

### Low Coupling

Each business domain is implemented as an independent module with clear boundaries.

### Service Layer

Domain services own their domain-specific database operations and validation.

### API Composition

Cross-domain operations are composed at the API/application layer instead of creating unnecessary dependencies between domain services.

### Shared Infrastructure

Reusable infrastructure such as database, authentication, storage, email, caching, image processing, and pagination is kept under src/lib.

### Server-Side Security

Authentication, authorization, validation, rate limiting, and consent checks are enforced on the server.

## Current Scope

The platform currently focuses on:

- Corporate website
- Campus placement training
- Technology training programs
- Trainer and mentor management
- Institutional partnerships
- Content publishing
- Internship management
- Career management
- Webinar management
- Lead management
- Media management
- Administrative operations

Student course delivery, online payments, video hosting, and student authentication are outside the current scope.

## License

No open-source license has currently been specified for this repository.
