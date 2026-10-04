# SODAK Technology

> A production-ready, CMS-driven technology and campus placement training platform built with Next.js, TypeScript, Prisma, PostgreSQL, Redis, AWS S3, Resend, and NextAuth.

SODAK Technology is a full-stack web platform for presenting technology training programs, trainers, mentors, partner institutions, internships, webinars, careers, and technical insights while giving internal teams a role-based CMS for managing the platform.

## Overview

The platform combines a public-facing website with a protected administration system and a REST API.

### Public Platform

- Technology and campus placement training programs
- Training-stack and technology catalog
- Trainer and mentor directories
- Partner institution directory and engagement pages
- Webinars and registrations
- Internship listings and applications
- Careers and job applications
- Blog / insights
- Media gallery
- Contact and enquiry forms
- Platform overview pages for LMS, CTF, and assessment products

### Admin Platform

- Dashboard
- Trainer and mentor management
- Program management
- Institution management
- Internship management
- Webinar management
- Blog publishing workflow
- Gallery and media management
- Lead management and pipeline
- Careers and applications
- Site settings
- User management
- Audit logs
- Redirect management

## Key Features

### Role-Based Access Control

The platform supports four authenticated roles:

| Role | Capabilities |
| --- | --- |
| `super_admin` | Full platform access, user management, settings, audit logs, and destructive operations |
| `editor` | Manage and publish platform content and media |
| `contributor` | Create/edit permitted content and submit blog drafts for review |
| `sales` | Manage leads, statuses, notes, and lead exports |

Public visitors can browse published content and submit public forms.

Authorization is enforced on protected routes and API operations rather than relying only on frontend visibility.

### Content Management

The CMS is organized around independent domain modules:

- Trainers
- Mentors
- Programs
- Training stacks
- Institutions
- Gallery
- Blog
- Leads
- Careers
- Internships
- Webinars
- Site settings
- Media

Each domain has dedicated schemas, types, and service-layer logic.

### Publishing Workflows

Several content types support explicit publishing states and actions.

```text
Draft
  |
  v
In Review
  |
  v
Published
