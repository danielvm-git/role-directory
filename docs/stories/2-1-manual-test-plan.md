# Manual Test Plan: Story 2-1 - Neon PostgreSQL Account and Database Setup

**Story:** 2-1-neon-postgresql-account-and-database-setup  
**Test Date:** [TO BE FILLED BY TESTER]  
**Tester:** [TO BE FILLED BY TESTER]  
**Environment:** Neon (cloud), Google Cloud Secret Manager, Cloud Run

---

## Test Overview

This manual test plan verifies the Neon PostgreSQL account, database setup, Secret Manager configuration, and Cloud Run integration for Story 2-1.

**Scope:**
- ✅ Neon account and project creation
- ✅ Three database creation (dev, staging, production)
- ✅ Database connection testing via psql
- ✅ SSL/TLS encryption verification
- ✅ Google Secret Manager setup
- ✅ IAM permissions configuration
- ✅ Cloud Run environment variable injection
- ✅ Local development setup (.env.local)
- ✅ Documentation completeness

---

## Prerequisites

Before testing, ensure:
- [ ] Neon account created
- [ ] Google Cloud project configured
- [ ] gcloud CLI installed and authenticated
- [ ] PostgreSQL client (psql) installed
- [ ] Cloud Run services exist (from Epic 1)

---

## Test Cases

### Test Case 1: Neon Account Creation ✅

**Objective:** Verify Neon account can be created successfully.

**Steps:**
1. Navigate to https://neon.tech
2. Click "Sign Up"
3. Sign up with GitHub or Google account
4. Complete email verification if required
5. Access Neon Console: https://console.neon.tech

**Expected Results:**
- [ ] Neon account created successfully
- [ ] Can access Neon Console
- [ ] Account shows "Free Tier" plan
- [ ] No payment method required

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL - Reason: _______________

---

### Test Case 2: Neon Project Creation ✅

**Objective:** Verify Neon project "role-directory" can be created.

**Steps:**
1. In Neon Console, click "Create Project"
2. Name: `role-directory`
3. Region: US East (Ohio) or US West (Oregon)
4. Auto-suspend: Enabled (default)
5. PostgreSQL version: 17 (default)
6. Click "Create Project"

**Expected Results:**
- [ ] Project `role-directory` created successfully
- [ ] Project shows "Active" status
- [ ] Default database `neondb` exists
- [ ] Project ID visible in URL

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL - Reason: _______________

**Project Details:**
- Project ID: _______________
- Region: _______________

---

### Test Case 3: Dev Database Creation ✅

**Objective:** Verify dev database `role_directory_dev` can be created.

**Steps:**
1. Navigate to project "role-directory"
2. Click "Databases" tab
3. Click "Create Database"
4. Database name: `role_directory_dev`
5. Owner: default
6. Click "Create"

**Expected Results:**
- [ ] Database `role_directory_dev` created successfully
- [ ] Database shows "Active" status
- [ ] Connection string available in "Connection Details"
- [ ] Connection string format: `postgresql://user:password@ep-xxx.region.neon.tech/role_directory_dev?sslmode=require`

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL - Reason: _______________

**Connection String (REDACTED - for testing only):**
- Endpoint: ep-_______________
- Region: _______________

---

### Test Case 4: Staging Database Creation ✅

**Objective:** Verify staging database `role_directory_stg` can be created.

**Steps:**
1. In same project, click "Create Database"
2. Database name: `role_directory_stg`
3. Owner: default
4. Click "Create"

**Expected Results:**
- [ ] Database `role_directory_stg` created successfully
- [ ] Database shows "Active" status
- [ ] Connection string available

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL - Reason: _______________

---

### Test Case 5: Production Database Creation ✅

**Objective:** Verify production database `role_directory_prd` can be created.

**Steps:**
1. In same project, click "Create Database"
2. Database name: `role_directory_prd`
3. Owner: default
4. Click "Create"

**Expected Results:**
- [ ] Database `role_directory_prd` created successfully
- [ ] Database shows "Active" status
- [ ] Connection string available

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL - Reason: _______________

---

### Test Case 6: Dev Database Connection Test ✅

**Objective:** Verify can connect to dev database via psql.

**Steps:**
1. Copy dev database connection string from Neon Console
2. Run: `psql "postgresql://user:password@ep-xxx.neon.tech/role_directory_dev?sslmode=require"`
3. Connection succeeds
4. Run: `\conninfo`
5. Verify SSL connection shown
6. Run: `SELECT version();`
7. Verify PostgreSQL 17.0
8. Run: `\q` to exit

**Expected Results:**
- [ ] psql connects successfully
- [ ] `\conninfo` shows "SSL connection (protocol: TLSv1.3, ...)"
- [ ] `SELECT version();` returns PostgreSQL 17.0
- [ ] No connection errors

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL - Reason: _______________

**PostgreSQL Version:**
- _______________

---

### Test Case 7: Staging Database Connection Test ✅

**Objective:** Verify can connect to staging database via psql.

**Steps:**
1. Copy staging database connection string
2. Run: `psql "postgresql://user:password@ep-xxx.neon.tech/role_directory_stg?sslmode=require"`
3. Run: `\conninfo`
4. Run: `SELECT version();`
5. Run: `\q`

**Expected Results:**
- [ ] psql connects successfully
- [ ] SSL connection confirmed
- [ ] PostgreSQL 17.0 verified

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL - Reason: _______________

---

### Test Case 8: Production Database Connection Test ✅

**Objective:** Verify can connect to production database via psql.

**Steps:**
1. Copy production database connection string
2. Run: `psql "postgresql://user:password@ep-xxx.neon.tech/role_directory_prd?sslmode=require"`
3. Run: `\conninfo`
4. Run: `SELECT version();`
5. Run: `\q`

**Expected Results:**
- [ ] psql connects successfully
- [ ] SSL connection confirmed
- [ ] PostgreSQL 17.0 verified

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL - Reason: _______________

---

### Test Case 9: Create Google Secret Manager Secrets ✅

**Objective:** Verify can create secrets in Google Secret Manager.

**Steps:**
1. Set GCP project: `gcloud config set project YOUR_PROJECT_ID`
2. Create dev secret:
   ```bash
   echo "postgresql://user:password@ep-xxx.neon.tech/role_directory_dev?sslmode=require" | \
     gcloud secrets create dev-database-url --data-file=-
   ```
3. Create staging secret:
   ```bash
   echo "postgresql://user:password@ep-xxx.neon.tech/role_directory_stg?sslmode=require" | \
     gcloud secrets create staging-database-url --data-file=-
   ```
4. Create production secret:
   ```bash
   echo "postgresql://user:password@ep-xxx.neon.tech/role_directory_prd?sslmode=require" | \
     gcloud secrets create production-database-url --data-file=-
   ```
5. Verify: `gcloud secrets list | grep database-url`

**Expected Results:**
- [ ] Three secrets created: `dev-database-url`, `staging-database-url`, `production-database-url`
- [ ] All show "Created" status
- [ ] No errors during creation

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL - Reason: _______________

---

### Test Case 10: Verify Secret Contents ✅

**Objective:** Verify secrets contain correct connection strings.

**Steps:**
1. View dev secret: `gcloud secrets versions access latest --secret=dev-database-url`
2. Verify connection string format is correct
3. Verify includes `?sslmode=require`
4. Repeat for staging and production secrets

**Expected Results:**
- [ ] Dev secret contains dev connection string
- [ ] Staging secret contains staging connection string
- [ ] Production secret contains production connection string
- [ ] All include `?sslmode=require`

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL - Reason: _______________

---

### Test Case 11: Grant IAM Permissions ✅

**Objective:** Verify Cloud Run service account can access secrets.

**Steps:**
1. Get project number: `gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)"`
2. Grant dev secret access:
   ```bash
   gcloud secrets add-iam-policy-binding dev-database-url \
     --member="serviceAccount:<PROJECT_NUMBER>-compute@developer.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```
3. Repeat for staging and production secrets
4. Verify: `gcloud secrets get-iam-policy dev-database-url`

**Expected Results:**
- [ ] IAM bindings created successfully for all three secrets
- [ ] Role: `roles/secretmanager.secretAccessor`
- [ ] Member: `<PROJECT_NUMBER>-compute@developer.gserviceaccount.com`
- [ ] No errors

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL - Reason: _______________

**Project Number:**
- _______________

---

### Test Case 12: Configure Dev Cloud Run Service ✅

**Objective:** Verify dev Cloud Run service can be configured with DATABASE_URL.

**Steps:**
1. Update dev service:
   ```bash
   gcloud run services update role-directory-dev \
     --region=southamerica-east1 \
     --set-secrets=DATABASE_URL=dev-database-url:latest
   ```
2. Verify deployment succeeds
3. Check environment variable:
   ```bash
   gcloud run services describe role-directory-dev \
     --region=southamerica-east1 \
     --format="value(spec.template.spec.containers[0].env)"
   ```

**Expected Results:**
- [ ] Service update succeeds
- [ ] New revision created
- [ ] Environment variable `DATABASE_URL` set
- [ ] Points to `dev-database-url:latest`

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL - Reason: _______________

---

### Test Case 13: Configure Staging Cloud Run Service ✅

**Objective:** Verify staging Cloud Run service can be configured with DATABASE_URL.

**Steps:**
1. Update staging service:
   ```bash
   gcloud run services update role-directory-staging \
     --region=southamerica-east1 \
     --set-secrets=DATABASE_URL=staging-database-url:latest
   ```
2. Verify deployment succeeds
3. Check environment variable

**Expected Results:**
- [ ] Service update succeeds
- [ ] Environment variable `DATABASE_URL` set
- [ ] Points to `staging-database-url:latest`

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL - Reason: _______________

---

### Test Case 14: Configure Production Cloud Run Service ✅

**Objective:** Verify production Cloud Run service can be configured with DATABASE_URL.

**Steps:**
1. Update production service:
   ```bash
   gcloud run services update role-directory-production \
     --region=southamerica-east1 \
     --set-secrets=DATABASE_URL=production-database-url:latest
   ```
2. Verify deployment succeeds
3. Check environment variable

**Expected Results:**
- [ ] Service update succeeds
- [ ] Environment variable `DATABASE_URL` set
- [ ] Points to `production-database-url:latest`

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL - Reason: _______________

---

### Test Case 15: Local Development Setup ✅

**Objective:** Verify local development can be set up with .env.local.

**Steps:**
1. Verify `.env.example` exists in project root
2. Copy to .env.local: `cp .env.example .env.local`
3. Edit `.env.local` with dev connection string
4. Verify `.env.local` is gitignored: `grep "\.env\.local" .gitignore`

**Expected Results:**
- [ ] `.env.example` exists with DATABASE_URL template
- [ ] `.env.local` created successfully
- [ ] `.env.local` is gitignored (found in .gitignore)
- [ ] Template includes clear instructions

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL - Reason: _______________

---

### Test Case 16: Documentation Completeness ✅

**Objective:** Verify Neon setup documentation is complete and accurate.

**Steps:**
1. Open: `docs/guides/neon-infrastructure-setup-guide.md`
2. Verify table of contents present
3. Verify all 8 setup steps documented
4. Verify connection string format explained
5. Verify troubleshooting section included
6. Verify Neon free tier details documented
7. Check README links to guide

**Expected Results:**
- [ ] Documentation file exists
- [ ] Table of contents with 14 sections
- [ ] Step-by-step instructions for all tasks
- [ ] Connection string format with examples
- [ ] Troubleshooting section (8+ issues)
- [ ] Neon free tier details table
- [ ] README links to guide

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL - Reason: _______________

---

## Acceptance Criteria Verification

### AC-1: Three Databases Created ✅

**Requirement:** Three databases created: `role_directory_dev`, `role_directory_stg`, `role_directory_prd`

**Verification:**
- [ ] ✅ Dev database exists
- [ ] ✅ Staging database exists
- [ ] ✅ Production database exists
- [ ] ✅ All databases visible in Neon Console

**Status:** [ ] PASS [ ] FAIL

---

### AC-2: Unique Connection Strings ✅

**Requirement:** Each database has a unique connection string

**Verification:**
- [ ] ✅ Dev connection string retrieved
- [ ] ✅ Staging connection string retrieved
- [ ] ✅ Production connection string retrieved
- [ ] ✅ All three connection strings are different

**Status:** [ ] PASS [ ] FAIL

---

### AC-3: Connection String Format ✅

**Requirement:** Connection strings use format: `postgresql://user:pass@ep-xxx.region.neon.tech/dbname?sslmode=require`

**Verification:**
- [ ] ✅ Format matches specification
- [ ] ✅ Includes user and password
- [ ] ✅ Includes endpoint (ep-xxx)
- [ ] ✅ Includes region
- [ ] ✅ Includes database name
- [ ] ✅ Includes `?sslmode=require`

**Status:** [ ] PASS [ ] FAIL

---

### AC-4: TLS/SSL Encryption Enabled ✅

**Requirement:** TLS/SSL encryption enabled (sslmode=require)

**Verification:**
- [ ] ✅ Connection strings include `?sslmode=require`
- [ ] ✅ `\conninfo` shows "SSL connection (protocol: TLSv1.3)"
- [ ] ✅ psql connections confirm SSL active

**Status:** [ ] PASS [ ] FAIL

---

### AC-5: Neon Auto-Suspend Enabled ✅

**Requirement:** Neon auto-suspend enabled (default, saves compute hours)

**Verification:**
- [ ] ✅ Auto-suspend shown as enabled in Neon Console
- [ ] ✅ Free tier project (auto-suspend is default)

**Status:** [ ] PASS [ ] FAIL

---

### AC-6: Database Connections Work ✅

**Requirement:** Can connect to each database using psql or PostgreSQL client

**Verification:**
- [ ] ✅ psql connects to dev database
- [ ] ✅ psql connects to staging database
- [ ] ✅ psql connects to production database
- [ ] ✅ All connections succeed without errors

**Status:** [ ] PASS [ ] FAIL

---

### AC-7: Credentials in Secret Manager ✅

**Requirement:** Connection strings stored in Google Secret Manager (not in code)

**Verification:**
- [ ] ✅ dev-database-url secret exists
- [ ] ✅ staging-database-url secret exists
- [ ] ✅ production-database-url secret exists
- [ ] ✅ No connection strings in git (grep confirms)

**Status:** [ ] PASS [ ] FAIL

---

### AC-8: Cloud Run Access to Secrets ✅

**Requirement:** Each environment's Cloud Run service has access to its corresponding database connection string

**Verification:**
- [ ] ✅ Dev service has DATABASE_URL from dev-database-url
- [ ] ✅ Staging service has DATABASE_URL from staging-database-url
- [ ] ✅ Production service has DATABASE_URL from production-database-url
- [ ] ✅ IAM permissions granted (secretAccessor role)

**Status:** [ ] PASS [ ] FAIL

---

## Summary

### Test Statistics

- **Total Test Cases**: 16
- **Passed**: _______________
- **Failed**: _______________
- **Pass Rate**: _______________%

### Acceptance Criteria

- **Total ACs**: 8
- **Passed**: _______________
- **Failed**: _______________
- **AC Pass Rate**: _______________%

### Overall Result

- [ ] ✅ **APPROVED** - All tests passed, story ready for next phase
- [ ] ⚠️ **CONDITIONALLY APPROVED** - Minor issues, can proceed with notes
- [ ] ❌ **REJECTED** - Major issues, requires rework

### Issues Found

1. _______________
2. _______________
3. _______________

### Recommendations

1. _______________
2. _______________
3. _______________

---

**Tester Signature:** _______________  
**Date:** _______________  
**Story Status:** [ ] ready-for-review [ ] approved [ ] rejected

---

**End of Test Plan**

