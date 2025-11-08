# ATDD Checklist: Story 1.8 - Cloud Run Production Service Setup

**Story:** 1.8 - Cloud Run Service Setup (Production)  
**Generated:** 2025-11-06  
**Test Architect:** Murat (TEA Agent)  
**Workflow:** `*atdd` (Acceptance Test-Driven Development)

---

## Overview

Story 1.8 is an **infrastructure setup story** that creates the production Cloud Run service via `gcloud` CLI commands. Unlike feature stories, this does not modify application code, so traditional "failing tests first" ATDD doesn't apply.

Instead, this checklist provides:
1. **Verification tests** to run AFTER manual setup
2. **Pre-implementation checklist** for setup validation
3. **Post-implementation tests** to verify configuration

---

## Test Artifacts Created

### E2E Verification Tests

✅ **File:** `tests/e2e/cloud-run-production-verification.spec.ts`

**Test Suites:**

1. **Configuration Verification** (P0)
   - ✅ Production URL accessible with authentication (AC-1)
   - ✅ IAM authentication required (not public) (AC-5)
   - ✅ No cold starts (min 2 instances) (P0 Critical)
   - ✅ Concurrent request handling (P1)
   - ✅ Consistent responses (P1)
   - ✅ Error handling (P2)

2. **Environment Configuration** (P1)
   - ✅ NODE_ENV=production (AC-6)
   - ✅ Correct production URL format (AC-12)

3. **Performance Requirements** (NFR-2)
   - ✅ P95 response time <200ms (warm instances)
   - ✅ High availability (100% uptime during test)

4. **Manual Verification Guide**
   - ✅ gcloud commands for all acceptance criteria

**Total:** 12 test scenarios covering all critical acceptance criteria

---

## ATDD Implementation Flow

### Phase 1: PRE-IMPLEMENTATION (Current - Red Phase)

**Status:** ⏳ Tests written, infrastructure not yet created

#### Step 1: Review Story Acceptance Criteria ✅

**All 15 acceptance criteria documented:**
- AC-1 to AC-15 cover service configuration
- High availability requirements (min 2 instances)
- Performance requirements (2 CPU, 1 GB, gen2, CPU boost)
- Security requirements (IAM authentication)
- Cost awareness (~$50-100/month)

#### Step 2: Set Up Test Environment Variables

**Required environment variables:**

```bash
# Production service URL (to be filled after setup)
export PRODUCTION_URL=https://role-directory-production-xxx.run.app

# GCP authentication token
export GCP_AUTH_TOKEN=$(gcloud auth print-identity-token)
```

#### Step 3: Run Tests (Should Skip - Service Not Created)

```bash
# Tests will skip if environment variables not set
npx playwright test tests/e2e/cloud-run-production-verification.spec.ts
```

**Expected Result:** ⏭️ Tests skipped (PRODUCTION_URL not set)

---

### Phase 2: IMPLEMENTATION (Next - Manual Setup)

**Action:** Follow setup guide to create production service

#### Option A: Automated Setup (Recommended)

```bash
chmod +x scripts/setup-cloud-run-production.sh
./scripts/setup-cloud-run-production.sh
```

**Script will:**
- Verify prerequisites (gcloud CLI, authentication, APIs)
- Prompt for cost acknowledgment (~$50-100/month)
- Create service with all production settings
- Configure scaling (min 2, max 10)
- Configure resources (2 CPU, 1 GB)
- Enable gen2 execution + CPU boost
- Set environment variables
- Create placeholder database secret
- Grant IAM access
- Verify configuration
- Output service URL

#### Option B: Manual Setup

Follow step-by-step guide:
```bash
# See: docs/guides/cloud-run-production-setup.md
```

#### Verification Commands

After setup, verify configuration:

```bash
# Service exists
gcloud run services list --filter="role-directory-production"

# Min 2 instances
gcloud run services describe role-directory-production \
  --format="value(spec.template.metadata.annotations['autoscaling.knative.dev/minScale'])"
# Expected: 2

# Max 10 instances
gcloud run services describe role-directory-production \
  --format="value(spec.template.metadata.annotations['autoscaling.knative.dev/maxScale'])"
# Expected: 10

# 2 CPUs, 1 GB memory
gcloud run services describe role-directory-production \
  --format="value(spec.template.spec.containers[0].resources)"
# Expected: cpu: "2", memory: 1Gi

# Gen2 execution environment
gcloud run services describe role-directory-production \
  --format="value(spec.template.metadata.annotations['run.googleapis.com/execution-environment'])"
# Expected: gen2

# CPU boost enabled
gcloud run services describe role-directory-production \
  --format="value(spec.template.metadata.annotations['run.googleapis.com/cpu-boost'])"
# Expected: true

# Environment variables
gcloud run services describe role-directory-production \
  --format="value(spec.template.spec.containers[0].env)"
# Expected: NODE_ENV=production, NEXT_PUBLIC_API_URL=[url]

# Labels
gcloud run services describe role-directory-production \
  --format="value(metadata.labels)"
# Expected: environment=production, app=role-directory

# Service URL
gcloud run services describe role-directory-production \
  --format="value(status.url)"
# Copy this URL for next phase
```

---

### Phase 3: VERIFICATION (Green Phase)

**Action:** Run verification tests to confirm production service works

#### Step 1: Set Environment Variables

```bash
# Get production URL from gcloud output
export PRODUCTION_URL=$(gcloud run services describe role-directory-production --format="value(status.url)")

# Get authentication token
export GCP_AUTH_TOKEN=$(gcloud auth print-identity-token)

# Verify variables are set
echo "PRODUCTION_URL: $PRODUCTION_URL"
echo "GCP_AUTH_TOKEN: ${GCP_AUTH_TOKEN:0:50}..."
```

#### Step 2: Run Verification Tests

```bash
# Run all production verification tests
npx playwright test tests/e2e/cloud-run-production-verification.spec.ts

# Expected: ✅ All tests pass
```

#### Step 3: Manual Health Check Test

```bash
# Test authenticated access
curl -H "Authorization: Bearer $GCP_AUTH_TOKEN" \
  $PRODUCTION_URL/api/health

# Expected: 200 OK
# Response: { "status": "ok", "timestamp": "..." }
# Response time: <100ms (no cold start)

# Test unauthenticated access (should fail)
curl $PRODUCTION_URL/api/health

# Expected: 403 Forbidden (IAM protected)
```

#### Step 4: Load Testing (Optional)

```bash
# Test concurrent requests
ab -n 100 -c 10 \
  -H "Authorization: Bearer $GCP_AUTH_TOKEN" \
  $PRODUCTION_URL/api/health

# Expected:
# - 100% success rate
# - Mean response time <200ms
# - No failed requests
```

---

### Phase 4: REFINEMENT (Refactor Phase)

**Action:** Optimize based on test results

#### Performance Optimization

If tests show:
- **Response times >200ms:** Consider increasing resources
- **Scaling delays:** Adjust min/max instances
- **Cost too high:** Review instance scaling behavior

#### Configuration Refinement

```bash
# Adjust scaling (if needed)
gcloud run services update role-directory-production \
  --min-instances=2 \
  --max-instances=10

# Adjust resources (if needed)
gcloud run services update role-directory-production \
  --cpu=2 \
  --memory=1Gi
```

#### Re-run Tests

```bash
# Verify changes don't break functionality
npx playwright test tests/e2e/cloud-run-production-verification.spec.ts
```

---

## Acceptance Criteria Checklist

### Infrastructure Configuration

- [ ] **AC-1:** Service has public production URL: `https://role-directory-production-[hash].run.app`
- [ ] **AC-2:** Uses minimum 2 instances (high availability, no cold starts)
- [ ] **AC-3:** Uses maximum 10 instances (handles traffic spikes)
- [ ] **AC-4:** Uses 2 CPUs and 1024 MB memory per instance
- [ ] **AC-5:** Requires authentication via Google IAM (NOT public)
- [ ] **AC-6:** Sets environment variables: `NODE_ENV=production`, `DATABASE_URL`, `NEXT_PUBLIC_API_URL`
- [ ] **AC-7:** Has ingress set to "all" (accessible from internet with auth)
- [ ] **AC-8:** Uses container port 8080
- [ ] **AC-9:** Has resource labels: `environment=production`, `app=role-directory`
- [ ] **AC-10:** Service NOT created manually via Console (reproducible gcloud CLI)
- [ ] **AC-11:** Configuration documented for Infrastructure-as-Code
- [ ] **AC-12:** Production service URL recorded for CI/CD workflows
- [ ] **AC-13:** Production has higher resource allocation than dev/staging
- [ ] **AC-14:** Uses gen2 execution environment
- [ ] **AC-15:** Uses CPU boost for faster cold starts

### Test Coverage

- [ ] **E2E Tests:** Production verification tests passing (12 scenarios)
- [ ] **Manual Tests:** gcloud verification commands executed
- [ ] **Load Tests:** Concurrent request handling validated (optional)
- [ ] **Performance Tests:** P95 response time <200ms confirmed

### Documentation

- [ ] **Setup Guide:** `docs/guides/cloud-run-production-setup.md` complete
- [ ] **Test Guide:** This ATDD checklist document
- [ ] **Service URL:** Documented for Story 1.10 (promotion workflow)
- [ ] **Cost Analysis:** ~$50-100/month documented and approved

---

## Test Execution Summary

### Test Status

| Test Suite | Tests | Status | Notes |
|------------|-------|--------|-------|
| Configuration Verification | 6 | ⏳ Pending | Requires service creation |
| Environment Configuration | 2 | ⏳ Pending | Requires service creation |
| Performance Requirements | 2 | ⏳ Pending | Requires service creation |
| Manual Verification Guide | 1 | ✅ Ready | Documentation complete |
| **Total** | **11** | **⏳ Pending** | **Ready to run after setup** |

### Pass Criteria

**Story 1.8 is DONE when:**

✅ All 15 acceptance criteria verified (manual or automated)  
✅ Production service created and accessible with authentication  
✅ Verification tests pass (11/11)  
✅ No cold starts confirmed (min 2 instances always warm)  
✅ Performance meets requirements (P95 <200ms)  
✅ Configuration documented and reproducible  
✅ Service URL recorded for Story 1.10

---

## Next Steps

### After Story 1.8 Complete

1. **Story 1.9 (Dev → Staging Promotion):**
   - Use staging service URL
   - Test promotion workflow
   - Verify health check with IAM auth

2. **Story 1.10 (Staging → Production Promotion):**
   - Use production service URL from this story
   - Implement automated promotion workflow
   - Add safety checks for production deployments

3. **Epic 2 (Database Setup):**
   - Update production database secret
   - Test database connectivity
   - Verify health check includes database status

---

## Troubleshooting

### Tests Skip

**Problem:** Tests show "Skipping: PRODUCTION_URL or GCP_AUTH_TOKEN not set"

**Solution:**
```bash
export PRODUCTION_URL=$(gcloud run services describe role-directory-production --format="value(status.url)")
export GCP_AUTH_TOKEN=$(gcloud auth print-identity-token)
```

### Authentication Fails

**Problem:** curl returns 403 even with auth token

**Solution:**
```bash
# Refresh token
gcloud auth application-default login
export GCP_AUTH_TOKEN=$(gcloud auth print-identity-token)

# Verify IAM access
gcloud run services get-iam-policy role-directory-production
```

### Slow Response Times

**Problem:** Tests show response times >200ms

**Solution:**
```bash
# Check instance count
gcloud run services describe role-directory-production \
  --format="value(status.conditions)"

# Verify min 2 instances
gcloud run services describe role-directory-production \
  --format="value(spec.template.metadata.annotations['autoscaling.knative.dev/minScale'])"

# If min < 2, update:
gcloud run services update role-directory-production --min-instances=2
```

### High Cost

**Problem:** Production costs exceed $100/month

**Solution:**
```bash
# Check current instance usage in Cloud Console
# Consider reducing max instances if not needed:
gcloud run services update role-directory-production --max-instances=5

# Set up billing alerts in GCP Console
```

---

## References

- **Story File:** `docs/stories/1-8-cloud-run-service-setup-production.md`
- **Setup Guide:** `docs/guides/cloud-run-production-setup.md`
- **Setup Script:** `scripts/setup-cloud-run-production.sh`
- **Verification Tests:** `tests/e2e/cloud-run-production-verification.spec.ts`
- **Test Design:** `docs/stories/test-design-epic-1.md`

---

**Generated by:** Murat (Master Test Architect - TEA Agent)  
**Workflow:** `bmad/bmm/testarch/atdd`  
**Date:** 2025-11-06

---

<!-- Powered by BMAD-CORE™ -->

