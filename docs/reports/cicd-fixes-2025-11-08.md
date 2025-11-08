# CI/CD Troubleshooting and Fixes Report

**Date:** 2025-11-08  
**Author:** danielvm (with Winston, Architect)  
**Status:** ✅ All Issues Resolved

---

## Executive Summary

This report documents four critical CI/CD issues discovered and resolved on 2025-11-08 after completing the regional migration to southamerica-east1. All issues have been fixed, and the deployment pipeline is now fully operational.

**Issues Resolved:**
1. ✅ Missing GitHub Secret (`GCP_PROJECT_ID`)
2. ✅ Docker Build Failure (`/app/public`: not found)
3. ✅ GCR Push Permission Denied
4. ✅ Inconsistent max-instances configuration

---

## Issue #1: Missing GitHub Secret (GCP_PROJECT_ID)

### **Symptom**

GitHub Actions workflow failed during Docker build with:
```
ERROR: failed to build: invalid tag "gcr.io//role-directory:dev-20251108-163515": 
invalid reference format
```

### **Root Cause**

The `GCP_PROJECT_ID` secret was not configured in GitHub repository secrets. The workflow used:
```yaml
IMAGE_NAME="gcr.io/${{ secrets.GCP_PROJECT_ID }}/role-directory"
```

When `secrets.GCP_PROJECT_ID` is undefined, it results in malformed tag: `gcr.io//role-directory` (note double slash).

### **Solution**

**1. Added GCP_PROJECT_ID to GitHub Secrets:**
- Name: `GCP_PROJECT_ID`
- Value: `role-directory`
- Location: Repository Settings → Secrets and variables → Actions

**2. Updated Workflow for Better Error Visibility:**

`.github/workflows/ci-cd.yml`:
```yaml
deploy-dev:
  env:
    GCP_PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
    GCP_REGION: southamerica-east1
    SERVICE_NAME: role-directory-dev
  
  steps:
    - name: Build and tag Docker image
      run: |
        IMAGE_NAME="gcr.io/${GCP_PROJECT_ID}/role-directory"  # Use env var
        docker build -t $DEV_IMAGE -t $DEV_LATEST .
```

**Benefits:**
- Clearer variable scope (job-level env)
- Earlier failure if secret is missing
- More consistent variable access pattern

### **Verification**

✅ Docker build now succeeds with correct tag: `gcr.io/role-directory/role-directory:dev-20251108-170800`

---

## Issue #2: Docker Build Failure (Missing Public Directory)

### **Symptom**

Docker build failed with:
```
ERROR: failed to calculate checksum of ref: "/app/public": not found
```

### **Root Cause**

Next.js 15 doesn't automatically create a `public` directory if there are no static assets. The Dockerfile attempted to copy this directory without ensuring it exists:

```dockerfile
COPY --from=builder /app/public ./public  # Fails if public doesn't exist
```

### **Solution**

**1. Updated Dockerfile:**

```dockerfile
# Stage 1: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN mkdir -p public  # ← NEW: Ensure public directory exists
RUN npm run build
```

**2. Created public/.gitkeep:**

```bash
mkdir -p public
echo "# Public Assets" > public/.gitkeep
git add public/.gitkeep
```

This ensures the directory is tracked in git even when empty.

### **Why This Happens**

Next.js 15 behavior:
- If `public/` exists in source: Next.js uses it
- If `public/` doesn't exist: Next.js doesn't create it
- Docker `COPY` fails if source doesn't exist

Our project had no static assets yet, so `public/` didn't exist.

### **Verification**

✅ Docker build completes successfully
✅ Multi-stage build copies `public` directory without errors
✅ Production image builds: ~150-200MB (Alpine-based)

---

## Issue #3: GCR Push Permission Denied

### **Symptom**

Docker push to Google Container Registry failed with:
```
denied: gcr.io repo does not exist. Creating on push requires the 
artifactregistry.repositories.createOnPush permission
```

### **Root Cause**

The `github-actions-deployer` service account lacked permissions to:
1. Push Docker images to GCR (requires `storage.admin`)
2. Create repositories automatically (requires `artifactregistry.writer`)

### **Solution**

**Granted Required IAM Roles:**

```bash
# Service account email
SERVICE_ACCOUNT="github-actions-deployer@role-directory.iam.gserviceaccount.com"

# Storage Admin (CRITICAL for GCR push)
gcloud projects add-iam-policy-binding role-directory \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/storage.admin"

# Artifact Registry Writer (create repos on push)
gcloud projects add-iam-policy-binding role-directory \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/artifactregistry.writer"

# Artifact Registry Admin (full access - recommended)
gcloud projects add-iam-policy-binding role-directory \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/artifactregistry.admin"
```

### **Complete IAM Role List**

Service account now has:

| Role | Purpose | Status |
|------|---------|--------|
| `roles/storage.admin` | Push Docker images to GCR | ✅ Added 2025-11-08 |
| `roles/artifactregistry.writer` | Create repositories | ✅ Added 2025-11-08 |
| `roles/artifactregistry.admin` | Full Artifact Registry access | ✅ Added 2025-11-08 |
| `roles/run.developer` | Deploy to Cloud Run | ✅ Existing |
| `roles/iam.serviceAccountUser` | Act as service account | ✅ Existing |
| `roles/cloudbuild.builds.editor` | Build management | ✅ Existing |
| `roles/serviceusage.serviceUsageConsumer` | Use GCP APIs | ✅ Existing |

### **Verification**

✅ Docker images push successfully to `gcr.io/role-directory/role-directory:dev-*`
✅ Repository created automatically on first push
✅ CI/CD workflow completes end-to-end

---

## Issue #4: Inconsistent max-instances Configuration

### **Symptom**

Discovered during workflow update that `.github/workflows/ci-cd.yml` had:
```yaml
--max-instances=3  # Inconsistent with architecture decision (should be 2)
```

### **Root Cause**

Initial workflow configuration predated the decision to standardize all environments with:
- Min instances: 0 (scale to zero)
- Max instances: 2 (sufficient for solo usage)

### **Solution**

**Updated `.github/workflows/ci-cd.yml`:**

```yaml
flags: |
  --allow-unauthenticated
  --set-env-vars=NODE_ENV=development
  --min-instances=0
  --max-instances=2  # ← Changed from 3 to 2
  --cpu=1
  --memory=512Mi
```

### **Verification**

✅ All three environments now have consistent configuration:
- Dev: min=0, max=2
- Staging: min=0, max=2
- Production: min=0, max=2

---

## Impact Analysis

### **Before Fixes**

❌ CI/CD pipeline completely broken
❌ Cannot build Docker images
❌ Cannot push to GCR
❌ Cannot deploy to Cloud Run
❌ Development workflow blocked

### **After Fixes**

✅ CI/CD pipeline fully operational
✅ Docker builds succeed (~150-200MB images)
✅ Images push to GCR successfully
✅ Deploys to Cloud Run (southamerica-east1)
✅ Health checks pass
✅ Development workflow unblocked

---

## Documentation Updates

All relevant documentation has been updated to reflect these fixes:

### **1. Architecture Document (v1.3)**

**File:** `docs/3-solutioning/architecture.md`

**Updates:**
- Added "Docker Configuration" section with full Dockerfile
- Added "IAM Configuration" section with required roles
- Added "GitHub Secrets Required" table
- Updated deployment flow to include Docker build steps
- Version: 1.2 → 1.3
- Last Updated: 2025-11-08

### **2. Docker Usage Guide**

**File:** `docs/guides/docker-usage-guide.md`

**Updates:**
- Documented `public` directory fix in "Dockerfile Structure"
- Added troubleshooting section: "Build Fails: /app/public not found"
- Explained Next.js 15 behavior
- Included fix commands

### **3. GitHub Actions Setup Guide**

**File:** `docs/guides/github-actions-setup-guide.md`

**Updates:**
- Updated IAM roles section (added 3 critical roles)
- Added explanations for Storage Admin and Artifact Registry roles
- Documented GCP_PROJECT_ID secret requirement (marked CRITICAL)
- Added error message examples
- Updated grant commands with all required roles

### **4. Tech Spec Epic 1**

**File:** `docs/tech-spec-epic-1.md`

**Updates:**
- Status: Draft → Complete
- Last Updated: 2025-11-08
- Updated NFR-2.2 with new IAM roles
- Updated AC-2 with public directory fix
- Documented Alpine image size (~150-200MB)

### **5. Regional Migration Report**

**File:** `docs/reports/regional-migration-2025-11-08.md`

**Already Included:**
- Comprehensive migration details
- Performance improvements
- All infrastructure changes

---

## Root Cause Analysis

### **Why These Issues Occurred**

1. **Missing GitHub Secret:**
   - Initial setup documentation didn't emphasize GCP_PROJECT_ID requirement
   - Workflow assumed secret was configured
   - No early validation in workflow

2. **Public Directory Issue:**
   - Next.js 15 behavior change (doesn't create empty directories)
   - Dockerfile copied directory without checking existence
   - New project had no static assets yet

3. **GCR Permissions:**
   - Initial IAM setup focused on Cloud Run deployment only
   - Didn't anticipate Docker image registry permissions
   - GCR/Artifact Registry permissions often overlooked in setup guides

4. **max-instances Inconsistency:**
   - Workflow created before architecture decision finalized
   - No validation against architecture document
   - Configuration drift between docs and code

### **Prevention Strategies**

✅ **Implemented:**
- Comprehensive documentation updates
- Clear troubleshooting sections with error messages
- Step-by-step setup guides with all requirements
- Architecture document includes IAM and Docker details

🔄 **Recommended (Future):**
- Create setup validation script
- Pre-flight checklist for deployments
- Automated IAM role verification
- GitHub Actions secret validation step

---

## Testing and Validation

### **Test 1: Docker Build**

```bash
# Local build test
docker build -t role-directory:test .

Result: ✅ Success
Image size: ~180MB
Build time: ~45 seconds
```

### **Test 2: GitHub Actions Workflow**

```
Trigger: Push to main
Steps:
  1. Lint ✅
  2. Type check ✅
  3. Build ✅
  4. Unit tests ✅
  5. E2E tests ✅
  6. Docker build ✅
  7. Push to GCR ✅
  8. Deploy to Cloud Run ✅
  9. Health check ✅

Total time: ~4 minutes
Result: ✅ Success
```

### **Test 3: Service Health**

```bash
curl https://role-directory-dev-q5xt7ys22a-rj.a.run.app/api/health

Response:
{
  "status": "ok",
  "timestamp": "2025-11-08T17:30:00.000Z"
}

Result: ✅ Success
```

---

## Lessons Learned

### **1. IAM Permissions Are Critical**

**Lesson:** Don't assume default permissions include registry access.

**Action:** Always grant Storage Admin for GCR operations explicitly.

### **2. Next.js Behavior Changes**

**Lesson:** Framework updates can introduce subtle breaking changes.

**Action:** Document framework-specific quirks (public directory handling).

### **3. GitHub Secrets Must Be Complete**

**Lesson:** Missing secrets cause cryptic errors in CI/CD.

**Action:** Document ALL required secrets upfront with examples.

### **4. Configuration Drift Prevention**

**Lesson:** Code and docs can drift apart during rapid iteration.

**Action:** Cross-reference architecture decisions in all related files.

---

## Timeline

| Time | Event |
|------|-------|
| 09:00 | Regional migration completed successfully |
| 16:30 | User pushed to main, CI/CD failed (Issue #1) |
| 16:35 | Identified missing GCP_PROJECT_ID secret |
| 16:40 | Added secret, re-ran workflow |
| 16:45 | Docker build failed (Issue #2: public directory) |
| 16:50 | Fixed Dockerfile, created public/.gitkeep |
| 16:55 | Re-ran workflow, Docker build succeeded |
| 17:00 | GCR push failed (Issue #3: permissions) |
| 17:05 | Granted Storage Admin and Artifact Registry roles |
| 17:10 | Re-ran workflow, full pipeline succeeded ✅ |
| 17:15 | Discovered max-instances=3 (Issue #4) |
| 17:20 | Fixed workflow configuration |
| 17:30 | Updated all documentation |
| 17:45 | Created this troubleshooting report |

**Total Resolution Time:** ~1 hour 15 minutes

---

## Recommendations

### **For Future Deployments**

1. **Setup Checklist:**
   - Create pre-deployment checklist
   - Verify all GitHub secrets before first deploy
   - Validate IAM roles match documentation

2. **Automated Validation:**
   - Add GitHub Actions job to validate secrets exist
   - Check IAM roles programmatically
   - Verify Dockerfile structure

3. **Documentation:**
   - Keep troubleshooting sections in all guides
   - Include error messages and solutions
   - Update docs immediately when issues are resolved

4. **Testing:**
   - Test full CI/CD pipeline in isolated environment
   - Validate IAM permissions before production use
   - Run Docker build locally before pushing

---

## Conclusion

All four CI/CD issues have been successfully resolved:

✅ **GitHub Secret:** GCP_PROJECT_ID configured
✅ **Docker Build:** Public directory handling fixed
✅ **GCR Permissions:** IAM roles granted
✅ **Configuration:** max-instances standardized

**Current Status:**
- CI/CD pipeline: ✅ Operational
- Docker builds: ✅ Working (~150-200MB)
- GCR push: ✅ Authorized
- Cloud Run deployments: ✅ Successful
- Documentation: ✅ Updated (5 files)

**Next Steps:**
1. Commit and push all documentation changes
2. Continue with Story 2.2 (Database Connection Configuration)
3. Monitor first few deployments for any edge cases

**Infrastructure is now production-ready! 🚀**

---

## References

- **Architecture Document:** `docs/3-solutioning/architecture.md` (v1.3)
- **Docker Guide:** `docs/guides/docker-usage-guide.md`
- **GitHub Actions Guide:** `docs/guides/github-actions-setup-guide.md`
- **Tech Spec:** `docs/tech-spec-epic-1.md`
- **Regional Migration Report:** `docs/reports/regional-migration-2025-11-08.md`

**Report Generated:** 2025-11-08  
**Status:** ✅ Complete

