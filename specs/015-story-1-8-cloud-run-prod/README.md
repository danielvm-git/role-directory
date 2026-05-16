---
status: complete
created: 2026-04-17
priority: high
tags:
- epic-1
- cloud-run
- gcp
- production
parent: 004-epic-1-foundation
created_at: 2026-04-17T01:11:54.545192Z
updated_at: 2026-04-17T01:16:11.710874Z
completed_at: 2026-04-17T01:16:11.710874Z
---

# Story 1.8: Cloud Run Service Setup (Production)

## Overview

As a **developer**, I want a Cloud Run service configured for the production environment, so that fully validated changes can be deployed to the final showcase environment.

## Design

**Service:** `role-directory-prd`
**Region:** `us-central1`
**Config:** Same as dev/staging (0–10 instances, 1 CPU, 512Mi)
**URL:** `https://role-directory-prd-[hash]-uc.a.run.app`

Production has an additional safeguard in the promotion workflow (Story 1.10): manual approval gate before the deployment step runs.

Production uses its own Neon database (`role_directory_prd`) and Secret Manager secret (`role-directory-prd-db-url`).

## Plan

- [x] Create Cloud Run service `role-directory-prd`
- [x] Configure same resource limits as dev/stg
- [x] Set `NODE_ENV=production`
- [x] Reference production DATABASE_URL from Secret Manager
- [x] Ensure production secrets are properly configured

## Test

- [x] Service deployed and URL accessible
- [x] Health check returns 200
- [x] Environment variables point to production database
- [x] Independent from dev and staging

## Notes

**Source:** `docs/stories/1-8-cloud-run-service-setup-production.md` (Status: done)

**Production safeguards:** GitHub Environment protection rules on the `production` environment. Require manual approval before deployment runs.