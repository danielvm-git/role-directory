---
status: complete
created: '2026-04-17'
tags:
  - guide
  - github-actions
  - ci-cd
priority: medium
created_at: '2026-04-17T01:14:51.273555+00:00'
---
# Guide: GitHub Actions Setup and Configuration

## Overview

Operational guide for the GitHub Actions CI/CD setup: service account configuration, required secrets, and workflow overview.

## Design

### Workflows

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| CI/CD - Build and Deploy to Dev | `ci-cd-dev.yml` | Push to `main` | Lint → typecheck → build → deploy dev |
| Promote Dev to Staging | `promote-dev-to-staging.yml` | Manual (`workflow_dispatch`) | Promote dev image to staging |
| Promote Staging to Production | `promote-staging-to-production.yml` | Manual + approval | Promote staging image to production |

### GitHub Secrets required

| Secret | Description |
|--------|-------------|
| `GCP_PROJECT_ID` | Google Cloud project ID |
| `GCP_SERVICE_ACCOUNT_KEY` | Service account JSON key with required roles |
| `GCP_REGION` | Cloud Run region (e.g., `us-central1`) |

### Service account roles

The CI/CD service account needs:
- `roles/run.admin` — deploy Cloud Run services
- `roles/storage.admin` — push to Container Registry
- `roles/artifactregistry.writer` — push to Artifact Registry
- `roles/secretmanager.secretAccessor` — read secrets

## Plan

### Service account setup

```bash
# Create service account
gcloud iam service-accounts create github-actions-sa \
  --display-name="GitHub Actions CI/CD"

# Grant roles
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:github-actions-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

# Create JSON key
gcloud iam service-accounts keys create key.json \
  --iam-account="github-actions-sa@PROJECT_ID.iam.gserviceaccount.com"
```

Add `key.json` contents as `GCP_SERVICE_ACCOUNT_KEY` GitHub Secret.

### Docker auth for Artifact Registry

```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

### Production environment protection

In GitHub: Settings → Environments → `production` → Required reviewers.
Add yourself. Deployment pauses until you approve.

## Test

- [x] CI workflow triggers on commit to `main`
- [x] All stages pass (lint, typecheck, build, deploy)
- [x] Docker image pushed to Artifact Registry with `$GITHUB_SHA` tag
- [x] Dev Cloud Run service updated after push
- [x] Promotion workflows available in GitHub Actions UI

## Notes

**Source:** `docs/GITHUB_ACTIONS_SETUP.md`

**Alternative auth (recommended for production use):** Workload Identity Federation instead of service account JSON key. Eliminates long-lived secret rotation burden. See Google's `google-github-actions/auth` action docs for WIF setup.