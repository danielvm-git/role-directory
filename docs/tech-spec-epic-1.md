# Epic Technical Specification: Foundation & Deployment Pipeline

Date: 2025-11-06
Author: danielvm
Epic ID: 1
Status: Draft

---

## Overview

Epic 1 establishes the complete deployment infrastructure foundation for the role-directory project. This epic creates the CI/CD automation, containerization, and three-environment deployment workflow (dev → staging → production) that enables all subsequent development work. The primary goal is infrastructure validation: proving that code can flow reliably from commit to production with automated quality gates and manual promotion controls.

This epic transforms the initial Next.js project into a production-ready, deployed application with health monitoring, rollback capabilities, and a proven promotion workflow. Success means danielvm can commit code with confidence, knowing the deployment pipeline will automatically validate, build, and deploy changes to the development environment, with clear pathways to staging and production.

## Objectives and Scope

**In Scope:**
- Next.js 15 project initialization with TypeScript, ESLint, Prettier, and Tailwind CSS
- Docker multi-stage containerization optimized for Cloud Run (<500MB target)
- GitHub Actions CI/CD pipeline with lint, type check, and build stages
- Three Cloud Run services (dev, staging, production) with proper configuration
- Automated deployment to dev environment on every commit to `main`
- Manual promotion workflows for staging and production deployments
- Health check endpoint for deployment validation (`/api/health`)
- Rollback procedures documented and tested
- Environment-specific configuration with Google Secret Manager integration

**Out of Scope:**
- Database setup and migrations (Epic 2)
- Authentication and authorization (Epic 3)
- Dashboard features and UI components (Epic 4)
- Automated testing in CI/CD (Phase 2 - deferred from MVP)
- Infrastructure as Code (Terraform/Pulumi) - manual setup acceptable for MVP
- Custom domain configuration (optional, not required for infrastructure validation)
- Advanced monitoring and alerting (basic Cloud Run logging sufficient)

**Success Criteria:**
- ✅ Commit to `main` → Auto-deploys to dev within 10 minutes
- ✅ Dev deployment passes health check (200 OK response)
- ✅ Manual promotion to staging works with same Docker image
- ✅ Manual promotion to production works with additional safeguards
- ✅ Rollback procedure tested and documented
- ✅ Application accessible at all three environment URLs
- ✅ Container size <500MB (or documented reason if larger)
- ✅ Cold start performance <5 seconds (acceptable: <10s)

## System Architecture Alignment

**Architecture Components Used:**
- **Project Structure:** Next.js 15 App Router with standard folder organization (`/app`, `/lib`, `/types`, `/components`)
- **CI/CD Pattern:** GitHub Actions workflows with gcloud CLI deployment (ADR-004)
- **Containerization:** Docker multi-stage build (build stage + production stage)
- **Deployment:** Cloud Run "deploy from source" with Cloud Build handling Docker builds
- **Secrets Management:** Google Secret Manager for runtime secrets + GitHub Secrets for CI/CD credentials (ADR-007)
- **Logging:** Structured JSON logs to stdout, captured by Cloud Run
- **Health Checks:** Standard `/api/health` endpoint with database connectivity check (when available)

**Architectural Constraints:**
- **Serverless-First:** Cloud Run services configured to scale to zero (cost optimization)
- **Stateless Containers:** No in-memory state, all persistent data in external services
- **Environment Parity:** Same Docker image deployed across all environments, only env vars differ
- **Cost Target:** ~$0-3/month total infrastructure cost (Cloud Run + Neon free tiers)

**Technology Stack Validation:**
- Node.js 22.11.0 LTS
- Next.js 15.0.3 with App Router
- TypeScript 5.6.3 (strict mode)
- React 18.3.1
- Tailwind CSS 3.4.14
- Docker 27.3.1
- Google Cloud Run (serverless container platform)
- GitHub Actions (CI/CD automation)

## Detailed Design

### Services and Modules

| Service/Module | Responsibility | Inputs | Outputs | Owner/Epic |
|----------------|----------------|--------|---------|------------|
| **Next.js Application** | Web application runtime, handles HTTP requests, serves pages and API routes | HTTP requests, environment variables | HTTP responses, logs | Epic 1 (foundation), Epic 3-4 (features) |
| **Health Check API** | Validates application and database health for deployment monitoring | HTTP GET requests to `/api/health` | JSON: `{ status, timestamp, database? }` | Epic 1 (Story 1.6) |
| **GitHub Actions CI/CD** | Automated build, test, and deployment pipeline | Git push to `main`, manual workflow triggers | Deployed Cloud Run services, build artifacts | Epic 1 (Stories 1.3, 1.5, 1.9, 1.10) |
| **Cloud Build** | Containerization service, builds Docker images from source | Source code, Dockerfile | Docker images in Artifact Registry | Epic 1 (automated by Cloud Run) |
| **Cloud Run Services** | Serverless container hosting (3 services: dev, stg, prd) | Docker images, environment variables, secrets | Running HTTP services with auto-scaling | Epic 1 (Stories 1.4, 1.7, 1.8) |
| **Google Secret Manager** | Secure secrets storage and injection | Secret values (DATABASE_URL, API keys) | Environment variables injected at runtime | Epic 1 (Story 1.4+), Epic 2-3 (configuration) |
| **Artifact Registry** | Docker image storage and versioning | Docker images from Cloud Build | Versioned images accessible to Cloud Run | Epic 1 (automated) |

### Data Models and Contracts

**Environment Configuration Model:**
```typescript
// lib/config.ts
interface Config {
  // Environment
  nodeEnv: 'development' | 'staging' | 'production';
  port: number;
  
  // Database (Epic 2)
  databaseUrl: string; // postgresql://...
  
  // Authentication (Epic 3)
  neonAuthProjectId: string;
  neonAuthSecretKey: string;
  allowedEmails: string[]; // Parsed from comma-separated string
}
```

**Health Check Response:**
```typescript
// app/api/health/route.ts
interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string; // ISO 8601
  database?: 'connected' | 'disconnected'; // Optional, added in Epic 2
}

// Example:
{
  "status": "ok",
  "timestamp": "2024-11-06T15:30:00.000Z",
  "database": "connected"
}
```

**GitHub Actions Workflow Inputs:**
```yaml
# promote-to-staging.yml
inputs:
  image_tag:
    description: 'Docker image tag (commit SHA) to promote'
    required: true
    type: string

# promote-to-production.yml  
inputs:
  image_tag:
    description: 'Docker image tag (commit SHA) to promote'
    required: true
    type: string
```

**Cloud Run Service Configuration:**
```yaml
Service Name: role-directory-{env}  # dev, stg, prd
Region: us-central1
Container Port: 8080
CPU: 1             # Minimal for solo usage
Memory: 512Mi      # Minimal for solo usage
Min Instances: 0   # Scale to zero for cost optimization (all environments)
Max Instances: 3   # Minimal for hello world + testing (all environments)
Concurrency: 80    # Requests per container
Timeout: 300s      # 5 minutes

Note: All environments (dev/staging/production) use IDENTICAL configuration 
for solo usage. This minimizes costs (~$0-2/month total) while maintaining 
complete deployment pipeline validation.
```

### APIs and Interfaces

#### API Endpoint: Health Check

**Route:** `GET /api/health`

**Purpose:** Validate application health for deployment automation and monitoring

**Authentication:** None (public endpoint for health checks)

**Request:**
```http
GET /api/health HTTP/1.1
Host: role-directory-dev-xxx.run.app
```

**Success Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-11-06T15:30:00.000Z"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "status": "error",
  "timestamp": "2024-11-06T15:30:00.000Z",
  "database": "disconnected"
}
```

**Implementation Notes:**
- Response time: <100ms (warm), <3s (cold start)
- Epic 1: Returns basic status (no database check yet)
- Epic 2: Adds database connectivity check (Story 2.5)
- Used by CI/CD pipeline to verify successful deployment
- Used by Cloud Run for container health monitoring

#### GitHub Actions Workflows

**Workflow 1: CI/CD - Deploy to Dev**
- **Trigger:** Push to `main` branch
- **File:** `.github/workflows/ci-cd-dev.yml`
- **Stages:**
  1. Checkout code
  2. Setup Node.js 22.x
  3. Install dependencies (`npm ci`)
  4. Run ESLint (`npm run lint`)
  5. Run TypeScript type check (`npm run type-check`)
  6. Build Next.js (`npm run build`)
  7. Authenticate with GCP
  8. Deploy to Cloud Run dev service
  9. Run health check (`GET /api/health`)
  10. Report deployment status

**Workflow 2: Promote to Staging**
- **Trigger:** Manual (`workflow_dispatch`)
- **File:** `.github/workflows/promote-to-staging.yml`
- **Input:** `image_tag` (commit SHA)
- **Stages:**
  1. Authenticate with GCP
  2. Deploy existing image to staging service
  3. Update staging environment variables
  4. Run health check
  5. Report promotion status

**Workflow 3: Promote to Production**
- **Trigger:** Manual (`workflow_dispatch`)
- **File:** `.github/workflows/promote-to-production.yml`
- **Input:** `image_tag` (commit SHA)
- **Optional:** GitHub environment protection (require approval)
- **Stages:**
  1. Authenticate with GCP
  2. Deploy existing image to production service
  3. Update production environment variables
  4. Run health check
  5. Report promotion status

#### Cloud Run Service Interface

**Service Deployment Command:**
```bash
gcloud run deploy role-directory-dev \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars=NODE_ENV=development,PORT=8080 \
  --set-secrets=DATABASE_URL=role-directory-dev-db-url:latest \
  --min-instances=0 \
  --max-instances=3 \
  --cpu=1 \
  --memory=512Mi \
  --timeout=300
```

**Service Revision Rollback:**
```bash
# List available revisions
gcloud run revisions list \
  --service=role-directory-dev \
  --region=us-central1

# Rollback to specific revision
gcloud run services update-traffic role-directory-dev \
  --to-revisions=role-directory-dev-00042-xyz=100 \
  --region=us-central1
```

### Workflows and Sequencing

#### Workflow 1: Automated Dev Deployment

```
Developer commits code to main branch
  ↓
GitHub webhook triggers CI/CD workflow
  ↓
[Stage 1] Checkout code (actions/checkout@v4)
  ↓
[Stage 2] Setup Node.js 22.x (actions/setup-node@v4)
  ↓
[Stage 3] Install dependencies (npm ci)
  ↓
[Stage 4] Run ESLint (npm run lint)
  → FAIL: Stop pipeline, report error
  → PASS: Continue
  ↓
[Stage 5] Run TypeScript type check (npm run type-check)
  → FAIL: Stop pipeline, report error
  → PASS: Continue
  ↓
[Stage 6] Build Next.js (npm run build)
  → FAIL: Stop pipeline, report error
  → PASS: Continue
  ↓
[Stage 7] Authenticate with GCP (google-github-actions/auth@v2)
  ↓
[Stage 8] Deploy to Cloud Run dev service
  - Cloud Build creates Docker image
  - Image tagged with commit SHA
  - Deployed to role-directory-dev
  - Environment variables injected
  - Secrets mounted from Secret Manager
  ↓
[Stage 9] Wait for deployment ready (30s timeout)
  ↓
[Stage 10] Run health check (GET /api/health)
  → FAIL: Mark deployment failed, previous version still running
  → PASS: Deployment successful
  ↓
[Stage 11] Report deployment status
  - Comment on commit with deployment URL
  - Update GitHub deployment status
  ↓
✅ Dev deployment complete
```

**Timing:** <10 minutes total (target: 5-7 minutes)

**Failure Handling:**
- Failed lint/type/build: No deployment, clear error message in GitHub Actions logs
- Failed deployment: Previous Cloud Run revision continues running
- Failed health check: Deployment marked as failed, investigate and fix

#### Workflow 2: Manual Staging Promotion

```
Developer validates feature in dev environment
  ↓
Developer triggers "Promote to Staging" workflow in GitHub Actions
  ↓
[Input] Enter commit SHA (image tag) to promote
  ↓
Workflow authenticates with GCP
  ↓
Workflow deploys SAME Docker image to staging
  - No rebuild
  - Same image tag from dev deployment
  - Different environment variables (NODE_ENV=staging)
  - Different secrets (staging database URL)
  ↓
Wait for deployment ready (30s timeout)
  ↓
Run health check against staging URL
  → FAIL: Promotion failed, previous staging version still running
  → PASS: Promotion successful
  ↓
Report promotion status
  - Post staging URL to workflow summary
  - Notify in Slack/email (optional, Phase 5)
  ↓
✅ Staging promotion complete
```

**Timing:** <3 minutes (faster than dev because no rebuild)

#### Workflow 3: Manual Production Promotion

```
Developer validates feature in staging environment
  ↓
Developer triggers "Promote to Production" workflow in GitHub Actions
  ↓
[Optional] GitHub environment protection requires manual approval
  ↓
Approver reviews deployment plan and approves
  ↓
[Input] Enter commit SHA (image tag) to promote
  ↓
Workflow authenticates with GCP
  ↓
Workflow deploys SAME Docker image to production
  - No rebuild
  - Same image tag from staging deployment
  - Different environment variables (NODE_ENV=production)
  - Different secrets (production database URL)
  ↓
Wait for deployment ready (30s timeout)
  ↓
Run health check against production URL
  → FAIL: Promotion failed, previous production version still running
  → PASS: Promotion successful
  ↓
Report promotion status
  - Post production URL to workflow summary
  - Notify in Slack/email (optional, Phase 5)
  ↓
✅ Production promotion complete
```

**Timing:** <3 minutes (plus approval time if environment protection enabled)

**Safety Gates:**
- Manual trigger only (no automatic production deployments)
- Optional approval requirement (GitHub environment protection)
- Health check validation before marking successful
- Zero-downtime deployment (Cloud Run handles traffic switching)
- Instant rollback capability if issues detected

#### Workflow 4: Rollback Procedure

```
Issue detected in deployed environment (dev, staging, or production)
  ↓
[Option 1] Rollback via GitHub Actions workflow (future)
[Option 2] Rollback via gcloud CLI (MVP approach)
  ↓
List available Cloud Run revisions:
  $ gcloud run revisions list --service=role-directory-prd --region=us-central1
  ↓
Identify previous stable revision (previous commit SHA)
  ↓
Update traffic routing to previous revision:
  $ gcloud run services update-traffic role-directory-prd \
      --to-revisions=role-directory-prd-00042-xyz=100 \
      --region=us-central1
  ↓
Verify rollback successful:
  $ curl https://role-directory-prd-xxx.run.app/api/health
  ↓
✅ Rollback complete
```

**Rollback Time:** <1 minute (instant traffic switch to previous revision)

**Database Rollback (Epic 2):**
- If database migrations were applied, may need to rollback migrations
- Run down migration before code rollback
- Document rollback procedures in `docs/ROLLBACK.md` (Story 1.11)

## Non-Functional Requirements

### Performance

**NFR-1.1: Cold Start Performance**
- **Target:** <5 seconds for application cold start (first request after idle)
- **Acceptable:** <10 seconds (serverless constraint understood)
- **Measurement:** Time from Cloud Run container start to first HTTP 200 response
- **Optimization Strategies:**
  - Multi-stage Docker build to minimize production image size
  - Minimal dependencies in production bundle
  - No heavy initialization logic (database connection pooling lazy-loaded)
  - Cloud Run allocated CPU: 1 vCPU, Memory: 512Mi

**NFR-1.2: CI/CD Pipeline Performance**
- **Target:** <10 minutes total pipeline time (lint → build → deploy → health check)
- **Expected Breakdown:**
  - Lint + Type Check: ~1 minute
  - Build: ~2-3 minutes
  - Deploy (Cloud Build): ~4-5 minutes
  - Health Check: ~30 seconds
- **Optimization:** Cache `node_modules` in GitHub Actions using `actions/cache`

**NFR-1.3: Health Check Response Time**
- **Target:** <100ms (warm container)
- **Acceptable:** <3 seconds (cold start)
- **Measurement:** HTTP response time from `GET /api/health`
- **Implementation:** Simple endpoint with minimal logic, optional database check (Epic 2)

### Security

**NFR-2.1: Secrets Management**
- **Requirement:** No secrets stored in code, Docker images, or git repository
- **Implementation:**
  - Runtime secrets: Google Secret Manager (DATABASE_URL, NEON_AUTH_SECRET_KEY)
  - CI/CD secrets: GitHub Secrets (GCP_SERVICE_ACCOUNT_KEY, NEON_AUTH_PROJECT_ID)
  - `.gitignore` excludes `.env`, `.env.local`, `.env.*.local`
  - `.env.example` provides template with placeholder values only
- **Validation:** Audit git history to ensure no secrets committed

**NFR-2.2: Service Account Permissions**
- **Requirement:** Least-privilege IAM roles for CI/CD service account
- **Permissions Required:**
  - `roles/run.developer` - Deploy to Cloud Run
  - `roles/secretmanager.secretAccessor` - Read secrets from Secret Manager
  - `roles/artifactregistry.writer` - Push Docker images to Artifact Registry
- **Validation:** Service account cannot access unrelated GCP resources

**NFR-2.3: Container Security**
- **Requirement:** Production Docker image does not expose sensitive data
- **Implementation:**
  - Multi-stage build: build stage artifacts not included in final image
  - `.dockerignore` excludes `.env`, `.git`, `node_modules`, `docs`
  - No hardcoded credentials or API keys
  - Base image: Official Node.js 22 image (security updates from Docker Hub)
- **Validation:** Inspect final Docker image for sensitive files

**NFR-2.4: HTTPS and Transport Security**
- **Requirement:** All HTTP traffic encrypted with TLS/SSL
- **Implementation:**
  - Cloud Run provides automatic HTTPS with managed certificates
  - HTTP requests automatically redirected to HTTPS
  - Custom domain support (optional, not required for MVP)
- **Validation:** Test HTTP URL redirects to HTTPS

### Reliability

**NFR-3.1: Deployment Error Handling**
- **Requirement:** Failed deployments do not affect running service
- **Implementation:**
  - Cloud Run atomic deployments: new revision only receives traffic after passing health check
  - Previous revision continues serving traffic until new revision healthy
  - CI/CD pipeline fails fast: lint/type/build errors stop deployment before Cloud Run
- **Validation:** Simulate failed deployment (syntax error), verify previous version still running

**NFR-3.2: Zero-Downtime Deployments**
- **Requirement:** No service interruption during deployments
- **Implementation:**
  - Cloud Run gradual traffic migration: new revision receives traffic incrementally
  - HTTP connections gracefully drained from old revision
  - Cold start handled by Cloud Run: new containers pre-warmed before receiving traffic
- **Validation:** Monitor response times during deployment, verify no 502/503 errors

**NFR-3.3: Rollback Capability**
- **Requirement:** Ability to rollback to previous working version within 5 minutes
- **Implementation:**
  - Cloud Run maintains revision history (last 10 revisions)
  - Instant traffic switch to previous revision via `gcloud` command
  - Documented rollback procedure (Story 1.11)
  - Tested rollback at least once in dev environment
- **Validation:** Perform test rollback in dev: deploy v1, deploy v2, rollback to v1

**NFR-3.4: Logging and Observability**
- **Requirement:** All deployment events and application errors logged
- **Implementation:**
  - Structured JSON logs to stdout (Cloud Run captures automatically)
  - GitHub Actions logs viewable in Actions tab
  - Cloud Run logs viewable in GCP Console (Logs Explorer)
  - Log levels: INFO (normal operations), WARN (potential issues), ERROR (failures)
- **Validation:** Verify logs accessible after deployment, search for specific events

### Observability

**NFR-4.1: Deployment Status Visibility**
- **Requirement:** Clear deployment status in GitHub Actions UI
- **Implementation:**
  - GitHub Actions workflow status: success (green), failure (red), in-progress (yellow)
  - Deployment URL posted to workflow summary
  - Failed stages highlighted with error messages
  - Deployment history visible in Cloud Run console (revisions tab)
- **Validation:** Trigger deployment, verify status updates in real-time

**NFR-4.2: Health Check Monitoring**
- **Requirement:** Deployment health verified automatically
- **Implementation:**
  - CI/CD pipeline runs `GET /api/health` after deployment
  - Expected response: `{ "status": "ok", "timestamp": "..." }`
  - Timeout: 30 seconds (allows for cold start)
  - Failure marks deployment as unsuccessful
- **Validation:** Deploy broken health check, verify pipeline fails

**NFR-4.3: Log Accessibility**
- **Requirement:** Logs easily accessible for debugging
- **Implementation:**
  - Cloud Run logs: GCP Console → Cloud Run → Select Service → Logs tab
  - GitHub Actions logs: GitHub → Actions → Select Workflow Run
  - CLI access: `gcloud run services logs read role-directory-dev --region=us-central1`
- **Validation:** Access logs via console and CLI, verify structured JSON format

## Dependencies and Integrations

**External Services:**
- **Google Cloud Run** - Serverless container hosting platform
- **Google Cloud Build** - Container build automation (triggered by Cloud Run)
- **Google Artifact Registry** - Docker image storage and versioning
- **Google Secret Manager** - Secrets storage and runtime injection
- **GitHub Actions** - CI/CD automation and workflow orchestration
- **GitHub** - Source code repository and version control

**Development Dependencies (package.json):**
```json
{
  "dependencies": {
    "next": "15.0.3",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "typescript": "5.6.3",
    "@neondatabase/serverless": "0.10.1",
    "zod": "3.23.8"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "9.13.0",
    "eslint-config-next": "15.0.3",
    "eslint-config-prettier": "^9.1.0",
    "prettier": "3.3.3",
    "tailwindcss": "3.4.14",
    "postcss": "^8",
    "autoprefixer": "^10"
  }
}
```

**GitHub Actions Dependencies:**
- `actions/checkout@v4` - Checkout source code
- `actions/setup-node@v4` - Setup Node.js environment
- `actions/cache@v4` - Cache node_modules for faster builds
- `google-github-actions/auth@v2` - Authenticate with GCP
- `google-github-actions/setup-gcloud@v2` - Setup gcloud CLI

**Google Cloud CLI:**
- `gcloud` (version 450.0.0+) - Cloud SDK for deployments
- Service account key stored in GitHub Secrets

**Docker:**
- Docker 27.3.1+ - Container runtime (for local testing)
- Node.js 22 base image: `node:22-alpine` (official Docker Hub image)

## Acceptance Criteria (Authoritative)

These acceptance criteria are derived from the PRD and Epic 1 stories. All criteria must be met for Epic 1 to be considered complete.

**AC-1: Project Initialization (Story 1.1)**
- ✅ Next.js 15.0.3 project initialized with TypeScript, Tailwind CSS, and App Router
- ✅ ESLint and Prettier configured with recommended rules
- ✅ Basic folder structure created: `app/`, `lib/`, `types/`, `components/`
- ✅ `npm run dev` starts development server successfully
- ✅ `npm run lint` and `npm run type-check` run without errors
- ✅ `.gitignore` properly configured (excludes `.env`, `node_modules`)

**AC-2: Docker Containerization (Story 1.2)**
- ✅ `Dockerfile` with multi-stage build (build stage + production stage)
- ✅ Node.js 22.x base image used
- ✅ Production image size <500MB (or documented reason if larger)
- ✅ Environment variables accepted at runtime (not baked into image)
- ✅ Container runs locally: `docker run -p 8080:8080 -e NODE_ENV=production`
- ✅ `.dockerignore` excludes unnecessary files

**AC-3: CI Pipeline (Story 1.3)**
- ✅ `.github/workflows/ci-cd-dev.yml` created and functional
- ✅ Pipeline runs on every commit to `main` branch
- ✅ Pipeline stages: Lint → Type Check → Build (in order)
- ✅ Failed stage stops pipeline and reports error
- ✅ Pipeline completes in <5 minutes (build only, no deploy yet)
- ✅ Workflow status visible in GitHub pull requests and commits

**AC-4: Cloud Run Dev Service (Story 1.4)**
- ✅ Service name: `role-directory-dev`
- ✅ Region configured (e.g., `us-central1`)
- ✅ Allow unauthenticated access (public URL)
- ✅ Environment variables configured: `NODE_ENV=development`, `PORT=8080`
- ✅ Min instances: 0, Max instances: 3 (minimal for solo usage)
- ✅ Service accessible at public URL: `https://role-directory-dev-[hash].run.app`

**AC-5: Automated Dev Deployment (Story 1.5)**
- ✅ CI pipeline extended with deployment stage (after build)
- ✅ Authenticates with GCP using service account key
- ✅ Deploys to `role-directory-dev` Cloud Run service
- ✅ Deployment completes in <10 minutes total (CI + deploy)
- ✅ Health check runs after deployment (`GET /api/health` returns 200)
- ✅ Failed deployments do not affect currently running service

**AC-6: Health Check Endpoint (Story 1.6)**
- ✅ Route: `GET /api/health`
- ✅ Returns 200 OK when healthy
- ✅ Response body: `{ "status": "ok", "timestamp": "ISO 8601" }`
- ✅ Response time <100ms (warm), <3s (cold start acceptable)
- ✅ Does not require authentication (public endpoint)

**AC-7: Cloud Run Staging Service (Story 1.7)**
- ✅ Service name: `role-directory-stg`
- ✅ Same configuration as dev (region, CPU, memory, instance limits)
- ✅ Environment variables: `NODE_ENV=staging`, `PORT=8080`
- ✅ Public URL: `https://role-directory-stg-[hash].run.app`
- ✅ Independent from dev service

**AC-8: Cloud Run Production Service (Story 1.8)**
- ✅ Service name: `role-directory-prd`
- ✅ Same configuration as dev/staging
- ✅ Environment variables: `NODE_ENV=production`, `PORT=8080`
- ✅ Public URL: `https://role-directory-prd-[hash].run.app`
- ✅ Independent from dev/staging services

**AC-9: Manual Staging Promotion (Story 1.9)**
- ✅ `.github/workflows/promote-to-staging.yml` created
- ✅ Manually triggerable from GitHub Actions UI
- ✅ Accepts image tag (commit SHA) as input
- ✅ Deploys SAME Docker image to staging (no rebuild)
- ✅ Staging environment variables injected (different from dev)
- ✅ Health check runs against staging URL
- ✅ Workflow summary displays staging URL

**AC-10: Manual Production Promotion (Story 1.10)**
- ✅ `.github/workflows/promote-to-production.yml` created
- ✅ Manually triggerable from GitHub Actions UI
- ✅ Accepts image tag (commit SHA) as input
- ✅ Deploys SAME Docker image to production (no rebuild)
- ✅ Production environment variables injected
- ✅ Health check runs against production URL
- ✅ Optional: Includes additional confirmation step or approval requirement

**AC-11: Rollback Documentation and Testing (Story 1.11)**
- ✅ Rollback procedure documented in README or `docs/ROLLBACK.md`
- ✅ Documentation includes `gcloud` commands and GCP Console steps
- ✅ Rollback tested at least once in dev environment
- ✅ Screenshots or examples included in documentation
- ✅ Rollback completes in <5 minutes

## Traceability Mapping

| Acceptance Criteria | PRD Section | Architecture Component | Test Strategy |
|---------------------|-------------|------------------------|---------------|
| AC-1: Project Initialization | FR-6.1 (Dockerfile), NFR-4.1 (Code Quality) | Next.js 15 + TypeScript + Tailwind | Manual: `npm run dev`, `npm run lint` |
| AC-2: Docker Containerization | FR-6.1 (Dockerfile), FR-6.2 (Env Variables) | Multi-stage Docker build | Manual: `docker build`, `docker run` locally |
| AC-3: CI Pipeline | FR-4.4 (CI/CD Pipeline), NFR-4.1 (Code Quality) | GitHub Actions + ESLint + TypeScript | Commit to `main`, verify pipeline runs |
| AC-4: Cloud Run Dev Service | FR-4.1 (Development Environment) | Cloud Run + Secret Manager | GCP Console, verify service accessible |
| AC-5: Automated Dev Deployment | FR-4.1 (Development Environment), NFR-6.1 (Automated Deployment) | GitHub Actions + gcloud CLI + Cloud Run | Commit to `main`, verify auto-deploy |
| AC-6: Health Check Endpoint | FR-6.3 (Health Check Endpoint) | Next.js API route | `curl /api/health`, verify 200 OK |
| AC-7: Cloud Run Staging Service | FR-4.2 (Staging Environment) | Cloud Run | GCP Console, verify service accessible |
| AC-8: Cloud Run Production Service | FR-4.3 (Production Environment) | Cloud Run | GCP Console, verify service accessible |
| AC-9: Manual Staging Promotion | FR-4.2 (Staging Environment), NFR-6.1 (Manual Promotion) | GitHub Actions + gcloud CLI | Trigger workflow, verify staging deployment |
| AC-10: Manual Production Promotion | FR-4.3 (Production Environment), NFR-6.1 (Manual Promotion) | GitHub Actions + gcloud CLI | Trigger workflow, verify production deployment |
| AC-11: Rollback Documentation | FR-4.4 (CI/CD Pipeline), NFR-3.3 (Rollback Capability) | Cloud Run revisions | Follow rollback procedure, verify success |

## Risks, Assumptions, Open Questions

**Risks:**

**Risk-1: Cloud Build Timeout**
- **Description:** Cloud Build may timeout during Docker build if dependencies are slow to install
- **Likelihood:** Low
- **Impact:** Medium (deployment failure, but previous version still running)
- **Mitigation:** Use `npm ci` instead of `npm install`, cache `node_modules` in Cloud Build
- **Contingency:** Increase Cloud Build timeout from default 10 minutes to 15 minutes

**Risk-2: Secret Manager Permissions**
- **Description:** CI/CD service account may lack permissions to read secrets from Secret Manager
- **Likelihood:** Medium (common misconfiguration)
- **Impact:** High (deployment fails, no secrets available at runtime)
- **Mitigation:** Document required IAM roles in README, test permissions in dev environment first
- **Contingency:** Grant `roles/secretmanager.secretAccessor` role to service account

**Risk-3: Docker Image Size Exceeds 500MB**
- **Description:** Production Docker image may exceed 500MB due to dependencies
- **Likelihood:** Medium
- **Impact:** Low (slower deployments, higher storage costs)
- **Mitigation:** Multi-stage build, use `node:22-alpine` base image, audit dependencies
- **Contingency:** Document reason for larger size, optimize in future iteration

**Risk-4: Cold Start Performance >10 Seconds**
- **Description:** Application cold start may exceed 10 seconds if initialization is slow
- **Likelihood:** Low (Next.js starts quickly with minimal dependencies)
- **Impact:** Medium (poor user experience on first request after idle)
- **Mitigation:** Minimize dependencies, lazy-load heavy libraries, optimize Docker image
- **Contingency:** Document cold start time, consider increasing Cloud Run min instances to 1 (cost increase)

**Assumptions:**

**Assumption-1: GitHub Actions Free Tier Sufficient**
- **Assumption:** GitHub Actions free tier (2,000 minutes/month for private repos, unlimited for public) is sufficient for MVP
- **Validation:** Monitor GitHub Actions usage in billing dashboard
- **If Invalid:** Switch to self-hosted runner or optimize pipeline to reduce minutes

**Assumption-2: Cloud Run Free Tier Sufficient**
- **Assumption:** Cloud Run free tier (2M requests/month, 360,000 GB-seconds) covers MVP usage
- **Validation:** Monitor Cloud Run usage in GCP Console billing
- **If Invalid:** Optimize container resources, scale to zero more aggressively

**Assumption-3: No Database Needed for Epic 1**
- **Assumption:** Epic 1 can be completed without database setup (Epic 2)
- **Validation:** Health check endpoint returns basic status without database check
- **If Invalid:** Defer stories requiring database (unlikely for Epic 1)

**Assumption-4: Manual GCP Setup Acceptable**
- **Assumption:** Manual Cloud Run service creation acceptable for MVP (no Terraform/IaC)
- **Validation:** Document all manual setup steps in README
- **If Invalid:** Invest time in IaC setup (deferred to Phase 2)

**Open Questions:**

**Question-1: Custom Domain for Production?**
- **Question:** Should production environment use custom domain (e.g., `role-directory.example.com`) or default Cloud Run URL?
- **Decision:** Out of scope for MVP, default Cloud Run URL acceptable
- **Rationale:** Custom domain requires DNS setup and certificate management, adds complexity without infrastructure validation benefit

**Question-2: GitHub Environment Protection for Production?**
- **Question:** Should production promotion require manual approval via GitHub environment protection?
- **Decision:** Optional, can be enabled later
- **Rationale:** Manual workflow trigger already provides control, additional approval adds safety but slows deployment

**Question-3: Rollback Automation?**
- **Question:** Should rollback be automated via GitHub Actions workflow or remain manual `gcloud` commands?
- **Decision:** Manual rollback sufficient for MVP, automation in Phase 2
- **Rationale:** Rollback is rare, manual control acceptable for low-traffic MVP

**Question-4: Multi-Region Deployment?**
- **Question:** Should services be deployed to multiple regions for high availability?
- **Decision:** Out of scope for MVP, single region sufficient
- **Rationale:** Infrastructure validation goal does not require HA, single region reduces cost and complexity

## Test Strategy Summary

**Testing Approach for Epic 1:**

**Manual Testing (Primary for MVP):**
- **Story 1.1:** Run `npm run dev`, `npm run lint`, `npm run type-check`, verify no errors
- **Story 1.2:** Build Docker image, run locally, verify application accessible at `http://localhost:8080`
- **Story 1.3:** Commit to `main`, verify GitHub Actions pipeline runs and passes all stages
- **Story 1.4:** Access dev Cloud Run URL, verify "Hello World" page loads (or 404 if no pages yet)
- **Story 1.5:** Commit to `main`, verify auto-deployment to dev, verify health check passes
- **Story 1.6:** `curl https://role-directory-dev-xxx.run.app/api/health`, verify 200 OK response
- **Story 1.7-1.8:** Access staging/production Cloud Run URLs, verify services running
- **Story 1.9-1.10:** Trigger promotion workflows, verify deployments successful
- **Story 1.11:** Follow rollback procedure, verify previous version restored

**Automated Testing (Minimal for Epic 1):**
- **CI Pipeline:** ESLint, TypeScript type check, Next.js build (automated in GitHub Actions)
- **Health Check:** Automated `GET /api/health` after each deployment (in CI/CD workflow)

**Phase 2 Testing (Deferred from MVP):**
- **Unit Tests:** Vitest tests for utility functions, API routes
- **Component Tests:** React Testing Library tests for UI components
- **E2E Tests:** Playwright tests for critical user flows
- **Integration Tests:** API integration tests with Supertest or Vitest

**Test Coverage Targets (Phase 2):**
- Unit/Component Tests: 70%+ code coverage
- API Routes: 100% coverage (all endpoints tested)
- E2E Tests: 5-10 critical user flows

**Epic 1 Test Plan (Manual):**

1. **Local Development Test:**
   - Clone repository
   - Run `npm install`
   - Run `npm run dev`
   - Verify application accessible at `http://localhost:3000`
   - Run `npm run lint` and `npm run type-check`, verify no errors

2. **Docker Build Test:**
   - Build Docker image: `docker build -t role-directory:test .`
   - Run container: `docker run -p 8080:8080 -e NODE_ENV=production role-directory:test`
   - Verify application accessible at `http://localhost:8080`
   - Check image size: `docker images role-directory:test`, verify <500MB

3. **CI Pipeline Test:**
   - Create feature branch
   - Make code change (add comment)
   - Commit and push to `main`
   - Verify GitHub Actions workflow triggers
   - Verify all stages pass: Lint → Type Check → Build
   - Verify workflow completes in <5 minutes

4. **Dev Deployment Test:**
   - Commit to `main`
   - Verify GitHub Actions deploys to dev automatically
   - Access dev URL: `https://role-directory-dev-xxx.run.app`
   - Verify application loads (200 OK or expected page)
   - Verify health check: `curl https://role-directory-dev-xxx.run.app/api/health`

5. **Staging Promotion Test:**
   - Note commit SHA from dev deployment
   - Trigger "Promote to Staging" workflow in GitHub Actions UI
   - Enter commit SHA as input
   - Verify workflow completes successfully
   - Access staging URL: `https://role-directory-stg-xxx.run.app`
   - Verify same version deployed as dev

6. **Production Promotion Test:**
   - Note commit SHA from staging deployment
   - Trigger "Promote to Production" workflow in GitHub Actions UI
   - Enter commit SHA as input
   - (If enabled) Approve deployment
   - Verify workflow completes successfully
   - Access production URL: `https://role-directory-prd-xxx.run.app`
   - Verify same version deployed as staging

7. **Rollback Test (Dev):**
   - Deploy version 1 to dev (e.g., commit "v1")
   - Deploy version 2 to dev (e.g., commit "v2")
   - List revisions: `gcloud run revisions list --service=role-directory-dev --region=us-central1`
   - Rollback to v1: `gcloud run services update-traffic role-directory-dev --to-revisions=role-directory-dev-00001-abc=100 --region=us-central1`
   - Verify v1 is running: Access dev URL, verify expected content

8. **End-to-End Flow Test:**
   - Make code change (add new page or update text)
   - Commit to `main`
   - Verify auto-deployment to dev
   - Validate change in dev environment
   - Promote to staging
   - Validate change in staging environment
   - Promote to production
   - Validate change in production environment
   - Verify complete flow works as expected

---

**Epic 1 Technical Specification Complete**

This specification provides comprehensive guidance for implementing all 11 stories in Epic 1. All acceptance criteria, technical details, and architectural patterns are documented to ensure consistent implementation by development agents.

**Next Steps:**
1. Review and approve this tech spec
2. Mark Epic 1 as "contexted" in sprint-status.yaml
3. Begin Story 1.1 implementation using `*create-story` workflow

