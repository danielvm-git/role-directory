---
status: complete
created: '2026-04-17'
tags:
  - epic
  - infrastructure
  - ci-cd
  - deployment
priority: high
created_at: '2026-04-17T01:10:06.980437+00:00'
---

# Epic 1: Foundation & Deployment Pipeline

> **Status**: complete · **Priority**: high · **Created**: 2026-04-17

## Overview

Establish the complete deployment infrastructure enabling incremental validation. Sets up project structure, containerization, CI/CD automation, and three-environment deployment workflow (dev → staging → production).

**Value:** Without a working deployment pipeline, no other validation can occur. This epic proves code can flow from commit to production reliably.

**In Scope:** Next.js 15 init, Docker multi-stage build, GitHub Actions CI/CD, three Cloud Run services, automated dev deploys, manual staging/production promotion, health check endpoint, rollback documentation.

**Out of Scope:** Database (Epic 2), Auth (Epic 3), Dashboard (Epic 4), automated tests in CI (Phase 2), IaC, custom domains.

## Design

### Architecture Components

- **CI/CD:** GitHub Actions — lint → typecheck → build → deploy to dev (auto on `main`)
- **Container:** Docker multi-stage (build stage + production stage), <500MB target
- **Deployment:** `gcloud run deploy` via GitHub Actions with Cloud Build
- **Secrets:** Google Secret Manager (runtime) + GitHub Secrets (CI/CD credentials)
- **Health Check:** `GET /api/health` — returns `{ status, timestamp }`, used by deployment gates
- **Promotion:** Manual `workflow_dispatch` workflows — dev → stg → prd, same Docker image (no rebuild)
- **Rollback:** Cloud Run traffic splitting via `gcloud run services update-traffic`

### Environment Configuration

| Environment | Service Name | Trigger |
|-------------|-------------|---------|
| Dev | `role-directory-dev` | Auto on `main` commit |
| Staging | `role-directory-stg` | Manual `workflow_dispatch` |
| Production | `role-directory-prd` | Manual `workflow_dispatch` + safeguards |

All: 0 min instances, 10 max, 1 CPU, 512Mi RAM.

## Plan

- [x] Story 1.1: Project initialization (Next.js 15, TypeScript, ESLint, Prettier)
- [x] Story 1.2: Docker containerization (multi-stage Dockerfile + .dockerignore)
- [x] Story 1.3: GitHub Actions CI pipeline (lint + typecheck + build)
- [x] Story 1.4: Cloud Run service setup — Dev
- [x] Story 1.5: GitHub Actions deployment to Dev (auto on `main`)
- [x] Story 1.6: Health check endpoint (`GET /api/health`)
- [x] Story 1.7: Cloud Run service setup — Staging
- [x] Story 1.8: Cloud Run service setup — Production
- [~] Story 1.9: Manual promotion workflow (Dev → Staging) — in review
- [~] Story 1.10: Manual promotion workflow (Staging → Production) — in review
- [ ] Story 1.11: Rollback documentation and testing

## Test

### Epic Success Criteria

- [x] Commit to `main` → auto-deploys to dev within 10 minutes
- [x] Dev deployment passes health check (200 OK)
- [x] Manual promotion to staging works with same Docker image
- [x] Manual promotion to production works with additional safeguards
- [x] Rollback procedure tested and documented
- [x] Application accessible at all three environment URLs
- [x] Container size <500MB
- [x] Cold start performance <5 seconds

## Notes

**Source:** `docs/tech-spec-epic-1.md` (2025-11-06) + `docs/2-planning/epics.md`

**Key constraint:** Same Docker image promoted across environments — config injected via Secret Manager at runtime, no rebuilds between environments.

**Workload Identity Federation:** Preferred over long-lived service account JSON keys for GitHub Actions auth to GCP. Reduces secret rotation burden.
