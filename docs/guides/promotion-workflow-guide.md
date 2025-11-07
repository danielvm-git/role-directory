# Promotion Workflow Guide: Dev to Staging

This guide explains how to manually promote a validated dev deployment to the staging environment using the GitHub Actions promotion workflow.

## Overview

The promotion workflow allows you to promote a tested Docker image from the dev environment to staging with a single button click. This workflow:

- ✅ **Does NOT rebuild** the application (promotes the exact same artifact)
- ✅ Pulls the specified dev image from GCR
- ✅ Re-tags it for staging with a timestamp
- ✅ Deploys to the staging Cloud Run service
- ✅ Runs automated health checks with IAM authentication
- ✅ Provides audit trail (who promoted what and when)
- ✅ Completes in under 5 minutes

## Prerequisites

Before using the promotion workflow, ensure:

1. **Dev deployment exists**: A successful deployment to the dev environment
2. **Dev image tag available**: You know the dev image tag to promote
3. **Staging service configured**: The `role-directory-staging` Cloud Run service is set up
4. **GitHub permissions**: You have permission to trigger GitHub Actions workflows

## How to Trigger the Promotion Workflow

### Step 1: Navigate to GitHub Actions

1. Go to your repository on GitHub
2. Click on the **Actions** tab (top navigation bar)
3. In the left sidebar, find and click **"Promote Dev to Staging"**

### Step 2: Run the Workflow

1. Click the **"Run workflow"** button (top right, blue button)
2. Select the branch (usually `main`)
3. Enter the **dev image tag** to promote (see next section for how to find this)
4. Click **"Run workflow"** (green button in the dropdown)

The workflow will start immediately and you can monitor its progress in real-time.

## Finding the Dev Image Tag

You need to provide the dev image tag (e.g., `dev-20231106-123456`) when triggering the promotion. Here are three ways to find it:

### Option 1: From GitHub Actions Dev Deployment Logs

1. Go to **Actions** → **"CI/CD - Build and Deploy to Dev"**
2. Click on the most recent successful run
3. Open the **"Deploy to Cloud Run"** step
4. Look for output mentioning the image tag or service URL
5. The tag typically follows the format: `dev-<timestamp>` or `dev-<commit-sha>`

### Option 2: From GCR (Google Container Registry)

Run this command in your terminal:

```bash
gcloud container images list-tags gcr.io/<PROJECT_ID>/role-directory \
  --filter="tags:dev-*" \
  --sort-by="~timestamp" \
  --limit=5 \
  --format="table(tags,timestamp)"
```

This shows the 5 most recent dev image tags.

### Option 3: From Cloud Run Dev Service

Run this command to see what image is currently deployed to dev:

```bash
gcloud run revisions list \
  --service=role-directory-dev \
  --region=us-central1 \
  --limit=1 \
  --format="value(image)"
```

Extract the tag from the image URL (the part after the last `:`)

## Workflow Execution Timeline

The promotion workflow typically completes in **3-4 minutes**:

| Time | Step | Duration |
|------|------|----------|
| 0:00 | Workflow triggered | - |
| 0:05 | Authenticate to GCP | 5 seconds |
| 0:35 | Pull dev image | 30 seconds |
| 0:40 | Re-tag image | 5 seconds |
| 1:10 | Push staging images | 30 seconds |
| 3:10 | Deploy to Cloud Run | 1-2 minutes |
| 3:25 | Wait for deployment | 15 seconds |
| 3:55 | Health check (with retries) | 30 seconds |
| 4:00 | Log promotion details | 5 seconds |
| **4:00** | **Complete** ✅ | **~4 minutes** |

## Verification Steps

After the workflow completes successfully:

### 1. Check GitHub Actions UI

- ✅ Workflow status should show green checkmark (Success)
- ✅ All steps should show green checkmarks
- ✅ Review the "Promotion Summary" in the workflow logs

### 2. Check Staging URL

The staging service URL is displayed in the workflow summary. You can also get it with:

```bash
gcloud run services describe role-directory-staging \
  --region=us-central1 \
  --format="value(status.url)"
```

### 3. Manual Health Check

Run a manual health check against staging (requires authentication):

```bash
# Generate IAM token
TOKEN=$(gcloud auth print-identity-token)

# Get staging URL
STAGING_URL=$(gcloud run services describe role-directory-staging \
  --region=us-central1 \
  --format="value(status.url)")

# Health check
curl -H "Authorization: Bearer $TOKEN" "$STAGING_URL/api/health"
```

Expected response (200 OK):
```json
{
  "status": "ok",
  "timestamp": "2025-11-07T15:30:00.000Z"
}
```

### 4. Verify Image in GCR

Check that the staging images were pushed:

```bash
gcloud container images list-tags gcr.io/<PROJECT_ID>/role-directory \
  --filter="tags:staging-*" \
  --sort-by="~timestamp" \
  --limit=5
```

You should see:
- `staging-<timestamp>` (the new promotion)
- `staging-latest` (updated to point to the new promotion)

## Rollback Procedure

If the promotion fails or you need to rollback to a previous version:

### Option 1: Re-promote Previous Dev Image

1. Find the previous working dev image tag
2. Re-run the promotion workflow with that tag
3. The staging service will deploy the previous version

```bash
# Find previous dev images
gcloud container images list-tags gcr.io/<PROJECT_ID>/role-directory \
  --filter="tags:dev-*" \
  --sort-by="~timestamp" \
  --limit=10
```

### Option 2: Rollback to Previous Cloud Run Revision

```bash
# List recent revisions
gcloud run revisions list \
  --service=role-directory-staging \
  --region=us-central1 \
  --limit=5

# Route 100% traffic to previous revision
gcloud run services update-traffic role-directory-staging \
  --region=us-central1 \
  --to-revisions=<PREVIOUS_REVISION>=100
```

### Option 3: Deploy Previous Staging Image

```bash
# Find previous staging images
gcloud container images list-tags gcr.io/<PROJECT_ID>/role-directory \
  --filter="tags:staging-*" \
  --sort-by="~timestamp" \
  --limit=5

# Deploy previous staging image
gcloud run deploy role-directory-staging \
  --region=us-central1 \
  --image=gcr.io/<PROJECT_ID>/role-directory:staging-<PREVIOUS_TAG>
```

## Audit Trail

Every promotion is automatically logged with:

- **Dev image tag**: Which dev version was promoted
- **Staging image tag**: The new staging tag (with timestamp)
- **Staging URL**: Where the service is deployed
- **Triggered by**: GitHub username who triggered the promotion
- **Timestamp**: When the promotion occurred (UTC)
- **Run URL**: Link to the GitHub Actions run for full details

This information is available in:
- GitHub Actions workflow logs (permanent)
- GitHub Actions workflow summary (visible in the Actions UI)
- GCR image tags (shows when images were pushed)
- Cloud Run revision history (shows deployment timeline)

## Troubleshooting

### Problem: "Dev image not found"

**Cause**: The dev image tag doesn't exist in GCR

**Solution**:
1. Verify the tag format (should be `dev-<timestamp>` or similar)
2. List available dev images: `gcloud container images list-tags gcr.io/<PROJECT_ID>/role-directory --filter="tags:dev-*"`
3. Use a valid tag from the list

### Problem: "Health check failed"

**Cause**: Staging service didn't start properly or health endpoint is unavailable

**Solution**:
1. Check Cloud Run logs: `gcloud run services logs read role-directory-staging --region=us-central1`
2. Verify staging service is running: `gcloud run services describe role-directory-staging --region=us-central1`
3. Check if previous revision is still serving traffic (rollback succeeded)
4. If needed, manually test health endpoint with IAM token

### Problem: "Authentication failed"

**Cause**: GitHub Secrets not configured or invalid

**Solution**:
1. Verify `GCP_SERVICE_ACCOUNT_KEY` secret is set in GitHub repository settings
2. Verify `GCP_PROJECT_ID` secret is set correctly
3. Ensure the service account has necessary permissions:
   - Cloud Run Admin
   - Storage Admin (for GCR)
   - Service Account User

### Problem: "Workflow takes longer than 5 minutes"

**Cause**: Cloud Run deployment is slow (cold start, resource constraints)

**Solution**:
1. This is usually not a problem unless it exceeds timeout
2. Check if staging has `min-instances` set to 0 (causes cold starts)
3. Consider increasing `min-instances` to 1 for staging if faster promotions are needed

## Best Practices

1. **Always test in dev first**: Ensure the dev version works before promoting to staging
2. **Use descriptive dev tags**: Use commit SHAs or timestamps for traceability
3. **Monitor promotions**: Watch the workflow logs during promotion
4. **Verify after promotion**: Always check staging URL after successful promotion
5. **Document issues**: If rollback is needed, document why in team chat or issue tracker
6. **Promote regularly**: Don't let dev and staging drift too far apart

## Security Considerations

- ✅ Workflow requires **manual trigger** (no automatic promotions)
- ✅ GitHub repository settings can restrict who can trigger workflows
- ✅ Staging service requires **IAM authentication** (not publicly accessible)
- ✅ Service account has **minimal permissions** (Cloud Run deployer, GCR writer)
- ✅ **Audit trail** tracks who promoted what and when
- ✅ Consider enabling **GitHub Environments** for additional approval gates (optional)

---

## Production Promotion: Staging to Production

### ⚠️ CRITICAL WARNINGS ⚠️

**PRODUCTION PROMOTIONS ARE HIGH-RISK OPERATIONS**

- ⚠️ Production serves real users - downtime affects customers
- ⚠️ Requires explicit approval from designated reviewers
- ⚠️ Requires typing confirmation string: `PROMOTE_TO_PRODUCTION`
- ⚠️ Only promote to production after thorough testing in staging
- ⚠️ Never promote on Friday evenings or before holidays
- ⚠️ Have a rollback plan ready before promoting
- ⚠️ Monitor production closely after promotion

### GitHub Environment Setup (REQUIRED FIRST)

**Before first production promotion, configure GitHub Environment:**

1. Navigate to: Repository → Settings → Environments
2. Click "New environment"
3. Name: `production`
4. Add protection rules:
   - **Required reviewers**: Add 1-6 team members (Tech Lead, DevOps, CTO)
   - **Wait timer**: 0 minutes (or add delay for change windows)
   - **Deployment branches**: Limit to `main` branch only
5. Save protection rules

**Who Can Approve:**
- Only reviewers configured in the `production` environment
- Any configured reviewer can approve (not just workflow trigger)
- Workflow triggerer CANNOT self-approve (GitHub prevents this)

### How to Trigger Production Promotion

#### Step 1: Verify Staging is Stable

Before promoting to production:
1. ✅ Staging deployment successful and healthy
2. ✅ All tests passing in staging
3. ✅ Staging has been running stably for reasonable time (hours, not minutes)
4. ✅ No known issues in staging
5. ✅ Team aware of upcoming production deployment

#### Step 2: Find Staging Image Tag

You need the staging image tag (e.g., `staging-20231106-123456`). Find it using:

**Option 1: From GitHub Actions Staging Promotion Logs**
1. Go to **Actions** → **"Promote Dev to Staging"**
2. Click on the most recent successful run
3. Look for: "Tagged as: staging-<TAG>"

**Option 2: From GCR**
```bash
gcloud container images list-tags gcr.io/<PROJECT_ID>/role-directory \
  --filter="tags:staging-*" \
  --sort-by="~timestamp" \
  --limit=5 \
  --format="table(tags,timestamp)"
```

**Option 3: From Cloud Run Staging Service**
```bash
gcloud run services describe role-directory-staging \
  --region=us-central1 \
  --format="value(spec.template.spec.containers[0].image)"
```

#### Step 3: Trigger the Workflow

1. Go to your repository on GitHub
2. Click on the **Actions** tab
3. In the left sidebar, find **"Promote Staging to Production"**
4. Click **"Run workflow"** button (top right)
5. Enter the **staging image tag** (e.g., `staging-20231106-143022`)
6. Enter confirmation string: **`PROMOTE_TO_PRODUCTION`**
   - ⚠️ Must be EXACT (case-sensitive, underscores not dashes)
   - ❌ Wrong: `promote_to_production`, `PROMOTE-TO-PRODUCTION`, `PROMOTE TO PRODUCTION`
   - ✅ Correct: `PROMOTE_TO_PRODUCTION`
7. Click **"Run workflow"** (green button)

#### Step 4: Wait for Approval Request

1. Workflow starts and validates confirmation string
2. Workflow pauses at approval gate
3. Status shows: **"Waiting for approval"**
4. Email notification sent to configured reviewers

#### Step 5: Review and Approve (For Reviewers)

**As a Reviewer:**
1. Check email notification or GitHub Actions UI
2. Click **"Review deployments"** button
3. Review the details:
   - Staging image tag being promoted
   - Who triggered the promotion
   - When it was triggered
4. Decision:
   - ✅ Click **"Approve and deploy"** (green) → Promotion continues
   - ❌ Click **"Reject"** (red) → Promotion cancelled

#### Step 6: Monitor Deployment

After approval:
1. Workflow continues automatically
2. Staging image pulled and re-tagged
3. Production images pushed to registry
4. Cloud Run production service updated
5. Health check runs (should be <100ms, no cold start)
6. Promotion summary logged

**Total Time:** 3-4 minutes after approval

### Production Promotion Timeline

| Time | Step | Duration | Notes |
|------|------|----------|-------|
| 0:00 | Workflow triggered | - | User enters staging tag + confirmation |
| 0:05 | Confirmation validated | 5 seconds | Fails if string doesn't match |
| ⏸️ | **WAIT FOR APPROVAL** | **Variable** | **Seconds to hours** |
| 0:10 | Approval granted | - | Reviewer clicks "Approve and deploy" |
| 0:15 | Authenticate to GCP | 5 seconds | |
| 0:45 | Pull staging image | 30 seconds | |
| 0:50 | Re-tag image | 5 seconds | production-<timestamp> |
| 1:20 | Push production images | 30 seconds | Both tags |
| 3:20 | Deploy to Cloud Run | 1-2 minutes | Zero-downtime |
| 3:35 | Wait for deployment | 15 seconds | |
| 3:50 | Health check | 15 seconds | <100ms, min 2 instances |
| 4:00 | Log promotion details | 10 seconds | |
| **4:00** | **Complete** ✅ | **~4 min** | **After approval** |

### Verification Steps

After production promotion completes:

#### 1. Check GitHub Actions UI
- ✅ Workflow status: Success (green checkmark)
- ✅ All steps completed successfully
- ✅ Review "PRODUCTION Promotion Summary" in logs

#### 2. Verify Production Service
```bash
# Get production URL
PRODUCTION_URL=$(gcloud run services describe role-directory-production \
  --region=us-central1 \
  --format="value(status.url)")

echo "Production URL: $PRODUCTION_URL"
```

#### 3. Manual Health Check
```bash
# Generate IAM token
TOKEN=$(gcloud auth print-identity-token)

# Health check
curl -H "Authorization: Bearer $TOKEN" "$PRODUCTION_URL/api/health"
```

Expected response (200 OK):
```json
{
  "status": "ok",
  "timestamp": "2025-11-07T15:30:00.000Z"
}
```

Response time should be **<100ms** (production has min 2 instances, no cold start)

#### 4. Verify Production Images
```bash
gcloud container images list-tags gcr.io/<PROJECT_ID>/role-directory \
  --filter="tags:production-*" \
  --limit=5
```

You should see:
- `production-<timestamp>` (the new promotion)
- `production-latest` (updated to point to new promotion)

#### 5. Verify Production Revision
```bash
gcloud run revisions list \
  --service=role-directory-production \
  --region=us-central1 \
  --limit=3
```

Verify:
- New revision created
- New revision receiving 100% traffic
- Min 2 instances running

### Production Rollback Procedures

If production promotion fails or issues discovered:

#### Option 1: Promote Previous Staging Version

1. Find previous working staging tag:
```bash
gcloud container images list-tags gcr.io/<PROJECT_ID>/role-directory \
  --filter="tags:staging-*" \
  --sort-by="~timestamp" \
  --limit=10
```

2. Re-run production promotion workflow with that tag
3. Requires approval (follow normal process)

#### Option 2: Rollback to Previous Production Revision

**Fast rollback (no rebuild or approval):**

```bash
# List recent revisions
gcloud run revisions list \
  --service=role-directory-production \
  --region=us-central1 \
  --limit=5

# Rollback to specific revision
gcloud run services update-traffic role-directory-production \
  --region=us-central1 \
  --to-revisions=PREVIOUS_REVISION=100
```

Example:
```bash
# Rollback to previous revision
gcloud run services update-traffic role-directory-production \
  --region=us-central1 \
  --to-revisions=role-directory-production-00008-abc=100
```

This is the **fastest rollback method** (~30 seconds)

#### Option 3: Deploy Previous Production Image

```bash
# Find previous production images
gcloud container images list-tags gcr.io/<PROJECT_ID>/role-directory \
  --filter="tags:production-*" \
  --sort-by="~timestamp" \
  --limit=5

# Deploy previous production image
gcloud run deploy role-directory-production \
  --region=us-central1 \
  --image=gcr.io/<PROJECT_ID>/role-directory:production-<PREVIOUS_TAG>
```

### Production-Specific Troubleshooting

#### Problem: "Confirmation string does not match"

**Cause**: Confirmation string incorrect or typo

**Solution**:
1. Verify you typed: `PROMOTE_TO_PRODUCTION` (exact, case-sensitive)
2. Copy-paste from documentation to avoid typos
3. Re-run workflow with correct string

#### Problem: "Waiting for approval" stuck

**Cause**: No reviewers configured or reviewers unavailable

**Solution**:
1. Check Repository Settings → Environments → production → Required reviewers
2. Ensure at least one reviewer is configured
3. Contact reviewer to approve
4. If urgent: Add additional reviewers to production environment

#### Problem: "Health check failed"

**Cause**: Production service didn't start properly

**Solution**:
1. Check Cloud Run logs: `gcloud run services logs read role-directory-production --region=us-central1`
2. Verify staging was healthy (might be app issue)
3. Check if previous revision still running (auto-rollback on failure)
4. If critical: Use Option 2 rollback (previous revision)

#### Problem: "Deployment successful but users see old version"

**Cause**: DNS caching or CDN not updated

**Solution**:
1. Verify Cloud Run revision updated: `gcloud run revisions list --service=role-directory-production`
2. Check traffic split: `gcloud run services describe role-directory-production`
3. Clear browser cache and test with curl
4. Wait 2-5 minutes for DNS propagation

### Production Deployment Best Practices

**Timing:**
- ✅ Monday-Thursday during business hours
- ✅ When team available to monitor
- ✅ Outside of peak usage hours if known
- ❌ Friday evenings (risk over weekend)
- ❌ Before holidays
- ❌ During major events/launches

**Pre-Deployment Checklist:**
- [ ] All tests passing in staging
- [ ] Staging stable for at least 2 hours
- [ ] No known issues in staging
- [ ] Team aware of deployment
- [ ] Rollback plan ready
- [ ] Monitoring dashboard open
- [ ] Designated approver available
- [ ] Database migrations (if any) tested
- [ ] Feature flags configured (if applicable)

**Post-Deployment Monitoring:**
- Monitor for 15-30 minutes after promotion
- Watch Cloud Run metrics (requests, errors, latency)
- Check application logs for errors
- Verify key user flows working
- Be ready to rollback if issues detected

**Communication:**
- Announce in team channel before promoting
- Share production URL after promotion
- Report any issues immediately
- Document any unexpected behavior

### Differences: Staging vs Production Promotion

| Aspect | Staging Promotion | Production Promotion |
|--------|------------------|---------------------|
| **Approval** | No | **Yes (Required)** |
| **Confirmation** | No | **Yes ("PROMOTE_TO_PRODUCTION")** |
| **Reviewers** | N/A | **1-6 configured reviewers** |
| **Scrutiny** | Medium | **High** |
| **Service** | role-directory-staging | **role-directory-production** |
| **Min Instances** | 1 | **2 (High Availability)** |
| **CPU** | 1 | **2** |
| **Memory** | 512 MB | **1 GB** |
| **Response Time** | <200ms | **<100ms (no cold start)** |
| **Impact** | Dev team | **End users** |
| **Timing** | Anytime | **Business hours preferred** |
| **Rollback** | Simple | **Critical procedure** |

### Audit Trail

Every production promotion is logged with:
- **Staging Image**: Which staging version was promoted
- **Production Image**: The new production tag (with timestamp)
- **Production URL**: Where the service is deployed
- **Triggered by**: GitHub username who triggered
- **Approved by**: Available in GitHub Environment deployment events
- **Timestamp**: When promotion occurred (UTC)
- **Run URL**: Link to full GitHub Actions run

Access audit trail:
- GitHub Actions workflow logs (permanent)
- GitHub Actions workflow summary (UI)
- GitHub API (workflow runs endpoint)
- GCR image tags (deployment history)
- Cloud Run revision history (deployment timeline)

---

## Related Documentation

- [Cloud Run Staging Setup Guide](./cloud-run-staging-setup.md)
- [Cloud Run Production Setup Guide](./cloud-run-production-setup.md)
- [Docker Configuration](../DOCKER.md)
- [GitHub Actions CI/CD Setup](../GITHUB_ACTIONS_SETUP.md)
- [Story 1-9: Manual Promotion Workflow (Dev to Staging)](../stories/1-9-manual-promotion-workflow-dev-staging.md)
- [Story 1-10: Manual Promotion Workflow (Staging to Production)](../stories/1-10-manual-promotion-workflow-staging-production.md)

## Future Enhancements

Potential improvements for the promotion workflow:

- **Slack/Discord notifications**: Send alert when promotion completes (especially production)
- **Automated smoke tests**: Run automated tests before marking promotion successful
- **Deployment windows**: Prevent promotions outside approved times
- **Promotion calendar**: Track promotion schedule and frequency
- **Automated rollback**: Auto-rollback if health check fails or error rate spikes
- **Canary deployments**: Gradually roll out to subset of users first

