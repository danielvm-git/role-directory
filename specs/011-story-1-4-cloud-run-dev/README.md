---
status: complete
created: 2026-04-17
priority: high
tags:
- epic-1
- cloud-run
- gcp
- dev
parent: 004-epic-1-foundation
created_at: 2026-04-17T01:11:47.578008Z
updated_at: 2026-04-17T01:16:11.570929Z
completed_at: 2026-04-17T01:16:11.570929Z
---

# Story 1.4: Cloud Run Service Setup (Dev)

## Overview

As a **developer**, I want a Cloud Run service configured for the dev environment, so that the application can be deployed and accessed via a public URL.

## Design

**Service:** `role-directory-dev`
**Region:** `us-central1`
**Config:**
- Allow unauthenticated access (public URL)
- Min instances: 0 (scale to zero)
- Max instances: 10
- CPU: 1, Memory: 512Mi
- Port: 8080

**Environment variables (Secret Manager references):**
- `NODE_ENV=development`
- `DATABASE_URL` → `projects/PROJECT_ID/secrets/role-directory-dev-db-url/versions/latest`

**URL pattern:** `https://role-directory-dev-[hash]-uc.a.run.app`

**Deploy command:**
```bash
gcloud run deploy role-directory-dev \
  --image gcr.io/PROJECT_ID/role-directory:latest \
  --region us-central1 --allow-unauthenticated \
  --min-instances 0 --max-instances 10 \
  --memory 512Mi --cpu 1
```

## Plan

- [x] Enable Cloud Run API and Artifact Registry API
- [x] Create service account with Cloud Run Admin + Secret Accessor roles
- [x] Deploy initial service (placeholder image or first build)
- [x] Configure Secret Manager reference for DATABASE_URL
- [x] Verify public URL is accessible
- [x] Document service URL in README

## Test

- [x] Service deployed successfully
- [x] Public URL accessible
- [x] Health check returns 200 (after Story 1.6)
- [x] Environment variables injected correctly

## Notes

**Source:** `docs/stories/1-4-cloud-run-service-setup-dev.md` (Status: done)

**GCP APIs to enable:** Cloud Run, Artifact Registry, Secret Manager, Cloud Build.