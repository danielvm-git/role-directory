---
status: complete
created: '2026-08-03'
tags:
  - bug
  - ci
  - deployment
  - gcp
  - bigbase
priority: high
created_at: '2026-08-03T18:15:00.000000+00:00'
---
# Bug: GCP Cloud Run deploy fails (billing not enabled + Artifact Registry IAM)

## Overview

The `deploy-dev` job in `.github/workflows/ci-cd.yml` fails on every push to `main`. CI (lint, type-check, build, unit + e2e tests) passes; only the GCP Cloud Run deploy is red.

## Root Cause Analysis

Two independent GCP project-level blockers cause the failure:

1. **Billing not enabled on the GCP project.** `gcloud run deploy --source .` delegates image build + push to Cloud Build, and Cloud Build, Cloud Run, and Artifact Registry all refuse to operate in a project without an active billing account. This blocks the deploy regardless of IAM configuration.
2. **`PERMISSION_DENIED` on Artifact Registry.** Even with billing in place, the `github-actions-deployer` service account (`github-actions-deployer@role-directory.iam.gserviceaccount.com`) lacks Artifact Registry write access (`roles/artifactregistry.writer`), so the Cloud Build image push fails.

A previous attempt (`161f844` "feat: switch to source-based deploy to avoid Artifact Registry billing") switched to `gcloud run deploy --source` hoping to bypass Artifact Registry; Cloud Build still needs billing, so the pipeline stayed red.

## Decision

Migrate the deploy from GCP Cloud Run to **BigBase** (user-confirmed, see plan `fix-red-ci-four-repos`). The app (`APP_TYPE=node`) deploys to `https://role-directory.bigbase.click` via the centralized `danielvm-git/.github` node template (`test-build-release-node.yml` + `deploy-node.yml`) and `big-release`.

## Fix

- Replace `.github/workflows/ci-cd.yml` with the standalone node template pair:
  - `.github/workflows/test-build-release.yml` (node template, `release_tool: big-release`, `SITE_URL: https://role-directory.bigbase.click`).
  - `.github/workflows/deploy.yml` (node template, `workflow_run` trigger).
- Drop Cloud-Run-specific steps: periodic_table DB load via psql, post-deploy e2e against the Cloud Run URL, and the image-promotion summary.
- Delete GCP-specific workflows `promote-dev-to-staging.yml` and `promote-staging-to-production.yml` (obsolete after migration); keep `update-readme-status.yml` (unrelated).
- Add `.big-release.yml` at repo root.
- Provision `BIGBASE_SITE_ID` + `BIGBASE_DEPLOY_TOKEN` repo secrets (manual, see PR body).

## References

- Plan: `fix-red-ci-four-repos` (`/Users/danielvm/.cursor/plans/fix-red-ci-four-repos_3abb0651.plan.md`)
- Central templates: `danielvm-git/.github/.github/workflows/test-build-release-node.yml`, `deploy-node.yml`
- Reference instantiation: `danielvm-git/bigbase-canary-node`
