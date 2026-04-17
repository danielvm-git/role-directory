---
status: complete
created: 2026-04-17
priority: high
tags:
- epic-1
- promotion
- github-actions
- staging
parent: 004-epic-1-foundation
created_at: 2026-04-17T01:11:54.577719Z
updated_at: 2026-04-16T00:00:00.000000Z
---

# Story 1.9: Manual Promotion Workflow (Dev → Staging)

## Overview

As a **DevOps engineer**, I want a GitHub Actions workflow to manually promote a validated dev deployment to staging, so that I can promote tested changes to staging with a single button click.

## Design

**File:** `.github/workflows/promote-dev-to-staging.yml`
**Trigger:** `workflow_dispatch` with inputs:
- `dev_image_tag` — image tag to promote (e.g., `dev-abc1234`)
- `environment` — target (enum: `["staging"]`, default: `staging`)

**Steps:**
1. Authenticate with GCP (`google-github-actions/auth@v2`)
2. Pull dev image: `docker pull gcr.io/PROJECT_ID/role-directory:$dev_image_tag`
3. Re-tag: `gcr.io/PROJECT_ID/role-directory:staging-<timestamp>`
4. Push re-tagged image
5. Deploy to `role-directory-staging` Cloud Run service
6. Health check: `GET /api/health` on staging URL
7. Report success/failure + log promoted tag for audit trail

**Key constraint:** Does NOT rebuild the application. Same image promoted as-is.

## Plan

- [x] Create `.github/workflows/promote-dev-to-staging.yml`
- [x] Add `workflow_dispatch` trigger with image tag input
- [x] Implement GCP auth step
- [x] Pull, re-tag, push image steps
- [x] Deploy to `role-directory-staging`
- [x] Add post-deploy health check
- [x] Update ci-cd.yml to build and push tagged GCR images (required for promotion)

## Test

- [ ] Workflow runs from GitHub Actions UI without errors
- [x] Same image (no rebuild) deployed to staging
- [ ] Health check passes post-promotion
- [ ] Completion time <5 minutes
- [x] Audit log shows promoted image tag
- [x] Failed health check marks promotion as failed

## Notes

**Source:** `docs/stories/1-9-manual-promotion-workflow-dev-staging.md`

Workflow file exists at `.github/workflows/promote-dev-to-staging.yml`.

**Key fix applied:** `ci-cd.yml` was updated to build and push a named Docker image to GCR (tagged `dev-YYYYMMDD-HHMMSS-<sha7>`) before deploying. Previously it used `--source .` (source-based deploy) which never created a GCR image, making the promotion workflow unable to pull a dev image. The CI job now surfaces the image tag in the deployment summary so operators know which tag to pass to this workflow.

Remaining tests (marked unchecked above) require a live GCP environment to verify.