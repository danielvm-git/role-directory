---
status: planned
created: 2026-04-17
priority: medium
tags:
- epic-1
- rollback
- documentation
parent: 004-epic-1-foundation
created_at: 2026-04-17T01:11:54.647211Z
updated_at: 2026-04-17T01:16:11.817420Z
---

# Story 1.11: Rollback Documentation and Testing

## Overview

As a **developer**, I want clear documentation and tested procedures for rolling back deployments, so that I can quickly recover from failed deployments or issues in any environment.

## Design

**Rollback mechanism:** Cloud Run traffic splitting. Cloud Run keeps previous revisions. Roll back by redirecting 100% traffic to a prior revision.

**Commands:**
```bash
# List revisions
gcloud run revisions list --service role-directory-dev --region us-central1

# Rollback to specific revision
gcloud run services update-traffic role-directory-dev \
  --to-revisions REVISION_NAME=100 --region us-central1

# Verify
curl https://role-directory-dev-[hash]-uc.a.run.app/api/health
```

**Documentation location:** `docs/ROLLBACK.md` or README deployment section.

## Plan

- [ ] Create rollback documentation (`docs/ROLLBACK.md`)
  - List revisions command
  - Update-traffic rollback command
  - GCP Console UI instructions
  - Verification steps (health check + manual test)
- [ ] Test rollback in dev: deploy v1 → deploy v2 → rollback to v1
- [ ] Document database migration rollback (link to Epic 2)
- [ ] Add troubleshooting section (logs, health check debugging)

## Test

- [ ] Rollback procedure documented with CLI examples
- [ ] Rollback tested at least once in dev environment
- [ ] Previous version confirmed working after rollback
- [ ] Database migration rollback documented

## Notes

**Source:** `docs/stories/1-11-rollback-documentation-and-testing.md` (Status: ready-for-dev)

**Cloud Run advantage:** No custom rollback tooling needed. Platform natively supports traffic splitting to previous revisions. Rollback is near-instant (traffic switch, not re-deploy).