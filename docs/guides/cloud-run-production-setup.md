# Cloud Run Service Setup Guide - Production Environment

This guide provides step-by-step instructions for setting up the **production** Cloud Run service for the Role Directory application.

## Overview

**Service Name:** `role-directory-production`  
**Region:** `southamerica-east1`  
**Authentication:** IAM protected (not publicly accessible)  
**Scaling:** Min 0 instances (scale to zero), Max 2 instances  
**Resources:** 1 CPU, 512 MB memory  
**Purpose:** Live production service for end users

## Configuration Summary

All environments (dev, staging, production) use identical resource configuration for simplicity and cost optimization:

| Configuration | Value |
|---------------|-------|
| Min Instances | 0 (scale to zero) |
| Max Instances | 2 |
| CPU | 1 vCPU |
| Memory | 512 MB |
| Authentication | IAM protected (staging/prod), Public (dev only) |
| Port | 8080 |

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
# Create the production service with initial configuration
gcloud run deploy role-directory-production \
  --region=southamerica-east1 \
  --platform=managed \
  --no-allow-unauthenticated \
  --image=gcr.io/cloudrun/hello \
  --min-instances=0 \
  --max-instances=2 \
  --cpu=1 \
  --memory=512Mi \
  --port=8080 \
  --ingress=all \
  --labels=environment=production,app=role-directory

# Note: We use the Hello World image initially, will replace with actual app image via promotion workflow
```

**Expected output:**
```
Deploying container to Cloud Run service [role-directory-production] in project [YOUR_PROJECT] region [southamerica-east1]
✓ Deploying... Done.
  ✓ Creating Revision...
  ✓ Routing traffic...
Done.
Service [role-directory-production] revision [role-directory-production-00001-xxx] has been deployed and is serving 100 percent of traffic.
Service URL: https://role-directory-production-xxxxx-uc.a.run.app
```

**Record the Service URL** - you'll need it for environment variables and CI/CD configuration.

### Step 3: Configure Environment Variables

```bash
# Get the service URL
SERVICE_URL=$(gcloud run services describe role-directory-production \
  --region=southamerica-east1 \
  --format="value(status.url)")

echo "Service URL: $SERVICE_URL"

# Set environment variables including the service URL
gcloud run services update role-directory-production \
  --region=southamerica-east1 \
  --set-env-vars=NODE_ENV=production,NEXT_PUBLIC_API_URL=$SERVICE_URL
```

### Step 4: Set Up Database Secret in Secret Manager

**Note:** This creates a placeholder secret. You'll update it with the actual database URL in Epic 2.

```bash
# Create a placeholder database URL secret
echo "postgresql://placeholder:placeholder@placeholder:5432/placeholder?sslmode=require" | \
  gcloud secrets create role-directory-production-db-url \
    --data-file=- \
    --replication-policy=automatic

# Get the project number (needed for service account)
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) \
  --format="value(projectNumber)")

# Get the Cloud Run service account email
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "Service Account: $SERVICE_ACCOUNT"

# Grant the Cloud Run service account access to the secret
gcloud secrets add-iam-policy-binding role-directory-production-db-url \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"

# Configure Cloud Run to use the secret as DATABASE_URL environment variable
gcloud run services update role-directory-production \
  --region=southamerica-east1 \
  --set-secrets=DATABASE_URL=role-directory-production-db-url:latest
```

### Step 5: Configure IAM Authentication

The production service is IAM protected. Grant access to authorized users and service accounts.

```bash
# Grant your GitHub Actions service account access (if already created)
# Replace with your actual service account email
GHA_SA_EMAIL="github-actions-deployer@YOUR_PROJECT.iam.gserviceaccount.com"

gcloud run services add-iam-policy-binding role-directory-production \
  --region=southamerica-east1 \
  --member="serviceAccount:${GHA_SA_EMAIL}" \
  --role="roles/run.invoker"

# Grant yourself access for testing (optional)
gcloud run services add-iam-policy-binding role-directory-production \
  --region=southamerica-east1 \
  --member="user:$(gcloud config get-value account)" \
  --role="roles/run.invoker"
```

### Step 6: Verify Configuration

```bash
# Verify service exists and is configured correctly
gcloud run services describe role-directory-production \
  --region=southamerica-east1

# Check scaling configuration
gcloud run services describe role-directory-production \
  --region=southamerica-east1 \
  --format="value(spec.template.metadata.annotations)"

# Check resources
gcloud run services describe role-directory-production \
  --region=southamerica-east1 \
  --format="value(spec.template.spec.containers[0].resources)"

# Check environment variables
gcloud run services describe role-directory-production \
  --region=southamerica-east1 \
  --format="value(spec.template.spec.containers[0].env)"

# List all Cloud Run services
gcloud run services list
```

### Step 7: Test Service (After Deployment via Promotion Workflow)

```bash
# Test that service requires authentication (should fail without token)
curl https://role-directory-production-xxxxx-uc.a.run.app/api/health
# Expected: 403 Forbidden (authentication required)

# Test with authentication token
curl -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
  https://role-directory-production-xxxxx-uc.a.run.app/api/health
# Expected: 200 OK with {"status":"ok","timestamp":"..."}
```

## Final Configuration

Your production Cloud Run service configuration:

```yaml
service_name: role-directory-production
region: southamerica-east1
platform: managed

scaling:
  min_instances: 0      # Scale to zero (same as dev/staging)
  max_instances: 3      # Sufficient for solo usage (same as dev/staging)

resources:
  cpu: 1                # Minimal (same as dev/staging)
  memory: 512Mi         # Minimal (same as dev/staging)

environment:
  NODE_ENV: production
  NEXT_PUBLIC_API_URL: https://role-directory-production-xxxxx-uc.a.run.app
  DATABASE_URL: (from Secret Manager: role-directory-production-db-url)

security:
  authentication: required  # IAM protected
  ingress: all             # Internet accessible with auth

container:
  port: 8080

labels:
  environment: production
  app: role-directory
```

## Cost Implications

**Production Environment Costs:**
- **Scale to zero (min 0):** $0 when idle
- **Active usage:** ~$0.024/hour per instance when running
- **Typical monthly cost:** $0-5 (scales to zero when not in use)
- **Same as dev and staging for cost optimization**

## Updating Database Secret (Epic 2)

When you provision the Neon production database in Epic 2:

```bash
# Update the secret with the actual production database URL
echo "postgresql://user:password@production-host.neon.tech:5432/role_directory_production?sslmode=require" | \
  gcloud secrets versions add role-directory-production-db-url --data-file=-

# The Cloud Run service will automatically use the latest version
```

## Troubleshooting

### Issue: "Permission denied" when creating service

**Solution:**
```bash
# Verify you have required roles
gcloud projects get-iam-policy $(gcloud config get-value project) \
  --flatten="bindings[].members" \
  --format="table(bindings.role)" \
  --filter="bindings.members:$(gcloud config get-value account)"
```

### Issue: Cannot access service URL (403 Forbidden)

**Solution:**
```bash
# Production is IAM protected - use authentication token
curl -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
  YOUR_PRODUCTION_URL/api/health

# Grant yourself invoker role if needed
gcloud run services add-iam-policy-binding role-directory-production \
  --region=southamerica-east1 \
  --member="user:$(gcloud config get-value account)" \
  --role="roles/run.invoker"
```

## Next Steps

1. ✅ **Story 1.10:** Create manual promotion workflow (staging → production)
2. ✅ **Epic 2:** Provision Neon production database and update DATABASE_URL secret

## References

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [GitHub Actions Setup Guide](./github-actions-setup-guide.md)
- [Staging Setup Guide](./cloud-run-staging-setup.md)

---

**Document Version:** 1.1  
**Last Updated:** 2025-11-08  
**Story:** 1.8 - Cloud Run Service Setup (Production)
