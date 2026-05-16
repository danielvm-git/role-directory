---
status: complete
created: '2026-04-17'
tags:
  - planning
  - requirements
  - prd
priority: high
created_at: '2026-04-17T01:09:05.388487+00:00'
---

# Product Requirements Document

> **Status**: complete · **Priority**: high · **Created**: 2026-04-17

## Overview

role-directory is a Next.js web application designed to **validate a production-ready deployment infrastructure** on Google Cloud Run. The application implements time-limited invitation code access control to enable secure collaboration during development.

**Infrastructure-first approach:** Every feature validates another piece of the deployment stack. Success = code committed with confidence knowing the entire pipeline (GitHub Actions → Cloud Run → PostgreSQL) is battle-tested.

### Project Classification

- **Type:** Web Application (Next.js 15, App Router)
- **Complexity:** Low-Medium (infrastructure focus, standard web patterns)
- **Architecture:** Server-side rendered React + API routes
- **Deployment:** Docker → Cloud Run (serverless)
- **Database:** PostgreSQL with connection pooling (cloud-optimized via Neon)
- **Auth:** Custom session-based (invitation codes + server-side sessions → Neon Auth in Epic 3)
- **CI/CD:** GitHub Actions, multi-environment promotion

## Design

### Epic Overview

| Epic | Goal | Status |
|------|------|--------|
| Epic 1: Foundation & Deployment Pipeline | CI/CD, Docker, 3x Cloud Run environments | Complete |
| Epic 2: Database Infrastructure | Neon PostgreSQL, connection, schema migrations | In Progress |
| Epic 3: Authentication & Access Control | Neon Auth, email whitelist, invite codes | Planned |
| Epic 4: Hello World Dashboard | Protected pages, stack validation end-to-end | Planned |

### Functional Requirements

**FR-001: Invitation Code Access**
- Public landing page with code entry form
- 24-hour time-limited access codes
- Reusable codes (multiple users per code)
- Server-side validation against PostgreSQL
- Automatic expiry with re-entry prompt

**FR-002: Admin Interface**
- Generate random invitation codes
- View active codes and expiry times
- Protected by admin authentication

**FR-003: Collaborator Dashboard**
- Hello World page with PostgreSQL data fetch
- Workflow status page (renders `docs/bmm-workflow-status.yaml`)
- Sprint status page (renders `docs/sprint-status.yaml`)

**FR-004: Deployment Pipeline**
- Auto-deploy to dev on every commit to `main`
- Manual promotion: dev → staging
- Manual promotion: staging → production (with safeguards)
- Health check endpoint (`GET /api/health`)

### Non-Functional Requirements

- **Performance:** Cold start <5s (acceptable: <10s), health check <100ms warm
- **Cost:** ~$0-3/month using free tiers (Cloud Run, Neon, Secret Manager, GitHub Actions)
- **Container:** Docker image <500MB
- **CI/CD:** Commit → dev deploy in <10 minutes
- **Sessions:** 24-hour duration, database-backed (no in-memory state)
- **Environments:** dev / staging / production — all isolated, same codebase

### Technical Constraints

- Stateless containers (Cloud Run scales to zero)
- TypeScript strict mode everywhere
- Secrets via Google Secret Manager (runtime) and GitHub Secrets (CI/CD)
- No custom domain required for MVP

## Plan

- [x] Epic 1: Foundation & Deployment Pipeline
- [ ] Epic 2: Database Infrastructure & Connectivity
- [ ] Epic 3: Authentication & Access Control
- [ ] Epic 4: Hello World Dashboard (Stack Validation)

## Test

### Acceptance Criteria (MVP)

- [x] Commit to `main` → auto-deploys to dev within 10 minutes
- [x] Dev deployment passes health check (200 OK)
- [x] Manual promotion to staging works with same Docker image
- [x] Manual promotion to production works with additional safeguards
- [x] Container size <500MB
- [ ] Valid invite codes grant 24-hour access
- [ ] Expired codes rejected, re-entry prompted
- [ ] Hello World page shows database data
- [ ] Admin can generate codes

## Notes

**Source:** `docs/2-planning/PRD.md` (v1.0, 2025-11-06, danielvm)

**Classification decision:** Treating this as "Low-Medium complexity" to resist over-engineering. The primary deliverable is infrastructure confidence, not feature richness.

**Deferred from MVP:**
- Automated testing in CI/CD (Phase 2)
- Infrastructure as Code (Terraform/Pulumi)
- Custom domain configuration
- Advanced monitoring and alerting
