---
status: complete
created: 2026-04-17
priority: high
tags:
- epic-1
- cloud-run
- gcp
- staging
parent: 004-epic-1-foundation
created_at: 2026-04-17T01:11:54.512368Z
updated_at: 2026-04-17T01:16:11.675875Z
completed_at: 2026-04-17T01:16:11.675875Z
---

# Story 1.7: Cloud Run Service Setup (Staging)

## Overview

As a **developer**, I want a Cloud Run service configured for the staging environment, so that validated changes can be promoted from dev for final testing.

## Design

**Service:** `role-directory-stg`
**Region:** `us-central1`
**Config:** Same as dev (0–10 instances, 1 CPU, 512Mi)
**URL:** `https://role-directory-stg-[hash]-uc.a.run.app`

Staging uses its own Neon database (`role_directory_stg`) and its own Secret Manager secret (`role-directory-stg-db-url`). Independent from dev.

**Populated by:** Manual promotion workflow (Story 1.9), NOT auto-deploy.

## Plan

- [x] Create Cloud Run service `role-directory-stg`
- [x] Configure same resource limits as dev
- [x] Set `NODE_ENV=staging`
- [x] Reference staging DATABASE_URL from Secret Manager
- [x] Document staging URL

## Test

- [x] Service deployed and URL accessible
- [x] Health check returns 200
- [x] Environment variables point to staging database
- [x] Independent from dev (separate service)

## Notes

**Source:** `docs/stories/1-7-cloud-run-service-setup-staging.md` (Status: done)

Staging database populated after Epic 2 runs migrations.