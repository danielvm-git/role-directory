# Promotion Workflow Guide

This guide explains how to use the manual promotion workflows to promote validated deployments across environments:

- **Part 1: Dev to Staging** - Promote tested dev deployments to staging
- **Part 2: Staging to Production** - Promote validated staging deployments to production (with approval)

---

# Part 1: Dev to Staging Promotion

## Overview

The **Promote Dev to Staging** workflow allows you to promote a tested dev deployment to staging with a single button click. The workflow:

- ✅ Does NOT rebuild the application (uses existing dev image)
- ✅ Re-tags the dev image for staging
- ✅ Deploys to Cloud Run staging service
- ✅ Runs health check validation
- ✅ Completes in under 5 minutes
- ✅ Provides full audit trail

## Prerequisites

Before using the promotion workflow, ensure:

1. ✅ A successful deployment exists in the dev environment
2. ✅ You know the dev image tag to promote
3. ✅ You have permission to trigger GitHub Actions workflows
4. ✅ GitHub Secrets are configured:
   - `GCP_PROJECT_ID` - Your Google Cloud project ID
   - `GCP_SERVICE_ACCOUNT_KEY` - Service account JSON key with Cloud Run deployer and GCR writer permissions

## How to Trigger the Workflow

### Step 1: Navigate to GitHub Actions

1. Go to your GitHub repository
2. Click on the **Actions** tab
3. In the left sidebar, select **"Promote Dev to Staging"** workflow

### Step 2: Find the Dev Image Tag

Before triggering the workflow, you need to identify the dev image tag you want to promote. Here are three ways to find it:

#### Option 1: From GitHub Actions Dev Deployment Logs

1. Go to **Actions** → **CI/CD - Build and Deploy to Dev**
2. Open the most recent successful workflow run
3. Look for the deployment step output
4. The image tag format is typically: `dev-<timestamp>` or `dev-<commit-sha>`

#### Option 2: From Google Container Registry (GCR)

```bash
gcloud container images list-tags gcr.io/<PROJECT_ID>/role-directory \
  --filter="tags:dev-*" \
  --sort-by="~timestamp" \
  --limit=5
```

This will show the 5 most recent dev image tags.

#### Option 3: From Cloud Run Dev Service

```bash
gcloud run revisions list \
  --service=role-directory-dev \
  --region=us-central1 \
  --limit=1 \
  --format="value(metadata.name)"
```

This shows the current revision name, which includes the image tag.

### Step 3: Run the Workflow

1. On the **"Promote Dev to Staging"** workflow page, click **"Run workflow"** (top right)
2. Select the branch (usually `main`)
3. Enter the **dev image tag** in the input field (e.g., `dev-20231106-123456`)
4. Click the green **"Run workflow"** button

The workflow will start immediately and you can watch the progress in real-time.

## Workflow Steps

The promotion workflow executes these steps in order:

1. **Checkout code** - Checks out repository (for scripts/logging)
2. **Authenticate to Google Cloud** - Authenticates using service account
3. **Set up Cloud SDK** - Configures gcloud CLI
4. **Configure Docker for GCR** - Sets up Docker authentication for GCR
5. **Pull dev image** - Pulls the specified dev image from GCR
6. **Re-tag image for staging** - Creates staging tags (`staging-<timestamp>` and `staging-latest`)
7. **Push staging images** - Pushes re-tagged images to GCR
8. **Deploy to Cloud Run** - Deploys staging image to `role-directory-staging` service
9. **Wait for deployment** - Waits 15 seconds for service to stabilize
10. **Health check** - Validates deployment with authenticated health check
11. **Log promotion details** - Records audit trail information

## Expected Timeline

The workflow typically completes in **3-4 minutes**:

```
00:00 - Workflow triggered
00:05 - Authenticate to GCP
00:15 - Pull dev image (~30 seconds)
00:20 - Re-tag image (~5 seconds)
00:30 - Push staging images (~30 seconds)
01:00 - Deploy to Cloud Run (~1-2 minutes)
03:00 - Wait for deployment (~15 seconds)
03:15 - Health check (~10-30 seconds)
03:45 - Log promotion details (~5 seconds)
03:50 - Complete ✅
```

**Total: ~3-4 minutes** (well under the 5-minute target)

## Verification Steps

After the workflow completes successfully:

### 1. Check Workflow Status

- ✅ Green checkmark = Success
- ❌ Red X = Failure (check logs for details)

### 2. Verify Staging Deployment

```bash
# Get staging service URL
gcloud run services describe role-directory-staging \
  --region=us-central1 \
  --format="value(status.url)"

# Test health endpoint (requires authentication)
TOKEN=$(gcloud auth print-identity-token)
curl -H "Authorization: Bearer $TOKEN" <STAGING_URL>/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-07T15:30:00.000Z"
}
```

### 3. Verify Image Tags in GCR

```bash
gcloud container images list-tags gcr.io/<PROJECT_ID>/role-directory \
  --filter="tags:staging-*" \
  --sort-by="~timestamp" \
  --limit=5
```

You should see:
- The new `staging-<timestamp>` tag
- `staging-latest` pointing to the new image

### 4. Check Cloud Run Revisions

```bash
gcloud run revisions list \
  --service=role-directory-staging \
  --region=us-central1 \
  --limit=3
```

The most recent revision should use the new staging image tag.

## Rollback Procedure

If a promotion fails or you need to rollback to a previous staging version:

### Option 1: Re-promote Previous Dev Image

1. Find the dev image tag that was working in staging
2. Trigger the promotion workflow again with that dev image tag
3. This will create a new staging revision from the previous dev image

### Option 2: Deploy Previous Staging Revision

```bash
# List recent revisions
gcloud run revisions list \
  --service=role-directory-staging \
  --region=us-central1

# Update traffic to previous revision (100% traffic)
gcloud run services update-traffic role-directory-staging \
  --region=us-central1 \
  --to-revisions=<PREVIOUS_REVISION_NAME>=100
```

### Option 3: Deploy Previous Staging Image Tag

```bash
# Find previous staging image tag
gcloud container images list-tags gcr.io/<PROJECT_ID>/role-directory \
  --filter="tags:staging-*" \
  --sort-by="~timestamp" \
  --limit=10

# Deploy previous staging image
gcloud run deploy role-directory-staging \
  --region=us-central1 \
  --image=gcr.io/<PROJECT_ID>/role-directory:staging-<PREVIOUS_TAG>
```

## Troubleshooting

### Workflow Fails at "Pull dev image"

**Error:** `Failed to pull dev image: gcr.io/.../role-directory:dev-xxx`

**Solutions:**
- Verify the dev image tag exists in GCR
- Check that the image tag format is correct (no typos)
- Ensure GCP authentication succeeded
- Verify Docker is configured for GCR: `gcloud auth configure-docker`

### Workflow Fails at "Push staging images"

**Error:** `Failed to push staging image`

**Solutions:**
- Check service account has GCR writer permissions
- Verify Docker authentication: `gcloud auth configure-docker`
- Check GCR quota/limits
- Ensure image tag format is valid

### Workflow Fails at "Deploy to Cloud Run"

**Error:** Deployment fails or times out

**Solutions:**
- Verify service account has Cloud Run deployer role
- Check that `role-directory-staging` service exists
- Verify region is correct (`us-central1`)
- Check Cloud Run service logs: `gcloud run services logs read role-directory-staging --region=us-central1`

### Workflow Fails at "Health check"

**Error:** Health check returns non-200 status or times out

**Solutions:**
- Wait longer (service may be cold-starting)
- Check service logs for errors: `gcloud run services logs read role-directory-staging --region=us-central1`
- Verify health endpoint is accessible: `/api/health`
- Check IAM authentication is working: `gcloud auth print-identity-token`
- Verify staging service requires authentication (it should)
- Check if service is actually running: `gcloud run services describe role-directory-staging --region=us-central1`

### Workflow Takes Too Long (>5 minutes)

**Possible Causes:**
- Large Docker image (slow pull/push)
- Cloud Run cold start (if min instances = 0)
- Network issues
- GCP service delays

**Solutions:**
- Check workflow logs for slow steps
- Consider increasing Cloud Run min instances to 1 (reduces cold start)
- Optimize Docker image size (future enhancement)

## Audit Trail

Every promotion is logged with:

- **Dev Image Tag:** The source dev image that was promoted
- **Staging Image Tag:** The new staging tag created (`staging-<timestamp>`)
- **Staging URL:** The Cloud Run service URL
- **Triggered By:** GitHub username who triggered the workflow
- **Timestamp:** UTC timestamp of promotion
- **Run URL:** Link to the GitHub Actions workflow run

Access audit trail:
- **GitHub Actions:** View workflow run logs
- **GitHub API:** Query workflow runs endpoint
- **GCR:** List staging image tags with timestamps

## Security Considerations

- ✅ **Manual Trigger Only:** Workflow requires explicit user action (`workflow_dispatch`)
- ✅ **Repository Settings:** GitHub repository settings can restrict who can trigger workflows
- ✅ **Service Account Permissions:** Minimal permissions (Cloud Run deployer, GCR writer)
- ✅ **IAM Authentication:** Staging service requires IAM authentication
- ✅ **Audit Logging:** All promotions are logged with user and timestamp

**Optional Enhancements:**
- Use GitHub Environments for additional approval gates
- Add Slack/Discord notifications on promotion
- Store audit trail in separate database/file

## Related Documentation

- [Staging Cloud Run Setup Guide](cloud-run-staging-setup.md) - How staging service was created
- [Dev Deployment Workflow](../stories/1-5-github-actions-deployment-to-dev.md) - How dev images are created
- [Architecture: Promotion Workflow Pattern](../3-solutioning/architecture.md#promotion-workflow-pattern) - Technical design

## Support

If you encounter issues not covered in this guide:

1. Check the workflow logs in GitHub Actions
2. Review Cloud Run service logs: `gcloud run services logs read role-directory-staging --region=us-central1`
3. Verify GCP permissions and secrets
4. Check GCR image availability
5. Review [Architecture Document](../3-solutioning/architecture.md) for technical details

---

# Part 2: Staging to Production Promotion

## ⚠️ CRITICAL: Production Promotion Overview

The **Promote Staging to Production** workflow allows you to promote a fully validated staging deployment to production. This workflow has **MUCH HIGHER SCRUTINY** than dev→staging promotion:

- ⚠️ **Confirmation String Required:** Must type `PROMOTE_TO_PRODUCTION` exactly
- ⚠️ **Human Approval Required:** Designated reviewers must approve before deployment
- ⚠️ **Manual Trigger Only:** No automatic production deployments
- ✅ Does NOT rebuild the application (uses existing staging image)
- ✅ Re-tags the staging image for production
- ✅ Deploys to Cloud Run production service (min 2 instances, 2 CPUs, 1 GB)
- ✅ Runs health check validation (fast response, no cold start)
- ✅ Completes in under 5 minutes (AFTER approval)
- ✅ Provides comprehensive audit trail (including approver)

## Prerequisites for Production Promotion

Before using the production promotion workflow, ensure:

1. ✅ A successful deployment exists in the staging environment
2. ✅ Staging deployment has been thoroughly tested and validated
3. ✅ You know the staging image tag to promote
4. ✅ You have permission to trigger GitHub Actions workflows
5. ✅ **CRITICAL:** GitHub Environment `production` is configured with required reviewers
6. ✅ GitHub Secrets are configured:
   - `GCP_PROJECT_ID` - Your Google Cloud project ID
   - `GCP_SERVICE_ACCOUNT_KEY` - Service account JSON key with Cloud Run deployer and GCR writer permissions

### Setting Up GitHub Environment (One-Time Setup)

**CRITICAL:** You MUST configure the `production` environment BEFORE first use:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Environments**
3. Click **"New environment"**
4. Name: `production`
5. Add **Protection Rules:**
   
   **a) Required reviewers:**
   - Click **"Required reviewers"**
   - Add 1-6 team members who can approve production deployments
   - Suggestions: Tech lead, DevOps engineer, CTO, or designated approvers
   - At least 1 reviewer required
   
   **b) Wait timer (optional):**
   - Set to `0` minutes (no delay after approval)
   - Or add a delay (e.g., 5 minutes) for change windows
   
   **c) Deployment branches:**
   - Select **"Selected branches"**
   - Add rule: `main` (only allow production from main branch)
   - This prevents accidental deployments from feature branches

6. Click **"Save protection rules"**

**What happens when workflow runs:**
- Workflow pauses at `environment: production` step
- Approval request sent to configured reviewers (email notification)
- Any configured reviewer can approve or reject
- After approval, workflow continues automatically

## How to Trigger Production Promotion

### Step 1: Navigate to GitHub Actions

1. Go to your GitHub repository
2. Click on the **Actions** tab
3. In the left sidebar, select **"Promote Staging to Production"** workflow

### Step 2: Find the Staging Image Tag

Before triggering the workflow, identify the staging image tag you want to promote:

#### Option 1: From GitHub Actions Staging Promotion Logs

1. Go to **Actions** → **"Promote Dev to Staging"**
2. Open the most recent successful workflow run
3. Look for the "Re-tag image for staging" step output
4. The staging tag format is: `staging-<timestamp>` (e.g., `staging-20231106-123456`)

#### Option 2: From Google Container Registry (GCR)

```bash
gcloud container images list-tags gcr.io/<PROJECT_ID>/role-directory \
  --filter="tags:staging-*" \
  --sort-by="~timestamp" \
  --limit=5
```

This will show the 5 most recent staging image tags.

#### Option 3: From Cloud Run Staging Service

```bash
gcloud run revisions list \
  --service=role-directory-staging \
  --region=us-central1 \
  --limit=1 \
  --format="value(spec.containers[0].image)"
```

This shows the current staging image (extract the tag after the colon).

### Step 3: Run the Workflow (with Confirmation)

1. On the **"Promote Staging to Production"** workflow page, click **"Run workflow"** (top right)
2. Select the branch (usually `main`)
3. **Enter the staging image tag** (e.g., `staging-20231106-123456`)
4. **⚠️ CRITICAL: Enter confirmation string:** Type exactly `PROMOTE_TO_PRODUCTION` (case-sensitive)
5. Click the green **"Run workflow"** button

The workflow will start immediately and validate the confirmation string first.

### Step 4: Wait for Approval Request

After the confirmation validation passes:

1. Workflow pauses with status: **"Waiting for approval"**
2. Configured reviewers receive email notification
3. Reviewers can see:
   - Staging image tag being promoted
   - Confirmation string entered
   - Who triggered the workflow
4. Reviewer must click **"Review deployments"** → **"Approve and deploy"** (green button)
   - OR **"Reject"** (red button) to cancel the deployment

### Step 5: Monitor Deployment (After Approval)

Once approved, the workflow continues automatically:

1. Pulls staging image from GCR
2. Re-tags for production
3. Pushes production images
4. Deploys to Cloud Run production
5. Runs health check
6. Logs comprehensive audit trail

You can watch the progress in real-time in the GitHub Actions UI.

## Workflow Steps (Production)

The production promotion workflow executes these steps in order:

1. **Checkout code** - Checks out repository
2. **Validate confirmation string** - Fails if not exactly `PROMOTE_TO_PRODUCTION`
3. ⏸️ **WAIT FOR APPROVAL** - Pauses until reviewer approves
4. **Authenticate to Google Cloud** - Authenticates using service account
5. **Set up Cloud SDK** - Configures gcloud CLI
6. **Configure Docker for GCR** - Sets up Docker authentication
7. **Pull staging image** - Pulls the specified staging image from GCR
8. **Re-tag image for production** - Creates production tags (`production-<timestamp>` and `production-latest`)
9. **Push production images** - Pushes re-tagged images to GCR
10. **Deploy to Cloud Run (Production)** - Deploys to `role-directory-production` service
11. **Wait for deployment** - Waits 15 seconds for service to stabilize
12. **Health check** - Validates deployment (fast response, min 2 instances = no cold start)
13. **Log promotion details** - Records comprehensive audit trail

## Expected Timeline (Production)

The workflow typically completes in **3-4 minutes AFTER approval**:

```
00:00 - Workflow triggered
00:05 - Validation check (confirmation string)
⏸️  WAIT FOR APPROVAL (seconds to hours - depends on reviewer availability)
00:10 - Approval granted ✅
00:15 - Authenticate to GCP
00:25 - Pull staging image (~30 seconds)
00:30 - Re-tag image (~5 seconds)
00:40 - Push production images (~30 seconds)
01:10 - Deploy to Cloud Run (~1-2 minutes)
03:10 - Wait for deployment (~15 seconds)
03:25 - Health check (~10 seconds, no cold start)
03:35 - Log promotion details (~5 seconds)
03:40 - Complete ✅
```

**Total (after approval): ~3-4 minutes**  
**Total (including approval): Variable** (depends on how quickly reviewer responds)

## Verification Steps (Production)

After the workflow completes successfully:

### 1. Check Workflow Status

- ✅ Green checkmark = Success
- ❌ Red X = Failure (check logs for details)
- Review the "PRODUCTION Promotion Summary" in the workflow output

### 2. Verify Production Deployment

```bash
# Get production service URL
gcloud run services describe role-directory-production \
  --region=us-central1 \
  --format="value(status.url)"

# Test health endpoint (requires authentication)
TOKEN=$(gcloud auth print-identity-token)
curl -H "Authorization: Bearer $TOKEN" <PRODUCTION_URL>/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-07T15:30:00.000Z"
}
```

**Expected response time:** <100ms (production has min 2 instances, no cold start)

### 3. Verify Image Tags in GCR

```bash
gcloud container images list-tags gcr.io/<PROJECT_ID>/role-directory \
  --filter="tags:production-*" \
  --sort-by="~timestamp" \
  --limit=5
```

You should see:
- The new `production-<timestamp>` tag
- `production-latest` pointing to the new image

### 4. Check Cloud Run Production Service

```bash
# List revisions
gcloud run revisions list \
  --service=role-directory-production \
  --region=us-central1 \
  --limit=3

# Check running instances (should be min 2)
gcloud run services describe role-directory-production \
  --region=us-central1 \
  --format="value(spec.template.metadata.annotations.autoscaling.knative.dev/minScale)"
```

The most recent revision should:
- Use the new production image tag
- Have 100% traffic
- Show 2+ active instances

### 5. Monitor Production Metrics

```bash
# View recent logs
gcloud run services logs read role-directory-production \
  --region=us-central1 \
  --limit=50

# Check for errors
gcloud run services logs read role-directory-production \
  --region=us-central1 \
  --filter="severity>=ERROR" \
  --limit=10
```

## Production Rollback Procedure

⚠️ If a production promotion fails or you discover issues in production:

### Option 1: Re-promote Previous Staging Image (Recommended)

This is the safest option as it goes through the full approval process:

1. Find the staging image tag that was working in production
2. Trigger the **"Promote Staging to Production"** workflow again
3. Enter the previous staging image tag
4. Enter confirmation: `PROMOTE_TO_PRODUCTION`
5. Wait for approval
6. New production revision created from previous staging image

### Option 2: Rollback to Previous Production Revision (Fast)

Use this for immediate rollback without approval (requires gcloud access):

```bash
# List recent production revisions
gcloud run revisions list \
  --service=role-directory-production \
  --region=us-central1 \
  --limit=5

# Identify the previous working revision
# Update traffic to route 100% to previous revision
gcloud run services update-traffic role-directory-production \
  --region=us-central1 \
  --to-revisions=<PREVIOUS_REVISION_NAME>=100
```

This immediately routes all traffic to the previous revision (takes ~10 seconds).

### Option 3: Deploy Previous Production Image Tag

```bash
# Find previous production image tag
gcloud container images list-tags gcr.io/<PROJECT_ID>/role-directory \
  --filter="tags:production-*" \
  --sort-by="~timestamp" \
  --limit=10

# Deploy previous production image directly
gcloud run deploy role-directory-production \
  --region=us-central1 \
  --image=gcr.io/<PROJECT_ID>/role-directory:production-<PREVIOUS_TAG>
```

**⚠️ Note:** Options 2 and 3 bypass the approval process. Use only for emergency rollbacks.

## Production Troubleshooting

### Workflow Fails at "Validate confirmation string"

**Error:** `Confirmation string does not match. Promotion cancelled.`

**Solutions:**
- Confirmation must be EXACTLY: `PROMOTE_TO_PRODUCTION` (case-sensitive)
- Common mistakes:
  - ❌ `promote_to_production` (lowercase)
  - ❌ `PROMOTE TO PRODUCTION` (spaces)
  - ❌ `PROMOTE-TO-PRODUCTION` (dashes)
  - ✅ `PROMOTE_TO_PRODUCTION` (correct)
- Re-run workflow with correct confirmation string

### Approval Never Appears

**Problem:** Workflow stuck at "Waiting for approval" but no approval request

**Solutions:**
- Verify GitHub Environment `production` exists: Settings → Environments
- Verify required reviewers are configured
- Check that reviewers have repository access
- Check reviewer email notifications (may be in spam)
- Verify workflow references `environment: production` in job definition

### Reviewer Cannot Approve

**Problem:** Reviewer doesn't see "Approve" button or gets error

**Solutions:**
- Verify reviewer is in the configured reviewers list
- Verify reviewer has repository write/admin access
- Check that approval hasn't already been granted by another reviewer
- Try refreshing the GitHub page

### Workflow Fails at "Pull staging image"

**Error:** `Failed to pull staging image`

**Solutions:**
- Verify staging image tag exists in GCR
- Check image tag format (should be `staging-<timestamp>`)
- List available staging images: `gcloud container images list-tags`
- Ensure you promoted to staging first (workflow expects staging image, not dev)

### Health Check Slower Than Expected

**Warning:** Health check takes >100ms

**Investigation:**
- Production should have min 2 instances (no cold start expected)
- Verify min instances: `gcloud run services describe role-directory-production`
- Check Cloud Run metrics for instance count
- Review application logs for slow startup or queries
- May be first request hitting new revision (subsequent requests should be faster)

### Production Deployment Succeeds but Shows Errors

**Problem:** Deployment completes but production shows errors in logs

**Immediate Action:**
1. Check error severity and frequency
2. If critical: Rollback immediately using Option 2 (traffic rollback)
3. If minor: Monitor and decide whether to rollback

**Investigation:**
- Review Cloud Run logs: `gcloud run services logs read role-directory-production`
- Check error patterns (500s, timeouts, crashes)
- Compare with staging logs (was issue present in staging?)
- Review deployment changes (what changed from previous production?)

## Production Audit Trail

Every production promotion is logged with comprehensive details:

- **Staging Image Tag:** The source staging image that was promoted
- **Production Image Tag:** The new production tag created (`production-<timestamp>`)
- **Production URL:** The Cloud Run service URL
- **Triggered By:** GitHub username who triggered the workflow
- **Approved By:** GitHub username who approved the deployment
- **Timestamp:** UTC timestamp of promotion
- **Run URL:** Link to the GitHub Actions workflow run

Access production audit trail:
- **GitHub Actions:** View workflow run logs (permanent record)
- **GitHub API:** Query workflow runs endpoint for automation
- **GCR:** List production image tags with timestamps
- **Cloud Run:** View revision history with deployment times

**Compliance Note:** Production audit trail includes approver information for regulatory compliance.

## Production Safety Checklist

Before promoting to production, verify:

- [ ] ✅ Staging deployment fully tested (functionality, performance, errors)
- [ ] ✅ No critical errors in staging logs
- [ ] ✅ Performance acceptable in staging environment
- [ ] ✅ Database migrations successful (if applicable)
- [ ] ✅ External integrations working (APIs, third-party services)
- [ ] ✅ Correct staging image tag identified
- [ ] ✅ Confirmation string ready: `PROMOTE_TO_PRODUCTION`
- [ ] ✅ Designated reviewer available for approval
- [ ] ✅ Rollback plan understood and ready
- [ ] ✅ Off-hours deployment (if high-risk changes)
- [ ] ✅ Stakeholders notified (if necessary)

## Production vs Staging: Key Differences

| Aspect | Staging | Production |
|--------|---------|-----------|
| **Trigger** | Manual (workflow_dispatch) | Manual (workflow_dispatch) |
| **Confirmation** | None | `PROMOTE_TO_PRODUCTION` string |
| **Approval** | None | Human approval required |
| **Reviewers** | N/A | Designated reviewers only |
| **Target Service** | `role-directory-staging` | `role-directory-production` |
| **Min Instances** | 1 (warm) | 2 (high availability) |
| **CPU** | 1 CPU | 2 CPUs |
| **Memory** | 512 MB | 1 GB |
| **Cold Start** | Possible (min 1) | Never (min 2) |
| **Response Time** | ~50-100ms | <100ms guaranteed |
| **Impact** | Dev team only | End users |
| **Scrutiny** | Medium | **HIGH** |
| **Audit Trail** | Standard | **Comprehensive (includes approver)** |
| **Rollback** | Standard | **Multiple options, fast** |

## Production Security Considerations

- ✅ **Manual Trigger Only:** Workflow requires explicit user action (`workflow_dispatch`)
- ✅ **Confirmation String:** Prevents accidental production promotions
- ✅ **GitHub Environment Approval:** Requires human approval from designated reviewers
- ✅ **Deployment Branches:** Restricted to `main` branch only
- ✅ **Repository Settings:** GitHub repository settings control who can trigger workflows
- ✅ **Service Account Permissions:** Minimal permissions (Cloud Run deployer, GCR writer)
- ✅ **IAM Authentication:** Production service requires IAM authentication
- ✅ **Comprehensive Audit Logging:** All promotions logged with user, approver, and timestamp
- ✅ **Rollback Capability:** Multiple rollback options for fast recovery

**Additional Recommendations:**
- Review and update GitHub Environment reviewers regularly
- Rotate GCP service account keys periodically
- Monitor GitHub Actions logs for suspicious activity
- Use GitHub audit log for compliance tracking
- Consider adding deployment windows (no Friday evening deploys)
- Add Slack/Discord notifications for production promotions (future enhancement)

## Related Documentation

- [Production Cloud Run Setup Guide](cloud-run-production-setup.md) - How production service was created
- [Staging Cloud Run Setup Guide](cloud-run-staging-setup.md) - How staging service was created
- [Staging Promotion Workflow](#part-1-dev-to-staging-promotion) - How to promote dev to staging
- [Architecture: Promotion Workflow Pattern](../3-solutioning/architecture.md#promotion-workflow-pattern) - Technical design
- [Architecture: Production Safety Gates](../3-solutioning/architecture.md#production-promotion-safety-gates) - Security design

## Production Support

If you encounter issues with production promotion:

1. **FIRST:** If production is broken, rollback immediately (Option 2: traffic rollback)
2. Check the workflow logs in GitHub Actions
3. Review Cloud Run production logs: `gcloud run services logs read role-directory-production --region=us-central1`
4. Verify GitHub Environment configuration (Settings → Environments → production)
5. Check GCP permissions and secrets
6. Verify staging image availability in GCR
7. Review [Architecture Document](../3-solutioning/architecture.md) for technical details
8. Contact designated reviewers or DevOps team

**Emergency Contacts:** [Add your team's contact information here]

---

**Last Updated:** 2025-12-02  
**Stories:**
- 1.9 - Manual Promotion Workflow (Dev to Staging)
- 1.10 - Manual Promotion Workflow (Staging to Production)

