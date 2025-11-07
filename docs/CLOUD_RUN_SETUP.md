# Cloud Run Service Setup Guide

This document provides step-by-step instructions for setting up Cloud Run services for the Role Directory application across different environments (dev, staging, production).

## Prerequisites

Before you begin, ensure you have:

1. **Google Cloud Platform Account**
   - Active GCP account with billing enabled
   - Required roles: Project Owner or Editor
   - Billing account linked to project

2. **gcloud CLI Installed**
   ```bash
   # Check if gcloud is installed
   gcloud version
   
   # If not installed, visit: https://cloud.google.com/sdk/docs/install
   ```

3. **Authentication**
   ```bash
   # Authenticate with your Google account
   gcloud auth login
   
   # Set your project (you'll set this up in Step 1)
   gcloud config set project YOUR_PROJECT_ID
   ```

## Environment Setup

### Dev Environment

#### Step 1: Create GCP Project (if needed)

```bash
# List existing projects
gcloud projects list

# Create new project (if needed)
gcloud projects create role-directory-dev-project \
  --name="Role Directory Dev"

# Set as active project
gcloud config set project role-directory-dev-project

# Link billing account (required for Cloud Run)
# Find your billing account ID first
gcloud billing accounts list

# Link billing
gcloud billing projects link role-directory-dev-project \
  --billing-account=YOUR_BILLING_ACCOUNT_ID
```

#### Step 2: Enable Required APIs

```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Artifact Registry (for container storage)
gcloud services enable artifactregistry.googleapis.com

# Enable Secret Manager (for database credentials)
gcloud services enable secretmanager.googleapis.com

# Enable Cloud Build (for CI/CD deployments)
gcloud services enable cloudbuild.googleapis.com

# Verify APIs are enabled
gcloud services list --enabled
```

#### Step 3: Create Secrets in Secret Manager

```bash
# Create DATABASE_URL secret with placeholder
echo "postgresql://placeholder-will-be-replaced-in-epic-2" | \
  gcloud secrets create role-directory-dev-db-url \
  --data-file=- \
  --replication-policy="automatic"

# Verify secret creation
gcloud secrets list

# View secret (metadata only, not value)
gcloud secrets describe role-directory-dev-db-url
```

#### Step 4: Configure IAM Permissions for Secrets

```bash
# Get your project number
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) \
  --format="value(projectNumber)")

echo "Project Number: $PROJECT_NUMBER"

# Grant Cloud Run service account access to secrets
gcloud secrets add-iam-policy-binding role-directory-dev-db-url \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Verify IAM policy
gcloud secrets get-iam-policy role-directory-dev-db-url
```

#### Step 5: Create Cloud Run Service

**Important:** You have two options:

**Option A: Create service now with placeholder container** (recommended for testing infrastructure)
```bash
# Deploy a minimal Hello World container
gcloud run deploy role-directory-dev \
  --image=us-docker.pkg.dev/cloudrun/container/hello \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --min-instances=0 \
  --max-instances=10 \
  --cpu=1 \
  --memory=512Mi \
  --set-env-vars NODE_ENV=development \
  --set-secrets=DATABASE_URL=role-directory-dev-db-url:latest
```

**⚠️ Important Notes:**
- **Do NOT set PORT env var** - Cloud Run sets this automatically (causes deployment failure)
- `--allow-unauthenticated` alone may not work - see Step 5.1 for IAM fix

**Option B: Wait for Story 1.5** to deploy your actual application
- Service will be created automatically during first deployment
- Skip to Step 7 (verification) after Story 1.5 deployment

#### Step 5.1: Enable Public Access (Critical)

The `--allow-unauthenticated` flag doesn't always apply IAM policy correctly. Fix manually:

```bash
# Grant public access to invoke the service
gcloud run services add-iam-policy-binding role-directory-dev \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/run.invoker"

# Verify policy
gcloud run services get-iam-policy role-directory-dev \
  --region=us-central1
```

**Expected output:**
```yaml
bindings:
- members:
  - allUsers
  role: roles/run.invoker
```

#### Step 6: Verify Service Configuration

```bash
# List Cloud Run services
gcloud run services list --region=us-central1

# Describe service details
gcloud run services describe role-directory-dev --region=us-central1

# Get service URL
SERVICE_URL=$(gcloud run services describe role-directory-dev \
  --region=us-central1 \
  --format="value(status.url)")

echo "Service URL: $SERVICE_URL"

# Test service accessibility
curl $SERVICE_URL
```

#### Step 7: View Service Logs

```bash
# View recent logs
gcloud run services logs read role-directory-dev \
  --region=us-central1 \
  --limit=50

# Stream logs in real-time
gcloud run services logs tail role-directory-dev \
  --region=us-central1
```

#### Step 8: Document Configuration

Save this information for CI/CD configuration (Story 1.5):

```bash
# Get all important values
echo "=== Dev Environment Configuration ==="
echo "Project ID: $(gcloud config get-value project)"
echo "Project Number: $PROJECT_NUMBER"
echo "Region: us-central1"
echo "Service Name: role-directory-dev"
echo "Service URL: $SERVICE_URL"
echo ""
echo "=== For GitHub Secrets (Story 1.5) ==="
echo "GCP_PROJECT_ID: $(gcloud config get-value project)"
echo "GCP_SERVICE_ACCOUNT_KEY: (create in next step)"
```

## Service Configuration Reference

### Dev Environment Specifications

| Setting | Value | Rationale |
|---------|-------|-----------|
| **Service Name** | `role-directory-dev` | Identifies dev environment |
| **Region** | `us-central1` | Central US, good latency for most users |
| **CPU** | 1 vCPU | Sufficient for MVP dev workload |
| **Memory** | 512Mi | Adequate for Next.js application |
| **Min Instances** | 0 | Scale to zero for cost savings |
| **Max Instances** | 10 | Cost control (prevents runaway costs) |
| **Concurrency** | 80 (default) | Cloud Run default, adjust if needed |
| **Timeout** | 300s (5 min) | Default, sufficient for most requests |
| **Public Access** | Yes | Allow unauthenticated (MVP requirement) |

### Environment Variables

| Variable | Value | Source | When Added | Notes |
|----------|-------|--------|------------|-------|
| `NODE_ENV` | `development` | Direct env var | Story 1.4 | |
| `PORT` | `8080` | **Auto-set by Cloud Run** | - | ⚠️ **DO NOT set manually** |
| `DATABASE_URL` | (placeholder) | Secret Manager | Story 1.4 (updated Epic 2) | Optional until Epic 2 |
| `NEON_AUTH_PROJECT_ID` | TBD | Secret Manager | Epic 3 | |
| `NEON_AUTH_SECRET_KEY` | TBD | Secret Manager | Epic 3 | |
| `ALLOWED_EMAILS` | TBD | Direct env var | Epic 3 | |

### Cost Expectations

**Free Tier (per month):**
- 2 million requests
- 360,000 GB-seconds of compute time
- 180,000 vCPU-seconds

**Dev Environment Expected Usage:**
- Occasional testing/development access
- Scales to zero when idle
- **Expected cost: $0-3/month** (within free tier)

## Troubleshooting

### Issue: "Error 403 Forbidden" When Accessing Service

**Symptom:** Service deploys successfully but returns 403 when accessed via browser/curl

**Root Cause:** IAM policy not applied correctly despite `--allow-unauthenticated` flag

**Solution:** Manually grant public access:
```bash
gcloud run services add-iam-policy-binding role-directory-dev \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/run.invoker"
```

**Verification:**
```bash
# Should return HTTP 200
curl -I https://YOUR-SERVICE-URL
```

### Issue: "PORT environment variable" Deployment Error

**Symptom:** `ERROR: spec.template.spec.containers[0].env: The following reserved env names were provided: PORT`

**Root Cause:** Cloud Run automatically sets PORT - manual override conflicts

**Solution:** Remove PORT from `--set-env-vars`:
```bash
# ❌ WRONG
--set-env-vars NODE_ENV=development,PORT=8080

# ✅ CORRECT  
--set-env-vars NODE_ENV=development
```

### Issue: "Missing required argument [--clear-base-image]"

**Symptom:** `ERROR: Missing required argument [--clear-base-image]: Base image is not supported for services built from Dockerfile`

**Root Cause:** Service was previously deployed with different build method (buildpacks ↔ Dockerfile)

**Solution:** Add `--clear-base-image` flag when switching build methods:
```bash
# Switching from buildpacks to Dockerfile (or vice versa)
gcloud run deploy role-directory-dev \
  --source . \
  --region us-central1 \
  --clear-base-image \
  ... # other flags
```

**Prevention:** Once you choose a build method, stick with it to avoid this issue

### Issue: "Permission Denied" During Deployment

**Solution:** Verify you have necessary roles:
```bash
# Check your roles
gcloud projects get-iam-policy $(gcloud config get-value project) \
  --flatten="bindings[].members" \
  --filter="bindings.members:user:YOUR_EMAIL"
```

Required roles:
- `roles/owner` OR `roles/editor`
- `roles/run.admin`
- `roles/secretmanager.admin`

### Issue: "Billing Not Enabled"

**Solution:** Link billing account:
```bash
# List billing accounts
gcloud billing accounts list

# Link to project
gcloud billing projects link $(gcloud config get-value project) \
  --billing-account=YOUR_BILLING_ACCOUNT_ID
```

### Issue: Service Won't Deploy

**Solution:** Check logs and status:
```bash
# Check service status
gcloud run services describe role-directory-dev \
  --region=us-central1 \
  --format="value(status.conditions)"

# View detailed logs
gcloud run services logs read role-directory-dev \
  --region=us-central1 \
  --limit=100
```

### Issue: Secrets Not Accessible

**Solution:** Verify IAM permissions:
```bash
# Check secret IAM policy
gcloud secrets get-iam-policy role-directory-dev-db-url

# Re-grant if needed
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) \
  --format="value(projectNumber)")

gcloud secrets add-iam-policy-binding role-directory-dev-db-url \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## Next Steps

After completing dev environment setup:

1. **Story 1.5**: Configure GitHub Actions deployment
   - Create service account for CI/CD
   - Add GCP credentials to GitHub Secrets
   - Deploy application automatically on push to main

2. **Story 1.6**: Implement health check endpoint
   - Add `/api/health` route to Next.js application
   - Configure Cloud Run health checks

3. **Stories 1.7-1.8**: Set up staging and production environments
   - Repeat this process for staging and production
   - Configure environment-specific secrets
   - Set up promotion workflows

## Key Lessons Learned

### 1. PORT Environment Variable
**Problem:** Setting `PORT=8080` manually causes deployment failure  
**Reason:** Cloud Run automatically injects PORT - conflicts with manual setting  
**Solution:** Never set PORT in deployment commands or env vars

### 2. Public Access IAM Policy  
**Problem:** `--allow-unauthenticated` flag doesn't always work  
**Reason:** Flag doesn't consistently apply IAM policy binding  
**Solution:** Always verify with `get-iam-policy` and manually bind if needed:
```bash
gcloud run services add-iam-policy-binding SERVICE_NAME \
  --member="allUsers" --role="roles/run.invoker"
```

### 3. Buildpacks vs Dockerfile
**Finding:** Cloud Run buildpacks auto-detect Next.js and work well  
**Recommendation:** Start with buildpacks (no Dockerfile), optimize later if needed  
**Benefit:** Simpler setup, automatic optimizations, less maintenance

**⚠️ Important - Switching Build Methods:**
If you switch between buildpacks and Dockerfile, you MUST clear the base image:
```bash
# When switching FROM buildpacks TO Dockerfile
gcloud run deploy SERVICE_NAME --source . --clear-base-image ...

# When switching FROM Dockerfile TO buildpacks  
gcloud run deploy SERVICE_NAME --source . --clear-base-image ...
```
**Error if not cleared:** `Missing required argument [--clear-base-image]`

### 4. Secrets Management
**Best Practice:** Create secrets early, even with placeholder values  
**Reason:** Prevents deployment failures, easier to update later  
**Note:** Services can deploy without secrets if not referenced

### 5. GitHub Actions Service Account
**Required Permissions:**
- `roles/artifactregistry.admin` (create repositories)
- `roles/cloudbuild.builds.editor` (trigger builds)
- `roles/run.developer` (deploy services)
- `roles/iam.serviceAccountUser` (act as service accounts)
- `roles/serviceusage.serviceUsageConsumer` (use APIs)
- `roles/storage.admin` (build artifacts)

**Cloud Build Service Account also needs:**
- `roles/run.admin` (deploy to Cloud Run)
- `roles/iam.serviceAccountUser` (impersonate)

## References

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [gcloud CLI Reference](https://cloud.google.com/sdk/gcloud/reference)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing)
- [Cloud Run IAM](https://cloud.google.com/run/docs/securing/managing-access)

