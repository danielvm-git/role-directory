# Infrastructure Setup: Neon PostgreSQL + Cloud Run

**Project:** role-directory  
**Date:** 2025-11-06  
**Cost:** ~$0-3/month (free tier infrastructure)

---

## Overview

This document provides step-by-step instructions for setting up the cost-optimized infrastructure:

- **Hosting:** Google Cloud Run (3 services: dev, stg, prd)
- **Database:** Neon PostgreSQL (3 databases: dev, stg, prd)
- **Secrets:** Google Secret Manager
- **CI/CD:** GitHub Actions

**Total Cost:** ~$0-3/month (both within free tiers)

---

## Prerequisites

- Google Cloud Platform account
- `gcloud` CLI installed and authenticated
- GitHub account
- Neon account (https://neon.tech - sign up free)

---

## Step 1: Create Neon Databases

### 1.1: Sign Up for Neon

1. Go to https://neon.tech
2. Sign up with GitHub or email (free)
3. Create a new project: "role-directory"

### 1.2: Create Three Databases

**Development Database:**
```
Project: role-directory
Database name: role_directory_dev
Region: Choose closest to your Cloud Run region
```

**Staging Database:**
```
Database name: role_directory_stg
(Same project, separate database)
```

**Production Database:**
```
Database name: role_directory_prd
(Same project, separate database)
```

### 1.3: Get Connection Strings

For each database, get the connection string:

```
Format:
postgresql://[user]:[password]@[host]/[database]?sslmode=require

Example:
postgresql://daniel:abc123@ep-cool-sound-123456.us-east-2.aws.neon.tech/role_directory_dev?sslmode=require
```

**Save these connection strings securely - you'll need them for Secret Manager.**

---

## Step 2: Configure Google Cloud Project

### 2.1: Set GCP Project

```bash
# Set your project ID
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 2.2: Store Database Credentials in Secret Manager

```bash
# Create secrets for each environment
echo -n "postgresql://[user]:[pass]@[host]/role_directory_dev?sslmode=require" | \
  gcloud secrets create DATABASE_URL_DEV --data-file=-

echo -n "postgresql://[user]:[pass]@[host]/role_directory_stg?sslmode=require" | \
  gcloud secrets create DATABASE_URL_STG --data-file=-

echo -n "postgresql://[user]:[pass]@[host]/role_directory_prd?sslmode=require" | \
  gcloud secrets create DATABASE_URL_PRD --data-file=-
```

### 2.3: Create Session Secrets

```bash
# Generate random session secrets (32+ characters)
# macOS/Linux:
export SESSION_SECRET_DEV=$(openssl rand -hex 32)
export SESSION_SECRET_STG=$(openssl rand -hex 32)
export SESSION_SECRET_PRD=$(openssl rand -hex 32)

# Store in Secret Manager
echo -n "$SESSION_SECRET_DEV" | gcloud secrets create SESSION_SECRET_DEV --data-file=-
echo -n "$SESSION_SECRET_STG" | gcloud secrets create SESSION_SECRET_STG --data-file=-
echo -n "$SESSION_SECRET_PRD" | gcloud secrets create SESSION_SECRET_PRD --data-file=-
```

---

## Step 3: Run Database Migrations

### 3.1: Install Dependencies Locally

```bash
cd /Users/me/Sites/role-directory

# Install Node.js dependencies (if using Prisma/Knex)
npm install

# Or use raw SQL with psql
brew install postgresql  # macOS
```

### 3.2: Run Migrations Against Each Database

**Option A: Using psql (Raw SQL)**

```bash
# Development
psql "postgresql://[user]:[pass]@[host]/role_directory_dev?sslmode=require" \
  -f sql/schema/01_regions.sql \
  -f sql/schema/02_currencies.sql \
  # ... (run all schema files)

# Create new tables for sessions
psql "postgresql://[user]:[pass]@[host]/role_directory_dev?sslmode=require" \
  -c "CREATE TABLE invitation_codes (
    code VARCHAR(12) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
  );"

psql "postgresql://[user]:[pass]@[host]/role_directory_dev?sslmode=require" \
  -c "CREATE TABLE access_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    code_used VARCHAR(12) REFERENCES invitation_codes(code),
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    last_accessed TIMESTAMP DEFAULT NOW()
  );"

# Repeat for staging and production databases
```

**Option B: Using Prisma Migrate**

```bash
# Configure DATABASE_URL for dev
export DATABASE_URL="postgresql://[user]:[pass]@[host]/role_directory_dev?sslmode=require"

# Run migrations
npx prisma migrate deploy

# Repeat for stg and prd
```

---

## Step 4: Create Cloud Run Services

### 4.1: Development Service

```bash
# Create Cloud Run service (initial deployment will come from CI/CD)
gcloud run services create role-directory-dev \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --set-secrets="DATABASE_URL=DATABASE_URL_DEV:latest,SESSION_SECRET=SESSION_SECRET_DEV:latest" \
  --set-env-vars="NODE_ENV=development,PORT=8080" \
  --min-instances=0 \
  --max-instances=3 \
  --memory=512Mi \
  --cpu=1
```

### 4.2: Staging Service

```bash
gcloud run services create role-directory-stg \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --set-secrets="DATABASE_URL=DATABASE_URL_STG:latest,SESSION_SECRET=SESSION_SECRET_STG:latest" \
  --set-env-vars="NODE_ENV=staging,PORT=8080" \
  --min-instances=0 \
  --max-instances=3 \
  --memory=512Mi \
  --cpu=1
```

### 4.3: Production Service

```bash
gcloud run services create role-directory-prd \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --set-secrets="DATABASE_URL=DATABASE_URL_PRD:latest,SESSION_SECRET=SESSION_SECRET_PRD:latest" \
  --set-env-vars="NODE_ENV=production,PORT=8080" \
  --min-instances=0 \
  --max-instances=5 \
  --memory=512Mi \
  --cpu=1
```

---

## Step 5: Configure GitHub Actions

### 5.1: Create Service Account for GitHub Actions

```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployer"

# Grant necessary roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create key
gcloud iam service-accounts keys create github-sa-key.json \
  --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com
```

### 5.2: Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:
- `GCP_PROJECT_ID`: Your GCP project ID
- `GCP_SA_KEY`: Contents of `github-sa-key.json` file
- `GCP_REGION`: `us-central1` (or your chosen region)

---

## Step 6: Test Database Connectivity

### 6.1: Test Neon Connection Locally

```bash
# Test dev database
psql "postgresql://[user]:[pass]@[host]/role_directory_dev?sslmode=require" \
  -c "SELECT version();"

# Should return PostgreSQL version info
```

### 6.2: Generate Test Invitation Code

```bash
# Insert a test code (expires in 24 hours)
psql "postgresql://[user]:[pass]@[host]/role_directory_dev?sslmode=require" \
  -c "INSERT INTO invitation_codes (code, expires_at) 
      VALUES ('TEST1234', NOW() + INTERVAL '24 hours');"

# Verify
psql "postgresql://[user]:[pass]@[host]/role_directory_dev?sslmode=require" \
  -c "SELECT * FROM invitation_codes;"
```

---

## Step 7: Deploy Application

### 7.1: Initial Manual Deploy (Test)

```bash
# Build Docker image
docker build -t gcr.io/$PROJECT_ID/role-directory:latest .

# Push to Google Container Registry
docker push gcr.io/$PROJECT_ID/role-directory:latest

# Deploy to dev
gcloud run deploy role-directory-dev \
  --image=gcr.io/$PROJECT_ID/role-directory:latest \
  --region=us-central1
```

### 7.2: Verify Deployment

```bash
# Get service URL
gcloud run services describe role-directory-dev \
  --region=us-central1 \
  --format="value(status.url)"

# Test health endpoint
curl https://[service-url]/api/health
```

### 7.3: Configure Auto-Deploy via GitHub Actions

Push your code to `main` branch:

```bash
git add .
git commit -m "Initial deployment setup"
git push origin main
```

GitHub Actions will automatically:
1. Lint and type check
2. Build Docker image
3. Deploy to Cloud Run dev service

---

## Cost Monitoring

### Check Cloud Run Usage

```bash
# Check Cloud Run billing
gcloud run services describe role-directory-dev \
  --region=us-central1 \
  --format="get(status.traffic)"
```

### Check Neon Usage

Visit Neon dashboard: https://console.neon.tech
- Monitor compute hours (free tier: 100 hours/month)
- Monitor storage (free tier: 3GB)

---

## Troubleshooting

### Database Cold Start Issues

**Symptom:** First request after idle takes 3-5 seconds

**Solution:** This is expected with Neon serverless. Subsequent requests are fast.

```javascript
// Add retry logic in your database connection
const connectWithRetry = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await pool.connect();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

### Connection String Issues

**Symptom:** Cannot connect to Neon database

**Check:**
1. Connection string includes `?sslmode=require`
2. Password special characters are URL-encoded
3. Firewall/network allows outbound HTTPS

### Secret Manager Access Issues

**Symptom:** Cloud Run cannot access secrets

**Fix:**
```bash
# Grant Cloud Run service account access to secrets
gcloud secrets add-iam-policy-binding DATABASE_URL_DEV \
  --member="serviceAccount:$PROJECT_ID@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## Migration to Cloud SQL (Future)

When ready to migrate from Neon to Cloud SQL:

1. **Export from Neon:**
```bash
pg_dump "postgresql://[neon-connection-string]" > dump.sql
```

2. **Create Cloud SQL instance**
3. **Import to Cloud SQL:**
```bash
psql "postgresql://[cloud-sql-connection-string]" < dump.sql
```

4. **Update Secret Manager with new connection string**
5. **Redeploy Cloud Run services**

No code changes needed - same PostgreSQL!

---

## Summary

**✅ Infrastructure Setup Complete**

You now have:
- 3 Neon PostgreSQL databases (dev, stg, prd) - **$0/month**
- 3 Cloud Run services (dev, stg, prd) - **$0-3/month**
- Secrets in Google Secret Manager - **$0.06/month**
- GitHub Actions CI/CD - **$0/month**

**Total: ~$0-3/month**

**Next Steps:**
1. Push code to GitHub (triggers auto-deploy to dev)
2. Test invitation code flow
3. Manually promote to staging
4. Validate in staging
5. Manually promote to production

**Infrastructure validation complete!** 🎉

