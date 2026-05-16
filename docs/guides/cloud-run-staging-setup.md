# Cloud Run Service Setup Guide - Staging Environment

This guide provides step-by-step instructions for setting up the **staging** Cloud Run service for the Role Directory application. The staging environment is designed for pre-production validation and testing before promoting to production.

## Overview

**Service Name:** `role-directory-staging`  
**Region:** `us-central1`  
**Authentication:** IAM protected (not publicly accessible)  
**Scaling:** Min 1 instance (warm standby), Max 3 instances  
**Resources:** 1 CPU, 512 MB memory  
**Purpose:** Pre-production validation and testing

## Key Differences from Dev Environment

| Configuration | Dev | Staging |
|---------------|-----|---------|
| Service Name | `role-directory-dev` | `role-directory-staging` |
| Min Instances | 0 (cost savings) | 1 (warm standby) |
| Max Instances | 2 | 3 |
| Authentication | Public (easier testing) | IAM protected |
| NODE_ENV | `development` | `staging` |
| Database | Dev database | Staging database (Epic 2) |
| Purpose | Rapid iteration | Pre-production validation |

## Prerequisites

Before you begin, ensure you have:

1. **Google Cloud Platform Account**
   - Active GCP account with billing enabled
   - Required roles: `roles/run.admin`, `roles/iam.serviceAccountAdmin`, `roles/secretmanager.admin`
   - Billing account linked to project

2. **gcloud CLI Installed and Authenticated**
   ```bash
   # Check if gcloud is installed
   gcloud version
   
   # If not installed, visit: https://cloud.google.com/sdk/docs/install
   
   # Authenticate with your Google account
   gcloud auth login
   
   # Set your project
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Cloud Run API Enabled**
   ```bash
   # Enable required APIs
   gcloud services enable run.googleapis.com
   gcloud services enable secretmanager.googleapis.com
   ```

4. **Existing Dev Service** (Story 1.4)
   - Ensures consistent setup across environments
   - Reference for configuration validation

## Setup Options

You have two options for setting up the staging Cloud Run service:

### Option 1: Automated Setup (Recommended)

Use the provided shell script for one-command setup:

```bash
# Make script executable (if not already)
chmod +x scripts/setup-cloud-run-staging.sh

# Run the setup script
./scripts/setup-cloud-run-staging.sh
```

The script will:
- ✅ Verify prerequisites (gcloud CLI, authentication, APIs)
- ✅ Create the Cloud Run service with staging configuration
- ✅ Configure scaling (min 1, max 3 instances)
- ✅ Set CPU and memory resources (1 CPU, 512 MB)
- ✅ Create placeholder database secret in Secret Manager
- ✅ Configure environment variables (NODE_ENV, NEXT_PUBLIC_API_URL, DATABASE_URL)
- ✅ Set up IAM authentication (require auth)
- ✅ Add resource labels for organization
- ✅ Display service URL and configuration summary

### Option 2: Manual Setup

Follow the step-by-step instructions below for manual setup.

---

## Manual Setup Instructions

### Step 1: Verify Prerequisites

```bash
# Verify gcloud is authenticated
gcloud auth list

# Verify project is set
gcloud config get-value project

# Verify Cloud Run API is enabled
gcloud services list --enabled | grep run.googleapis.com

# If not enabled, enable it
gcloud services enable run.googleapis.com secretmanager.googleapis.com
```

### Step 2: Create Cloud Run Service

```bash
# Create the staging service with initial configuration
gcloud run deploy role-directory-staging \
  --region=us-central1 \
  --platform=managed \
  --no-allow-unauthenticated \
  --image=gcr.io/cloudrun/hello \
  --min-instances=1 \
  --max-instances=3 \
  --cpu=1 \
  --memory=512Mi \
  --port=8080 \
  --ingress=all \
  --labels=environment=staging,app=role-directory

# Note: We use the Hello World image initially, will replace with actual app image in deployment workflow
```

**Expected output:**
```
Deploying container to Cloud Run service [role-directory-staging] in project [YOUR_PROJECT] region [us-central1]
✓ Deploying... Done.
  ✓ Creating Revision...
  ✓ Routing traffic...
Done.
Service [role-directory-staging] revision [role-directory-staging-00001-xxx] has been deployed and is serving 100 percent of traffic.
Service URL: https://role-directory-staging-xxxxx-uc.a.run.app
```

**Record the Service URL** - you'll need it for environment variables and CI/CD configuration.

### Step 3: Get Service URL and Configure Environment Variables

```bash
# Get the service URL
SERVICE_URL=$(gcloud run services describe role-directory-staging \
  --region=us-central1 \
  --format="value(status.url)")

echo "Service URL: $SERVICE_URL"

# Set environment variables including the service URL
gcloud run services update role-directory-staging \
  --region=us-central1 \
  --set-env-vars=NODE_ENV=staging,NEXT_PUBLIC_API_URL=$SERVICE_URL
```

### Step 4: Set Up Database Secret in Secret Manager

**Note:** This creates a placeholder secret. You'll update it with the actual database URL in Epic 2 when the Neon staging database is provisioned.

```bash
# Create a placeholder database URL secret
# Replace with actual connection string when available
echo "postgresql://placeholder:placeholder@placeholder:5432/placeholder?sslmode=require" | \
  gcloud secrets create role-directory-staging-db-url \
    --data-file=- \
    --replication-policy=automatic

# Get the project number (needed for service account)
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) \
  --format="value(projectNumber)")

# Get the Cloud Run service account email
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "Service Account: $SERVICE_ACCOUNT"

# Grant the Cloud Run service account access to the secret
gcloud secrets add-iam-policy-binding role-directory-staging-db-url \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"

# Configure Cloud Run to use the secret as DATABASE_URL environment variable
gcloud run services update role-directory-staging \
  --region=us-central1 \
  --set-secrets=DATABASE_URL=role-directory-staging-db-url:latest
```

### Step 5: Configure IAM Authentication

The staging service is IAM protected (not publicly accessible). You need to grant access to authorized users and service accounts.

```bash
# Grant your GitHub Actions service account access (if already created from Story 1.5)
# Replace with your actual service account email
GHA_SA_EMAIL="github-actions@YOUR_PROJECT.iam.gserviceaccount.com"

gcloud run services add-iam-policy-binding role-directory-staging \
  --region=us-central1 \
  --member="serviceAccount:${GHA_SA_EMAIL}" \
  --role="roles/run.invoker"

# Grant yourself access for testing (optional)
gcloud run services add-iam-policy-binding role-directory-staging \
  --region=us-central1 \
  --member="user:$(gcloud config get-value account)" \
  --role="roles/run.invoker"
```

### Step 6: Verify Configuration

```bash
# Verify service exists and is configured correctly
gcloud run services describe role-directory-staging \
  --region=us-central1 \
  --format=yaml

# Check scaling configuration
gcloud run services describe role-directory-staging \
  --region=us-central1 \
  --format="value(spec.template.metadata.annotations)"

# Check resources
gcloud run services describe role-directory-staging \
  --region=us-central1 \
  --format="value(spec.template.spec.containers[0].resources)"

# Check environment variables
gcloud run services describe role-directory-staging \
  --region=us-central1 \
  --format="value(spec.template.spec.containers[0].env)"

# Check labels
gcloud run services describe role-directory-staging \
  --region=us-central1 \
  --format="value(metadata.labels)"

# List all Cloud Run services
gcloud run services list --filter="role-directory-staging"
```

### Step 7: Test Service (After Deployment)

**Note:** Testing requires a deployed application image. This will be done via the promotion workflow (Story 1.9).

```bash
# Test that service requires authentication (should fail without token)
curl https://role-directory-staging-xxxxx-uc.a.run.app/api/health
# Expected: 403 Forbidden (authentication required)

# Test with authentication token
curl -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
  https://role-directory-staging-xxxxx-uc.a.run.app/api/health
# Expected: 200 OK with {"status":"ok","timestamp":"..."}
```

---

## Configuration Summary

After completing the setup, your staging Cloud Run service should have the following configuration:

```yaml
service_name: role-directory-staging
region: us-central1
platform: managed

scaling:
  min_instances: 1      # Warm standby for pre-prod
  max_instances: 3      # Cost control

resources:
  cpu: 1
  memory: 512Mi

environment:
  NODE_ENV: staging
  NEXT_PUBLIC_API_URL: https://role-directory-staging-xxxxx-uc.a.run.app
  DATABASE_URL: (from Secret Manager: role-directory-staging-db-url)

security:
  authentication: required  # IAM protected
  ingress: all             # Internet accessible with auth

container:
  port: 8080

labels:
  environment: staging
  app: role-directory
```

## Service URL Storage

**Important:** Record your staging service URL for use in:

1. **GitHub Actions Workflows** (Stories 1.9, 1.10)
   - Manual promotion workflows will deploy to this URL
   - Health checks will verify this endpoint

2. **CI/CD Configuration**
   - Add to GitHub Secrets as `STAGING_SERVICE_URL` (optional)
   - Reference in promotion workflow files

3. **Documentation**
   - Update project README with staging URL
   - Include in deployment documentation

**Your Staging Service URL:**
```
https://role-directory-staging-xxxxx-uc.a.run.app
```

## Cost Implications

**Staging Environment Costs:**
- **Min 1 instance (always running):** ~$0.024/hour = ~$17/month
- **Max 3 instances (peak load):** ~$51/month if all instances running
- **Typical usage:** $20-30/month
- **Rationale:** Warm standby ensures fast response times for pre-production testing

**Cost Optimization Tips:**
- Monitor usage via GCP Console → Cloud Run → Metrics
- Review scaling behavior to adjust min/max instances if needed
- Consider temporary scale-to-zero during off-hours (weekends) if cost is a concern
- Set up billing alerts to monitor spending

## Updating Database Secret (Epic 2)

When you provision the Neon staging database in Epic 2, update the secret:

```bash
# Update the secret with the actual staging database URL
echo "postgresql://user:password@staging-host.neon.tech:5432/role_directory_staging?sslmode=require" | \
  gcloud secrets versions add role-directory-staging-db-url --data-file=-

# The Cloud Run service will automatically use the latest version
# No need to redeploy unless you want immediate pickup
```

## IAM Roles Reference

**Required IAM Roles for Setup:**
- `roles/run.admin` - Create and configure Cloud Run services
- `roles/secretmanager.admin` - Create and manage secrets
- `roles/iam.serviceAccountAdmin` - Grant IAM bindings

**Required IAM Roles for GitHub Actions:**
- `roles/run.invoker` - Invoke Cloud Run service (deployment triggers)
- `roles/secretmanager.secretAccessor` - Read secrets (for DATABASE_URL)

## Troubleshooting

### Issue: "Permission denied" when creating service

**Solution:**
```bash
# Verify you have required roles
gcloud projects get-iam-policy $(gcloud config get-value project) \
  --flatten="bindings[].members" \
  --format="table(bindings.role)" \
  --filter="bindings.members:$(gcloud config get-value account)"

# If missing roles, contact project owner to grant access
```

### Issue: "API not enabled" error

**Solution:**
```bash
# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### Issue: Cannot access service URL (403 Forbidden)

**Solution:**
```bash
# Staging is IAM protected - you need authentication token
curl -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
  YOUR_STAGING_URL/api/health

# Grant yourself invoker role if needed
gcloud run services add-iam-policy-binding role-directory-staging \
  --region=us-central1 \
  --member="user:$(gcloud config get-value account)" \
  --role="roles/run.invoker"
```

### Issue: Service not scaling as expected

**Solution:**
```bash
# Check current scaling settings
gcloud run services describe role-directory-staging \
  --region=us-central1 \
  --format="value(spec.template.metadata.annotations)"

# Update scaling if needed
gcloud run services update role-directory-staging \
  --region=us-central1 \
  --min-instances=1 \
  --max-instances=3
```

## Next Steps

After completing the staging Cloud Run service setup:

1. ✅ **Story 1.8:** Set up production Cloud Run service (similar process with different config)
2. ✅ **Story 1.9:** Create manual promotion workflow (dev → staging)
3. ✅ **Story 1.10:** Create manual promotion workflow (staging → production)
4. ✅ **Epic 2:** Provision Neon staging database and update DATABASE_URL secret

## References

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [Cloud Run IAM Documentation](https://cloud.google.com/run/docs/authenticating/overview)
- [Story 1.4: Dev Environment Setup](./cloud-run-dev-setup.md)
- [Story 1.9: Manual Promotion Workflow](../../stories/1-9-manual-promotion-workflow-dev-staging.md)

## Support

For issues or questions:
- Check [TROUBLESHOOTING.md](../../bmm/docs/troubleshooting.md)
- Review [Architecture Documentation](../3-solutioning/architecture.md)
- Contact: danielvm (Project Owner)

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-07  
**Story:** 1.7 - Cloud Run Service Setup (Staging)  
**Status:** Implementation Complete

