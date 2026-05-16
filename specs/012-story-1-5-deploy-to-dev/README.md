---
status: complete
created: 2026-04-17
priority: high
tags:
- epic-1
- cd
- github-actions
- dev
parent: 004-epic-1-foundation
created_at: 2026-04-17T01:11:47.613477Z
updated_at: 2026-04-17T01:16:11.605271Z
completed_at: 2026-04-17T01:16:11.605271Z
---

# Story 1.5: GitHub Actions Deployment to Dev

## Overview

As a **developer**, I want automated deployment to the dev environment on every commit to main, so that changes are immediately available for validation without manual intervention.

## Design

**Added to** `.github/workflows/ci-cd-dev.yml` as a deploy job after CI passes.

**Steps:**
1. Authenticate with GCP (`google-github-actions/auth@v2` using `GCP_SA_KEY` secret)
2. Set up gcloud CLI (`google-github-actions/setup-gcloud@v2`)
3. Configure Docker for Artifact Registry
4. Build: `docker build -t us-central1-docker.pkg.dev/PROJECT_ID/repo/role-directory:$GITHUB_SHA .`
5. Push image to Artifact Registry
6. Deploy: `gcloud run deploy role-directory-dev --image ... --region us-central1`
7. Health check: `curl -f https://role-directory-dev-[hash]-uc.a.run.app/api/health`

**GitHub Secrets required:** `GCP_PROJECT_ID`, `GCP_SA_KEY`

## Plan

- [x] Add deploy job to CI/CD workflow (depends on ci job)
- [x] Configure `google-github-actions/auth@v2` with service account key
- [x] Build and push Docker image tagged with `$GITHUB_SHA`
- [x] Deploy image to `role-directory-dev` Cloud Run service
- [x] Add health check step post-deployment
- [x] Verify end-to-end: commit → auto-deploy → health check passes

## Test

- [x] Commit to `main` triggers deployment automatically
- [x] CI passes before deployment begins
- [x] Docker image pushed to Artifact Registry with commit SHA tag
- [x] Cloud Run service updated with new image
- [x] Health check passes post-deployment
- [x] Total time (CI + deploy): <10 minutes
- [x] Failed deployment does NOT affect currently-running service

## Notes

**Source:** `docs/stories/1-5-github-actions-deployment-to-dev.md` (Status: done)

**Image tagging:** Use `$GITHUB_SHA` for traceability. Also tag as `latest` for convenience.