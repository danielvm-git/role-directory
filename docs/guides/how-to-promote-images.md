# How to Promote Images Between Environments

## Overview

This guide explains how to promote Docker images from Dev → Staging → Production using the manual promotion workflows from Epic 1.

---

## Architecture Update (November 2025)

The CI/CD pipeline has been updated to build and push **tagged Docker images** to GCR (Google Container Registry) instead of using Cloud Run buildpacks. This enables the manual promotion workflows.

### Image Tagging Strategy

| Environment | Tag Format | Example |
|-------------|------------|---------|
| **Dev** | `dev-YYYYMMDD-HHMMSS` | `dev-20231106-143022` |
| **Staging** | `staging-YYYYMMDD-HHMMSS` | `staging-20231106-150045` |
| **Production** | `production-YYYYMMDD-HHMMSS` | `production-20231106-160512` |

Each environment also has a **`*-latest`** tag for convenience:
- `dev-latest`
- `staging-latest`
- `production-latest`

---

## Step-by-Step: Promote Dev to Staging

### Step 1: Deploy to Dev (Automatic on Push to `main`)

When you push to `main`, the **CI/CD - Build and Deploy to Dev** workflow automatically:

1. ✅ Runs linting, type checking, and tests
2. 🐳 Builds Docker image
3. 🏷️  Tags image as `dev-YYYYMMDD-HHMMSS` and `dev-latest`
4. 📤 Pushes to `gcr.io/role-directory/role-directory`
5. 🚀 Deploys to Cloud Run dev environment
6. 🏥 Runs health checks

**Deployment Summary shows the image tag:**
```
✅ Deployment successful
Image Tag: `dev-20231106-143022`
```

### Step 2: Find the Dev Image Tag

After a successful dev deployment, find the image tag in **one of these places**:

#### Option A: GitHub Actions Summary
1. Go to **Actions** → **CI/CD - Build and Deploy to Dev** → Latest run
2. Scroll to **Deployment Summary**
3. Copy the **Image Tag** (e.g., `dev-20231106-143022`)

#### Option B: Command Line
```bash
# List recent dev images
gcloud container images list-tags gcr.io/role-directory/role-directory \
  --filter="tags:dev-*" \
  --sort-by="~timestamp" \
  --limit=5 \
  --format="table(tags,timestamp)"
```

**Example output:**
```
TAGS                     TIMESTAMP
dev-20231106-143022      2023-11-06T14:30:22
dev-20231106-120045      2023-11-06T12:00:45
dev-latest
```

Copy the **most recent** dev tag (e.g., `dev-20231106-143022`).

#### Option C: Cloud Run Console
1. Go to **Cloud Run** → `role-directory-dev`
2. Click on the active revision
3. Look at the **Container image URL**:
   ```
   gcr.io/role-directory/role-directory:dev-20231106-143022
   ```
4. Copy the tag after the colon

### Step 3: Run the Promotion Workflow

1. Go to **GitHub** → **Actions** → **Promote Dev to Staging**
2. Click **"Run workflow"** button (top right)
3. **Fill in the form:**
   - **Branch:** `main`
   - **Dev image tag to promote:** `dev-20231106-143022` ← paste your tag here
4. Click **"Run workflow"**

### Step 4: Monitor the Promotion

The workflow will:

1. 📦 Pull the dev image from GCR
2. 🏷️  Re-tag as `staging-YYYYMMDD-HHMMSS` and `staging-latest`
3. 📤 Push staging images to GCR
4. 🚀 Deploy to Cloud Run staging environment
5. ⏳ Wait 15 seconds for deployment to stabilize
6. 🏥 Run health checks with IAM authentication (12 retries, 60s total)
7. ✅ Log promotion details

### Step 5: Verify Staging Deployment

Check the **workflow run summary** for:
```
✅ Promotion successful

Dev Image:     dev-20231106-143022
Staging Image: staging-20231106-150045
Staging URL:   https://role-directory-staging-xxx.a.run.app
```

**Test staging manually:**
```bash
# Get IAM token
TOKEN=$(gcloud auth print-identity-token)

# Health check (staging is IAM-protected)
curl -H "Authorization: Bearer $TOKEN" \
  https://role-directory-staging-q5xt7ys22a-rj.a.run.app/api/health
```

---

## Step-by-Step: Promote Staging to Production

### Step 1: Find the Staging Image Tag

After a successful staging promotion, find the image tag:

#### Option A: GitHub Actions Summary
1. Go to **Actions** → **Promote Dev to Staging** → Latest run
2. Find the **Staging Image** tag (e.g., `staging-20231106-150045`)

#### Option B: Command Line
```bash
# List recent staging images
gcloud container images list-tags gcr.io/role-directory/role-directory \
  --filter="tags:staging-*" \
  --sort-by="~timestamp" \
  --limit=5 \
  --format="table(tags,timestamp)"
```

### Step 2: Run the Production Promotion Workflow

1. Go to **GitHub** → **Actions** → **Promote Staging to Production**
2. Click **"Run workflow"** button
3. **Fill in the form:**
   - **Branch:** `main`
   - **Staging image tag to promote:** `staging-20231106-150045`
   - **Confirmation string:** `PROMOTE_TO_PRODUCTION` ← **MUST match exactly**
4. Click **"Run workflow"**

⚠️ **Production deployment requires manual approval!**

### Step 3: Approve the Production Deployment

1. The workflow will pause at the **GitHub Environment protection rule**
2. You'll receive a notification (if configured)
3. Go to the workflow run and click **"Review deployments"**
4. Select **"production"** environment
5. Click **"Approve and deploy"**

### Step 4: Monitor Production Promotion

The workflow will:

1. ✅ Validate confirmation string
2. 📦 Pull staging image from GCR
3. 🏷️  Re-tag as `production-YYYYMMDD-HHMMSS` and `production-latest`
4. 📤 Push production images to GCR
5. 🚀 Deploy to Cloud Run production (2 CPU, 1GB RAM)
6. ⏳ Wait 30 seconds for deployment to stabilize
7. 🏥 Run health checks with IAM authentication (20 retries, 100s total)
8. ✅ Log promotion details with enhanced audit trail

### Step 5: Verify Production Deployment

**Test production manually:**
```bash
# Get IAM token
TOKEN=$(gcloud auth print-identity-token)

# Health check (production is IAM-protected)
curl -H "Authorization: Bearer $TOKEN" \
  https://role-directory-production-q5xt7ys22a-rj.a.run.app/api/health
```

---

## Troubleshooting

### Problem: "Dev image not found"

**Error:**
```
Error: Failed to pull dev image: gcr.io/role-directory/role-directory:dev-20231106-143022
```

**Solution:**
- Verify the tag exists:
  ```bash
  gcloud container images list-tags gcr.io/role-directory/role-directory \
    --filter="tags:dev-20231106-143022"
  ```
- Make sure you're using the **exact tag** from a successful dev deployment
- Check that the CI/CD workflow completed successfully

### Problem: "Health check failed"

**Error:**
```
❌ Health check failed after 60 seconds
```

**Solution:**
- Check Cloud Run logs:
  ```bash
  gcloud run services logs read role-directory-staging \
    --region=southamerica-east1 \
    --limit=50
  ```
- Verify the service is running:
  ```bash
  gcloud run services describe role-directory-staging \
    --region=southamerica-east1 \
    --format="value(status.conditions[0].status)"
  ```
- Check if you have IAM permissions to call the service

### Problem: "Confirmation string mismatch" (Production)

**Error:**
```
❌ Confirmation string mismatch. Expected: PROMOTE_TO_PRODUCTION
```

**Solution:**
- Type **exactly**: `PROMOTE_TO_PRODUCTION` (case-sensitive, no spaces)
- Copy/paste from this guide if needed

### Problem: GitHub Environment "production" not found

**Error:**
```
Error: Environment "production" not found
```

**Solution:**
Follow the setup guide in `docs/guides/promotion-workflow-guide.md` to create the GitHub Environment with protection rules.

---

## Quick Reference Commands

### List All Images
```bash
# All dev images
gcloud container images list-tags gcr.io/role-directory/role-directory \
  --filter="tags:dev-*" \
  --sort-by="~timestamp" \
  --limit=10

# All staging images
gcloud container images list-tags gcr.io/role-directory/role-directory \
  --filter="tags:staging-*" \
  --sort-by="~timestamp" \
  --limit=10

# All production images
gcloud container images list-tags gcr.io/role-directory/role-directory \
  --filter="tags:production-*" \
  --sort-by="~timestamp" \
  --limit=10
```

### Check Service Status
```bash
# Dev
gcloud run services describe role-directory-dev \
  --region=southamerica-east1 \
  --format="value(status.url,status.latestReadyRevisionName)"

# Staging
gcloud run services describe role-directory-staging \
  --region=southamerica-east1 \
  --format="value(status.url,status.latestReadyRevisionName)"

# Production
gcloud run services describe role-directory-production \
  --region=southamerica-east1 \
  --format="value(status.url,status.latestReadyRevisionName)"
```

### Health Checks (with IAM auth)
```bash
# Get token
TOKEN=$(gcloud auth print-identity-token)

# Dev (unauthenticated)
curl https://role-directory-dev-q5xt7ys22a-rj.a.run.app/api/health

# Staging (IAM-protected)
curl -H "Authorization: Bearer $TOKEN" \
  https://role-directory-staging-q5xt7ys22a-rj.a.run.app/api/health

# Production (IAM-protected)
curl -H "Authorization: Bearer $TOKEN" \
  https://role-directory-production-q5xt7ys22a-rj.a.run.app/api/health
```

---

## Related Documentation

- **Promotion Workflow Guide:** `docs/guides/promotion-workflow-guide.md`
- **Rollback Procedures:** `docs/3-solutioning/architecture.md#rollback-strategy`
- **Architecture Documentation:** `docs/3-solutioning/architecture.md`

---

**Last Updated:** 2025-11-08  
**Epic:** 1 - DevOps & CI/CD Foundation  
**Stories:** 1-5 (CI/CD), 1-9 (Dev→Staging), 1-10 (Staging→Production)

