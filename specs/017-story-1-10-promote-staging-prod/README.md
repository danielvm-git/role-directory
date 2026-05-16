---
status: in-progress
created: 2026-04-17
priority: high
tags:
- epic-1
- promotion
- github-actions
- production
parent: 004-epic-1-foundation
created_at: 2026-04-17T01:11:54.612941Z
updated_at: 2026-04-17T01:16:11.782784Z
---

# Story 1.10: Manual Promotion Workflow (Staging → Production)

## Overview

As a **DevOps engineer**, I want a GitHub Actions workflow to promote a validated staging deployment to production, so that I can control production releases with an additional safeguard.

## Design

**File:** `.github/workflows/promote-staging-to-production.yml`
**Trigger:** `workflow_dispatch` with inputs:
- `staging_image_tag` — image tag to promote
- `environment` — target (enum: `["production"]`, default: `production`)

**Additional safeguard:** `environment: production` in the job config, referencing a GitHub Environment with required reviewers. Deployment step pauses until a designated reviewer approves.

**Steps:**
1. Authenticate with GCP
2. Pull staging image
3. Re-tag: `gcr.io/PROJECT_ID/role-directory:prd-<timestamp>`
4. Push re-tagged image
5. Deploy to `role-directory-prd`
6. Health check on production URL
7. Log promoted tag for audit trail

## Plan

- [x] Create `.github/workflows/promote-staging-to-production.yml`
- [x] Add `workflow_dispatch` trigger with image tag input
- [x] Add `environment: production` with required reviewer protection
- [x] Implement same steps as staging promotion
- [ ] Configure GitHub Environment protection rules
- [ ] Test end-to-end promotion with approval gate

## Test

- [ ] Workflow requires manual approval before production deploy
- [ ] Approved promotion deploys correct image (no rebuild)
- [ ] Production health check passes
- [ ] Completion time <5 minutes after approval
- [ ] Audit log shows promoted image tag

## Notes

**Source:** `docs/stories/1-10-manual-promotion-workflow-staging-production.md` (Status: review)

**GitHub Environment protection:** Set up under repo Settings → Environments → production → Required reviewers. Blocks the deployment job until approved.