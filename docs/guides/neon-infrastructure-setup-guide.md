# Neon PostgreSQL Infrastructure Setup Guide

**Project:** role-directory  
**Last Updated:** 2025-11-07  
**Story:** 2-1-neon-postgresql-account-and-database-setup

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Create Neon Account](#step-1-create-neon-account)
4. [Step 2: Create Neon Project](#step-2-create-neon-project)
5. [Step 3: Create Databases](#step-3-create-databases)
6. [Step 4: Test Database Connections](#step-4-test-database-connections)
7. [Step 5: Store Credentials in Google Secret Manager](#step-5-store-credentials-in-google-secret-manager)
8. [Step 6: Grant Cloud Run Access to Secrets](#step-6-grant-cloud-run-access-to-secrets)
9. [Step 7: Configure Cloud Run Services](#step-7-configure-cloud-run-services)
10. [Step 8: Set Up Local Development](#step-8-set-up-local-development)
11. [Connection String Format](#connection-string-format)
12. [Neon Free Tier Details](#neon-free-tier-details)
13. [Troubleshooting](#troubleshooting)
14. [References](#references)

---

## Overview

This guide walks you through setting up **three Neon PostgreSQL databases** (dev, staging, production) for the role-directory project. Each database is:

- ✅ **Isolated** - Separate databases for dev, staging, and production
- ✅ **Serverless** - Auto-scales and auto-suspends (cost optimization)
- ✅ **Secure** - SSL/TLS encryption required, credentials in Secret Manager
- ✅ **Free** - Uses Neon's free tier (0.5 GB storage, ~100 compute hours/month)

**Architecture:**
- **Neon Project**: `role-directory` (single project with multiple branches)
- **Branches**: `production` (main), `development`, and optionally `staging`
- **Database Name**: `neondb` (Neon's default, same across all branches)
- **Branch Identification**: Via endpoint (`ep-xxx` for dev, `ep-yyy` for staging, `ep-zzz` for production)
- **Credentials**: Stored in Google Secret Manager (not in code)
- **Access**: Cloud Run services access via environment variable (`DATABASE_URL`)

---

## Prerequisites

Before starting, ensure you have:

1. ✅ **Email address** for Neon account (GitHub or Google account recommended)
2. ✅ **Google Cloud project** configured (from Epic 1)
3. ✅ **gcloud CLI** installed and authenticated
4. ✅ **PostgreSQL client** (`psql`) installed for testing
5. ✅ **Cloud Run services** deployed (from Stories 1.4, 1.7, 1.8)

**Check your setup:**
```bash
# Verify gcloud CLI
gcloud --version
gcloud auth list
gcloud config get-value project

# Verify psql installed
psql --version
# Expected: psql (PostgreSQL) 14.x or higher

# If psql not installed:
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql-client
# Windows: Download from postgresql.org
```

---

## Step 1: Create Neon Account

### 1.1 Navigate to Neon

Go to: **https://neon.tech**

### 1.2 Sign Up

1. Click **"Sign Up"** button (top right)
2. Choose authentication method:
   - **Recommended**: Sign up with GitHub or Google
   - Alternative: Email + password
3. Complete authentication flow
4. Verify email address if required

### 1.3 Complete Account Setup

1. You'll be redirected to Neon Console: **https://console.neon.tech**
2. First-time wizard may appear - follow prompts or skip
3. Note your account email and plan (should show "Free Tier")

**Verification:**
- ✅ You can access Neon Console
- ✅ Account shows "Free Tier" plan
- ✅ No payment method required

---

## Step 2: Create Neon Project

### 2.1 Create Project

1. In Neon Console, click **"Create Project"** button
2. Fill in project details:
   - **Name**: `role-directory` (or `role-directory-mvp`)
   - **Region**: Choose closest to Cloud Run (recommend: **AWS South America (São Paulo)**)
     - Cloud Run region: `southamerica-east1` (São Paulo)
     - Closest Neon region: AWS South America (São Paulo)
   - **PostgreSQL version**: 17 (default, recommended)
3. **Auto-suspend**: Leave enabled (default)
   - Database suspends after 5 minutes of inactivity (free tier)
   - Resumes automatically on first query (~2-3 second cold start)
4. Click **"Create Project"**

### 2.2 Note Project Details

After creation, note:
- **Project ID**: Displayed in URL (e.g., `https://console.neon.tech/app/projects/[PROJECT-ID]`)
- **Project Name**: `role-directory`
- **Region**: e.g., `aws-sa-east-1` (São Paulo) - should match your Cloud Run region
- **Default Database**: `neondb` (auto-created, we'll create our own)

**Verification:**
- ✅ Project appears in Neon Console
- ✅ Project shows "Active" status
- ✅ Default database `neondb` exists (ignore this, we'll create our own)

---

## Step 3: Create Branches (Not Databases)

**Important:** Neon uses **branches** (like Git branches) rather than separate databases for environment isolation. Each branch is a copy-on-write clone with its own compute and can have different data.

We'll create **two branches** for your environments:
1. **`main` (or `production`)** - Production environment (already exists as default branch)
2. **`development`** - Development environment (we'll create this)
3. **`staging`** (optional) - Staging environment (we'll create this)

### 3.1 Identify Your Production Branch

1. In Neon Console, navigate to your project: `role-directory`
2. You should see **"2 Branches"** at the top (as shown in your screenshot)
3. Click **"Branches"** in the left sidebar or click "View all" under "2 Branches"
4. You'll see:
   - **`production`** - Primary compute is "Idle" (your default/main branch)
   - **`development`** - Primary compute is "Active" (may already exist)

**Note:** The default branch created with your project is typically named `main` or `production`. This will be your production database.

### 3.2 Copy Production Branch Connection String

1. In the Branches view, click on your **`production`** branch (or whichever branch you want to use for production)
2. Under **"Compute"** section, find the connection details
3. Click **"Connection Details"** or look for the connection string
4. Copy the full connection string
5. **Format should be**:
   ```
   postgresql://neondb_owner:[password]@ep-xxx-xxx-xxx.aws-sa-east-1.neon.tech/neondb?sslmode=require
   ```
   **Note:** 
   - Database name: `neondb` (Neon's default)
   - Role name: `neondb_owner` (default role created with your project, has admin privileges)
6. **Save this connection string securely** (you'll need it for Secret Manager as `production-database-url`)

### 3.3 Create Development Branch

1. In the Branches view, look for **"Create branch"** button (or similar)
2. If a `development` branch doesn't already exist, create it:
   - **Branch name**: `development` (or `dev`)
   - **Parent branch**: Select `production` (or your main branch)
   - **Create from**: Latest point (or select "Current point in time")
3. Click **"Create branch"**
4. After creation, click on the `development` branch
5. Copy the connection string for the development branch
6. Save securely (you'll use this as `dev-database-url`)

**Note:** If you already see a `development` branch in your console (as shown in your screenshot), you can skip creation and just copy its connection string.

### 3.4 Create Staging Branch (Optional)

If you need a separate staging environment:
1. Click **"Create branch"** again
2. **Branch name**: `staging`
3. **Parent branch**: Select `production` (or your main branch)
4. **Create from**: Latest point in time
5. Click **"Create branch"**
6. Copy the staging branch connection string
7. Save securely (you'll use this as `staging-database-url`)

**Alternative:** You can also use the `development` branch for both dev and staging initially, and create a separate `staging` branch later if needed.

### 3.5 Understanding Neon Branches

**Key Points:**
- Each branch has its own **compute** (can scale independently)
- Branches share data up to the point of divergence (copy-on-write)
- Writes to one branch don't affect other branches
- Perfect for testing schema changes or new features
- **Database name is typically `neondb`** for all branches (the branch name differentiates them, not the database name)

**Connection String Difference:**
The branch is identified by the **endpoint** in the connection string, not the database name:
- Production: `postgresql://user:pass@ep-xxx-xxx.region.neon.tech/neondb?sslmode=require`
- Development: `postgresql://user:pass@ep-yyy-yyy.region.neon.tech/neondb?sslmode=require`
  
Notice the `ep-xxx-xxx` vs `ep-yyy-yyy` - different endpoints for different branches!

**Verification:**
- ✅ You can see 2-3 branches in Neon Console: `production`, `development` (and optionally `staging`)
- ✅ Each branch shows "Active" or "Idle" status under Primary compute
- ✅ You have 2-3 connection strings saved (one for each branch)
- ✅ Each connection string has a different endpoint (`ep-xxx` vs `ep-yyy`)

---

## Step 4: Test Branch Connections

Test each branch connection locally using `psql` to verify they work before configuring Cloud Run.

### 4.1 Test Development Branch

```bash
# Replace with your actual development branch connection string
# Note: Use "neondb_owner" role (created with your project) and "neondb" database
psql "postgresql://neondb_owner:your_password@ep-xxx-xxx.aws-sa-east-1.neon.tech/neondb?sslmode=require"
```

**If connection succeeds, you'll see:**
```
psql (17.0)
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, compression: off)
Type "help" for help.

neondb=>
```

**Note:** The prompt shows `neondb=>` (Neon's default database name), not `role_directory_dev`.

### 4.2 Verify SSL Connection

```sql
-- Run this command in psql
\conninfo
```

**Expected output:**
```
You are connected to database "neondb" as user "neondb_owner" on host "ep-xxx-xxx.aws-sa-east-1.neon.tech" at port "5432".
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, compression: off)
```

**Note:** 
- Database: `neondb` (Neon's default)
- Role: `neondb_owner` (default admin role)
- Branch identified by endpoint (`ep-xxx-xxx`)

**Important**: Verify that output includes **"SSL connection"**. If not, check your connection string includes `?sslmode=require`.

### 4.3 Run Test Query

```sql
-- Check PostgreSQL version
SELECT version();
```

**Expected output** (exact version may vary):
```
PostgreSQL 17.0 on x86_64-pc-linux-gnu, compiled by gcc (Debian 12.2.0-14) 12.2.0, 64-bit
```

### 4.4 Test Additional Commands

```sql
-- List databases (will show "neondb" as the database name)
\l

-- List tables (should be empty for now)
\dt

-- Exit psql
\q
```

### 4.5 Test Staging and Production Branches

Repeat the same tests for staging and production branches:

```bash
# Test staging branch (if created)
# Note: Different endpoint but same role (neondb_owner) and database (neondb)
psql "postgresql://neondb_owner:your_password@ep-yyy-yyy.aws-sa-east-1.neon.tech/neondb?sslmode=require"
\conninfo
SELECT version();
\q

# Test production branch
# Note: Different endpoint but same role (neondb_owner) and database (neondb)
psql "postgresql://neondb_owner:your_password@ep-zzz-zzz.aws-sa-east-1.neon.tech/neondb?sslmode=require"
\conninfo
SELECT version();
\q
```

**Key Point:** Each branch has a **different endpoint** (`ep-xxx`, `ep-yyy`, `ep-zzz`) but typically the **same database name** (`neondb`). The endpoint identifies which branch you're connecting to.

**Verification:**
- ✅ All branches connect successfully (2-3 branches depending on whether you created staging)
- ✅ SSL connection confirmed for each (`\conninfo` shows "SSL connection")
- ✅ PostgreSQL version is 17.0
- ✅ Each connection uses a different endpoint but same database name (`neondb`)
- ✅ No errors during connection

---

## Step 5: Store Credentials in Google Secret Manager

**Security Principle**: Never commit database credentials to git. Store them in Google Secret Manager.

### 5.1 Set GCP Project

```bash
# Ensure you're in the correct GCP project
gcloud config set project YOUR_PROJECT_ID

# Verify
gcloud config get-value project
```

### 5.2 Create Dev Secret

```bash
# Replace with your actual development branch connection string
# Note: Use "neondb_owner" role (default admin), "neondb" database, endpoint identifies branch
echo "postgresql://neondb_owner:your_password@ep-dev-xxx.aws-sa-east-1.neon.tech/neondb?sslmode=require" | \
  gcloud secrets create dev-database-url --data-file=-
```

**Expected output:**
```
Created version [1] of the secret [dev-database-url].
```

### 5.3 Create Staging Secret

```bash
# Replace with your actual staging branch connection string
# Note: Use "neondb_owner" role, "neondb" database, endpoint identifies branch
echo "postgresql://neondb_owner:your_password@ep-staging-yyy.aws-sa-east-1.neon.tech/neondb?sslmode=require" | \
  gcloud secrets create staging-database-url --data-file=-
```

### 5.4 Create Production Secret

```bash
# Replace with your actual production branch connection string
# Note: Use "neondb_owner" role, "neondb" database, endpoint identifies branch
echo "postgresql://neondb_owner:your_password@ep-prod-zzz.aws-sa-east-1.neon.tech/neondb?sslmode=require" | \
  gcloud secrets create production-database-url --data-file=-
```

### 5.5 Verify Secrets Created

```bash
# List all secrets
gcloud secrets list

# Filter for database secrets
gcloud secrets list | grep database-url
```

**Expected output:**
```
NAME                     CREATED              REPLICATION_POLICY  LOCATIONS
dev-database-url         2025-11-07T...       automatic           -
staging-database-url     2025-11-07T...       automatic           -
production-database-url  2025-11-07T...       automatic           -
```

### 5.6 Verify Secret Contents (Optional)

```bash
# View dev secret (to verify it was stored correctly)
gcloud secrets versions access latest --secret=dev-database-url

# Should output your connection string
# Example: postgresql://neondb_owner:your_password@ep-dev-xxx.aws-sa-east-1.neon.tech/neondb?sslmode=require
```

**Verification:**
- ✅ Three secrets created: `dev-database-url`, `staging-database-url`, `production-database-url`
- ✅ Secrets contain correct connection strings (verify with `access latest`)
- ✅ No errors during secret creation

---

## Step 6: Grant Cloud Run Access to Secrets

Cloud Run services need IAM permission to read secrets from Secret Manager.

### 6.1 Get GCP Project Number

```bash
# Get project number (not project ID)
gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)"

# Example output: 123456789012
```

### 6.2 Construct Service Account Email

The default Compute Engine service account format:
```
<PROJECT_NUMBER>-compute@developer.gserviceaccount.com
```

**Example**: If project number is `123456789012`, service account is:
```
123456789012-compute@developer.gserviceaccount.com
```

### 6.3 Grant Dev Secret Access

```bash
# Replace <PROJECT_NUMBER> with your actual project number
gcloud secrets add-iam-policy-binding dev-database-url \
  --member="serviceAccount:<PROJECT_NUMBER>-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

**Expected output:**
```
Updated IAM policy for secret [dev-database-url].
bindings:
- members:
  - serviceAccount:123456789012-compute@developer.gserviceaccount.com
  role: roles/secretmanager.secretAccessor
```

### 6.4 Grant Staging Secret Access

```bash
gcloud secrets add-iam-policy-binding staging-database-url \
  --member="serviceAccount:<PROJECT_NUMBER>-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 6.5 Grant Production Secret Access

```bash
gcloud secrets add-iam-policy-binding production-database-url \
  --member="serviceAccount:<PROJECT_NUMBER>-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 6.6 Verify IAM Bindings

```bash
# Check dev secret IAM policy
gcloud secrets get-iam-policy dev-database-url

# Should show secretAccessor role for compute service account
```

**Expected output:**
```
bindings:
- members:
  - serviceAccount:123456789012-compute@developer.gserviceaccount.com
  role: roles/secretmanager.secretAccessor
etag: BwYZXXXXXXXX
version: 1
```

**Verification:**
- ✅ All three secrets have IAM binding for compute service account
- ✅ Role is `roles/secretmanager.secretAccessor` (read-only, least privilege)
- ✅ No errors during IAM binding

---

## Step 7: Configure Cloud Run Services

Inject database connection strings into Cloud Run services as environment variables.

### 7.1 Update Dev Cloud Run Service

```bash
gcloud run services update role-directory-dev \
  --region=southamerica-east1 \
  --set-secrets=DATABASE_URL=dev-database-url:latest
```

**Expected output:**
```
✓ Deploying... Done.
  ✓ Creating Revision...
  ✓ Routing traffic...
Done.
Service [role-directory-dev] revision [role-directory-dev-00XXX-xxx] has been deployed and is serving 100 percent of traffic.
```

### 7.2 Update Staging Cloud Run Service

```bash
gcloud run services update role-directory-staging \
  --region=southamerica-east1 \
  --set-secrets=DATABASE_URL=staging-database-url:latest
```

### 7.3 Update Production Cloud Run Service

```bash
gcloud run services update role-directory-production \
  --region=southamerica-east1 \
  --set-secrets=DATABASE_URL=production-database-url:latest
```

### 7.4 Verify Environment Variable Injection

```bash
# Check dev service configuration
gcloud run services describe role-directory-dev \
  --region=southamerica-east1 \
  --format="value(spec.template.spec.containers[0].env)"

# Should show DATABASE_URL mapped to dev-database-url secret
```

**Expected output (partial)**:
```
[{'name': 'DATABASE_URL', 'valueFrom': {'secretKeyRef': {'key': 'latest', 'name': 'dev-database-url'}}}]
```

**Verification:**
- ✅ All three Cloud Run services updated successfully
- ✅ `DATABASE_URL` environment variable set for each service
- ✅ Each service points to its corresponding secret (dev → dev-database-url, etc.)
- ✅ No deployment errors

---

## Step 8: Set Up Local Development

### 8.1 Copy .env.example to .env.local

```bash
# In project root
cp .env.example .env.local
```

### 8.2 Update .env.local with Dev Connection String

Edit `.env.local`:
```bash
# Replace with your actual development branch connection string
# Note: Use "neondb_owner" role (default admin), "neondb" database
DATABASE_URL=postgresql://neondb_owner:your_password@ep-dev-xxx.aws-sa-east-1.neon.tech/neondb?sslmode=require
```

### 8.3 Verify .env.local is Gitignored

```bash
# Check .gitignore includes .env.local
grep "\.env\.local" .gitignore

# Expected output: .env.local (or .env*.local)
```

### 8.4 Test Local Connection (Optional)

If your application supports it, test the connection:
```bash
# Start local dev server
npm run dev

# App should connect to Neon dev database
```

**Verification:**
- ✅ `.env.local` created with dev database connection string
- ✅ `.env.local` is gitignored (won't be committed)
- ✅ Local development can connect to Neon dev database

---

## Connection String Format

### Standard Format

```
postgresql://[user]:[password]@[endpoint].[region].neon.tech/[database]?sslmode=require
```

### Components Explained

| Component | Description | Example |
|-----------|-------------|---------|
| **user** | Database role (use `neondb_owner` - default admin role) | `neondb_owner` |
| **password** | Role password (from Neon Console connection details) | `abc123xyz456` |
| **endpoint** | Unique endpoint ID **(identifies the branch)** | `ep-cool-tree-12345678` |
| **region** | Neon region | `aws-sa-east-1` (São Paulo) |
| **database** | Database name (always `neondb` by default) | `neondb` |
| **sslmode** | SSL/TLS mode (REQUIRED) | `require` |

### Example Connection Strings (Using Branches)

**Development Branch:**
```
postgresql://neondb_owner:abc123xyz456@ep-dev-12345678.aws-sa-east-1.neon.tech/neondb?sslmode=require
```

**Staging Branch:**
```
postgresql://neondb_owner:abc123xyz456@ep-staging-87654321.aws-sa-east-1.neon.tech/neondb?sslmode=require
```

**Production Branch:**
```
postgresql://neondb_owner:abc123xyz456@ep-prod-11223344.aws-sa-east-1.neon.tech/neondb?sslmode=require
```

**Note:** All examples use `neondb_owner` - the default admin role created with your Neon project. This role has full permissions via membership in the `neon_superuser` group.

**Note**: Each **branch has a different endpoint** (`ep-dev-xxx`, `ep-staging-yyy`, `ep-prod-zzz`), but typically the **same database name** (`neondb`). The endpoint identifies which branch you're connecting to.

### SSL/TLS Encryption

**Always use**: `?sslmode=require`

This ensures:
- ✅ All data in transit is encrypted (TLS 1.3)
- ✅ Prevents man-in-the-middle attacks
- ✅ Required by security best practices (PRD NFR-3)
- ✅ Default for Neon connections

---

## Neon Free Tier Details

### What's Included (Free Tier)

| Resource | Free Tier Limit | Sufficient for MVP? |
|----------|----------------|---------------------|
| **Projects** | 1 project | ✅ Yes (1 needed) |
| **Databases** | Unlimited per project | ✅ Yes (3 needed) |
| **Storage** | 0.5 GB total | ✅ Yes (MVP data <100 MB) |
| **Compute Hours** | ~100 hours/month | ✅ Yes (with auto-suspend) |
| **Auto-suspend** | After 5 minutes inactivity | ✅ Yes (acceptable for MVP) |
| **Cold Start** | ~2-3 seconds | ✅ Yes (acceptable for MVP) |
| **Connections** | Unlimited (HTTP-based) | ✅ Yes |

### Auto-Suspend Behavior

**How it works:**
1. Database is active while queries are running
2. After **5 minutes of no queries**, database suspends (free tier)
3. Compute resources released (saves compute hours)
4. First query after suspend: **~2-3 second cold start** (resume time)
5. Subsequent queries: **<50ms** (while database is active)

**Implications:**
- ✅ Acceptable for MVP (cost optimization priority)
- ✅ Transparent to application (HTTP driver handles resume)
- ⚠️ First request after inactivity may be slower (~2-3 seconds)
- 💡 For production with high traffic, consider upgrading to paid tier for always-on compute (~$19/month)

### Cost Implications

| Component | Cost (Free Tier) | Cost (Paid Tier) |
|-----------|------------------|------------------|
| **Neon PostgreSQL** | $0/month | $19/month (always-on) |
| **Google Secret Manager** | $0 (3 secrets < 6 free) | $0.06/secret/month |
| **Cloud Run** | $0 (free tier requests) | ~$1-2/month (estimated) |
| **Total** | **$0/month** | **~$20-22/month** |

**For MVP**: Free tier is sufficient. Upgrade later if needed.

---

## Troubleshooting

### Issue 1: "psql: command not found"

**Cause**: PostgreSQL client not installed.

**Solution**:
```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client

# Windows
# Download from: https://www.postgresql.org/download/windows/
```

---

### Issue 2: "SSL connection failed" or "sslmode=require not supported"

**Cause**: Connection string missing `?sslmode=require` or SSL not configured.

**Solution**:
1. Verify connection string ends with `?sslmode=require`
2. Correct:
   ```
   postgresql://user:pass@ep-xxx.neon.tech/role_directory_dev?sslmode=require
   ```
3. Incorrect (missing sslmode):
   ```
   postgresql://user:pass@ep-xxx.neon.tech/role_directory_dev
   ```

---

### Issue 3: "FATAL: password authentication failed"

**Cause**: Incorrect password or username in connection string.

**Solution**:
1. Go to Neon Console: https://console.neon.tech
2. Navigate to your project → "Connection Details"
3. Copy connection string again (includes correct password)
4. Update connection string in Secret Manager:
   ```bash
   # Update dev secret
   echo "postgresql://CORRECT_USER:CORRECT_PASSWORD@..." | \
     gcloud secrets versions add dev-database-url --data-file=-
   ```
5. Re-deploy Cloud Run service to pick up new secret version

---

### Issue 4: "FATAL: database 'neondb' does not exist"

**Cause**: Branch endpoint not correct or database name incorrect.

**Solution**:
1. Verify you're using the correct branch endpoint (different endpoints for dev/staging/production)
2. Verify database name is `neondb` (Neon's default database name)
3. Go to Neon Console → Branches → Select your branch → Copy connection string
4. The database name should be `neondb`, not `role_directory_dev` or custom names

---

### Issue 5: "Permission denied for secret 'dev-database-url'"

**Cause**: Cloud Run service account doesn't have IAM permission to access secret.

**Solution**:
```bash
# Get project number
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

# Grant access
gcloud secrets add-iam-policy-binding dev-database-url \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Verify
gcloud secrets get-iam-policy dev-database-url
```

---

### Issue 6: "Cold start takes too long (>5 seconds)"

**Cause**: Neon auto-suspend on free tier. First query after inactivity resumes database.

**Solution** (Options):
1. **Accept it** (MVP): 2-3 second cold start is acceptable for low-traffic MVP
2. **Upgrade to paid tier** (Production): Always-on compute (~$19/month, no cold starts)
3. **Keep-alive ping** (Advanced): Periodic health check queries to keep database active (not recommended for free tier, wastes compute hours)

---

### Issue 7: "Environment variable DATABASE_URL not set in Cloud Run"

**Cause**: Secret not injected into Cloud Run service.

**Solution**:
```bash
# Re-configure Cloud Run service
gcloud run services update role-directory-dev \
  --region=southamerica-east1 \
  --set-secrets=DATABASE_URL=dev-database-url:latest

# Verify
gcloud run services describe role-directory-dev \
  --region=southamerica-east1 \
  --format="value(spec.template.spec.containers[0].env)"
```

---

### Issue 8: "Cannot connect from local machine but Cloud Run works"

**Cause**: Local machine firewall or network blocking PostgreSQL port 5432.

**Solution**:
1. Test connection with verbose output:
   ```bash
   psql "postgresql://user:pass@ep-xxx.neon.tech/role_directory_dev?sslmode=require" -v ON_ERROR_STOP=1
   ```
2. Check firewall allows outbound port 5432
3. Try from different network (mobile hotspot) to isolate issue
4. Verify connection string is correct (copy fresh from Neon Console)

---

## References

### Official Documentation

- **Neon Documentation**: https://neon.tech/docs/
- **Neon Quickstart**: https://neon.tech/docs/get-started-with-neon/signing-up
- **Neon Connection Strings**: https://neon.tech/docs/connect/connect-from-any-app
- **Google Secret Manager**: https://cloud.google.com/secret-manager/docs
- **Cloud Run Secret Injection**: https://cloud.google.com/run/docs/configuring/secrets

### Internal Documentation

- [Architecture Document](../3-solutioning/architecture.md#database) - Database technology decision
- [PRD NFR-3](../2-planning/PRD.md#nfr-3-security) - Security requirements for credentials
- [Tech Spec Epic 2](../tech-spec-epic-2.md) - Epic 2 technical specification
- [Story 2-1](../stories/2-1-neon-postgresql-account-and-database-setup.md) - This story's requirements

### Related Guides

- [Neon Auth Setup Guide](neon-auth-setup-guide.md) - OAuth setup (Epic 3)
- [Cloud Run Setup](../CLOUD_RUN_SETUP.md) - Cloud Run service configuration

---

**Setup Complete!** ✅

You now have:
- ✅ Neon account and project created
- ✅ Three databases: dev, staging, production
- ✅ Connection strings tested and verified (SSL enabled)
- ✅ Credentials stored in Google Secret Manager
- ✅ Cloud Run services configured with DATABASE_URL
- ✅ Local development environment set up (.env.local)

**Next Steps:**
- **Story 2.2**: Database Connection Configuration (Zod validation, connection module)
- **Story 2.3**: Database Schema Migration Setup (Drizzle ORM, migration scripts)
- **Story 2.4**: Initial Database Schema Migration (create tables)

---

**Last Updated**: 2025-11-07  
**Maintained By**: role-directory development team
