# Release and Deployment Guide

**Project:** role-directory  
**Last Updated:** 2025-11-08  
**Version:** 1.0

---

## Table of Contents

1. [Introduction](#introduction)
2. [Release Strategy](#release-strategy)
3. [Creating Releases](#creating-releases)
4. [Deployment Workflow](#deployment-workflow)
5. [Promotion Procedures](#promotion-procedures)
6. [Rollback Procedures](#rollback-procedures)
7. [Quick Reference](#quick-reference)

---

## Introduction

This guide consolidates all release, deployment, promotion, and rollback procedures for the role-directory application. It covers the complete lifecycle from creating a GitHub Release to deploying across environments (dev → staging → production) and rolling back if needed.

### Key Concepts

- **Release:** A tagged version of the codebase (e.g., v1.0.0) with release notes and artifacts
- **Image Tag:** Docker image identifier with timestamp (e.g., `dev-20251108-143022`)
- **Revision:** Immutable Cloud Run deployment snapshot
- **Promotion:** Moving a tested image from one environment to the next
- **Rollback:** Shifting traffic back to a previous revision

### Architecture Overview

```
GitHub Release (v1.0.0)
         ↓
    Git Tag (v1.0.0)
         ↓
    Push to main
         ↓
    CI/CD Build → Docker Image (dev-YYYYMMDD-HHMMSS)
         ↓
    Deploy to Dev
         ↓
    Manual Promotion → Staging (staging-YYYYMMDD-HHMMSS)
         ↓
    Manual Promotion → Production (production-YYYYMMDD-HHMMSS)
         ↓
    (Optional) Rollback to previous revision
```

---

## Release Strategy

### Semantic Versioning

We use [Semantic Versioning](https://semver.org/) for all releases:

```
MAJOR.MINOR.PATCH

Example: v1.2.3
  ↓    ↓   ↓
  1    2   3

MAJOR (v1.x.x): Breaking changes, new architecture
MINOR (v1.2.x): New features, backward compatible
PATCH (v1.2.3): Bug fixes, hotfixes
```

### Release Mapping

Releases are mapped to Epic completion:

| Release | Epic | Description | Status |
|---------|------|-------------|--------|
| **v1.0.0** | Epic 1 | Infrastructure & CI/CD Complete | ✅ Released |
| **v1.1.0** | Epic 2 | Database Integration | 🔄 In Progress |
| **v1.2.0** | Epic 3 | Authentication & Authorization | 📋 Planned |
| **v2.0.0** | Epic 4 | Full Product GA (Roles CRUD) | 📋 Planned |

### Image Tagging Strategy

Each environment uses timestamped tags:

| Environment | Tag Format | Example | Latest Tag |
|-------------|------------|---------|------------|
| **Dev** | `dev-YYYYMMDD-HHMMSS` | `dev-20251108-143022` | `dev-latest` |
| **Staging** | `staging-YYYYMMDD-HHMMSS` | `staging-20251108-150045` | `staging-latest` |
| **Production** | `production-YYYYMMDD-HHMMSS` | `production-20251108-160512` | `production-latest` |

---

## Creating Releases

### When to Create a Release

Create a release when:
- ✅ An Epic is complete and tested
- ✅ All stories in the Epic are done
- ✅ Production deployment is successful
- ✅ Major milestone achieved

**Don't create releases for:**
- ❌ Work in progress
- ❌ Incomplete features
- ❌ Failed deployments
- ❌ Minor bug fixes (use patch versions)

### Release Process

#### Step 1: Determine Version Number

**First Release (Epic 1 Complete):**
```
v1.0.0 - Infrastructure & CI/CD Complete
```

**Subsequent Releases:**
```
v1.1.0 - Next Epic complete (minor version bump)
v1.0.1 - Hotfix on v1.0.0 (patch version bump)
v2.0.0 - Breaking changes (major version bump)
```

#### Step 2: Create Git Tag

```bash
# Create annotated tag with detailed message
git tag -a v1.0.0 -m "Release v1.0.0 - Infrastructure & CI/CD Complete

Epic 1 Complete: DevOps & CI/CD Foundation

## Features
- ✅ Next.js 15 app with TypeScript
- ✅ Cloud Run deployment (dev, staging, production)
- ✅ GitHub Actions CI/CD pipeline
- ✅ Docker containerization with Artifact Registry
- ✅ Health check endpoint
- ✅ E2E tests with Playwright
- ✅ Regional optimization (southamerica-east1)
- ✅ Manual promotion workflows
- ✅ Rollback procedures

## Deployments
- Dev: https://role-directory-dev-q5xt7ys22a-rj.a.run.app
- Staging: https://role-directory-staging-q5xt7ys22a-rj.a.run.app  
- Production: https://role-directory-production-q5xt7ys22a-rj.a.run.app

## Stories Completed (11)
- Story 1.1: Project initialization
- Story 1.2: Landing page
- Story 1.3: GitHub Actions CI
- Story 1.4: Cloud Run dev setup
- Story 1.5: GitHub Actions deployment
- Story 1.6: Health check endpoint
- Story 1.7: Cloud Run staging setup
- Story 1.8: Cloud Run production setup
- Story 1.9: Promotion workflow (dev→staging)
- Story 1.10: Promotion workflow (staging→production)
- Story 1.11: Rollback documentation

## Technical Details
- Node.js: 22.x
- Next.js: 15.0
- Region: southamerica-east1 (São Paulo, Brazil)
- Registry: Artifact Registry
- Container Size: ~150-200MB (Alpine-based)"

# Push tag to GitHub
git push origin v1.0.0
```

#### Step 3: Create GitHub Release

**Option A: Via GitHub UI (Recommended)**

1. Go to your repository on GitHub
2. Click **Releases** → **Draft a new release**
3. **Choose a tag:** Select `v1.0.0` from dropdown
4. **Release title:** `v1.0.0 - Infrastructure & CI/CD Complete`
5. **Generate release notes:** Click button (GitHub auto-generates from commits)
6. **Edit release notes:** Enhance with sections from git tag message:
   ```markdown
   ## 🎉 Epic 1 Complete: Infrastructure & CI/CD Foundation
   
   First production release of role-directory! Full CI/CD pipeline with automated
   testing, multi-environment deployments, and rollback capabilities.
   
   ## ✨ Features
   
   - ✅ Next.js 15 application with TypeScript
   - ✅ Cloud Run deployment across 3 environments
   - ✅ GitHub Actions CI/CD pipeline
   - ✅ Docker containerization with Artifact Registry
   - ✅ Automated health checks and E2E tests
   - ✅ Regional optimization (São Paulo, Brazil)
   - ✅ Manual promotion workflows with approval gates
   - ✅ Comprehensive rollback procedures
   
   ## 🌍 Deployments
   
   - **Dev:** https://role-directory-dev-q5xt7ys22a-rj.a.run.app
   - **Staging:** https://role-directory-staging-q5xt7ys22a-rj.a.run.app
   - **Production:** https://role-directory-production-q5xt7ys22a-rj.a.run.app
   
   ## 📦 What's Changed
   
   ### Stories Completed (11)
   - Story 1.1: Project initialization and setup
   - Story 1.2: Landing page implementation
   - Story 1.3: GitHub Actions CI pipeline
   - Story 1.4: Cloud Run dev environment setup
   - Story 1.5: Automated deployment to dev
   - Story 1.6: Health check endpoint implementation
   - Story 1.7: Cloud Run staging environment setup
   - Story 1.8: Cloud Run production environment setup
   - Story 1.9: Manual promotion workflow (dev→staging)
   - Story 1.10: Manual promotion workflow (staging→production)
   - Story 1.11: Rollback documentation and testing
   
   ## 🔧 Technical Specifications
   
   - **Runtime:** Node.js 22.x
   - **Framework:** Next.js 15.0
   - **Region:** southamerica-east1 (São Paulo, Brazil)
   - **Registry:** Google Artifact Registry
   - **Container:** Alpine-based (~150-200MB)
   - **CI/CD:** GitHub Actions
   - **Testing:** Vitest (unit), Playwright (E2E)
   
   ## 📊 Performance
   
   - **Latency:** ~10-40ms (92% improvement after regional migration)
   - **Cold Start:** ~2-3s
   - **Build Time:** ~4 minutes (full CI/CD pipeline)
   
   ## 🚀 Next Steps
   
   Epic 2 is now in progress:
   - Database integration with Neon PostgreSQL
   - Environment-specific database configuration
   - Connection pooling and optimization
   
   ## 📖 Documentation
   
   - [Architecture](../3-solutioning/architecture.md)
   - [Release Guide](release-and-deployment-guide.md)
   - [Deployment Guide](how-to-promote-images.md)
   ```

7. **Attachments:** (Optional) Add any binary artifacts
8. **Pre-release:** Leave unchecked (this is a stable release)
9. **Set as latest release:** Check this box
10. **Create a discussion:** (Optional) Check if you want team discussion
11. Click **Publish release**

**Option B: Via GitHub CLI**

```bash
gh release create v1.0.0 \
  --title "v1.0.0 - Infrastructure & CI/CD Complete" \
  --notes-file RELEASE_NOTES.md
```

#### Step 4: Verify Release

1. **Check GitHub Releases page:**
   - Release appears with correct version
   - Tag is linked
   - Release notes are formatted correctly

2. **Verify tag exists:**
   ```bash
   git tag -l "v1.0.0"
   git show v1.0.0
   ```

3. **Check remote tag:**
   ```bash
   git ls-remote --tags origin | grep v1.0.0
   ```

---

## Deployment Workflow

### Automatic Dev Deployment

**Trigger:** Push to `main` branch

**Process:**
1. ✅ Checkout code
2. ✅ Run ESLint
3. ✅ Run TypeScript type check
4. ✅ Build Next.js application
5. ✅ Run unit tests
6. ✅ Run E2E tests
7. 🐳 Build Docker image
8. 🏷️ Tag as `dev-YYYYMMDD-HHMMSS` and `dev-latest`
9. 📤 Push to Artifact Registry
10. 🚀 Deploy to Cloud Run dev
11. 🏥 Run health checks
12. 📝 Post deployment summary

**Duration:** ~4 minutes

**Success Criteria:**
- All tests pass
- Docker build succeeds
- Health check returns 200 OK
- E2E tests pass against deployed service

### Finding Dev Image Tag

After successful dev deployment, find the image tag:

**Option 1: GitHub Actions Summary**
1. Go to **Actions** → **CI/CD - Build and Deploy to Dev**
2. Click latest successful run
3. Find **Image Tag** in deployment summary (e.g., `dev-20251108-143022`)

**Option 2: Command Line**
```bash
gcloud artifacts docker images list \
  southamerica-east1-docker.pkg.dev/role-directory/role-directory/app \
  --filter="tags:dev-*" \
  --sort-by="~update_time" \
  --limit=5
```

**Option 3: Cloud Run Console**
1. Go to Cloud Run → `role-directory-dev`
2. Click active revision
3. Copy image tag from container URL

---

## Promotion Procedures

### Dev → Staging Promotion

#### Step 1: Verify Dev is Stable

Before promoting to staging:
- ✅ Dev deployment successful
- ✅ All tests passing
- ✅ Manual testing in dev complete
- ✅ No known issues

#### Step 2: Trigger Promotion Workflow

1. Go to **GitHub** → **Actions** → **Promote Dev to Staging**
2. Click **"Run workflow"**
3. Fill in:
   - **Branch:** `main`
   - **Dev image tag:** `dev-20251108-143022` (from Step 1)
4. Click **"Run workflow"**

#### Step 3: Monitor Promotion

The workflow executes:

1. 📦 Pull dev image from Artifact Registry
2. 🏷️ Re-tag as `staging-YYYYMMDD-HHMMSS` and `staging-latest`
3. 📤 Push staging images
4. 🚀 Deploy to Cloud Run staging
5. ⏳ Wait 15 seconds for stabilization
6. 🏥 Health check with IAM authentication (12 retries)
7. ✅ Log promotion summary

**Duration:** ~4 minutes

#### Step 4: Verify Staging

**Check workflow summary:**
```
✅ Promotion successful

Dev Image:     dev-20251108-143022
Staging Image: staging-20251108-150045
Staging URL:   https://role-directory-staging-q5xt7ys22a-rj.a.run.app
```

**Manual health check:**
```bash
TOKEN=$(gcloud auth print-identity-token)

curl -H "Authorization: Bearer $TOKEN" \
  https://role-directory-staging-q5xt7ys22a-rj.a.run.app/api/health
```

**Expected response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2025-11-08T15:00:00.000Z"
}
```

---

### Staging → Production Promotion

#### ⚠️ Production Deployment Warnings

**CRITICAL CONSIDERATIONS:**
- ⚠️ Production serves real users - downtime affects customers
- ⚠️ Requires explicit approval from designated reviewers
- ⚠️ Requires confirmation string: `PROMOTE_TO_PRODUCTION`
- ⚠️ Only promote after thorough staging testing
- ⚠️ Never promote on Friday evenings or before holidays
- ⚠️ Have rollback plan ready
- ⚠️ Monitor production closely after promotion

#### Step 1: Configure GitHub Environment (First Time Only)

**Before first production promotion:**

1. Go to Repository → **Settings** → **Environments**
2. Click **"New environment"**
3. Name: `production`
4. Add **protection rules:**
   - **Required reviewers:** Add 1-6 team members
   - **Wait timer:** 0 minutes (or add delay)
   - **Deployment branches:** Limit to `main` only
5. **Save protection rules**

**Who can approve:**
- Only reviewers configured in `production` environment
- Any configured reviewer (not just triggerer)
- Triggerer CANNOT self-approve

#### Step 2: Verify Staging is Stable

**Pre-deployment checklist:**
- [ ] Staging deployment successful and healthy
- [ ] All tests passing in staging
- [ ] Staging stable for at least 2 hours
- [ ] No known issues in staging
- [ ] Team aware of production deployment
- [ ] Rollback plan ready
- [ ] Monitoring dashboard open
- [ ] Designated approver available

**Recommended timing:**
- ✅ Monday-Thursday during business hours
- ✅ When team available to monitor
- ❌ Friday evenings
- ❌ Before holidays
- ❌ During major events/launches

#### Step 3: Find Staging Image Tag

**Option 1: From promotion summary**
1. Go to **Actions** → **Promote Dev to Staging**
2. Find staging image tag (e.g., `staging-20251108-150045`)

**Option 2: Command line**
```bash
gcloud artifacts docker images list \
  southamerica-east1-docker.pkg.dev/role-directory/role-directory/app \
  --filter="tags:staging-*" \
  --sort-by="~update_time" \
  --limit=5
```

#### Step 4: Trigger Production Promotion

1. Go to **GitHub** → **Actions** → **Promote Staging to Production**
2. Click **"Run workflow"**
3. Fill in:
   - **Branch:** `main`
   - **Staging image tag:** `staging-20251108-150045`
   - **Confirmation:** `PROMOTE_TO_PRODUCTION` (exact, case-sensitive)
4. Click **"Run workflow"**

**Confirmation string must match exactly:**
- ✅ Correct: `PROMOTE_TO_PRODUCTION`
- ❌ Wrong: `promote_to_production`
- ❌ Wrong: `PROMOTE-TO-PRODUCTION`
- ❌ Wrong: `PROMOTE TO PRODUCTION`

#### Step 5: Approve Production Deployment

1. Workflow starts and validates confirmation
2. **Workflow pauses** at approval gate
3. Status: **"Waiting for approval"**
4. Reviewers receive email notification

**As a Reviewer:**
1. Go to **Actions** → Click paused workflow
2. Click **"Review deployments"** button
3. Review details:
   - Staging image being promoted
   - Who triggered
   - When triggered
4. Decision:
   - ✅ **"Approve and deploy"** → Promotion continues
   - ❌ **"Reject"** → Promotion cancelled

#### Step 6: Monitor Production Deployment

After approval:
1. Workflow resumes automatically
2. Staging image pulled and re-tagged
3. Production images pushed
4. Cloud Run production updated
5. Health check runs (should be <100ms)
6. Promotion summary logged

**Duration:** ~4 minutes after approval

#### Step 7: Verify Production

**Check workflow summary:**
```
✅ Promotion successful

Staging Image:    staging-20251108-150045
Production Image: production-20251108-160512
Production URL:   https://role-directory-production-q5xt7ys22a-rj.a.run.app
```

**Manual health check:**
```bash
TOKEN=$(gcloud auth print-identity-token)

curl -H "Authorization: Bearer $TOKEN" \
  https://role-directory-production-q5xt7ys22a-rj.a.run.app/api/health
```

**Response time:** Should be <100ms (production has min 2 instances, no cold start)

#### Step 8: Post-Deployment Monitoring

**Monitor for 15-30 minutes:**
- Watch Cloud Run metrics (requests, errors, latency)
- Check application logs for errors
- Verify key user flows working
- Be ready to rollback if issues detected

**Communication:**
- Announce in team channel after promotion
- Share production URL
- Report any issues immediately
- Document any unexpected behavior

---

## Rollback Procedures

### When to Rollback

**Rollback scenarios:**
- ✅ Application crashes or errors after deployment
- ✅ Performance degradation (high latency, timeouts)
- ✅ Feature bugs affecting users
- ✅ Health check failures
- ✅ Users reporting issues

**Don't rollback for:**
- ❌ Database issues (investigate separately)
- ❌ Upstream service failures
- ❌ Infrastructure issues (GCP outages)
- ❌ Minor cosmetic issues (deploy forward)

### Rollback Methods

**Method 1: Traffic Shift (Fastest - Recommended)**
- Shifts traffic to previous Cloud Run revision
- Duration: <1 minute
- Zero downtime
- Reversible

**Method 2: Re-promote Previous Image**
- Uses promotion workflow with older image tag
- Duration: ~4 minutes
- Requires approval for production
- Creates new revision

**Method 3: Manual Redeployment**
- Direct gcloud deployment
- Duration: ~2 minutes
- For emergencies only

### Rollback via Traffic Shift

#### Step 1: List Available Revisions

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

**Example output:**
```
REVISION                           ACTIVE  SERVICE              DEPLOYED_AT
role-directory-dev-00005-abc       yes     role-directory-dev   2025-11-08 15:30:00
role-directory-dev-00004-xyz               role-directory-dev   2025-11-08 14:00:00
role-directory-dev-00003-def               role-directory-dev   2025-11-08 12:00:00
```

**Identifying rollback target:**
- **Current:** Marked with `ACTIVE: yes`
- **Previous:** Most recent non-active (usually one line below)

#### Step 2: Execute Rollback

```bash
# Dev rollback
gcloud run services update-traffic role-directory-dev \
  --region=southamerica-east1 \
  --to-revisions=role-directory-dev-00004-xyz=100

# Staging rollback
gcloud run services update-traffic role-directory-staging \
  --region=southamerica-east1 \
  --to-revisions=role-directory-staging-00003-abc=100

# Production rollback (⚠️ CRITICAL)
gcloud run services update-traffic role-directory-production \
  --region=southamerica-east1 \
  --to-revisions=role-directory-production-00008-def=100
```

**Expected output:**
```
✓ Deploying... Done.
✓ Routing traffic... Done.
Service [role-directory-dev] revision [role-directory-dev-00004-xyz] has been deployed and is serving 100 percent of traffic.
```

**Duration:** ~30 seconds

#### Step 3: Verify Rollback

**Check traffic allocation:**
```bash
gcloud run services describe role-directory-dev \
  --region=southamerica-east1 \
  --format="value(status.traffic)"

# Expected: [{"revisionName":"role-directory-dev-00004-xyz","percent":100}]
```

**Health check (Dev - public):**
```bash
curl -f https://role-directory-dev-q5xt7ys22a-rj.a.run.app/api/health
```

**Health check (Staging/Production - IAM protected):**
```bash
TOKEN=$(gcloud auth print-identity-token)

curl -f -H "Authorization: Bearer $TOKEN" \
  https://role-directory-staging-q5xt7ys22a-rj.a.run.app/api/health
```

**Expected response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2025-11-08T16:00:00.000Z"
}
```

#### Step 4: Monitor After Rollback

**Monitor for 5-10 minutes:**
- Error rate (should be low/zero)
- Response times (should be normal)
- Request rate (traffic flowing)
- No crashes or restarts

**Check logs:**
```bash
gcloud run services logs read role-directory-dev \
  --region=southamerica-east1 \
  --limit=50
```

### Rollback Timeline

| Step | Duration | Notes |
|------|----------|-------|
| List revisions | 5 seconds | |
| Execute rollback | 25 seconds | Traffic shift |
| Health check | 10 seconds | |
| **Total** | **<1 minute** | Excluding monitoring |
| Monitoring | 5-10 minutes | Ensure stability |

### Production Rollback Best Practices

**Communication:**
1. Announce in team channel: "Rolling back production"
2. Specify reason and target revision
3. Update status when complete

**Documentation:**
1. Document why rollback was needed
2. Note what went wrong
3. Create incident report if critical
4. Update team on resolution

**Follow-up:**
1. Investigate root cause
2. Create bug fix or hotfix
3. Test thoroughly before redeploying
4. Consider additional safeguards

---

## Quick Reference

### Current Environment URLs

```bash
# Dev (public)
https://role-directory-dev-q5xt7ys22a-rj.a.run.app

# Staging (IAM-protected)
https://role-directory-staging-q5xt7ys22a-rj.a.run.app

# Production (IAM-protected)
https://role-directory-production-q5xt7ys22a-rj.a.run.app
```

### Common Commands

**List recent images:**
```bash
# Dev images
gcloud artifacts docker images list \
  southamerica-east1-docker.pkg.dev/role-directory/role-directory/app \
  --filter="tags:dev-*" --sort-by="~update_time" --limit=10

# Staging images
gcloud artifacts docker images list \
  southamerica-east1-docker.pkg.dev/role-directory/role-directory/app \
  --filter="tags:staging-*" --sort-by="~update_time" --limit=10

# Production images
gcloud artifacts docker images list \
  southamerica-east1-docker.pkg.dev/role-directory/role-directory/app \
  --filter="tags:production-*" --sort-by="~update_time" --limit=10
```

**Check service status:**
```bash
# All environments
gcloud run services list --region=southamerica-east1

# Specific service
gcloud run services describe role-directory-dev \
  --region=southamerica-east1 \
  --format="value(status.url,status.latestReadyRevisionName)"
```

**Health checks:**
```bash
# Get IAM token (for staging/production)
TOKEN=$(gcloud auth print-identity-token)

# Dev (public)
curl https://role-directory-dev-q5xt7ys22a-rj.a.run.app/api/health

# Staging (IAM-protected)
curl -H "Authorization: Bearer $TOKEN" \
  https://role-directory-staging-q5xt7ys22a-rj.a.run.app/api/health

# Production (IAM-protected)
curl -H "Authorization: Bearer $TOKEN" \
  https://role-directory-production-q5xt7ys22a-rj.a.run.app/api/health
```

### Deployment Timeline

| Action | Duration | Method |
|--------|----------|--------|
| **Dev Deployment** | ~4 min | Automatic on push |
| **Dev → Staging** | ~4 min | Manual promotion |
| **Staging → Production** | ~4 min + approval | Manual promotion + approval |
| **Rollback** | <1 min | Traffic shift |
| **Verification** | 2-5 min | Health checks + testing |

### Environment Comparison

| Aspect | Dev | Staging | Production |
|--------|-----|---------|------------|
| **Trigger** | Push to main | Manual promotion | Manual promotion + approval |
| **Authentication** | Public | IAM-protected | IAM-protected |
| **Min Instances** | 0 | 0 | 2 |
| **Max Instances** | 2 | 2 | 2 |
| **CPU** | 1 | 1 | 1 |
| **Memory** | 512 MB | 512 MB | 512 MB |
| **Cold Start** | Yes | Yes | No (min 2 instances) |
| **Approval** | No | No | Yes |
| **Confirmation** | No | No | Yes (`PROMOTE_TO_PRODUCTION`) |

### Troubleshooting

**Dev deployment failed:**
1. Check GitHub Actions logs
2. Look for failing test or linter error
3. Fix issue and push again

**Promotion failed:**
1. Check workflow logs for error message
2. Verify image tag exists
3. Check IAM permissions
4. Retry promotion with correct values

**Health check failed:**
1. Check Cloud Run logs
2. Verify service is running
3. Check database connection (if applicable)
4. Consider rollback if persistent

**Rollback failed:**
1. Check IAM permissions
2. Verify revision exists
3. Try older revision if needed
4. Use manual redeployment as last resort

---

## Related Documentation

- **Architecture:** `docs/3-solutioning/architecture.md`
- **PRD:** `docs/2-planning/PRD.md`
- **Tech Specs:** `docs/3-solutioning/tech-spec-epic-1.md`
- **GitHub Actions Setup:** `docs/guides/github-actions-setup-guide.md`
- **Docker Guide:** `docs/guides/docker-usage-guide.md`
- **Neon Setup:** `docs/guides/neon-infrastructure-setup-guide.md`

---

**Last Updated:** 2025-11-08  
**Version:** 1.0  
**Next Review:** After first production rollback or 3 months

---

**Document Owner:** DevOps Team  
**Questions?** Contact the team lead or file an issue in the repository.

