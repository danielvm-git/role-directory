---
status: complete
created: '2026-04-17'
tags:
  - guide
  - cloud-run
  - gcp
  - deployment
priority: medium
created_at: '2026-04-17T01:14:51.305733+00:00'
---
# Guide: Cloud Run Setup (All Environments)

## Overview

Operational guide for setting up and managing Cloud Run services across dev, staging, and production environments.

## Design

### Services

| Service | Environment | Min | Max | CPU | Memory | Trigger |
|---------|-------------|-----|-----|-----|--------|---------|
| `role-directory-dev` | dev | 0 | 10 | 1 | 512Mi | Auto on `main` |
| `role-directory-stg` | staging | 0 | 10 | 1 | 512Mi | Manual promote |
| `role-directory-prd` | production | 0 | 10 | 1 | 512Mi | Manual + approval |

All services: unauthenticated access, port 8080, region `us-central1`.

### Secret Manager references

Each service references its environment's secrets:
- `DATABASE_URL` → `projects/PROJECT_ID/secrets/role-directory-{env}-db-url/versions/latest`

## Plan

### Create a service

```bash
gcloud run deploy role-directory-dev \
  --image gcr.io/PROJECT_ID/role-directory:latest \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --min-instances 0 --max-instances 10 \
  --memory 512Mi --cpu 1 \
  --set-secrets DATABASE_URL=role-directory-dev-db-url:latest \
  --set-env-vars NODE_ENV=development
```

Replace `dev` with `stg` or `prd` for other environments.

### View service URL

```bash
gcloud run services describe role-directory-dev \
  --region us-central1 --format="value(status.url)"
```

### View logs

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=role-directory-dev" \
  --limit 50 --format json
```

### Rollback

```bash
# List revisions
gcloud run revisions list --service role-directory-dev --region us-central1

# Rollback to a previous revision
gcloud run services update-traffic role-directory-dev \
  --to-revisions REVISION_NAME=100 --region us-central1
```

## Test

- [x] All three services deployed and returning 200 from `/api/health`
- [x] Environment variables injected from Secret Manager
- [x] Scale to zero works (no charges when idle)
- [x] Service URLs documented

## Notes

**Sources:** `docs/CLOUD_RUN_SETUP.md`, `docs/guides/cloud-run-production-setup.md`, `docs/guides/cloud-run-staging-setup.md`

**Cold start latency:** Acceptable for MVP (<5s target). If needed later, min-instances can be increased (increases cost).

**APIs to enable:**
```bash
gcloud services enable run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com
```