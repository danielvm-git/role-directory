---
status: complete
created: '2026-04-17'
tags:
  - guide
  - promotion
  - deployment
  - workflow
priority: medium
created_at: '2026-04-17T01:14:51.376569+00:00'
---
# Guide: Promotion Workflow (Dev → Stg → Prd)

## Overview

Operational guide for the manual promotion workflow — how to promote a validated dev image to staging, and staging to production.

## Design

**Principle:** Same Docker image promoted across environments. No rebuild between stages. Config injected via Secret Manager at Cloud Run deploy time.

**Image tag lifecycle:**
```
ci-{sha}  (built by CI, deployed to dev)
    ↓ promote
staging-{timestamp}  (re-tagged for staging)
    ↓ promote  
prd-{timestamp}  (re-tagged for production)
```

## Plan

### Dev → Staging Promotion

1. Go to GitHub → Actions → **Promote Dev to Staging**
2. Click **Run workflow**
3. Enter the dev image tag (e.g., `dev-abc1234` or `ci-{sha}`)
4. Click **Run workflow**
5. Monitor workflow progress (~3-5 minutes)
6. Verify staging URL health: `GET https://role-directory-stg-[hash]-uc.a.run.app/api/health`

**Finding the dev image tag:**
```bash
gcloud container images list-tags gcr.io/PROJECT_ID/role-directory \
  --filter="tags:dev-*" --sort-by="~timestamp" --limit=5
```

### Staging → Production Promotion

1. Go to GitHub → Actions → **Promote Staging to Production**
2. Click **Run workflow**
3. Enter the staging image tag
4. Click **Run workflow**
5. **Approve the deployment** when the workflow pauses for review
6. Monitor completion (~3-5 minutes after approval)
7. Verify production URL health

### Rollback after promotion

If health check fails or issues are found post-promotion:
```bash
# List revisions
gcloud run revisions list --service role-directory-prd --region us-central1

# Roll back to previous revision
gcloud run services update-traffic role-directory-prd \
  --to-revisions PREVIOUS_REVISION=100 --region us-central1
```

## Test

- [x] Dev → Staging: workflow runs without rebuild, health check passes
- [x] Staging → Production: requires manual approval before deploy
- [x] Audit trail: promoted image tags logged in workflow summary
- [x] Failed health check marks promotion as failed, previous version intact

## Notes

**Sources:** `docs/guides/promotion-workflow-guide.md`

**Audit trail:** Each workflow run logs the `dev_image_tag` input. GitHub Actions run history provides a complete record of who promoted what and when.

**Why no rebuild:** Rebuilding risks introducing environment-specific differences. Promoting the exact tested image eliminates build variance between environments.