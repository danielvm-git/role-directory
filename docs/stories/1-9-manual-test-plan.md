# Story 1.9: Manual Test Plan
## Manual Promotion Workflow (Dev to Staging)

**Story ID:** 1-9  
**Test Date:** 2025-11-07  
**Tester:** (To be filled in during manual testing)  
**Status:** Pending Manual Verification

---

## Prerequisites

Before testing, ensure:

- ✅ Dev environment has at least one successful deployment with a tagged image
- ✅ GitHub Secrets are configured: `GCP_PROJECT_ID`, `GCP_SERVICE_ACCOUNT_KEY`
- ✅ Staging Cloud Run service `role-directory-staging` exists (Story 1-7)
- ✅ GCP service account has necessary permissions (Cloud Run Admin, Storage Admin)
- ✅ You have access to trigger GitHub Actions workflows in the repository
- ✅ You have `gcloud` CLI installed and authenticated for manual verification

---

## Test Cases

### TC-1: Workflow is Triggerable Manually (AC-1)

**Steps:**
1. Navigate to GitHub repository
2. Click on **Actions** tab
3. Look for **"Promote Dev to Staging"** workflow in the left sidebar
4. Click on the workflow name

**Expected Result:**
- ✅ Workflow appears in the list
- ✅ "Run workflow" button is visible (top right)
- ✅ No automatic triggers listed (only `workflow_dispatch`)

**Actual Result:** _____________________________

**Status:** ⬜ Pass | ⬜ Fail

---

### TC-2: Workflow Requires Dev Image Tag Input (AC-2)

**Steps:**
1. Click **"Run workflow"** button
2. Observe the input fields in the dropdown

**Expected Result:**
- ✅ `dev_image_tag` input field is visible
- ✅ Field description says: "Dev image tag to promote (e.g., dev-20231106-123456)"
- ✅ Field is marked as required
- ✅ Branch selector shows (typically `main`)

**Actual Result:** _____________________________

**Status:** ⬜ Pass | ⬜ Fail

---

### TC-3: Find Valid Dev Image Tag (Prerequisite for AC-3)

**Steps:**

**Option 1: From GitHub Actions**
1. Go to **Actions** → **"CI/CD - Build and Deploy to Dev"**
2. Click on the most recent successful run
3. Open the **"Deploy to Cloud Run"** step logs
4. Note the deployed image or tag information

**Option 2: From gcloud (Recommended)**
```bash
gcloud container images list-tags gcr.io/<PROJECT_ID>/role-directory \
  --filter="tags:dev-*" \
  --sort-by="~timestamp" \
  --limit=5 \
  --format="table(tags,timestamp)"
```

**Option 3: From Cloud Run Dev Service**
```bash
gcloud run services describe role-directory-dev \
  --region=southamerica-east1 \
  --format="value(spec.template.spec.containers[0].image)"
```

**Record Dev Image Tag:** _____________________________  
(Example: `dev-20231106-123456`)

**Status:** ⬜ Found dev image tag

---

### TC-4: Trigger Promotion Workflow (AC-1, AC-2)

**Steps:**
1. In the "Promote Dev to Staging" workflow page
2. Click **"Run workflow"** button
3. Enter the dev image tag from TC-3
4. Click **"Run workflow"** (green button)

**Expected Result:**
- ✅ Workflow starts immediately
- ✅ New workflow run appears in the list
- ✅ Status shows as "running" (yellow circle)

**Actual Result:** _____________________________

**Status:** ⬜ Pass | ⬜ Fail

---

### TC-5: Workflow Pulls Dev Image (AC-3)

**Steps:**
1. Click on the running workflow
2. Expand the **"Pull dev image"** step
3. Watch the logs

**Expected Result:**
- ✅ Step shows: `Pulling dev image: gcr.io/<PROJECT>/role-directory:<dev-tag>`
- ✅ Step completes successfully (green checkmark)
- ✅ Logs show: `Dev image pulled successfully`
- ✅ No "image not found" errors

**Actual Result:** _____________________________

**Status:** ⬜ Pass | ⬜ Fail

---

### TC-6: Workflow Re-tags Image for Staging (AC-4)

**Steps:**
1. Expand the **"Re-tag image for staging"** step
2. Check the logs

**Expected Result:**
- ✅ Step shows: `Re-tagging image for staging...`
- ✅ New staging tag generated: `staging-YYYYMMDD-HHMMSS` format
- ✅ Logs show: `Tagged as: staging-<timestamp>`
- ✅ Logs show: `Tagged as: staging-latest`
- ✅ Step completes successfully

**Record Staging Tag:** _____________________________  
(Example: `staging-20231106-143022`)

**Status:** ⬜ Pass | ⬜ Fail

---

### TC-7: Workflow Pushes Staging Images (AC-5)

**Steps:**
1. Expand the **"Push staging images"** step
2. Check the logs

**Expected Result:**
- ✅ Step shows: `Pushing staging images to registry...`
- ✅ Both images pushed: `staging-<timestamp>` and `staging-latest`
- ✅ Logs show: `Staging images pushed successfully`
- ✅ Step completes successfully

**Actual Result:** _____________________________

**Status:** ⬜ Pass | ⬜ Fail

**Verification (Optional):**
```bash
gcloud container images list-tags gcr.io/<PROJECT_ID>/role-directory \
  --filter="tags:staging-*" \
  --limit=5
```

---

### TC-8: Workflow Deploys to Cloud Run Staging (AC-6)

**Steps:**
1. Expand the **"Deploy to Cloud Run (Staging)"** step
2. Check the logs

**Expected Result:**
- ✅ Step uses `google-github-actions/deploy-cloudrun@v2`
- ✅ Service name: `role-directory-staging`
- ✅ Region: `southamerica-east1`
- ✅ Image: `gcr.io/<PROJECT>/role-directory:staging-<timestamp>`
- ✅ Deployment succeeds (green checkmark)
- ✅ Service URL captured in outputs

**Record Staging URL:** _____________________________  
(Example: `https://role-directory-staging-abc.run.app`)

**Status:** ⬜ Pass | ⬜ Fail

---

### TC-9: Workflow Runs Health Check with IAM Auth (AC-7)

**Steps:**
1. Expand the **"Health check"** step
2. Check the logs

**Expected Result:**
- ✅ Step generates IAM token: `gcloud auth print-identity-token`
- ✅ Health check URL shown: `<STAGING_URL>/api/health`
- ✅ Logs show retry attempts (up to 12 attempts over 60 seconds)
- ✅ Health check passes with 200 OK status
- ✅ Response body contains: `"status": "ok"`
- ✅ Logs show: `✅ Health check passed!`

**Actual Result:** _____________________________

**Status:** ⬜ Pass | ⬜ Fail

---

### TC-10: Workflow Reports Success (AC-8)

**Steps:**
1. Wait for workflow to complete
2. Check overall workflow status
3. Click on **"Summary"** tab in the workflow run

**Expected Result:**
- ✅ Workflow status shows green checkmark (Success)
- ✅ All steps show green checkmarks
- ✅ Summary tab shows "Promotion Summary" table with:
  - Dev Image tag
  - Staging Image tag
  - Staging URL
  - Triggered by (your GitHub username)
  - Timestamp (UTC)
  - Run URL
- ✅ Status shows: "Promotion successful"

**Actual Result:** _____________________________

**Status:** ⬜ Pass | ⬜ Fail

---

### TC-11: Workflow Completes in Under 5 Minutes (AC-9)

**Steps:**
1. Note the workflow start time (shown at top of workflow run)
2. Note the workflow end time
3. Calculate duration

**Expected Result:**
- ✅ Total duration < 5 minutes
- ✅ Typical duration: 3-4 minutes

**Actual Duration:** _____ minutes _____ seconds

**Status:** ⬜ Pass | ⬜ Fail

---

### TC-12: Workflow Does NOT Rebuild Application (AC-10)

**Steps:**
1. Review all workflow steps
2. Check logs for build commands

**Expected Result:**
- ✅ No `npm install` command
- ✅ No `npm run build` command
- ✅ No `docker build` command
- ✅ Only `docker pull`, `docker tag`, `docker push` commands
- ✅ Image SHA matches original dev image (same binary)

**Actual Result:** _____________________________

**Status:** ⬜ Pass | ⬜ Fail

---

### TC-13: Workflow Has Manual Trigger Protection (AC-11)

**Steps:**
1. Check workflow file: `.github/workflows/promote-dev-to-staging.yml`
2. Look at trigger section

**Expected Result:**
- ✅ Only trigger is `workflow_dispatch` (manual)
- ✅ No automatic triggers (`push`, `pull_request`, `schedule`, etc.)
- ✅ Requires explicit user action to run
- ✅ Prevents accidental promotions

**Actual Result:** _____________________________

**Status:** ⬜ Pass | ⬜ Fail

---

### TC-14: Workflow is Documented (AC-12)

**Steps:**
1. Check if `docs/guides/promotion-workflow-guide.md` exists
2. Review documentation content

**Expected Result:**
- ✅ File exists at correct location
- ✅ Documentation includes:
  - How to trigger workflow
  - How to find dev image tag
  - Expected behavior and timeline
  - Verification steps
  - Rollback procedure
  - Troubleshooting section
- ✅ Documentation is clear and comprehensive

**Actual Result:** _____________________________

**Status:** ⬜ Pass | ⬜ Fail

---

### TC-15: Workflow Logs Audit Trail (AC-13)

**Steps:**
1. Review workflow logs and summary
2. Check "Log promotion details" step

**Expected Result:**
- ✅ Dev Image tag logged
- ✅ Staging Image tag logged
- ✅ Staging URL logged
- ✅ Triggered by (GitHub username) logged
- ✅ Timestamp (UTC format) logged
- ✅ Run URL logged
- ✅ Information is accurate and complete

**Actual Result:** _____________________________

**Status:** ⬜ Pass | ⬜ Fail

---

### TC-16: Manual Staging Verification

**Steps:**
1. Get staging URL from workflow output
2. Generate IAM token: `gcloud auth print-identity-token`
3. Test health endpoint manually:

```bash
TOKEN=$(gcloud auth print-identity-token)
STAGING_URL="<URL_FROM_WORKFLOW>"

curl -H "Authorization: Bearer $TOKEN" "$STAGING_URL/api/health"
```

**Expected Result:**
- ✅ HTTP 200 OK status
- ✅ Response body: `{"status":"ok","timestamp":"..."}`
- ✅ Staging service is accessible with authentication
- ✅ Health check endpoint works correctly

**Actual Result:** _____________________________

**Status:** ⬜ Pass | ⬜ Fail

---

### TC-17: Verify Staging Image in GCR

**Steps:**
```bash
gcloud container images list-tags gcr.io/<PROJECT_ID>/role-directory \
  --filter="tags:staging-*" \
  --sort-by="~timestamp" \
  --limit=3 \
  --format="table(tags,timestamp)"
```

**Expected Result:**
- ✅ New staging tag appears: `staging-<timestamp>`
- ✅ `staging-latest` tag updated
- ✅ Timestamp matches promotion time

**Actual Result:** _____________________________

**Status:** ⬜ Pass | ⬜ Fail

---

### TC-18: Verify Cloud Run Deployment

**Steps:**
```bash
gcloud run services describe role-directory-staging \
  --region=southamerica-east1 \
  --format="value(status.latestReadyRevisionName,spec.template.spec.containers[0].image)"
```

**Expected Result:**
- ✅ Latest revision name shown
- ✅ Image matches: `gcr.io/<PROJECT>/role-directory:staging-<timestamp>`
- ✅ Deployment is healthy

**Actual Result:** _____________________________

**Status:** ⬜ Pass | ⬜ Fail

---

## Rollback Test (Optional but Recommended)

### TC-19: Test Rollback Procedure

**Steps:**
1. Promote a different dev image tag (or same one again)
2. Verify staging updates to new version
3. If needed, use rollback procedure from documentation

**Expected Result:**
- ✅ Can promote different versions
- ✅ Staging updates successfully
- ✅ Rollback procedure works if needed

**Actual Result:** _____________________________

**Status:** ⬜ Pass | ⬜ Fail

---

## Error Scenario Tests (Optional but Recommended)

### TC-20: Test with Invalid Dev Image Tag

**Steps:**
1. Trigger workflow with non-existent dev tag: `dev-invalid-12345`
2. Watch workflow execution

**Expected Result:**
- ✅ Workflow fails at "Pull dev image" step
- ✅ Clear error message: "image not found" or similar
- ✅ Workflow marked as failed (red X)
- ✅ No changes to staging service

**Actual Result:** _____________________________

**Status:** ⬜ Pass | ⬜ Fail

---

## Test Summary

**Total Test Cases:** 20  
**Passed:** _____  
**Failed:** _____  
**Skipped:** _____  

**Overall Status:** ⬜ All Tests Passed | ⬜ Some Failures | ⬜ Blocked

---

## Sign-off

**Tested By:** _____________________________  
**Date:** _____________________________  
**Approved:** ⬜ Yes | ⬜ No | ⬜ With Conditions

**Notes:**
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

---

## Next Steps

After manual testing passes:
1. Mark all test cases as passed
2. Update story status to `done` (using `*story-done` workflow)
3. Proceed to Story 1-10 (Manual Promotion Workflow: Staging to Production)
4. Consider integration into CI/CD documentation

