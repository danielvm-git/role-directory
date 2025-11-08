# Test Design: Epic 1 - Foundation & Deployment Pipeline

**Date:** 2025-11-06  
**Author:** Murat (Master Test Architect)  
**Status:** Draft  
**Scope:** Full test design with risk assessment and priority classification

---

## Executive Summary

**Scope:** Comprehensive test design for Epic 1 (Foundation & Deployment Pipeline)

**Risk Summary:**

- Total risks identified: 14
- High-priority risks (≥6): 4
- Critical categories: OPS (deployment), SEC (secrets), TECH (build), PERF (cold starts)

**Coverage Summary:**

- P0 scenarios: 18 tests (36 hours)
- P1 scenarios: 24 tests (24 hours)
- P2/P3 scenarios: 16 tests (6 hours)
- **Total effort**: 66 hours (~8-9 days)

**Testing Strategy:** **Manual testing only** for Epic 1 per architecture decision. Automated test infrastructure will be added in Phase 2. This test design focuses on verification procedures, risk mitigation, and quality gates for infrastructure validation stories.

---

## Risk Assessment

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description                                                      | Probability | Impact | Score | Mitigation                                            | Owner | Timeline      |
| ------- | -------- | ---------------------------------------------------------------- | ----------- | ------ | ----- | ----------------------------------------------------- | ----- | ------------- |
| R-001   | OPS      | **CI/CD deployment fails silently** - Image deployed but broken | 2           | 3      | 6     | Health check in deployment workflow, fail on 500      | Dev   | Story 1.5-1.6 |
| R-002   | SEC      | **Secrets leaked in GitHub Actions logs** - Credentials exposed | 2           | 3      | 6     | Mask secrets, use GitHub Secrets, audit logs          | Dev   | Story 1.5     |
| R-003   | OPS      | **Rollback fails when needed** - Cannot revert bad deployment   | 2           | 3      | 6     | Test rollback procedure, document commands, verify    | Dev   | Story 1.11    |
| R-004   | PERF     | **Cold start >10s** - Poor UX, deployment validation timeouts   | 3           | 2      | 6     | Optimize Docker image size, Next.js standalone build  | Dev   | Story 1.2     |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description                                                      | Probability | Impact | Score | Mitigation                                     | Owner |
| ------- | -------- | ---------------------------------------------------------------- | ----------- | ------ | ----- | ---------------------------------------------- | ----- |
| R-005   | TECH     | **Docker build fails in CI** - Works locally but fails in CI    | 2           | 2      | 4     | Test Docker build in CI, cache dependencies    | Dev   |
| R-006   | OPS      | **Env var mismatch** - Different configs between environments   | 2           | 2      | 4     | Document env vars, validate with Zod (Epic 2) | Dev   |
| R-007   | TECH     | **Multi-stage build incorrect** - Large image or missing files  | 1           | 3      | 3     | Test local Docker run, verify image size       | Dev   |
| R-008   | OPS      | **GitHub Actions rate limits** - API limits hit during deploy   | 1           | 3      | 3     | Cache node_modules, optimize workflows         | Dev   |
| R-009   | DATA     | **Deployment overwrites prod by accident** - Wrong image tag    | 1           | 3      | 3     | Manual workflow with confirmation, audit trail | Dev   |
| R-010   | PERF     | **Build time >5min in CI** - Slow feedback loop                 | 2           | 2      | 4     | Cache dependencies, parallel jobs              | Dev   |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description                                   | Probability | Impact | Score | Action  |
| ------- | -------- | --------------------------------------------- | ----------- | ------ | ----- | ------- |
| R-011   | BUS      | **Landing page styling broken** - Minor UI    | 1           | 2      | 2     | Monitor |
| R-012   | TECH     | **ESLint rules too strict** - Blocks dev flow | 1           | 1      | 1     | Monitor |
| R-013   | OPS      | **GCP quota exceeded** - Free tier limits hit | 1           | 2      | 2     | Monitor |
| R-014   | TECH     | **TypeScript strict mode errors** - Types     | 1           | 1      | 1     | Monitor |

### Risk Category Legend

- **TECH**: Technical/Architecture (flaws, integration, scalability)
- **SEC**: Security (access controls, auth, data exposure)
- **PERF**: Performance (SLA violations, degradation, resource limits)
- **DATA**: Data Integrity (loss, corruption, inconsistency)
- **BUS**: Business Impact (UX harm, logic errors, revenue)
- **OPS**: Operations (deployment, config, monitoring)

---

## Test Coverage Plan

### P0 (Critical) - Must Verify Before Story Done

**Criteria**: Blocks deployment pipeline + High risk (≥6) + No workaround

| Requirement                          | Test Level | Risk Link | Verification Method                | Owner | Notes                         |
| ------------------------------------ | ---------- | --------- | ---------------------------------- | ----- | ----------------------------- |
| **Health check returns 200 OK**      | API        | R-001     | Manual API test (curl/Postman)     | Dev   | Story 1.6                     |
| **Health check in CI fails on 500**  | CI/CD      | R-001     | Test failed health check scenario  | Dev   | Story 1.5                     |
| **Docker build succeeds**            | Build      | R-005     | Run `docker build` locally         | Dev   | Story 1.2                     |
| **Docker image <500MB**              | Build      | R-004     | Check `docker images` size         | Dev   | Story 1.2                     |
| **Container runs locally on 8080**   | Runtime    | R-007     | Run `docker run -p 8080:8080`      | Dev   | Story 1.2                     |
| **CI lint passes**                   | CI/CD      | R-005     | Commit code, verify GitHub Actions | Dev   | Story 1.3                     |
| **CI type-check passes**             | CI/CD      | R-005     | Commit code, verify GitHub Actions | Dev   | Story 1.3                     |
| **CI build passes**                  | CI/CD      | R-005     | Verify `npm run build` in CI       | Dev   | Story 1.3                     |
| **Secrets NOT in logs**              | CI/CD      | R-002     | Inspect workflow logs for leaks    | Dev   | Story 1.5                     |
| **Dev deployment succeeds**          | Deployment | R-001     | Verify Cloud Run service running   | Dev   | Story 1.5                     |
| **Dev health check passes post-dep** | Deployment | R-001     | Verify `/api/health` 200 OK        | Dev   | Story 1.5                     |
| **Rollback tested in dev**           | Deployment | R-003     | Deploy v1, v2, rollback to v1      | Dev   | Story 1.11                    |
| **Rollback health check passes**     | Deployment | R-003     | Verify health after rollback       | Dev   | Story 1.11                    |
| **Staging promotion succeeds**       | Deployment | R-001     | Promote dev image to staging       | Dev   | Story 1.9                     |
| **Staging health check passes**      | Deployment | R-001     | Verify staging `/api/health`       | Dev   | Story 1.9                     |
| **Prod promotion succeeds**          | Deployment | R-001     | Promote staging image to prod      | Dev   | Story 1.10                    |
| **Prod health check passes**         | Deployment | R-001     | Verify production `/api/health`    | Dev   | Story 1.10                    |
| **Prod promotion requires approval** | CI/CD      | R-009     | Verify manual workflow trigger     | Dev   | Story 1.10 (safety gate)      |

**Total P0**: 18 tests, 36 hours (~2 hours each due to deployment verification complexity)

---

### P1 (High) - Should Verify Before Story Done

**Criteria**: Important validations + Medium risk (3-4) + Common scenarios

| Requirement                               | Test Level | Risk Link | Verification Method                     | Owner | Notes                         |
| ----------------------------------------- | ---------- | --------- | --------------------------------------- | ----- | ----------------------------- |
| **Next.js dev server runs**               | Runtime    | -         | Run `npm run dev`, check localhost:3000 | Dev   | Story 1.1                     |
| **ESLint config valid**                   | Config     | R-012     | Inspect `.eslintrc.json`                | Dev   | Story 1.1                     |
| **Prettier config valid**                 | Config     | -         | Inspect `.prettierrc`                   | Dev   | Story 1.1                     |
| **TypeScript strict mode enabled**        | Config     | R-014     | Inspect `tsconfig.json`                 | Dev   | Story 1.1                     |
| **Folder structure created**              | Project    | -         | Verify app/, lib/, types/, components/  | Dev   | Story 1.1                     |
| **.gitignore excludes secrets**           | Security   | R-002     | Verify .env files excluded              | Dev   | Story 1.1                     |
| **Dockerfile multi-stage**                | Build      | R-007     | Inspect Dockerfile stages               | Dev   | Story 1.2                     |
| **.dockerignore excludes unnecessary**    | Build      | R-004     | Verify node_modules, .git excluded      | Dev   | Story 1.2                     |
| **CI completes <5min**                    | CI/CD      | R-010     | Check GitHub Actions duration           | Dev   | Story 1.3                     |
| **CI fails on lint error**                | CI/CD      | R-005     | Introduce lint error, verify failure    | Dev   | Story 1.3                     |
| **CI fails on type error**                | CI/CD      | R-005     | Introduce type error, verify failure    | Dev   | Story 1.3                     |
| **Dev service scales to zero**            | Cloud Run  | -         | Wait 15min, verify no active instances  | Dev   | Story 1.4                     |
| **Dev env vars configured**               | Cloud Run  | R-006     | Check NODE_ENV=development              | Dev   | Story 1.4                     |
| **Staging env independent from dev**      | Cloud Run  | R-006     | Verify separate service, separate URL   | Dev   | Story 1.7                     |
| **Production env independent from stg**   | Cloud Run  | R-006     | Verify separate service, separate URL   | Dev   | Story 1.8                     |
| **Promotion uses same image (no rebuild)**| CI/CD      | R-001     | Verify image tag matches across envs    | Dev   | Story 1.9-1.10                |
| **Health check response time <100ms**     | API        | R-004     | Measure warm response time              | Dev   | Story 1.6                     |
| **Health check includes timestamp**       | API        | -         | Verify JSON response format             | Dev   | Story 1.6                     |
| **Rollback documented with examples**     | Docs       | R-003     | Review docs/ROLLBACK.md                 | Dev   | Story 1.11                    |
| **Rollback tested in each env**           | Deployment | R-003     | Test rollback in dev, stg (not prod)    | Dev   | Story 1.11 (prod verified later) |
| **GitHub Actions cache working**          | CI/CD      | R-010     | Verify "cache hit" in workflow logs     | Dev   | Story 1.3                     |
| **GCP authentication succeeds**           | CI/CD      | R-002     | Verify gcloud auth in workflow          | Dev   | Story 1.5                     |
| **Image pushed to registry**              | CI/CD      | R-001     | Verify GCR/Artifact Registry has image  | Dev   | Story 1.5                     |
| **Failed deploy doesn't break service**   | Deployment | R-001     | Test failed health check scenario       | Dev   | Story 1.5                     |

**Total P1**: 24 tests, 24 hours (~1 hour each)

---

### P2 (Medium) - Nice to Verify (Nightly/Weekly)

**Criteria**: Secondary validations + Low risk (1-2) + Edge cases

| Requirement                                 | Test Level | Risk Link | Verification Method                | Owner | Notes                       |
| ------------------------------------------- | ---------- | --------- | ---------------------------------- | ----- | --------------------------- |
| **Landing page styling correct**            | UI         | R-011     | Visual inspection of localhost:3000| Dev   | Story 1.1                   |
| **Hot module replacement works**            | Runtime    | -         | Edit code, verify instant refresh  | Dev   | Story 1.1                   |
| **Build artifacts optimized**               | Build      | R-004     | Check .next/standalone/ structure  | Dev   | Story 1.2                   |
| **Node 22.x in Docker**                     | Build      | -         | Inspect Dockerfile base image      | Dev   | Story 1.2                   |
| **Production server (not dev)**             | Build      | R-007     | Verify `CMD ["npm", "start"]`      | Dev   | Story 1.2                   |
| **CI workflow status badge**                | CI/CD      | -         | Verify badge in README             | Dev   | Story 1.3                   |
| **Cloud Run min instances = 0**             | Cloud Run  | -         | Verify service config              | Dev   | Story 1.4, 1.7, 1.8         |
| **Cloud Run max instances = 10**            | Cloud Run  | R-013     | Verify service config (cost limit) | Dev   | Story 1.4, 1.7, 1.8         |
| **CPU=1, Memory=512Mi configured**          | Cloud Run  | -         | Verify resource limits             | Dev   | Story 1.4, 1.7, 1.8         |
| **Public URL accessible**                   | Deployment | -         | Access Cloud Run URL in browser    | Dev   | Story 1.4, 1.7, 1.8         |
| **Deployment logs structured JSON**         | Deployment | -         | Check Cloud Run logs format        | Dev   | Story 1.5                   |
| **Health check cold start <10s**            | API        | R-004     | Measure cold start response time   | Dev   | Story 1.6                   |
| **Rollback via GCP Console documented**     | Docs       | R-003     | Verify UI instructions in docs     | Dev   | Story 1.11                  |
| **Database migration rollback placeholder** | Docs       | -         | Verify Epic 2 reference in docs    | Dev   | Story 1.11 (future)         |
| **README includes all URLs**                | Docs       | -         | Verify dev, stg, prod URLs listed  | Dev   | Story 1.4, 1.7, 1.8         |
| **GCP permissions documented**              | Docs       | -         | Verify setup guide                 | Dev   | Story 1.4                   |

**Total P2**: 16 tests, 6 hours (~0.5 hours each - simple checks)

---

### P3 (Low) - Test if Time Permits

**Criteria**: Nice-to-have + Exploratory + Optional validations

*No P3 tests defined for Epic 1.* Infrastructure validation focuses on P0/P1 critical path. P3 tests (advanced monitoring, custom domains, performance benchmarks) are deferred to future phases.

**Total P3**: 0 tests

---

## Execution Order

### Smoke Tests (<2 min)

**Purpose**: Fast feedback, catch build-breaking issues immediately

- [ ] `npm run dev` starts successfully (30s) - **Story 1.1**
- [ ] `npm run lint` passes (20s) - **Story 1.1**
- [ ] `npm run type-check` passes (30s) - **Story 1.1**
- [ ] Health check returns 200 OK (10s) - **Story 1.6**

**Total**: 4 scenarios, ~90s

---

### P0 Tests (Critical Path - ~36 hours)

**Purpose**: Validate deployment pipeline end-to-end

**Story 1.1 - Project Initialization** (2 hours):
- [ ] Next.js 15 with TypeScript installed
- [ ] ESLint and Prettier configured
- [ ] Basic folder structure created

**Story 1.2 - Docker Containerization** (4 hours):
- [ ] Docker build succeeds locally
- [ ] Image size <500MB
- [ ] Container runs on port 8080

**Story 1.3 - CI Pipeline** (6 hours):
- [ ] CI lint, type-check, build pass
- [ ] CI fails on errors (negative tests)

**Story 1.5 - Automated Deployment** (8 hours):
- [ ] Dev deployment succeeds
- [ ] Health check validates deployment
- [ ] Secrets not leaked in logs

**Story 1.6 - Health Check** (2 hours):
- [ ] Health endpoint returns 200 OK
- [ ] Response includes timestamp

**Story 1.9 - Staging Promotion** (6 hours):
- [ ] Promote dev image to staging
- [ ] Staging health check passes

**Story 1.10 - Production Promotion** (6 hours):
- [ ] Promote staging image to production
- [ ] Production health check passes
- [ ] Manual approval required

**Story 1.11 - Rollback** (4 hours):
- [ ] Rollback tested in dev
- [ ] Rollback health check passes

**Total**: 18 scenarios, ~38 hours (deployment verification is time-intensive)

---

### P1 Tests (Important Features - ~24 hours)

**Purpose**: Validate supporting infrastructure features

**Story-by-Story Verification** (24 tests across all 11 stories):
- Configuration validation (ESLint, Prettier, TypeScript, Docker)
- CI/CD performance (<5min builds)
- Environment isolation (dev, staging, production independent)
- Health check performance (<100ms warm, <10s cold)
- Documentation completeness

**Total**: 24 scenarios, ~24 hours

---

### P2 Tests (Nice-to-Have - ~6 hours)

**Purpose**: Secondary validations and documentation

**Story-by-Story Optional Checks** (16 tests):
- UI styling verification
- Resource limits verification
- Documentation review
- GCP service configuration audit

**Total**: 16 scenarios, ~6 hours

---

## Resource Estimates

### Test Development Effort

| Priority  | Count  | Hours/Test | Total Hours | Notes                                              |
| --------- | ------ | ---------- | ----------- | -------------------------------------------------- |
| P0        | 18     | 2.0        | 36          | Complex deployment verification, rollback testing  |
| P1        | 24     | 1.0        | 24          | Standard configuration and environment validation  |
| P2        | 16     | 0.5        | 8           | Simple checks, documentation review                |
| P3        | 0      | -          | 0           | No P3 tests for Epic 1                             |
| **Total** | **58** | **-**      | **68**      | **~8-9 days** (assuming 8-hour work days)          |

**Note:** Epic 1 uses **manual testing only** (no automated test development effort). Time estimates reflect verification and validation activities, not test automation development.

---

### Prerequisites

**Manual Testing Tools:**

- **Browser**: Chrome/Firefox for accessing Cloud Run URLs
- **API Client**: curl, Postman, or httpie for health check testing
- **Docker**: Docker Desktop or Docker CLI for local containerization testing
- **Git**: GitHub CLI or web UI for workflow triggering
- **GCP CLI**: `gcloud` CLI for Cloud Run management and rollback testing
- **Text Editor**: For inspecting config files (ESLint, Prettier, TypeScript, Docker)

**Environment:**

- GitHub account with Actions enabled (free tier sufficient)
- GCP account with free tier activated
- Cloud Run API enabled
- Container Registry or Artifact Registry enabled
- Secret Manager API enabled (for future Epic 2)
- Local development machine: Node.js 22.x, Docker 27.x

**Access Required:**

- GitHub repository write access (for committing test changes)
- GCP project owner or editor role
- GitHub Secrets write access (for GCP credentials)

---

## Quality Gate Criteria

### Pass/Fail Thresholds

- **P0 verification rate**: 100% (no exceptions - all must pass)
- **P1 verification rate**: ≥95% (1 waiver allowed with justification)
- **P2 verification rate**: ≥80% (informational, nice-to-have)
- **High-risk mitigations**: 100% complete (R-001 through R-004 must be addressed)

### Coverage Targets

- **Critical deployment path**: 100% verified (commit → CI → deploy → health check)
- **Security scenarios**: 100% verified (secrets not leaked, .gitignore correct)
- **Rollback scenarios**: 100% tested (at least once per environment type)
- **Environment isolation**: 100% verified (dev, staging, production independent)

### Non-Negotiable Requirements

- [ ] All P0 verification steps pass
- [ ] No high-risk (≥6) items unmitigated
- [ ] Security verification (R-002 - secrets) passes 100%
- [ ] Rollback tested and documented (R-003)
- [ ] Health check validates deployments (R-001)
- [ ] Docker image size <500MB or justified (R-004)

---

## Mitigation Plans

### R-001: CI/CD deployment fails silently (Score: 6)

**Mitigation Strategy:**
- Add health check endpoint in Story 1.6 returning 200 OK when healthy, 500 when broken
- Integrate health check into GitHub Actions deployment workflow (Story 1.5)
- Fail deployment if health check returns non-200 status
- Add retry logic (1 retry with 5s delay) for transient failures
- Post deployment status (success/failure) to workflow summary with service URL

**Owner:** Dev (danielvm)  
**Timeline:** Story 1.5-1.6 (before first deployment)  
**Status:** Planned  
**Verification:** 
- Deploy intentionally broken app (e.g., syntax error causing 500)
- Verify deployment workflow fails with clear error message
- Verify previous version still running (atomic deployment)

---

### R-002: Secrets leaked in GitHub Actions logs (Score: 6)

**Mitigation Strategy:**
- Store all secrets in GitHub Secrets (GCP_PROJECT_ID, GCP_SA_KEY)
- Use `${{ secrets.SECRET_NAME }}` syntax (automatically masked in logs)
- Never echo secrets to stdout in workflow steps
- Use `::add-mask::` for dynamically generated secrets
- Audit workflow logs before first deployment to staging
- Use Google Secret Manager for runtime secrets (not GitHub Secrets)

**Owner:** Dev (danielvm)  
**Timeline:** Story 1.5 (before first deployment workflow created)  
**Status:** Planned  
**Verification:**
- Inspect GitHub Actions logs for GCP_SA_KEY, DATABASE_URL, API keys
- Search logs for "BEGIN PRIVATE KEY" or credential patterns
- Confirm secrets show as `***` in logs
- Test with dummy secret, verify masking works

---

### R-003: Rollback fails when needed (Score: 6)

**Mitigation Strategy:**
- Document rollback commands in `docs/ROLLBACK.md` with examples
- Include gcloud CLI commands: `gcloud run revisions list`, `gcloud run services update-traffic`
- Include GCP Console UI instructions with screenshots
- Test rollback at least once in dev environment before epic complete
- Verify health check passes after rollback
- Include database migration rollback placeholder (Epic 2)

**Owner:** Dev (danielvm)  
**Timeline:** Story 1.11 (before epic complete)  
**Status:** Planned  
**Verification:**
- Deploy "v1" to dev, confirm working
- Deploy "v2" to dev, confirm working
- Rollback to "v1" using documented procedure
- Verify health check returns 200 OK
- Verify landing page displays correctly
- Time the rollback process (should be <2 minutes)

---

### R-004: Cold start >10s (Score: 6)

**Mitigation Strategy:**
- Optimize Docker image size: target <500MB (preferably <300MB)
- Use Next.js standalone output mode (smaller image, faster startup)
- Use multi-stage Docker build to exclude dev dependencies
- Minimize layers in Dockerfile
- Test cold start time: Stop all instances → Access URL → Measure response time
- Document actual cold start time in README (acceptable: <10s, ideal: <5s)

**Owner:** Dev (danielvm)  
**Timeline:** Story 1.2 (Dockerfile creation)  
**Status:** Planned  
**Verification:**
- Build Docker image, check size with `docker images`
- Stop all Cloud Run instances (wait 15min or force stop)
- Access Cloud Run URL, measure time to first response
- Target: <10s acceptable, <5s ideal
- Document actual cold start time in test results

---

## Assumptions and Dependencies

### Assumptions

1. **GCP Free Tier Sufficient**: Cloud Run free tier (2M requests/month) is sufficient for MVP validation traffic
2. **GitHub Actions Free Tier Sufficient**: 2,000 CI/CD minutes/month covers Epic 1 deployments (~10 min/deployment × ~20 deployments = 200 minutes)
3. **No Custom Domain Required**: Cloud Run default URLs (.run.app) are acceptable for infrastructure validation
4. **Manual Testing Acceptable**: Automated tests (Vitest, Playwright) deferred to Phase 2 per architecture decision
5. **Single Developer**: Epic 1 assumes solo developer (danielvm), no concurrent deployment conflicts
6. **No Production Traffic**: Production environment is for showcasing only, not serving real users

### Dependencies

1. **GCP Account Setup** - Required by Story 1.4 (Cloud Run service creation)
2. **GitHub Repository** - Required by Story 1.3 (GitHub Actions workflows)
3. **Docker Desktop** - Required by Story 1.2 (local Docker testing)
4. **gcloud CLI Installed** - Required by Story 1.4+ (Cloud Run deployment)
5. **GitHub Secrets Configured** - Required by Story 1.5 (GCP authentication in CI/CD)
6. **Node.js 22.x Installed** - Required by Story 1.1 (project initialization)

### Risks to Plan

- **Risk**: GCP free tier limits exceeded
  - **Impact**: Unexpected costs or service disruption
  - **Contingency**: Monitor GCP billing dashboard, set budget alerts, use Cloud Run instance limits (max=10)

- **Risk**: GitHub Actions rate limits or outages
  - **Impact**: Cannot deploy, CI/CD blocked
  - **Contingency**: Manual deployment via gcloud CLI, test locally with Docker

- **Risk**: Next.js 15 breaking changes
  - **Impact**: Build failures, deployment issues
  - **Contingency**: Pin Next.js version (15.0.3), test locally before CI/CD push

---

## Testing Strategy for Epic 1

### Manual Testing Rationale

Epic 1 uses **manual testing only** per architecture decision. Rationale:

1. **Infrastructure Setup**: Stories are one-time configuration tasks (project init, Docker setup, CI/CD config)
2. **Low Test ROI**: Automated tests for infrastructure setup have low return on investment
3. **Human Verification Required**: Visual inspection of configs (ESLint, Prettier, Docker) more efficient than automation
4. **Phase 2 Automation**: Automated test framework (Vitest, Playwright) will be added in Phase 2 for feature stories (Epic 2+)

### Phase 2 Automated Testing (Future)

When automated testing is introduced (Phase 2):

**Unit Tests (Vitest)**:
- Health check endpoint logic
- Configuration validation (Zod schemas)
- Error handling utilities

**API Tests (Supertest or Playwright API)**:
- Health check contract (200 OK, correct JSON structure)
- Health check performance (response time <100ms)
- Error scenarios (500 when broken)

**E2E Tests (Playwright)**:
- Deployment validation (access Cloud Run URL, verify landing page)
- Full deployment flow (commit → CI → deploy → verify)
- Rollback scenario (deploy v1, v2, rollback, verify v1)

**CI Integration Tests**:
- Lint, type-check, build pass in CI
- Failed tests block deployment
- Secrets not leaked in logs

---

## Verification Checklist

### Story 1.1 - Project Initialization

- [ ] Next.js 15.0.3 with TypeScript 5.6.3 installed
- [ ] ESLint configured (extends next/core-web-vitals, prettier)
- [ ] Prettier configured (semi, singleQuote, tabWidth, trailingComma, printWidth)
- [ ] Folder structure created (app/, lib/, types/, components/)
- [ ] .gitignore excludes .env, node_modules, .next
- [ ] package.json scripts: dev, build, start, lint, type-check
- [ ] `npm run dev` starts successfully
- [ ] `npm run lint` passes without errors
- [ ] `npm run type-check` passes without errors
- [ ] Landing page displays "Hello World"

---

### Story 1.2 - Docker Containerization

- [ ] Dockerfile uses multi-stage build (build + production stages)
- [ ] Base image is Node.js 22.x
- [ ] .dockerignore excludes node_modules, .git, .env
- [ ] Docker image builds successfully: `docker build -t role-directory:test .`
- [ ] Image size <500MB (or documented reason if larger)
- [ ] Container runs locally: `docker run -p 8080:8080 -e NODE_ENV=production role-directory:test`
- [ ] Application accessible at http://localhost:8080
- [ ] Production server (not dev server) is running
- [ ] Environment variables accepted at runtime (NODE_ENV, PORT, DATABASE_URL)

---

### Story 1.3 - GitHub Actions CI Pipeline

- [ ] Workflow file created: `.github/workflows/ci-cd-dev.yml`
- [ ] Workflow triggers on push to `main`
- [ ] Workflow stages: checkout, setup Node.js, install deps, lint, type-check, build
- [ ] Lint stage runs `npm run lint`
- [ ] Type-check stage runs `npm run type-check`
- [ ] Build stage runs `npm run build`
- [ ] Workflow fails if any stage fails
- [ ] Workflow completes in <5 minutes
- [ ] Workflow status visible in GitHub commits/PRs
- [ ] Node modules cached for faster builds
- [ ] Workflow does NOT deploy yet (deployment in Story 1.5)

---

### Story 1.4 - Cloud Run Service Setup (Dev)

- [ ] Dev service created: `role-directory-dev`
- [ ] Region selected (e.g., southamerica-east1)
- [ ] Service allows unauthenticated access (public URL)
- [ ] Environment variables configured: NODE_ENV=development, PORT=8080
- [ ] Min instances = 0 (scale to zero)
- [ ] Max instances = 10 (cost control)
- [ ] CPU = 1, Memory = 512Mi
- [ ] Public URL accessible: https://role-directory-dev-xxx.run.app
- [ ] Service documented in README with URL and setup instructions

---

### Story 1.5 - GitHub Actions Deployment to Dev

- [ ] Deployment stage added to `.github/workflows/ci-cd-dev.yml`
- [ ] GitHub Secrets configured: GCP_PROJECT_ID, GCP_SA_KEY
- [ ] Workflow authenticates with GCP
- [ ] Docker image built and tagged with commit SHA
- [ ] Image pushed to GCR/Artifact Registry
- [ ] Image deployed to `role-directory-dev` Cloud Run service
- [ ] Health check runs against deployed service
- [ ] Deployment fails if health check returns non-200
- [ ] Deployment completes in <10 minutes total (CI + deploy)
- [ ] Dev URL posted in workflow logs
- [ ] Secrets NOT visible in GitHub Actions logs
- [ ] Failed deployment does NOT affect running service (atomic deployment)

---

### Story 1.6 - Health Check Endpoint

- [ ] Health check endpoint created: `app/api/health/route.ts`
- [ ] Endpoint responds to GET requests
- [ ] Success response: 200 OK, `{ "status": "ok", "timestamp": "ISO 8601" }`
- [ ] Response time <100ms (warm)
- [ ] Response time <10s (cold start acceptable)
- [ ] Endpoint does NOT require authentication
- [ ] Endpoint tested locally: `curl http://localhost:3000/api/health`
- [ ] Endpoint tested in dev: `curl https://role-directory-dev-xxx.run.app/api/health`

---

### Story 1.7 - Cloud Run Service Setup (Staging)

- [ ] Staging service created: `role-directory-stg`
- [ ] Same config as dev (region, CPU, memory, instance limits)
- [ ] Environment variables: NODE_ENV=staging, PORT=8080
- [ ] Public URL accessible: https://role-directory-stg-xxx.run.app
- [ ] Service independent from dev (separate service, separate URL)
- [ ] Service URL documented in README

---

### Story 1.8 - Cloud Run Service Setup (Production)

- [ ] Production service created: `role-directory-prd`
- [ ] Same config as dev/staging
- [ ] Environment variables: NODE_ENV=production, PORT=8080
- [ ] Public URL accessible: https://role-directory-prd-xxx.run.app
- [ ] Service independent from dev/staging
- [ ] Service URL documented in README
- [ ] Additional safeguards documented (manual approval for promotions)

---

### Story 1.9 - Manual Promotion Workflow (Dev → Staging)

- [ ] Workflow file created: `.github/workflows/promote-to-staging.yml`
- [ ] Workflow uses `workflow_dispatch` trigger
- [ ] Workflow accepts `image_tag` input (commit SHA)
- [ ] Workflow deploys same image to staging (no rebuild)
- [ ] Workflow runs health check against staging
- [ ] Health check pass → promotion success
- [ ] Health check fail → promotion failure (previous version still running)
- [ ] Staging URL posted in workflow summary
- [ ] Promotion process documented in README

---

### Story 1.10 - Manual Promotion Workflow (Staging → Production)

- [ ] Workflow file created: `.github/workflows/promote-to-production.yml`
- [ ] Workflow uses `workflow_dispatch` trigger with manual approval
- [ ] Workflow accepts `image_tag` input (commit SHA)
- [ ] Workflow deploys same image to production (no rebuild)
- [ ] Workflow runs health check against production
- [ ] Health check pass → promotion success
- [ ] Health check fail → promotion failure (previous version still running)
- [ ] Production URL posted in workflow summary
- [ ] Additional confirmation step included (manual approval)
- [ ] Production promotion process documented in README

---

### Story 1.11 - Rollback Documentation and Testing

- [ ] Rollback documentation created: `docs/ROLLBACK.md` or section in README
- [ ] Document lists previous Cloud Run revisions: `gcloud run revisions list --service [service]`
- [ ] Document rollback command: `gcloud run services update-traffic [service] --to-revisions [revision]=100`
- [ ] Document GCP Console UI rollback instructions (with screenshots/examples)
- [ ] Document rollback verification: health check + manual testing
- [ ] Database migration rollback placeholder included (Epic 2 reference)
- [ ] Rollback tested in dev: deploy v1 → deploy v2 → rollback to v1
- [ ] Rollback health check passes after rollback
- [ ] Rollback time measured (<2 minutes acceptable)
- [ ] Troubleshooting section included (health checks, logs)

---

## Phase 2 Transition Plan

### Automated Testing Framework Setup

After Epic 1 completes, Phase 2 will introduce automated testing:

**Step 1: Run `*framework` workflow** (TEA Agent)
- Initialize Vitest for unit/component testing
- Initialize Playwright for E2E/API testing
- Configure test runners in package.json
- Add test scripts to CI/CD pipeline
- Set up test data factories and fixtures

**Step 2: Convert Manual Tests to Automated** (Stories 2.x+)
- Health check API tests (Vitest or Playwright API)
- Configuration validation tests (Vitest + Zod)
- Database connection tests (Vitest + @neondatabase/serverless)
- E2E deployment validation tests (Playwright)

**Step 3: Integrate into CI/CD** (Story 1.3 update)
- Add test stage to GitHub Actions workflows
- Run unit/API tests on every commit (fast feedback)
- Run E2E tests on deployment to dev (post-deploy validation)
- Fail deployment if tests fail
- Report test results in workflow summary

---

## Approval

**Test Design Approved By:**

- [ ] Product Manager: **\_\_\_\_\_\_\_\_\_\_** Date: **\_\_\_\_\_\_\_\_\_\_**
- [ ] Tech Lead: **\_\_\_\_\_\_\_\_\_\_** Date: **\_\_\_\_\_\_\_\_\_\_**
- [ ] QA Lead: **\_\_\_\_\_\_\_\_\_\_** Date: **\_\_\_\_\_\_\_\_\_\_**

**Comments:**

---

## Appendix

### Knowledge Base References

- `risk-governance.md` - Risk classification framework (6 categories, probability × impact scoring)
- `probability-impact.md` - Risk scoring methodology (1-3 scale, thresholds)
- `test-levels-framework.md` - Test level selection (E2E, API, Component, Unit decision matrix)
- `test-priorities-matrix.md` - P0-P3 prioritization criteria (automated calculation, risk mapping)

### Related Documents

- **PRD**: `docs/2-planning/PRD.md` - Product requirements and infrastructure validation goals
- **Epic**: `docs/2-planning/epics.md#Epic-1` - Epic 1 story breakdown and acceptance criteria
- **Architecture**: `docs/3-solutioning/architecture.md` - System architecture, technology stack, ADRs
- **Tech Spec**: `docs/tech-spec-epic-1.md` - Epic 1 technical specification, API contracts, deployment architecture

### Test Execution Tracking

| Story | P0 Tests | P1 Tests | P2 Tests | Status | Notes |
|-------|----------|----------|----------|--------|-------|
| 1.1   | 3        | 5        | 2        | ✅ Done | All verified 2025-11-06 |
| 1.2   | 3        | 4        | 3        | ✅ Done | All verified 2025-11-06 |
| 1.3   | 2        | 4        | 2        | ✅ Done | All verified 2025-11-06 |
| 1.4   | 0        | 2        | 4        | ⏳ Review | Cloud Run setup |
| 1.5   | 3        | 4        | 1        | ⏳ Review | Deployment automation |
| 1.6   | 2        | 2        | 1        | ⏳ Review | Health check endpoint |
| 1.7   | 0        | 1        | 4        | ⏳ Review | Staging service |
| 1.8   | 0        | 1        | 4        | 🔵 Ready | Production service |
| 1.9   | 2        | 2        | 0        | 🔵 Ready | Staging promotion |
| 1.10  | 2        | 2        | 0        | 🔵 Ready | Production promotion |
| 1.11  | 1        | 2        | 1        | 📝 Draft | Rollback testing |
| **Total** | **18** | **24** | **16** | **-** | **58 tests total** |

---

**Generated by**: Murat (Master Test Architect - TEA Agent)  
**Workflow**: `bmad/bmm/testarch/test-design`  
**Version**: 4.0 (BMad v6)  
**Date**: 2025-11-06

---

<!-- Powered by BMAD-CORE™ -->

