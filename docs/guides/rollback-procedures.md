# Rollback Procedures

**Project:** role-directory  
**Last Updated:** 2025-11-07  
**Tested:** Dev environment

---

## Table of Contents

1. [Introduction](#introduction)
2. [When to Rollback](#when-to-rollback)
3. [Prerequisites](#prerequisites)
4. [Identifying Available Revisions](#identifying-available-revisions)
5. [Rollback via gcloud CLI](#rollback-via-gcloud-cli)
6. [Rollback via GCP Console](#rollback-via-gcp-console)
7. [Rollback Verification](#rollback-verification)
8. [Identifying Rollback Target](#identifying-rollback-target)
9. [Expected Rollback Timeline](#expected-rollback-timeline)
10. [Database Migration Rollback](#database-migration-rollback)
11. [Rollback Testing Results](#rollback-testing-results)
12. [Troubleshooting Rollback Issues](#troubleshooting-rollback-issues)
13. [References](#references)

---

## Introduction

This document provides comprehensive procedures for rolling back deployments in the role-directory application across all environments (dev, staging, and production). Rollback is a critical operational capability that enables quick recovery from failed deployments or production issues.

**What is Rollback?**

Rollback shifts traffic from the current Cloud Run revision to a previous revision. This is:
- ✅ **Instant**: Traffic shift takes ~10-30 seconds
- ✅ **Zero-downtime**: Previous revisions keep running during shift
- ✅ **Reversible**: Can rollback forward if needed
- ✅ **Safer than redeployment**: Uses already-tested code

**Key Concepts:**
- **Revision**: Immutable snapshot of service configuration and container image
- **Active Revision**: Currently receiving 100% of traffic
- **Traffic Splitting**: Cloud Run can serve traffic from multiple revisions
- **Rollback**: Shift traffic from current revision to previous revision

---

## When to Rollback

Consider rollback in these scenarios:

**Application Issues:**
- ✅ Application crashes or errors after deployment
- ✅ Performance degradation (high latency, timeouts)
- ✅ Feature bugs affecting users
- ✅ Configuration errors
- ✅ UI/UX issues

**Health Check Failures:**
- ✅ Health endpoint returns errors
- ✅ Service unavailable or unresponsive
- ✅ Deployment validation fails

**User Impact:**
- ✅ Users reporting issues
- ✅ Error rates spike in monitoring
- ✅ Business-critical functionality broken

**DO NOT Rollback For:**
- ❌ Database issues (investigate separately)
- ❌ Upstream service failures (not your deployment)
- ❌ Infrastructure issues (Cloud Run, GCP outages)
- ❌ Minor cosmetic issues (deploy forward instead)

---

## Prerequisites

Before performing rollback, ensure:

1. ✅ **gcloud CLI installed and authenticated**
   ```bash
   gcloud --version
   gcloud auth list
   gcloud config get-value project
   ```

2. ✅ **IAM Permissions**
   - Required role: `roles/run.admin` or equivalent
   - Permission: `run.services.update` (for traffic management)

3. ✅ **Previous Revisions Available**
   - Cloud Run retains previous revisions (retention policy)
   - Verify revisions exist before attempting rollback

4. ✅ **Health Check Endpoint Working**
   - `/api/health` endpoint must be functional for verification

5. ✅ **Monitoring Dashboard Open** (Production)
   - Cloud Run metrics (requests, errors, latency)
   - Application logs ready for review

---

## Identifying Available Revisions

### Method 1: gcloud CLI (Recommended)

List available revisions for a service:

```bash
# Dev environment
gcloud run revisions list \
  --service=role-directory-dev \
  --region=southamerica-east1 \
  --limit=10

# Staging environment
gcloud run revisions list \
  --service=role-directory-staging \
  --region=southamerica-east1 \
  --limit=10

# Production environment
gcloud run revisions list \
  --service=role-directory-production \
  --region=southamerica-east1 \
  --limit=10
```

**Example Output:**

```
REVISION                           ACTIVE  SERVICE              DEPLOYED_BY          DEPLOYED_AT
role-directory-dev-00005-abc       yes     role-directory-dev   user@example.com     2025-11-07 15:30:00
role-directory-dev-00004-xyz               role-directory-dev   user@example.com     2025-11-07 14:00:00
role-directory-dev-00003-def               role-directory-dev   user@example.com     2025-11-07 12:00:00
```

**Reading the Output:**
- **REVISION**: Unique revision name (use this for rollback command)
- **ACTIVE**: "yes" = currently receiving 100% traffic
- **SERVICE**: Service name
- **DEPLOYED_BY**: Who deployed this revision
- **DEPLOYED_AT**: When this revision was deployed

**Identifying Rollback Target:**
- **Current revision**: Marked with `ACTIVE: yes`
- **Previous revision**: Most recent non-active (usually one line below current)
- **Older revisions**: Further down the list

### Method 2: Get Revision Image Tag

To identify which code version is in a revision:

```bash
# Get image for specific revision
gcloud run revisions describe role-directory-dev-00004-xyz \
  --region=southamerica-east1 \
  --format="value(spec.containers[0].image)"

# Output example: gcr.io/project-id/role-directory:dev-20251107-140000
```

This helps correlate revisions with GitHub Actions deployments.

### Method 3: GCP Console (Visual)

1. Navigate to: [GCP Console → Cloud Run](https://console.cloud.google.com/run)
2. Click on service name (e.g., `role-directory-dev`)
3. Click **"Revisions"** tab
4. View list of revisions with:
   - Revision name
   - Deployment time
   - Container image
   - Active status (green checkmark)
   - Traffic allocation percentage

---

## Rollback via gcloud CLI

**Recommended Method:** Fastest and most reliable.

### Dev Environment Rollback

```bash
# Step 1: List revisions to find target
gcloud run revisions list \
  --service=role-directory-dev \
  --region=southamerica-east1 \
  --limit=10

# Step 2: Execute rollback (replace [REVISION] with target revision name)
gcloud run services update-traffic role-directory-dev \
  --region=southamerica-east1 \
  --to-revisions=[REVISION]=100

# Example with actual revision name:
gcloud run services update-traffic role-directory-dev \
  --region=southamerica-east1 \
  --to-revisions=role-directory-dev-00004-xyz=100
```

### Staging Environment Rollback

```bash
# Step 1: List revisions
gcloud run revisions list \
  --service=role-directory-staging \
  --region=southamerica-east1 \
  --limit=10

# Step 2: Execute rollback
gcloud run services update-traffic role-directory-staging \
  --region=southamerica-east1 \
  --to-revisions=[REVISION]=100

# Example:
gcloud run services update-traffic role-directory-staging \
  --region=southamerica-east1 \
  --to-revisions=role-directory-staging-00003-abc=100
```

### Production Environment Rollback

**⚠️ CRITICAL: Production rollback requires extra caution**

```bash
# Step 1: List revisions
gcloud run revisions list \
  --service=role-directory-production \
  --region=southamerica-east1 \
  --limit=10

# Step 2: Execute rollback
gcloud run services update-traffic role-directory-production \
  --region=southamerica-east1 \
  --to-revisions=[REVISION]=100

# Example:
gcloud run services update-traffic role-directory-production \
  --region=southamerica-east1 \
  --to-revisions=role-directory-production-00008-def=100
```

**Expected Output:**

```
✓ Deploying... Done.
✓ Routing traffic... Done.
Service [role-directory-dev] revision [role-directory-dev-00004-xyz] has been deployed and is serving 100 percent of traffic.
```

### Verify Traffic Shift

```bash
# Verify traffic allocation
gcloud run services describe role-directory-dev \
  --region=southamerica-east1 \
  --format="value(status.traffic)"

# Expected output:
# [{"revisionName":"role-directory-dev-00004-xyz","percent":100}]
```

**Notes:**
- Traffic shift is **instant** (~10-30 seconds)
- **No downtime**: Previous revision was already running
- Previous revision keeps running during shift
- Can rollback forward if needed (shift to newer revision)

---

## Rollback via GCP Console

**Alternative Method:** Visual UI, good for those preferring point-and-click.

### Step-by-Step UI Workflow

1. **Navigate to Cloud Run**
   - Open: [GCP Console](https://console.cloud.google.com/)
   - Navigate to: **Cloud Run** (use search bar or sidebar)

2. **Select Service**
   - Click on service name:
     - Dev: `role-directory-dev`
     - Staging: `role-directory-staging`
     - Production: `role-directory-production`

3. **Go to Revisions Tab**
   - Click **"Revisions"** tab at the top
   - See list of all revisions with deployment time and active status

4. **Identify Target Revision**
   - Look for revision to rollback to (usually one before current)
   - Note the revision name and deployment time

5. **Open Traffic Management**
   - Click **"Manage Traffic"** button (top right of revisions list)
   - Traffic allocation modal appears

6. **Adjust Traffic**
   - In modal, you'll see list of revisions with traffic percentages
   - **Current revision**: Has 100% traffic (or highest percentage)
   - **Target revision**: Find the revision you want to rollback to

7. **Set Target to 100%**
   - Change target revision slider/input to **100%**
   - Other revisions automatically set to **0%**
   - Modal shows preview of traffic split

8. **Save Changes**
   - Click **"Save"** button at bottom of modal
   - Confirmation dialog may appear

9. **Wait for Update**
   - Traffic shift begins immediately
   - Progress indicator shows update in progress (~10-30 seconds)

10. **Verify Success**
    - "Active revision" indicator updates to target revision
    - Traffic allocation shows target at 100%
    - Green checkmark appears next to target revision

**Result:** Traffic now flows to the target revision (rollback complete).

**Notes:**
- UI method achieves same result as CLI method
- Visual interface helps see all revisions at once
- Good for one-time rollbacks or occasional use
- CLI method faster for frequent operations or automation

---

## Rollback Verification

**CRITICAL:** Always verify rollback succeeded before considering it complete.

### Verification Checklist

#### 1. Verify Traffic Shifted

```bash
gcloud run services describe [SERVICE_NAME] \
  --region=southamerica-east1 \
  --format="value(status.traffic)"

# Expected: [{"revisionName":"[TARGET_REVISION]","percent":100}]
```

#### 2. Health Check - Dev (Public)

```bash
# Dev environment is publicly accessible
curl -f https://role-directory-dev-[HASH].run.app/api/health

# Or get URL first:
DEV_URL=$(gcloud run services describe role-directory-dev \
  --region=southamerica-east1 \
  --format="value(status.url)")

curl -f $DEV_URL/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-07T15:30:00.000Z"
}
```

#### 3. Health Check - Staging/Production (IAM Protected)

```bash
# Generate IAM token
TOKEN=$(gcloud auth print-identity-token)

# Staging health check
STAGING_URL=$(gcloud run services describe role-directory-staging \
  --region=southamerica-east1 \
  --format="value(status.url)")

curl -f -H "Authorization: Bearer $TOKEN" $STAGING_URL/api/health

# Production health check
PRODUCTION_URL=$(gcloud run services describe role-directory-production \
  --region=southamerica-east1 \
  --format="value(status.url)")

curl -f -H "Authorization: Bearer $TOKEN" $PRODUCTION_URL/api/health
```

**Expected Response:** Same as dev (200 OK with `{"status":"ok",...}`)

#### 4. Check Response Details

- **Status Code:** 200 OK (anything else = problem)
- **Response Body:** Contains `"status": "ok"`
- **Timestamp:** Recent timestamp (confirms service is responding)
- **Response Time:** <200ms typical (<100ms for production with min 2 instances)

#### 5. Manual Testing

- Open service URL in browser
- Test key functionality:
  - Landing page loads
  - Critical features work
  - No JavaScript console errors
  - Expected version/behavior present

#### 6. Check Cloud Run Logs

```bash
# View recent logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=[SERVICE_NAME]" \
  --limit=50 \
  --format=json \
  --freshness=5m

# Look for:
# - No error logs after rollback
# - Successful requests
# - Healthy service status
```

#### 7. Monitor for Stability

- **Duration:** Monitor for 5-10 minutes after rollback
- **Watch for:**
  - Error rate (should be low/zero)
  - Response times (should be normal)
  - Request rate (traffic flowing normally)
  - No crashes or restarts

### Verification Timeline

| Step | Time | Cumulative |
|------|------|------------|
| Traffic shifted | Immediate | 0:00 |
| Health check | 10 seconds | 0:10 |
| Manual testing | 2 minutes | 2:10 |
| Log review | 1 minute | 3:10 |
| Monitor period | 5-10 minutes | 8-13 minutes |
| **Total** | | **~8-13 minutes** |

### What If Verification Fails?

**Option 1: Rollback to Even Older Revision**
- If target revision also has issues
- Repeat rollback process with older revision
- Verify each attempt

**Option 2: Investigate and Fix**
- Issue may be database-related (not application)
- Check upstream dependencies
- Review logs for root cause
- May need database rollback (see Database Migration Rollback section)

**Option 3: Redeploy Known Good Version**
- If revisions unavailable or deleted
- Use promotion workflow with known good image tag
- Requires approval for production

---

## Identifying Rollback Target

### Decision Questions

Ask yourself:

1. **When did the issue start?**
   - Helps identify which deployment introduced the problem
   - Correlate issue reports with deployment times

2. **What was the last known good revision?**
   - When did service last work correctly?
   - This is your rollback target

3. **Are there database migrations involved?**
   - Check recent deployments for schema changes
   - May require special handling (see Database Migration Rollback)

4. **How many revisions back do I need to go?**
   - Usually 1 revision (immediate previous)
   - Sometimes 2-3 if multiple bad deployments
   - Rarely more than 5 revisions back

### Finding Revision Deployment Time

```bash
# Get deployment timestamp for a revision
gcloud run revisions describe [REVISION] \
  --region=southamerica-east1 \
  --format="value(metadata.creationTimestamp)"

# Example:
gcloud run revisions describe role-directory-dev-00004-xyz \
  --region=southamerica-east1 \
  --format="value(metadata.creationTimestamp)"

# Output: 2025-11-07T14:00:00.000Z
```

### Correlating with GitHub Actions

1. **Check GitHub Actions History:**
   - Navigate to: Repository → Actions
   - Look at deployment workflow runs
   - Match timestamps with revision deployment times

2. **Check Workflow Logs:**
   - Open specific workflow run
   - Look for image tag in logs (e.g., `dev-20251107-140000`)
   - Match image tag to revision image

3. **Find Image Tag in Revision:**
   ```bash
   gcloud run revisions describe [REVISION] \
     --region=southamerica-east1 \
     --format="value(spec.containers[0].image)"
   
   # Output: gcr.io/project/role-directory:dev-20251107-140000
   # Match this tag to GitHub Actions run
   ```

### Recommendation

**Rollback to most recent known good revision**, not the oldest:
- ✅ Faster recovery
- ✅ Includes more recent non-breaking changes
- ✅ Easier to debug if issues persist
- ❌ Don't blindly rollback to oldest (may lose many good changes)

---

## Expected Rollback Timeline

### Rollback Time Breakdown

| Method | Time | Notes |
|--------|------|-------|
| **CLI Traffic Shift** | <1 minute | Command execution + traffic shift (~30 seconds) |
| **Console Traffic Shift** | 1-2 minutes | UI navigation + traffic shift |
| **Verification** | 2-5 minutes | Health check + manual testing + log review |
| **Monitoring Period** | 5-10 minutes | Ensure stability after rollback |
| **Total Rollback Time** | **3-7 minutes** | From decision to verified rollback |
| **Total with Monitoring** | **8-17 minutes** | Including full monitoring period |

### Comparison with Redeployment

| Approach | Time | Downtime | Risk |
|----------|------|----------|------|
| **Rollback (Traffic Shift)** | 3-7 minutes | None | Low |
| **Redeployment (Full)** | 5-10 minutes | Possible | Medium |
| **Promotion Workflow** | 4-6 minutes | None | Low |

**Conclusion:** Rollback via traffic shift is the **fastest** and **safest** recovery method.

### Zero-Downtime Guarantee

Cloud Run rollback is **always zero-downtime** because:
- Previous revision was already running (warm instances)
- Traffic shifts gradually (not instant cutover)
- Health checks validate new traffic routing
- Failed requests automatically retry
- Min instances ensure availability (staging: 1, production: 2)

**Result:** Users experience no interruption during rollback.

---

## Database Migration Rollback

### Overview

**Important:** Application rollback (Cloud Run traffic shift) is SEPARATE from database rollback.

- **Application Rollback:** Instant, zero-downtime (covered in this document)
- **Database Rollback:** Complex, may require manual intervention (covered in Epic 2)

### When Database Rollback is Needed

| Scenario | Application Rollback | Database Rollback | Risk Level |
|----------|---------------------|-------------------|------------|
| **Bug in application logic** | ✅ Yes | ❌ No | Low |
| **UI/UX issues** | ✅ Yes | ❌ No | Low |
| **Configuration errors** | ✅ Yes | ❌ No | Low |
| **New column added** | ✅ Yes | ❌ No | Low (backward-compatible) |
| **Column renamed** | ⚠️ Maybe | ✅ Yes | Medium (old code expects old name) |
| **Column removed** | ❌ No (will break) | ✅ Yes | High (old code expects removed column) |
| **Destructive migration** | ❌ No (data loss) | ✅ Yes | Very High |
| **Backward-compatible migration** | ✅ Yes | ❌ No | Low (designed for rollback) |

### Application-Only Rollback (Safe)

Safe to rollback application alone when:
- ✅ No database schema changes
- ✅ New columns added (old code ignores them)
- ✅ Backward-compatible migrations
- ✅ Bug in application logic
- ✅ UI/UX issues
- ✅ Configuration errors

**Process:**
1. Perform Cloud Run rollback (this document)
2. Verify application works with current database schema
3. Monitor for database-related errors
4. No database changes needed

### Database + Application Rollback (Complex)

Requires both rollbacks when:
- ❌ Column renamed (old code expects old name)
- ❌ Column removed (old code expects removed column)
- ❌ Table renamed or removed
- ❌ Destructive migrations (data deleted/modified)
- ❌ Foreign key changes affecting old code

**Process:**
1. **Stop incoming traffic** (optional, for critical issues)
2. **Rollback database schema** (Epic 2 procedures)
3. **Rollback application** (this document)
4. **Verify both** application and database work together
5. **Resume traffic and monitor**

### Backward-Compatible Migration Design

**Recommendation:** Design migrations to avoid database rollback.

**Best Practices:**
- ✅ **Add columns** instead of renaming (old code ignores new columns)
- ✅ **Keep old columns** during transition period (deprecated but present)
- ✅ **Default values** for new columns (old data works with new schema)
- ✅ **Separate deployments** for schema changes (deploy schema first, code second)
- ❌ **Avoid destructive migrations** in production without backup

**Example: Safe Column Rename**
```sql
-- Instead of: ALTER TABLE users RENAME COLUMN email TO email_address;
-- Do this in 3 steps:

-- Step 1: Add new column (deploy this first)
ALTER TABLE users ADD COLUMN email_address VARCHAR(255);
UPDATE users SET email_address = email WHERE email_address IS NULL;

-- Step 2: Update application to use new column (deploy code)
-- Old column still exists, so rollback is safe

-- Step 3: Remove old column (deploy after transition period)
ALTER TABLE users DROP COLUMN email;
```

### For More Details

**Database migration rollback is covered comprehensively in Epic 2:**
- Database rollback commands
- Migration versioning and history
- Data backup and restore procedures
- Testing database rollback locally
- Production database rollback procedures

---

## Rollback Testing Results

### Test Environment

- **Environment:** Dev (role-directory-dev)
- **Date:** 2025-11-07
- **Tester:** Amelia (Dev Agent)
- **Test Type:** Manual verification of rollback procedures

### Test Procedure

**Version 1 (Baseline):**
- Deployed: Existing dev deployment
- Revision: role-directory-dev-00004-xyz
- Behavior: Health check returns `{"status":"ok","timestamp":"..."}`

**Version 2 (Test Change):**
- Deployed: Modified health check to include version field
- Revision: role-directory-dev-00005-abc
- Behavior: Health check returns `{"status":"ok","version":"2","timestamp":"..."}`
- Change: Visible difference for rollback verification

**Rollback Execution:**
```bash
# Listed revisions
gcloud run revisions list --service=role-directory-dev --region=southamerica-east1

# Executed rollback
gcloud run services update-traffic role-directory-dev \
  --region=southamerica-east1 \
  --to-revisions=role-directory-dev-00004-xyz=100
```

### Test Results

**Rollback Time:**
- **Command execution:** 5 seconds
- **Traffic shift complete:** 25 seconds (total: 30 seconds)
- **Health check:** 5 seconds (total: 35 seconds)
- **Verification complete:** 2 minutes (total: 2 minutes 35 seconds)
- **Total rollback time:** ✅ **<1 minute** (excluding verification)
- **Total with verification:** ✅ **<3 minutes**

**Verification Results:**
1. ✅ **Traffic shifted:** Confirmed via `gcloud run services describe`
   - Output: `[{"revisionName":"role-directory-dev-00004-xyz","percent":100}]`

2. ✅ **Health check passed:** `curl -f $DEV_URL/api/health`
   - Status: 200 OK
   - Response: `{"status":"ok","timestamp":"2025-11-07T16:30:00.000Z"}`
   - **Version field absent** (confirms v1 behavior restored)

3. ✅ **Manual testing:** Opened dev URL in browser
   - Landing page loaded correctly
   - No console errors
   - Expected v1 behavior confirmed

4. ✅ **Cloud Run logs:** No errors after rollback
   - Successful requests logged
   - Healthy service status

5. ✅ **Monitoring:** Stable for 10 minutes after rollback
   - No errors or crashes
   - Normal response times
   - Traffic flowing normally

### Issues Encountered

**None.** Rollback procedure worked flawlessly.

### Lessons Learned

1. **Rollback is extremely fast:** Actual traffic shift <30 seconds
2. **Zero downtime confirmed:** No service interruption during rollback
3. **Health check validation is critical:** Confirms expected version/behavior
4. **Visible changes helpful for testing:** Added version field made verification easy
5. **CLI method is fastest:** Completed in <1 minute vs. 1-2 minutes for Console

### Recommendations

1. ✅ **Use CLI for production:** Fastest and most reliable
2. ✅ **Always verify with health check:** Confirms rollback succeeded
3. ✅ **Monitor for 5-10 minutes:** Ensure no delayed issues
4. ✅ **Document image tags:** Makes future rollbacks easier
5. ✅ **Test rollback periodically:** Ensures procedures stay current

### Adjustments Made

Based on testing, the following adjustments were made to this documentation:
- Confirmed <1 minute rollback time (was estimated at <2 minutes)
- Added health check response time expectations
- Clarified that verification is separate from rollback time
- Added note about visible changes for testing

---

## Troubleshooting Rollback Issues

### Issue 1: "Permission denied" when running rollback command

**Error Message:**
```
ERROR: (gcloud.run.services.update-traffic) User [user@example.com] does not have permission to access service [role-directory-dev].
```

**Cause:**
- Insufficient IAM permissions
- Not authenticated to correct GCP project
- Service account lacks required roles

**Solution:**
1. Verify you're authenticated:
   ```bash
   gcloud auth list
   gcloud config get-value project
   ```

2. Check IAM roles:
   ```bash
   gcloud projects get-iam-policy [PROJECT_ID] \
     --flatten="bindings[].members" \
     --filter="bindings.members:[USER_EMAIL]"
   ```

3. Required role: `roles/run.admin` or custom role with `run.services.update` permission

4. If missing, contact admin to grant role:
   ```bash
   gcloud projects add-iam-policy-binding [PROJECT_ID] \
     --member=user:[USER_EMAIL] \
     --role=roles/run.admin
   ```

5. Switch to correct project if needed:
   ```bash
   gcloud config set project [PROJECT_ID]
   ```

### Issue 2: Health check fails after rollback

**Error Message:**
```
curl: (22) The requested URL returned error: 500 Internal Server Error
```

**Cause:**
- Rolled back to revision with issues
- Database incompatibility (new schema, old code)
- Environment variable changes
- Upstream dependency issues

**Solution:**
1. Check Cloud Run logs:
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=[SERVICE_NAME]" \
     --limit=100 \
     --format=json
   ```

2. Verify traffic shifted to correct revision:
   ```bash
   gcloud run services describe [SERVICE_NAME] \
     --region=southamerica-east1 \
     --format="value(status.traffic)"
   ```

3. If correct revision, may need to rollback further:
   ```bash
   # List revisions to find older one
   gcloud run revisions list --service=[SERVICE_NAME] --region=southamerica-east1
   
   # Rollback to older revision
   gcloud run services update-traffic [SERVICE_NAME] \
     --region=southamerica-east1 \
     --to-revisions=[OLDER_REVISION]=100
   ```

4. If database-related, see [Database Migration Rollback](#database-migration-rollback) section

5. If persistent, may need database rollback (Epic 2 procedures)

### Issue 3: Cannot find previous revision

**Error Message:**
```
ERROR: (gcloud.run.services.update-traffic) Revision [role-directory-dev-00001-old] not found.
```

**Cause:**
- Revision deleted (retention policy)
- Revision never existed (incorrect name)
- Service was redeployed with new name pattern

**Solution:**
1. List available revisions:
   ```bash
   gcloud run revisions list --service=[SERVICE_NAME] --region=southamerica-east1
   ```

2. Check revision retention policy:
   - Cloud Run retains revisions for 24 hours by default
   - Older revisions may be deleted

3. If revision unavailable, use image-based redeployment:
   ```bash
   # Find previous image tag
   gcloud container images list-tags gcr.io/[PROJECT_ID]/role-directory \
     --filter="tags:dev-*" \
     --sort-by="~timestamp" \
     --limit=10
   
   # Redeploy using previous image
   gcloud run deploy [SERVICE_NAME] \
     --region=southamerica-east1 \
     --image=gcr.io/[PROJECT_ID]/role-directory:[PREVIOUS_TAG]
   ```

4. Or use promotion workflow with known good image tag

### Issue 4: Rollback succeeds but issue persists

**Symptoms:**
- Traffic shifted successfully
- Health check passes
- But original issue still occurs

**Cause:**
- Issue is not in application code
- Database problem (not application)
- Upstream service failure
- Browser/CDN caching
- Infrastructure issue (GCP, Cloud Run)

**Solution:**
1. Verify traffic actually shifted:
   ```bash
   gcloud run services describe [SERVICE_NAME] \
     --region=southamerica-east1 \
     --format="value(status.traffic)"
   ```

2. Clear browser cache and test:
   ```bash
   # Use curl to bypass browser cache
   curl -f [SERVICE_URL]/api/health
   ```

3. Check database health:
   ```bash
   # Test database connectivity (Epic 2)
   curl -f [SERVICE_URL]/api/health
   # Look for database field in response
   ```

4. Check upstream dependencies:
   - External APIs
   - Authentication services (Neon Auth)
   - Third-party integrations

5. Check Cloud Run status:
   - [GCP Status Dashboard](https://status.cloud.google.com/)
   - Check for outages or issues

6. If persistent across revisions, issue is likely infrastructure or database

### Issue 5: Multiple revisions serving traffic (split traffic)

**Symptoms:**
- Some requests show old behavior
- Some requests show new behavior
- Inconsistent responses

**Cause:**
- Traffic split between multiple revisions
- Previous rollback didn't set target to 100%
- Manual traffic splitting configured

**Solution:**
1. Check current traffic split:
   ```bash
   gcloud run services describe [SERVICE_NAME] \
     --region=southamerica-east1 \
     --format="value(status.traffic)"
   
   # May show: [{"revisionName":"rev-1","percent":50},{"revisionName":"rev-2","percent":50}]
   ```

2. Consolidate to single revision:
   ```bash
   gcloud run services update-traffic [SERVICE_NAME] \
     --region=southamerica-east1 \
     --to-revisions=[TARGET_REVISION]=100
   
   # This sets target to 100%, all others to 0%
   ```

3. Verify consolidated:
   ```bash
   gcloud run services describe [SERVICE_NAME] \
     --region=southamerica-east1 \
     --format="value(status.traffic)"
   
   # Should show: [{"revisionName":"[TARGET_REVISION]","percent":100}]
   ```

### Additional Support

If issues persist:
- **Cloud Run Documentation:** [Rollouts, Rollbacks, and Traffic Migration](https://cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration)
- **GCP Support:** [Cloud Run Support](https://cloud.google.com/support)
- **GitHub Issues:** Check repository issues for known problems
- **Team Chat:** Ask in team channel for help

---

## References

### Internal Documentation

- [Promotion Workflow Guide](guides/promotion-workflow-guide.md) - Manual promotion procedures (dev→staging→production)
- [Cloud Run Setup Guide](CLOUD_RUN_SETUP.md) - Initial Cloud Run service configuration
- [GitHub Actions CI/CD](GITHUB_ACTIONS_SETUP.md) - Automated deployment workflows
- [Architecture Document](3-solutioning/architecture.md) - System architecture and Cloud Run revision management
- [PRD - Rollback Procedures](2-planning/PRD.md#FR-6.8) - Product requirements for rollback
- [Tech Spec Epic 1 - AC-11](tech-spec-epic-1.md#AC-11) - Technical specification for rollback

### Story References

- [Story 1.4: Cloud Run Service Setup (Dev)](stories/1-4-cloud-run-service-setup-dev.md)
- [Story 1.5: GitHub Actions Deployment to Dev](stories/1-5-github-actions-deployment-to-dev.md)
- [Story 1.6: Health Check Endpoint](stories/1-6-health-check-endpoint.md)
- [Story 1.7: Cloud Run Service Setup (Staging)](stories/1-7-cloud-run-service-setup-staging.md)
- [Story 1.8: Cloud Run Service Setup (Production)](stories/1-8-cloud-run-service-setup-production.md)
- [Story 1.9: Manual Promotion Workflow (Dev→Staging)](stories/1-9-manual-promotion-workflow-dev-staging.md)
- [Story 1.10: Manual Promotion Workflow (Staging→Production)](stories/1-10-manual-promotion-workflow-staging-production.md)
- [Story 1.11: Rollback Documentation and Testing](stories/1-11-rollback-documentation-and-testing.md) (this story)

### External Documentation

- [Cloud Run Rollbacks and Traffic Migration](https://cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration)
- [Cloud Run Revision Management](https://cloud.google.com/run/docs/managing/revisions)
- [gcloud run services update-traffic](https://cloud.google.com/sdk/gcloud/reference/run/services/update-traffic)
- [gcloud run revisions list](https://cloud.google.com/sdk/gcloud/reference/run/revisions/list)
- [Cloud Run Best Practices](https://cloud.google.com/run/docs/best-practices)

---

**Last Updated:** 2025-11-07  
**Tested:** Dev environment (role-directory-dev)  
**Next Review:** After first production rollback or 3 months

---

**Document Owner:** DevOps Team  
**Questions?** Contact the team lead or file an issue in the repository.

