# GitHub Actions Deployment Setup Guide

This document provides step-by-step instructions for configuring GitHub Actions to deploy automatically to Google Cloud Run.

## Prerequisites

Before you begin, ensure you have completed:

1. **Story 1.4**: Cloud Run service created (`role-directory-dev`)
2. **GCP Project**: Project ID from Story 1.4 setup
3. **GitHub Repository**: Code pushed to GitHub with Actions enabled
4. **gcloud CLI**: Installed and authenticated

## Overview

This setup enables automatic deployment to Cloud Run whenever code is pushed to the `main` branch:

```
Push to main → GitHub Actions → Build & Test → Deploy to Cloud Run → Health Check
```

## Step-by-Step Setup

### Step 1: Create GCP Service Account

The service account allows GitHub Actions to deploy to Cloud Run without using your personal credentials.

```bash
# Set your project ID (from Story 1.4)
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Create service account
gcloud iam service-accounts create github-actions-deployer \
  --display-name="GitHub Actions Deployer" \
  --description="Service account for GitHub Actions CI/CD pipeline"

# Verify creation
gcloud iam service-accounts list
```

### Step 2: Grant Required IAM Roles

Grant the service account permissions to deploy to Cloud Run and push Docker images:

```bash
# Get service account email
SERVICE_ACCOUNT_EMAIL="github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com"

# Role 1: Cloud Run Developer (deploy services)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/run.developer"

# Role 2: Service Account User (act as Cloud Run service account)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/iam.serviceAccountUser"

# Role 3: Storage Admin (CRITICAL for GCR push - added 2025-11-08)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/storage.admin"

# Role 4: Artifact Registry Writer (create repos on push - added 2025-11-08)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/artifactregistry.writer"

# Role 5: Artifact Registry Admin (full access - optional but recommended)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/artifactregistry.admin"

# Role 6: Cloud Build Editor (for build management)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/cloudbuild.builds.editor"

# Role 7: Service Usage Consumer (use GCP APIs)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/serviceusage.serviceUsageConsumer"

# Verify roles
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:${SERVICE_ACCOUNT_EMAIL}"
```

**Key Updates (2025-11-08):**
- ✅ **Storage Admin**: Required to push Docker images to Google Container Registry (GCR)
- ✅ **Artifact Registry Writer**: Required to create repositories automatically on push
- ✅ **Artifact Registry Admin**: Provides full access for repository management

**Why These Roles Are Critical:**
Without `storage.admin`, the CI/CD workflow will fail with:
```
ERROR: denied: gcr.io repo does not exist. Creating on push requires 
the artifactregistry.repositories.createOnPush permission
```

### Step 3: Generate Service Account Key

Create a JSON key file for GitHub Actions authentication:

```bash
# Generate key file
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=${SERVICE_ACCOUNT_EMAIL}

# Key file created: github-actions-key.json
# ⚠️ IMPORTANT: Keep this file secure! Do not commit to git!

# View key info (not the actual key)
gcloud iam service-accounts keys list \
  --iam-account=${SERVICE_ACCOUNT_EMAIL}
```

### Step 4: Add Secrets to GitHub

Navigate to your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**

Add the following secrets:

#### Secret 1: GCP_SERVICE_ACCOUNT_KEY

```bash
# Copy the ENTIRE contents of github-actions-key.json
cat github-actions-key.json

# In GitHub:
# Name: GCP_SERVICE_ACCOUNT_KEY
# Value: [Paste entire JSON content from the file]
```

**Important:** Copy the entire JSON including curly braces `{ ... }`

#### Secret 2: GCP_PROJECT_ID (CRITICAL - Added 2025-11-08)

```
Name: GCP_PROJECT_ID
Value: your-project-id
```

Use the same project ID from Story 1.4.

**⚠️ CRITICAL:** This secret is REQUIRED for CI/CD to work. Without it, Docker image builds will fail with:
```
ERROR: failed to build: invalid tag "gcr.io//role-directory:dev-..." 
invalid reference format
```

The workflow uses this to construct Docker image tags:
```yaml
IMAGE_NAME="gcr.io/${GCP_PROJECT_ID}/role-directory"
```

#### Optional Secrets (for Epic 3)

These can be added now with placeholder values:

```
Name: NEON_AUTH_PROJECT_ID
Value: placeholder-epic-3

Name: ALLOWED_EMAILS_DEV
Value: your-email@example.com
```

### Step 5: Verify Secrets

After adding secrets, you should see them listed (values hidden):

- `GCP_SERVICE_ACCOUNT_KEY` - Added [date]
- `GCP_PROJECT_ID` - Added [date]

### Step 6: Secure the Service Account Key

```bash
# After adding to GitHub, securely delete the local key file
# ⚠️ Make sure it's in GitHub first!
shred -vfz -n 10 github-actions-key.json  # Linux
# or
rm -P github-actions-key.json  # macOS

# Verify deletion
ls -la github-actions-key.json  # Should show "No such file"
```

### Step 7: Test the Deployment

Push a change to the `main` branch to trigger the workflow:

```bash
# Make a trivial change
echo "# CI/CD Test" >> README.md
git add README.md
git commit -m "test: Trigger CI/CD deployment"
git push origin main
```

### Step 8: Monitor Deployment

1. Go to your GitHub repository
2. Click **Actions** tab
3. Select the latest workflow run
4. Watch the stages:
   - ✅ Build and Quality Checks
   - ⏳ Deploy to Dev Environment
   - 🏥 Health Check (will fail until Story 1.6)

### Step 9: Verify Deployment

After workflow completes:

```bash
# Get the deployed service URL
gcloud run services describe role-directory-dev \
  --region southamerica-east1 \
  --format="value(status.url)"

# Test the service
curl https://role-directory-dev-[hash].run.app

# View deployment logs
gcloud run services logs read role-directory-dev \
  --region southamerica-east1 \
  --limit 50
```

## Workflow Configuration

The updated `.github/workflows/ci-cd.yml` now includes:

### Job 1: Build and Quality Checks
- Checkout code
- Setup Node.js with caching
- Install dependencies (`npm ci`)
- Run ESLint
- Run TypeScript type check
- Build Next.js application

### Job 2: Deploy to Dev (depends on Build)
- Checkout code
- Authenticate with GCP
- Setup gcloud CLI
- Deploy to Cloud Run (using `--source .`)
- Get service URL
- Run health check (retries for 60 seconds)
- Post deployment summary

## Deployment Configuration

| Setting | Value | Source |
|---------|-------|--------|
| **Service Name** | `role-directory-dev` | Hardcoded |
| **Region** | `southamerica-east1` | Hardcoded |
| **Source** | `.` (current directory) | Cloud Build handles Docker |
| **CPU** | 1 vCPU | Hardcoded |
| **Memory** | 512Mi | Hardcoded |
| **Min Instances** | 0 | Hardcoded |
| **Max Instances** | 10 | Hardcoded |
| **NODE_ENV** | `development` | Direct env var |
| **PORT** | `8080` | Direct env var |
| **DATABASE_URL** | From Secret Manager | `role-directory-dev-db-url:latest` |

## Security Best Practices

✅ **DO:**
- Use service accounts with minimal permissions
- Store credentials in GitHub Secrets
- Delete local key files after adding to GitHub
- Use Secret Manager for sensitive environment variables
- Rotate service account keys periodically (every 90 days)

❌ **DON'T:**
- Commit service account keys to git
- Use personal GCP credentials in CI/CD
- Grant overly broad IAM roles (like Owner or Editor)
- Store secrets in workflow files
- Share service account keys via email or chat

## Troubleshooting

### Issue: "Permission Denied" During Deployment

**Symptom:** Workflow fails with permission errors

**Solution:** Verify all required roles are granted:
```bash
# Check roles
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:${SERVICE_ACCOUNT_EMAIL}"
```

### Issue: "Secret Not Found"

**Symptom:** Workflow fails to find `GCP_SERVICE_ACCOUNT_KEY`

**Solution:**
1. Go to GitHub Settings → Secrets and variables → Actions
2. Verify secret exists and name matches exactly
3. Check that secret scope is "Repository" not "Environment"

### Issue: Health Check Fails

**Symptom:** Health check times out after 60 seconds

**Expected:** This is normal until Story 1.6 (Health Check Endpoint) is implemented.

**Current Behavior:** 
- Deployment succeeds
- Health check fails (endpoint doesn't exist yet)
- Workflow shows failure but service is actually deployed

**Solution:** Continue to Story 1.6 to implement `/api/health` endpoint.

### Issue: Cloud Build Fails

**Symptom:** `gcloud run deploy` fails during build

**Solution:**
1. Check Cloud Build API is enabled
2. Verify Dockerfile exists and is valid
3. Check build logs in GCP Console → Cloud Build
4. Ensure service account has `cloudbuild.builds.editor` role

### Issue: Service Account Key Invalid

**Symptom:** Authentication fails with "invalid_grant"

**Solution:**
1. Verify JSON was copied completely (including `{` and `}`)
2. Check no extra whitespace or newlines were added
3. Regenerate key if needed:
```bash
# List keys
gcloud iam service-accounts keys list \
  --iam-account=${SERVICE_ACCOUNT_EMAIL}

# Delete old key
gcloud iam service-accounts keys delete KEY_ID \
  --iam-account=${SERVICE_ACCOUNT_EMAIL}

# Create new key
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=${SERVICE_ACCOUNT_EMAIL}
```

## Performance Expectations

| Stage | Duration | Notes |
|-------|----------|-------|
| **Build & Quality Checks** | 2-3 min | With npm caching |
| **Deploy to Cloud Run** | 4-6 min | Cloud Build + deployment |
| **Health Check** | 10-60 sec | Includes cold start |
| **Total** | 7-10 min | Target: <10 minutes |

## Cost Impact

**GitHub Actions:**
- Free tier: 2,000 minutes/month (private repos)
- Unlimited for public repos
- Each deployment: ~7-10 minutes

**Google Cloud:**
- Cloud Build: 120 build-minutes/day free
- Cloud Run: Free tier covers dev usage
- Expected additional cost: $0/month (within free tiers)

## Next Steps

After completing this setup:

1. **Story 1.6**: Implement `/api/health` endpoint
   - Health check will start passing
   - Deployment workflow will complete successfully

2. **Story 1.7-1.8**: Set up staging and production environments
   - Create additional Cloud Run services
   - Configure environment-specific workflows
   - Implement promotion workflows

3. **Epic 2**: Add database connectivity
   - Update DATABASE_URL secret with real value
   - Test database connections in deployed service

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [google-github-actions/auth](https://github.com/google-github-actions/auth)
- [google-github-actions/setup-gcloud](https://github.com/google-github-actions/setup-gcloud)
- [Cloud Run IAM Roles](https://cloud.google.com/run/docs/reference/iam/roles)
- [Service Account Best Practices](https://cloud.google.com/iam/docs/best-practices-service-accounts)

