# Cloud Run Service Setup Guide - Production Environment

This guide provides step-by-step instructions for setting up the **production** Cloud Run service for the Role Directory application. The production environment is designed for high availability, performance, and reliability for live end users.

## Overview

**Service Name:** `role-directory-production`  
**Region:** `us-central1`  
**Authentication:** IAM protected (not publicly accessible)  
**Scaling:** Min 2 instances (high availability), Max 10 instances  
**Resources:** 2 CPUs, 1024 MB (1 GB) memory  
**Purpose:** Live production service for end users

## Key Differences from Staging Environment

| Configuration | Staging | Production |
|---------------|---------|------------|
| Service Name | `role-directory-staging` | `role-directory-production` |
| Min Instances | 1 (warm standby) | **2 (high availability)** |
| Max Instances | 3 | **10** |
| CPU | 1 | **2** |
| Memory | 512 MB | **1024 MB (1 GB)** |
| Execution Environment | gen1 (default) | **gen2 (recommended)** |
| CPU Boost | No | **Yes** |
| Timeout | 300s (default) | 300s (explicit) |
| NODE_ENV | `staging` | `production` |
| Database | Staging database | Production database |
| Purpose | Pre-production validation | **Live end users** |
| Cost | ~$17-30/month | **~$50-100/month** |

## Environment Comparison (All Environments)

| Configuration | Dev | Staging | Production |
|---------------|-----|---------|------------|
| **Min Instances** | 0 (cost) | 1 (warm) | **2 (HA)** |
| **Max Instances** | 2 | 3 | **10** |
| **CPU** | 1 | 1 | **2** |
| **Memory** | 512Mi | 512Mi | **1Gi** |
| **Authentication** | Public | IAM | **IAM** |
| **Exec Environment** | gen1 | gen1 | **gen2** |
| **CPU Boost** | No | No | **Yes** |
| **Purpose** | Rapid iteration | Pre-prod testing | **Live users** |

## Prerequisites

Before you begin, ensure you have:

1. **Google Cloud Platform Account**
   - Active GCP account with billing enabled
   - Required roles: `roles/run.admin`, `roles/iam.serviceAccountAdmin`, `roles/secretmanager.admin`
   - Billing account linked to project
   - **Production budget approved** (~$50-100/month for min 2 instances)

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
   gcloud services enable cloudbuild.googleapis.com
   ```

4. **Existing Dev and Staging Services** (Stories 1.4, 1.7)
   - Ensures consistent setup across environments
   - Reference for configuration validation

## Setup Options

You have two options for setting up the production Cloud Run service:

### Option 1: Automated Setup (Recommended)

Use the provided shell script for one-command setup:

```bash
# Make script executable (if not already)
chmod +x scripts/setup-cloud-run-production.sh

# Run the setup script
./scripts/setup-cloud-run-production.sh
```

The script will:
- ✅ Verify prerequisites (gcloud CLI, authentication, APIs)
- ✅ Create the Cloud Run service with production configuration
- ✅ Configure scaling (min 2, max 10 instances)
- ✅ Set CPU and memory resources (2 CPUs, 1 GB)
- ✅ Enable gen2 execution environment
- ✅ Enable CPU boost for faster cold starts
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
gcloud services enable run.googleapis.com secretmanager.googleapis.com cloudbuild.googleapis.com
```

### Step 2: Create Cloud Run Service

```bash
# Create the production service with initial configuration
gcloud run deploy role-directory-production \
  --region=us-central1 \
  --platform=managed \
  --no-allow-unauthenticated \
  --image=gcr.io/cloudrun/hello \
  --min-instances=2 \
  --max-instances=10 \
  --cpu=2 \
  --memory=1Gi \
  --port=8080 \
  --ingress=all \
  --execution-environment=gen2 \
  --cpu-boost \
  --timeout=300 \
  --concurrency=80 \
  --labels=environment=production,app=role-directory

# Note: We use the Hello World image initially, will replace with actual app image in promotion workflow
```

**Expected output:**
```
Deploying container to Cloud Run service [role-directory-production] in project [YOUR_PROJECT] region [us-central1]
✓ Deploying... Done.
  ✓ Creating Revision...
  ✓ Routing traffic...
Done.
Service [role-directory-production] revision [role-directory-production-00001-xxx] has been deployed and is serving 100 percent of traffic.
Service URL: https://role-directory-production-xxxxx-uc.a.run.app
```

**Record the Service URL** - you'll need it for environment variables and CI/CD configuration.

### Step 3: Get Service URL and Configure Environment Variables

```bash
# Get the service URL
SERVICE_URL=$(gcloud run services describe role-directory-production \
  --region=us-central1 \
  --format="value(status.url)")

echo "Service URL: $SERVICE_URL"

# Set environment variables including the service URL
gcloud run services update role-directory-production \
  --region=us-central1 \
  --set-env-vars=NODE_ENV=production,NEXT_PUBLIC_API_URL=$SERVICE_URL
```

### Step 4: Set Up Database Secret in Secret Manager

**Note:** This creates a placeholder secret. You'll update it with the actual database URL in Epic 2 when the Neon production database is provisioned.

```bash
# Create a placeholder database URL secret
# Replace with actual connection string when available
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
  --region=us-central1 \
  --set-secrets=DATABASE_URL=role-directory-production-db-url:latest
```

### Step 5: Configure IAM Authentication

The production service is IAM protected (not publicly accessible). You need to grant access to authorized users and service accounts.

```bash
# Grant your GitHub Actions service account access (if already created from Story 1.5)
# Replace with your actual service account email
GHA_SA_EMAIL="github-actions@YOUR_PROJECT.iam.gserviceaccount.com"

gcloud run services add-iam-policy-binding role-directory-production \
  --region=us-central1 \
  --member="serviceAccount:${GHA_SA_EMAIL}" \
  --role="roles/run.invoker"

# Grant yourself access for testing (optional)
gcloud run services add-iam-policy-binding role-directory-production \
  --region=us-central1 \
  --member="user:$(gcloud config get-value account)" \
  --role="roles/run.invoker"
```

### Step 6: Verify Configuration

```bash
# Verify service exists and is configured correctly
gcloud run services describe role-directory-production \
  --region=us-central1 \
  --format=yaml

# Check scaling configuration (min 2, max 10)
gcloud run services describe role-directory-production \
  --region=us-central1 \
  --format="value(spec.template.metadata.annotations)"

# Check resources (2 CPU, 1 GB)
gcloud run services describe role-directory-production \
  --region=us-central1 \
  --format="value(spec.template.spec.containers[0].resources)"

# Check environment variables
gcloud run services describe role-directory-production \
  --region=us-central1 \
  --format="value(spec.template.spec.containers[0].env)"

# Check gen2 execution environment
gcloud run services describe role-directory-production \
  --region=us-central1 \
  --format="value(spec.template.metadata.annotations[run.googleapis.com/execution-environment])"

# Check CPU boost
gcloud run services describe role-directory-production \
  --region=us-central1 \
  --format="value(spec.template.metadata.annotations[run.googleapis.com/cpu-boost])"

# Check labels
gcloud run services describe role-directory-production \
  --region=us-central1 \
  --format="value(metadata.labels)"

# List all Cloud Run services
gcloud run services list --filter="role-directory-production"
```

### Step 7: Test Service (After Deployment)

**Note:** Testing requires a deployed application image. This will be done via the promotion workflow (Story 1.10).

```bash
# Test that service requires authentication (should fail without token)
curl https://role-directory-production-xxxxx-uc.a.run.app/api/health
# Expected: 403 Forbidden (authentication required)

# Test with authentication token
curl -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
  https://role-directory-production-xxxxx-uc.a.run.app/api/health
# Expected: 200 OK with {"status":"ok","timestamp":"..."}

# Test response time (should be fast with min 2 instances)
time curl -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
  https://role-directory-production-xxxxx-uc.a.run.app/api/health
# Expected: <100ms response time (no cold start)

# Test concurrent requests (using Apache Bench)
ab -n 100 -c 10 \
  -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
  https://role-directory-production-xxxxx-uc.a.run.app/api/health
# Expected: All requests successful, consistent response times
```

---

## Configuration Summary

After completing the setup, your production Cloud Run service should have the following configuration:

```yaml
service_name: role-directory-production
region: us-central1
platform: managed

scaling:
  min_instances: 2       # High availability, no cold starts
  max_instances: 10      # Handle traffic spikes

resources:
  cpu: 2                 # Better performance than dev/staging
  memory: 1Gi            # 2x staging memory

environment:
  NODE_ENV: production
  NEXT_PUBLIC_API_URL: https://role-directory-production-xxxxx-uc.a.run.app
  DATABASE_URL: (from Secret Manager: role-directory-production-db-url)

security:
  authentication: required  # IAM protected
  ingress: all             # Internet accessible with auth

container:
  port: 8080

performance:
  execution_environment: gen2       # Recommended for production
  cpu_boost: true                   # Faster cold starts
  timeout: 300                      # 5 minutes max request
  concurrency: 80                   # Requests per instance

labels:
  environment: production
  app: role-directory
```

## Production-Specific Features

### Gen2 Execution Environment

**Benefits:**
- Up to 32 GiB memory support (vs. 4 GiB in gen1)
- Better performance and faster cold starts
- Network file system support
- Improved security and isolation
- Recommended for all new production services

**Migration from gen1 to gen2:**
```bash
gcloud run services update role-directory-production \
  --region=us-central1 \
  --execution-environment=gen2
```

### CPU Boost

**Benefits:**
- Allocates full CPU during startup (vs. throttled)
- Faster container initialization
- Reduces cold start time by ~30-50%
- Small additional cost during startup only

**When to use:**
- Production services requiring fast recovery
- Services with occasional cold starts
- Services with heavy initialization logic

**Enable CPU boost:**
```bash
gcloud run services update role-directory-production \
  --region=us-central1 \
  --cpu-boost
```

### High Availability (Min 2 Instances)

**Benefits:**
- Zero cold starts for users
- Always-on service availability
- Seamless rolling deployments (one instance stays available)
- Fast response times (<100ms P95)

**Cost implications:**
- ~$35/month base cost for 2 instances
- Justified by improved user experience
- Critical for production reliability

## Service URL Storage

**Important:** Record your production service URL for use in:

1. **GitHub Actions Workflows** (Story 1.10)
   - Manual promotion workflows will deploy to this URL
   - Health checks will verify this endpoint

2. **CI/CD Configuration**
   - Add to GitHub Secrets as `PRODUCTION_SERVICE_URL`
   - Reference in promotion workflow files

3. **Documentation**
   - Update project README with production URL
   - Include in deployment documentation
   - Share with team members

4. **Custom Domain (Future)**
   - Map custom domain to Cloud Run service
   - Configure DNS records
   - Set up SSL certificates (automatic with Cloud Run)

**Your Production Service URL:**
```
https://role-directory-production-xxxxx-uc.a.run.app
```

## Cost Implications

### Production Environment Costs

**Base Cost (Min 2 Instances):**
- 2 instances × 2 CPUs × $0.024/hour = ~$35/month base
- Memory (1 GB): Included in CPU pricing
- **Minimum monthly cost: ~$35**

**Typical Production Usage:**
- Average 3-5 instances during business hours
- **Estimated: $50-75/month**

**Peak Load (Max 10 Instances):**
- 10 instances × 2 CPUs × $0.024/hour = ~$175/month
- **Unlikely to run continuously at max**

**Additional Costs:**
- CPU boost: Small startup cost (~$0.001 per cold start)
- Networking: Minimal for typical usage
- Secret Manager: $0.06/secret/month (~$0.06)

**Total Estimated Cost: $50-100/month**

### Cost Optimization Tips

1. **Monitor Usage:**
   - GCP Console → Cloud Run → Metrics
   - Review instance count and CPU utilization
   - Adjust min/max instances based on traffic patterns

2. **Scaling Configuration:**
   - Current: Min 2, Max 10
   - If traffic is low: Consider min 1 (trade availability for cost)
   - If traffic is high: Increase max beyond 10

3. **Resource Allocation:**
   - Current: 2 CPUs, 1 GB memory
   - Monitor resource utilization
   - Reduce if consistently underutilized

4. **Billing Alerts:**
   - Set up budget alerts in GCP Console
   - Alert at 50%, 75%, 90% of budget
   - Review monthly spending trends

## Updating Database Secret (Epic 2)

When you provision the Neon production database in Epic 2, update the secret:

```bash
# Update the secret with the actual production database URL
echo "postgresql://user:password@production-host.neon.tech:5432/role_directory_production?sslmode=require" | \
  gcloud secrets versions add role-directory-production-db-url --data-file=-

# The Cloud Run service will automatically use the latest version
# No need to redeploy unless you want immediate pickup

# Verify the secret was updated
gcloud secrets versions list role-directory-production-db-url

# Force immediate pickup (optional - triggers new revision deployment)
gcloud run services update role-directory-production \
  --region=us-central1 \
  --update-labels=secret-updated=$(date +%s)
```

## IAM Roles Reference

**Required IAM Roles for Setup:**
- `roles/run.admin` - Create and configure Cloud Run services
- `roles/secretmanager.admin` - Create and manage secrets
- `roles/iam.serviceAccountAdmin` - Grant IAM bindings

**Required IAM Roles for GitHub Actions:**
- `roles/run.invoker` - Invoke Cloud Run service (deployment triggers)
- `roles/secretmanager.secretAccessor` - Read secrets (for DATABASE_URL)

**Production Access Control:**
- Limit production access to authorized personnel only
- Use separate service accounts for different environments
- Audit IAM bindings regularly

## Troubleshooting

### Issue: High costs due to max instances running

**Solution:**
```bash
# Check current instance count
gcloud run services describe role-directory-production \
  --region=us-central1 \
  --format="value(status.conditions)"

# Reduce max instances if needed
gcloud run services update role-directory-production \
  --region=us-central1 \
  --max-instances=5

# Set up billing alerts in GCP Console
```

### Issue: Slow response times even with min 2 instances

**Solution:**
```bash
# Check if CPU/memory is sufficient
gcloud run services describe role-directory-production \
  --region=us-central1 \
  --format="value(spec.template.spec.containers[0].resources)"

# Increase resources if needed
gcloud run services update role-directory-production \
  --region=us-central1 \
  --cpu=4 \
  --memory=2Gi
```

### Issue: Cold starts occurring despite min 2 instances

**Solution:**
```bash
# Verify min instances setting
gcloud run services describe role-directory-production \
  --region=us-central1 \
  --format="value(spec.template.metadata.annotations)"

# Ensure min instances is set correctly
gcloud run services update role-directory-production \
  --region=us-central1 \
  --min-instances=2

# Verify CPU boost is enabled
gcloud run services update role-directory-production \
  --region=us-central1 \
  --cpu-boost
```

### Issue: Cannot access production service (403 Forbidden)

**Solution:**
```bash
# Production is IAM protected - you need authentication token
curl -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
  YOUR_PRODUCTION_URL/api/health

# Grant yourself invoker role if needed
gcloud run services add-iam-policy-binding role-directory-production \
  --region=us-central1 \
  --member="user:$(gcloud config get-value account)" \
  --role="roles/run.invoker"
```

## Security Best Practices

1. **IAM Authentication:**
   - Always require authentication for production
   - Use service accounts for automated access
   - Audit IAM bindings regularly

2. **Secret Management:**
   - Store sensitive data in Secret Manager
   - Never commit secrets to version control
   - Rotate secrets periodically

3. **Environment Isolation:**
   - Use separate secrets for each environment
   - Isolate production data from dev/staging
   - Restrict production access to authorized personnel

4. **Monitoring and Logging:**
   - Enable Cloud Run logging (automatic)
   - Set up alerting for errors and anomalies
   - Review logs regularly for security issues

## Next Steps

After completing the production Cloud Run service setup:

1. ✅ **Story 1.9:** Create manual promotion workflow (dev → staging)
2. ✅ **Story 1.10:** Create manual promotion workflow (staging → production)
3. ✅ **Story 1.11:** Create rollback documentation and testing procedures
4. ✅ **Epic 2:** Provision Neon production database and update DATABASE_URL secret
5. ✅ **Future:** Set up Cloud Monitoring alerts and custom domain

## References

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Run Gen2 Environment](https://cloud.google.com/run/docs/about-execution-environments)
- [Cloud Run CPU Boost](https://cloud.google.com/run/docs/configuring/cpu-boost)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [Cloud Run IAM Documentation](https://cloud.google.com/run/docs/authenticating/overview)
- [Story 1.4: Dev Environment Setup](./cloud-run-dev-setup.md)
- [Story 1.7: Staging Environment Setup](./cloud-run-staging-setup.md)
- [Story 1.10: Staging→Production Promotion](../../stories/1-10-manual-promotion-workflow-staging-production.md)

## Support

For issues or questions:
- Check [TROUBLESHOOTING.md](../../bmm/docs/troubleshooting.md)
- Review [Architecture Documentation](../3-solutioning/architecture.md)
- Contact: danielvm (Project Owner)

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-07  
**Story:** 1.8 - Cloud Run Service Setup (Production)  
**Status:** Implementation Complete

