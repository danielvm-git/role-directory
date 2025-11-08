# Cloud Run Setup Guide

Complete guide for setting up Cloud Run services across all environments (dev, staging, production).

## Overview

This project uses three Cloud Run services, one for each environment:

| Environment | Service Name | Authentication | Purpose |
|-------------|--------------|----------------|---------|
| Development | `role-directory-dev` | Public (`--allow-unauthenticated`) | CI/CD auto-deployment |
| Staging | `role-directory-staging` | IAM protected | Pre-production validation |
| Production | `role-directory-production` | IAM protected | Live service for end users |

**Common Configuration:**
- **Region:** `southamerica-east1`
- **Platform:** Managed
- **Scaling:** Min 0 (scale to zero), Max 2
- **Resources:** 1 vCPU, 512 MB memory
- **Port:** 8080
- **Cost:** $0 when idle, ~$0.024/hour when active

## Prerequisites

1. **Google Cloud Platform Account**
   - Active GCP account with billing enabled
   - Required roles: `roles/run.admin`, `roles/iam.serviceAccountAdmin`, `roles/secretmanager.admin`

2. **gcloud CLI Installed and Authenticated**
   ```bash
   # Check if gcloud is installed
   gcloud version
   
   # If not installed: https://cloud.google.com/sdk/docs/install
   
   # Authenticate
   gcloud auth login
   
   # Set your project
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **APIs Enabled**
   ```bash
   gcloud services enable run.googleapis.com secretmanager.googleapis.com
   ```

## Quick Setup (All Environments)

Use the provided scripts for automated setup:

```bash
# Development environment
./scripts/setup-cloud-run-dev.sh

# Staging environment
./scripts/setup-cloud-run-staging.sh

# Production environment
./scripts/setup-cloud-run-production.sh
```

## Manual Setup

### Development Environment

```bash
# Create development service (public access for testing)
gcloud run deploy role-directory-dev \
  --region=southamerica-east1 \
  --platform=managed \
  --allow-unauthenticated \
  --image=gcr.io/cloudrun/hello \
  --min-instances=0 \
  --max-instances=2 \
  --cpu=1 \
  --memory=512Mi \
  --port=8080 \
  --ingress=all \
  --labels=environment=development,app=role-directory

# Get service URL
SERVICE_URL=$(gcloud run services describe role-directory-dev \
  --region=southamerica-east1 \
  --format="value(status.url)")

# Configure environment variables
gcloud run services update role-directory-dev \
  --region=southamerica-east1 \
  --set-env-vars=NODE_ENV=development,NEXT_PUBLIC_API_URL=$SERVICE_URL

# Create database secret (placeholder)
echo "postgresql://placeholder:placeholder@placeholder:5432/placeholder?sslmode=require" | \
  gcloud secrets create role-directory-dev-db-url \
    --data-file=- \
    --replication-policy=automatic

# Get project number and service account
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) \
  --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# Grant secret access
gcloud secrets add-iam-policy-binding role-directory-dev-db-url \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"

# Configure secret as env var
gcloud run services update role-directory-dev \
  --region=southamerica-east1 \
  --set-secrets=DATABASE_URL=role-directory-dev-db-url:latest
```

### Staging Environment

```bash
# Create staging service (IAM protected)
gcloud run deploy role-directory-staging \
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
  --labels=environment=staging,app=role-directory

# Get service URL
SERVICE_URL=$(gcloud run services describe role-directory-staging \
  --region=southamerica-east1 \
  --format="value(status.url)")

# Configure environment variables
gcloud run services update role-directory-staging \
  --region=southamerica-east1 \
  --set-env-vars=NODE_ENV=staging,NEXT_PUBLIC_API_URL=$SERVICE_URL

# Create database secret (placeholder)
echo "postgresql://placeholder:placeholder@placeholder:5432/placeholder?sslmode=require" | \
  gcloud secrets create role-directory-staging-db-url \
    --data-file=- \
    --replication-policy=automatic

# Grant secret access
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) \
  --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

gcloud secrets add-iam-policy-binding role-directory-staging-db-url \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"

# Configure secret as env var
gcloud run services update role-directory-staging \
  --region=southamerica-east1 \
  --set-secrets=DATABASE_URL=role-directory-staging-db-url:latest

# Grant GitHub Actions service account access
GHA_SA_EMAIL="github-actions-deployer@YOUR_PROJECT.iam.gserviceaccount.com"
gcloud run services add-iam-policy-binding role-directory-staging \
  --region=southamerica-east1 \
  --member="serviceAccount:${GHA_SA_EMAIL}" \
  --role="roles/run.invoker"

# Grant yourself access for testing
gcloud run services add-iam-policy-binding role-directory-staging \
  --region=southamerica-east1 \
  --member="user:$(gcloud config get-value account)" \
  --role="roles/run.invoker"
```

### Production Environment

```bash
# Create production service (IAM protected)
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

# Get service URL
SERVICE_URL=$(gcloud run services describe role-directory-production \
  --region=southamerica-east1 \
  --format="value(status.url)")

# Configure environment variables
gcloud run services update role-directory-production \
  --region=southamerica-east1 \
  --set-env-vars=NODE_ENV=production,NEXT_PUBLIC_API_URL=$SERVICE_URL

# Create database secret (placeholder)
echo "postgresql://placeholder:placeholder@placeholder:5432/placeholder?sslmode=require" | \
  gcloud secrets create role-directory-production-db-url \
    --data-file=- \
    --replication-policy=automatic

# Grant secret access
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) \
  --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

gcloud secrets add-iam-policy-binding role-directory-production-db-url \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"

# Configure secret as env var
gcloud run services update role-directory-production \
  --region=southamerica-east1 \
  --set-secrets=DATABASE_URL=role-directory-production-db-url:latest

# Grant GitHub Actions service account access
GHA_SA_EMAIL="github-actions-deployer@YOUR_PROJECT.iam.gserviceaccount.com"
gcloud run services add-iam-policy-binding role-directory-production \
  --region=southamerica-east1 \
  --member="serviceAccount:${GHA_SA_EMAIL}" \
  --role="roles/run.invoker"

# Grant yourself access for testing
gcloud run services add-iam-policy-binding role-directory-production \
  --region=southamerica-east1 \
  --member="user:$(gcloud config get-value account)" \
  --role="roles/run.invoker"
```

## Verification

```bash
# List all services
gcloud run services list --region=southamerica-east1

# Verify specific service configuration
gcloud run services describe role-directory-dev --region=southamerica-east1
gcloud run services describe role-directory-staging --region=southamerica-east1
gcloud run services describe role-directory-production --region=southamerica-east1

# Test public dev endpoint
curl https://role-directory-dev-xxxxx.a.run.app/api/health

# Test IAM-protected staging/production (requires auth token)
curl -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
  https://role-directory-staging-xxxxx.a.run.app/api/health
```

## Updating Database Secrets

When you provision Neon databases in Epic 2, update the secrets:

```bash
# Development
echo "postgresql://user:password@dev-host.neon.tech:5432/role_directory_dev?sslmode=require" | \
  gcloud secrets versions add role-directory-dev-db-url --data-file=-

# Staging
echo "postgresql://user:password@staging-host.neon.tech:5432/role_directory_staging?sslmode=require" | \
  gcloud secrets versions add role-directory-staging-db-url --data-file=-

# Production
echo "postgresql://user:password@prod-host.neon.tech:5432/role_directory_production?sslmode=require" | \
  gcloud secrets versions add role-directory-production-db-url --data-file=-
```

Cloud Run services automatically use the latest secret version.

## Troubleshooting

### Permission Denied

```bash
# Verify your IAM roles
gcloud projects get-iam-policy $(gcloud config get-value project) \
  --flatten="bindings[].members" \
  --format="table(bindings.role)" \
  --filter="bindings.members:$(gcloud config get-value account)"
```

### Cannot Access Service URL (403 Forbidden)

**For IAM-protected services (staging/production):**

```bash
# Use authentication token
curl -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
  YOUR_SERVICE_URL/api/health

# Or grant yourself invoker role
gcloud run services add-iam-policy-binding role-directory-staging \
  --region=southamerica-east1 \
  --member="user:$(gcloud config get-value account)" \
  --role="roles/run.invoker"
```

### Service Not Scaling Down

Check if your application has keep-alive connections or background processes preventing scale-to-zero.

## Cost Optimization

All environments use identical configuration:
- **Scale to zero:** $0 when idle (no traffic)
- **Active usage:** ~$0.024/hour per instance
- **Expected cost:** $0-5/month total across all environments
- Services automatically scale down after 15 minutes of inactivity

## References

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [GitHub Actions Setup Guide](./github-actions-setup-guide.md)
- [Neon Infrastructure Setup](./neon-infrastructure-setup-guide.md)
- [Release and Deployment Guide](./release-and-deployment-guide.md)

---

**Last Updated:** 2025-11-08

