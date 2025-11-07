# role-directory - Epic Breakdown

**Author:** danielvm  
**Date:** 2025-11-06  
**Project Level:** Infrastructure Validation (Low-Medium Complexity)  
**Target Scale:** MVP - Deployment Pipeline Validation

---

## Overview

This document provides the complete epic and story breakdown for role-directory, decomposing the requirements from the [PRD](./PRD.md) into implementable stories.

### Epic Structure

This project follows an **infrastructure-first approach** where each epic validates a critical piece of the deployment stack:

1. **Epic 1: Foundation & Deployment Pipeline** - Establish the deployment infrastructure that enables all subsequent work
2. **Epic 2: Database Infrastructure & Connectivity** - Prove database connectivity and serverless constraints work in Cloud Run
3. **Epic 3: Authentication & Access Control** - Secure access for collaborators using Neon Auth with email whitelist
4. **Epic 4: Hello World Dashboard (Stack Validation)** - Complete the validation loop with a working protected page

**Core Goal:** Prove ONE complete feature can flow successfully through all three environments (dev → staging → production).

**Success Metric:** Code committed → CI/CD runs → Auto-deploys to Dev → Promoted to Staging → Promoted to Production → Feature works correctly.

---

## Epic 1: Foundation & Deployment Pipeline

**Epic Goal:** Establish the complete deployment infrastructure that enables incremental validation. This epic creates the foundation for all subsequent work by setting up the project structure, containerization, CI/CD automation, and three-environment deployment workflow.

**Value Statement:** Without a working deployment pipeline, no other validation can occur. This epic proves that code can flow from commit to production reliably.

---

### Story 1.1: Project Initialization and Structure

As a **developer**,  
I want **a properly structured Next.js 15 project with TypeScript, ESLint, and Prettier configured**,  
So that **I have a solid foundation for building the application with quality tooling in place**.

**Acceptance Criteria:**

**Given** I am starting a new project  
**When** I initialize the project structure  
**Then** the following are set up:
- Next.js 15 with App Router and TypeScript 5.8
- ESLint configured with recommended rules
- Prettier configured for consistent formatting
- Basic folder structure: `app/`, `lib/`, `types/`, `components/`
- `.gitignore` properly configured (excludes `.env`, `node_modules`, etc.)
- `package.json` with all core dependencies

**And** I can run `npm run dev` successfully to start the development server  
**And** I can run `npm run lint` and `npm run type-check` without errors  
**And** The project includes a basic landing page at `/` with "Hello World"

**Prerequisites:** None (first story)

**Technical Notes:**
- Use `npx create-next-app@latest` with App Router and TypeScript options
- Install dependencies: `prettier`, `eslint-config-prettier`
- Create `.prettierrc` with basic configuration
- Create `tsconfig.json` with strict mode enabled
- Create basic folder structure following Next.js 15 conventions
- Add scripts to `package.json`: `dev`, `build`, `start`, `lint`, `type-check`

---

### Story 1.2: Docker Containerization Setup

As a **developer**,  
I want **a production-ready Dockerfile with multi-stage build**,  
So that **the application can be deployed to Cloud Run in an optimized container**.

**Acceptance Criteria:**

**Given** the Next.js project is initialized  
**When** I build the Docker image  
**Then** the Dockerfile includes:
- Multi-stage build (build stage + production stage)
- Node.js 22.x base image
- Dependencies installed and Next.js built
- Production server configured (not dev server)
- Environment variables accepted at runtime (not baked in)
- PORT defaults to 8080 (Cloud Run standard)

**And** the built image size is <500MB (or documented reason if larger)  
**And** I can run the container locally: `docker run -p 8080:8080 -e NODE_ENV=production`  
**And** the application is accessible at `http://localhost:8080`  
**And** a `.dockerignore` file excludes unnecessary files (`node_modules`, `.git`, etc.)

**Prerequisites:** Story 1.1 (Project Initialization)

**Technical Notes:**
- Create `Dockerfile` in project root
- Stage 1: Install deps and build (`npm ci`, `npm run build`)
- Stage 2: Copy build artifacts, install production deps only, set up runtime
- Use `COPY --from=builder` to copy built files
- `CMD ["npm", "start"]` to run production server
- Accept `DATABASE_URL`, `NODE_ENV`, `PORT` as environment variables
- Document expected environment variables in README

---

### Story 1.3: GitHub Actions CI Pipeline (Lint, Type Check, Build)

As a **developer**,  
I want **a GitHub Actions workflow that runs lint, type check, and build on every commit to main**,  
So that **code quality is automatically validated before deployment**.

**Acceptance Criteria:**

**Given** code is committed to the `main` branch  
**When** the GitHub Actions workflow runs  
**Then** the pipeline executes the following stages in order:
1. Checkout code
2. Set up Node.js 22.x
3. Install dependencies (`npm ci`)
4. Run ESLint (`npm run lint`)
5. Run TypeScript type check (`npm run type-check`)
6. Build Next.js application (`npm run build`)

**And** if any stage fails, the pipeline stops and reports failure  
**And** the workflow completes in <5 minutes  
**And** the workflow status is visible in GitHub pull requests and commits  
**And** the workflow does NOT deploy yet (deployment added in next story)

**Prerequisites:** Story 1.1 (Project with lint/type-check scripts), Story 1.2 (Dockerfile exists)

**Technical Notes:**
- Create `.github/workflows/ci-cd.yml`
- Use `actions/checkout@v4` and `actions/setup-node@v4`
- Cache `node_modules` using `actions/cache`
- Run `npm ci` for clean dependency install
- Set `fail-fast: true` to stop on first failure
- Add workflow status badge to README

---

### Story 1.4: Cloud Run Service Setup (Dev Environment)

As a **developer**,  
I want **a Cloud Run service configured for the dev environment**,  
So that **the application can be deployed and accessed via a public URL**.

**Acceptance Criteria:**

**Given** I have a GCP project set up  
**When** I create the dev Cloud Run service  
**Then** the following are configured:
- Service name: `role-directory-dev`
- Region: Selected region (e.g., `us-central1`)
- Allow unauthenticated access (public URL)
- Environment variables injected: `NODE_ENV=development`, `DATABASE_URL` (placeholder initially), `PORT=8080`
- Minimum instances: 0 (scale to zero)
- Maximum instances: 10 (cost control)
- CPU: 1, Memory: 512Mi (sufficient for MVP)

**And** the service has a public URL: `https://role-directory-dev-[hash].run.app`  
**And** environment variables are managed via GCP console or `gcloud` CLI  
**And** the service is documented in README with URL and setup instructions

**Prerequisites:** Story 1.2 (Docker image can be built)

**Technical Notes:**
- Use `gcloud run deploy role-directory-dev` or GCP Console
- Store `DATABASE_URL` in Google Secret Manager (reference in next epic)
- Note the service URL for GitHub Actions deployment
- Document required GCP permissions and service account setup
- Consider enabling Cloud Run API and Container Registry API

---

### Story 1.5: GitHub Actions Deployment to Dev

As a **developer**,  
I want **automated deployment to the dev environment on every commit to main**,  
So that **changes are immediately available for validation without manual intervention**.

**Acceptance Criteria:**

**Given** the CI pipeline passes (lint, type check, build)  
**When** the deployment stage runs  
**Then** the following happens:
1. Authenticate with GCP using service account credentials
2. Build Docker image and tag with commit SHA
3. Push image to Google Container Registry or Artifact Registry
4. Deploy image to `role-directory-dev` Cloud Run service
5. Run health check against deployed service (`GET /api/health` returns 200)

**And** if health check fails, the deployment is marked as failed  
**And** the deployment completes in <10 minutes total (CI + deploy)  
**And** the dev URL is posted as a comment or visible in workflow logs  
**And** failed deployments do NOT affect the currently running service

**Prerequisites:** Story 1.3 (CI pipeline), Story 1.4 (Dev Cloud Run service exists)

**Technical Notes:**
- Add deployment step to `.github/workflows/ci-cd.yml`
- Use `google-github-actions/auth@v2` for GCP authentication
- Use `google-github-actions/setup-gcloud@v2` for gcloud CLI
- Build: `docker build -t gcr.io/PROJECT_ID/role-directory:$GITHUB_SHA .`
- Push: `docker push gcr.io/PROJECT_ID/role-directory:$GITHUB_SHA`
- Deploy: `gcloud run deploy role-directory-dev --image gcr.io/...`
- Store GCP credentials in GitHub Secrets: `GCP_PROJECT_ID`, `GCP_SA_KEY`
- Create health check endpoint in Story 1.6

---

### Story 1.6: Health Check Endpoint

As a **developer**,  
I want **a health check endpoint that reports application status**,  
So that **CI/CD and Cloud Run can verify the application is running correctly**.

**Acceptance Criteria:**

**Given** the application is running  
**When** I request `GET /api/health`  
**Then** the endpoint returns:
- Status code: 200 OK (when healthy)
- Response body: `{ "status": "ok", "timestamp": "ISO 8601 timestamp" }`
- Response time: <100ms (warm)

**And** if database connectivity is testable (after Epic 2), optionally include database status  
**And** if critical issues exist (e.g., cannot connect to database), return 500 Internal Server Error  
**And** the endpoint does NOT require authentication (public for health checks)

**Prerequisites:** Story 1.1 (Next.js project with API routes)

**Technical Notes:**
- Create `app/api/health/route.ts` (Next.js 15 App Router)
- Export `GET` handler returning JSON response
- Include timestamp for cache-busting
- In Epic 2, optionally add database connection check
- Keep logic simple and fast (no heavy operations)

---

### Story 1.7: Cloud Run Service Setup (Staging Environment)

As a **developer**,  
I want **a Cloud Run service configured for the staging environment**,  
So that **validated changes can be promoted from dev for final testing**.

**Acceptance Criteria:**

**Given** the dev environment is working  
**When** I create the staging Cloud Run service  
**Then** the following are configured:
- Service name: `role-directory-stg`
- Same configuration as dev (region, CPU, memory, instance limits)
- Environment variables: `NODE_ENV=staging`, `DATABASE_URL` (staging database), `PORT=8080`
- Public URL: `https://role-directory-stg-[hash].run.app`

**And** the staging service is independent from dev (separate service)  
**And** the service URL is documented in README  
**And** staging database connection string points to separate database (configured in Epic 2)

**Prerequisites:** Story 1.4 (Dev Cloud Run service working)

**Technical Notes:**
- Use same `gcloud run deploy` command with different service name
- Ensure `DATABASE_URL` points to `role_directory_stg` database (Epic 2)
- Document staging URL and promotion workflow
- Same resource limits as dev (sufficient for MVP testing)

---

### Story 1.8: Cloud Run Service Setup (Production Environment)

As a **developer**,  
I want **a Cloud Run service configured for the production environment**,  
So that **fully validated changes can be deployed to the final showcase environment**.

**Acceptance Criteria:**

**Given** the staging environment is working  
**When** I create the production Cloud Run service  
**Then** the following are configured:
- Service name: `role-directory-prd`
- Same configuration as dev/staging
- Environment variables: `NODE_ENV=production`, `DATABASE_URL` (production database), `PORT=8080`
- Public URL: `https://role-directory-prd-[hash].run.app` (or custom domain if configured)

**And** the production service is independent from dev/staging  
**And** the service URL is documented in README  
**And** production database connection string points to separate database (configured in Epic 2)  
**And** additional safeguards documented (e.g., require manual approval for promotions)

**Prerequisites:** Story 1.7 (Staging Cloud Run service working)

**Technical Notes:**
- Use same `gcloud run deploy` command with different service name
- Ensure `DATABASE_URL` points to `role_directory_prd` database (Epic 2)
- Document production URL and promotion workflow
- Consider adding custom domain in future (out of MVP scope)
- Ensure production secrets are properly configured in Secret Manager

---

### Story 1.9: Manual Promotion Workflow (Dev → Staging)

As a **developer**,  
I want **a manual GitHub Actions workflow to promote a validated dev image to staging**,  
So that **I can control when changes move to staging after validation**.

**Acceptance Criteria:**

**Given** a Docker image has been deployed to dev and validated  
**When** I manually trigger the "Promote to Staging" workflow  
**Then** the workflow:
1. Accepts the image tag (commit SHA) as input
2. Authenticates with GCP
3. Deploys the SAME image to `role-directory-stg` (no rebuild)
4. Updates staging environment variables (injected, not rebuilt)
5. Runs health check against staging service

**And** if health check passes, the promotion is marked successful  
**And** if health check fails, the promotion is marked failed (previous version still running)  
**And** the workflow is manually triggerable from GitHub Actions UI  
**And** the staging URL is posted in workflow summary

**Prerequisites:** Story 1.5 (Dev deployment working), Story 1.7 (Staging service exists)

**Technical Notes:**
- Create `.github/workflows/promote-to-staging.yml`
- Use `workflow_dispatch` trigger with `inputs.image_tag`
- Deploy existing image: `gcloud run deploy role-directory-stg --image gcr.io/PROJECT_ID/role-directory:$IMAGE_TAG`
- Run same health check as dev deployment
- Document promotion process in README

---

### Story 1.10: Manual Promotion Workflow (Staging → Production)

As a **developer**,  
I want **a manual GitHub Actions workflow to promote a validated staging image to production**,  
So that **I can control when changes move to production after final validation**.

**Acceptance Criteria:**

**Given** a Docker image has been deployed to staging and validated  
**When** I manually trigger the "Promote to Production" workflow  
**Then** the workflow:
1. Accepts the image tag (commit SHA) as input
2. Authenticates with GCP
3. Deploys the SAME image to `role-directory-prd` (no rebuild)
4. Updates production environment variables (injected, not rebuilt)
5. Runs health check against production service

**And** if health check passes, the promotion is marked successful  
**And** if health check fails, the promotion is marked failed (previous version still running)  
**And** the workflow is manually triggerable from GitHub Actions UI  
**And** the production URL is posted in workflow summary  
**And** the workflow includes an additional confirmation step (e.g., require manual approval)

**Prerequisites:** Story 1.9 (Staging promotion working), Story 1.8 (Production service exists)

**Technical Notes:**
- Create `.github/workflows/promote-to-production.yml`
- Use `workflow_dispatch` trigger with `inputs.image_tag`
- Consider adding `environment: production` with required reviewers (GitHub feature)
- Deploy existing image: `gcloud run deploy role-directory-prd --image gcr.io/PROJECT_ID/role-directory:$IMAGE_TAG`
- Run same health check as dev/staging deployments
- Document production promotion process in README
- Add warning/confirmation in workflow description

---

### Story 1.11: Rollback Documentation and Testing

As a **developer**,  
I want **clear documentation and tested procedures for rolling back deployments**,  
So that **I can quickly recover from failed deployments or issues in any environment**.

**Acceptance Criteria:**

**Given** a deployment has been made to any environment  
**When** I need to rollback to a previous version  
**Then** the rollback procedure is documented with:
- How to identify previous Cloud Run revisions
- Command to rollback: `gcloud run services update-traffic [service] --to-revisions [revision]=100`
- How to rollback via GCP Console (UI instructions)
- How to verify rollback was successful (health check + manual testing)

**And** I have tested rollback at least once in dev environment  
**And** rollback documentation includes screenshots or examples  
**And** database migration rollback is documented (covered in Epic 2)  
**And** rollback procedures are included in README or separate DEPLOYMENT.md

**Prerequisites:** Story 1.5 (Dev deployment working), Story 1.10 (All environments deployed)

**Technical Notes:**
- Create `docs/ROLLBACK.md` or section in README
- Document `gcloud run revisions list --service [service]`
- Document `gcloud run services update-traffic` for rollback
- Test rollback in dev: deploy v1, deploy v2, rollback to v1
- Include troubleshooting section (health checks, logs)
- Link to Cloud Run revision management docs

---

## Epic 2: Database Infrastructure & Connectivity

**Epic Goal:** Establish reliable PostgreSQL database connectivity from Cloud Run, handling serverless constraints (cold starts, connection pooling), and enable database schema management across all three environments.

**Value Statement:** Authentication and dashboard features both depend on database connectivity working correctly in the serverless Cloud Run environment with Neon PostgreSQL's auto-suspend behavior.

---

### Story 2.1: Neon PostgreSQL Account and Database Setup

As a **developer**,  
I want **three separate Neon PostgreSQL databases (dev, staging, production) configured and accessible**,  
So that **each environment has isolated data and I can validate schema migrations independently**.

**Acceptance Criteria:**

**Given** I have a Neon account (free tier)  
**When** I create the databases  
**Then** the following are set up:
- Three databases: `role_directory_dev`, `role_directory_stg`, `role_directory_prd`
- Each database has a unique connection string
- Connection strings use format: `postgresql://user:pass@ep-xxx.region.neon.tech/dbname?sslmode=require`
- TLS/SSL encryption enabled (sslmode=require)
- Neon auto-suspend enabled (default, saves compute hours)

**And** I can connect to each database using `psql` or a PostgreSQL client  
**And** connection strings are stored in Google Secret Manager (not in code)  
**And** each environment's Cloud Run service has access to its corresponding database connection string

**Prerequisites:** None (can be done in parallel with Epic 1)

**Technical Notes:**
- Sign up for Neon free tier account
- Create project: "role-directory"
- Create three databases (or three separate projects if preferred)
- Copy connection strings from Neon Console
- Store in Google Secret Manager:
  - Secret: `role-directory-dev-db-url`
  - Secret: `role-directory-stg-db-url`
  - Secret: `role-directory-prd-db-url`
- Document Neon setup in README or `docs/infrastructure-setup-neon.md`
- Note: Neon includes built-in connection pooling

---

### Story 2.2: Database Connection Configuration with Zod-Validated Config

As a **developer**,  
I want **a type-safe configuration module with Zod validation and a database connection module with proper pooling**,  
So that **the application validates configuration on startup and can reliably connect to PostgreSQL from Cloud Run**.

**Acceptance Criteria:**

**Given** the Neon databases are set up  
**When** the application initializes  
**Then** the configuration module (`lib/config.ts`):
- Uses Zod to validate all required environment variables
- Validates `DATABASE_URL` is a valid PostgreSQL URL
- Validates `ALLOWED_EMAILS` contains valid email addresses
- Parses and transforms configuration (split emails, parse port)
- Provides type-safe `getConfig()` function
- Fails fast with detailed error messages if configuration is invalid

**And** the database connection module (`lib/db.ts`):
- Uses `getConfig()` to get validated `DATABASE_URL`
- Uses `@neondatabase/serverless` driver (built-in pooling)
- Handles Neon cold starts gracefully (2-3 second resume time)
- Logs slow queries (>200ms)
- Provides `query()` function with parameterized query support

**And** I can import configuration: `import { getConfig } from '@/lib/config'`  
**And** I can import database utilities: `import { query } from '@/lib/db'`  
**And** connection failures throw descriptive errors (not raw database errors)  
**And** the module handles connection timeouts (5 seconds max wait)  
**And** connections are properly released after use (no leaks)

**Prerequisites:** Story 2.1 (Neon databases exist), Story 1.1 (Project structure)

**Technical Notes:**

**Configuration Module (`lib/config.ts`):**
- Install Zod: `npm install zod` (added in Story 1.1)
- Follow architecture pattern: `docs/3-solutioning/architecture.md` (Configuration Management Pattern section)
- Create Zod schema for all environment variables:
  - `databaseUrl`: Must be valid PostgreSQL URL
  - `neonAuthProjectId`, `neonAuthSecretKey`: Required strings
  - `allowedEmails`: Comma-separated, transformed to array
  - `nodeEnv`: Enum (development/staging/production)
  - `port`: Parsed to number, validated range
- Export `validateConfig()` and `getConfig()` functions
- Export `Config` type inferred from schema

**Database Module (`lib/db.ts`):**
- Use `@neondatabase/serverless` (already installed in Story 1.1)
- Import `getConfig()` to get validated `DATABASE_URL`
- Create `query()` function with slow query logging (>200ms)
- Use parameterized queries only (prevent SQL injection)
- Export `query(text: string, params?: any[])` function

**Example Implementation:**
```typescript
// lib/config.ts - See architecture.md for full implementation
import { z } from 'zod';
const configSchema = z.object({ ... });
export const getConfig = () => { ... };

// lib/db.ts
import { getConfig } from '@/lib/config';
import { neon } from '@neondatabase/serverless';
const config = getConfig();
const sql = neon(config.databaseUrl);
export async function query(text: string, params?: any[]) { ... }
```

**Testing:**
- Configuration validation fails with invalid env vars
- Database connection works with valid config
- Slow query logging triggers at >200ms

---

### Story 2.3: Database Schema Migration Setup

As a **developer**,  
I want **a migration system to manage database schema changes across environments**,  
So that **schema updates can be applied consistently and safely to dev, staging, and production**.

**Acceptance Criteria:**

**Given** I need to create or modify database tables  
**When** I create a migration  
**Then** the migration system:
- Supports up (apply) and down (rollback) migrations
- Tracks migration state (which migrations have been applied)
- Can be run manually via CLI: `npm run migrate:up` / `npm run migrate:down`
- Generates migration files with timestamp: `YYYYMMDDHHMMSS_migration_name.sql`
- Applies migrations in order (based on timestamp)

**And** I can run migrations against any environment by setting `DATABASE_URL`  
**And** the migration tool creates a `schema_migrations` table to track applied migrations  
**And** migration process is documented in README or `docs/DATABASE.md`  
**And** sample migration included (create initial tables)

**Prerequisites:** Story 2.2 (Database connection module working)

**Technical Notes:**
- Options: Use Prisma Migrate, node-pg-migrate, Knex migrations, or custom script
- Recommended: Prisma Migrate for simplicity (if using Prisma) or node-pg-migrate
- Create `migrations/` directory for SQL files
- Add scripts to `package.json`: `"migrate:up": "node scripts/migrate.js up"`
- Document migration workflow:
  1. Create migration
  2. Run against dev: `DATABASE_URL=... npm run migrate:up`
  3. Test in dev
  4. Run against staging
  5. Run against production
- Include rollback instructions

---

### Story 2.4: Initial Database Schema Migration (Existing Tables)

As a **developer**,  
I want **the existing role/pricing tables migrated to all three Neon databases**,  
So that **the Hello World dashboard can query real data and validate database connectivity**.

**Acceptance Criteria:**

**Given** the migration system is set up  
**When** I create and run the initial migration  
**Then** the following tables are created in all three databases:
- Tables from existing schema (e.g., `role_profiles`, `profile_pricing`, etc.)
- Proper column types, constraints, and indexes
- Sample data inserted (optional, for Hello World query testing)

**And** the migration runs successfully against `role_directory_dev`  
**And** the migration runs successfully against `role_directory_stg`  
**And** the migration runs successfully against `role_directory_prd`  
**And** I can query the tables using `psql` or a PostgreSQL client  
**And** schema is consistent across all three environments

**Prerequisites:** Story 2.3 (Migration system working)

**Technical Notes:**
- Review existing SQL schema in `sql/` directory (if exists)
- Create migration: `migrations/001_create_role_tables.sql`
- Include `CREATE TABLE` statements for role/pricing tables
- Add indexes as needed (e.g., on primary keys)
- Optionally insert sample data for testing
- Run migration against each environment sequentially
- Document expected tables and schemas in `docs/DATABASE.md`
- Note: Neon Auth tables NOT needed in this migration (auto-created in Epic 3)

---

### Story 2.5: Database Connection Testing in Health Check

As a **developer**,  
I want **the health check endpoint to verify database connectivity**,  
So that **deployment health checks catch database connection issues early**.

**Acceptance Criteria:**

**Given** the database connection module is working  
**When** the health check endpoint runs  
**Then** it executes a simple database query (e.g., `SELECT 1` or `SELECT version()`)  
**And** if the query succeeds within 2 seconds, return `{ "status": "ok", "database": "connected" }`  
**And** if the query fails or times out, return 500 status with `{ "status": "error", "database": "disconnected" }`  
**And** database errors are logged (not exposed in response)  
**And** health check still responds quickly (<3 seconds total including cold start)

**Prerequisites:** Story 2.2 (Database connection working), Story 1.6 (Health check endpoint exists)

**Technical Notes:**
- Update `app/api/health/route.ts`
- Import database module: `import { query } from '@/lib/db'`
- Execute: `await query('SELECT 1')`
- Wrap in try-catch, set timeout (2 seconds)
- Return appropriate status code based on result
- Log errors to Cloud Run logs for debugging
- Consider making database check optional via env var (fail open vs fail closed)

---

### Story 2.6: Environment-Specific Database Configuration Documentation

As a **developer**,  
I want **clear documentation for configuring database connections in each environment**,  
So that **I can quickly troubleshoot connection issues and onboard new contributors**.

**Acceptance Criteria:**

**Given** all three environments are set up  
**When** I reference the documentation  
**Then** it includes:
- How to obtain Neon connection strings from Neon Console
- How to store connection strings in Google Secret Manager
- How to inject secrets into Cloud Run services
- Format of `DATABASE_URL` environment variable
- Troubleshooting common connection issues (cold starts, timeouts, SSL)
- How to test database connectivity locally
- How to run migrations against each environment

**And** documentation includes examples and screenshots where helpful  
**And** security best practices are noted (never commit connection strings)  
**And** documentation is located in README or `docs/infrastructure-setup-neon.md`

**Prerequisites:** Story 2.1 (Neon setup), Story 2.2 (Connection module), Story 2.3 (Migrations)

**Technical Notes:**
- Create or update `docs/infrastructure-setup-neon.md`
- Include step-by-step Neon setup instructions
- Document Google Secret Manager commands:
  - `gcloud secrets create role-directory-dev-db-url --data-file=-`
  - `gcloud run services update role-directory-dev --set-secrets=DATABASE_URL=role-directory-dev-db-url:latest`
- Include local development setup (.env file with DATABASE_URL)
- Add troubleshooting section (connection refused, SSL errors, cold start delays)
- Link to Neon docs and GCP Secret Manager docs

---

## Epic 3: Authentication & Access Control

**Epic Goal:** Implement secure authentication using Neon Auth with OAuth providers and email whitelist access control, enabling protected routes and session management that works correctly in the serverless Cloud Run environment.

**Value Statement:** Proves session management works in serverless, enables protected dashboard page, and validates that authentication flow integrates smoothly with Neon PostgreSQL for user data storage.

---

### Story 3.1: Neon Auth Project Setup and Configuration

As a **developer**,  
I want **Neon Auth configured with OAuth providers (Google and/or GitHub)**,  
So that **collaborators can sign in using their existing accounts without custom authentication code**.

**Acceptance Criteria:**

**Given** I have a Neon account with databases set up  
**When** I configure Neon Auth  
**Then** the following are set up:
- Neon Auth enabled for the project in Neon Console
- OAuth provider configured: Google (primary) or GitHub (alternative)
- OAuth application created in provider console (Google Cloud Console or GitHub Settings)
- OAuth credentials configured in Neon Auth: Client ID and Client Secret
- Allowed redirect URLs configured for all three environments

**And** I have the following credentials available:
- `NEON_AUTH_PROJECT_ID` (from Neon Console)
- `NEON_AUTH_SECRET_KEY` (from Neon Console, separate for each environment)
- OAuth provider credentials stored in Google Secret Manager

**And** Neon Auth setup is documented in `docs/neon-auth-setup-guide.md`  
**And** OAuth callback URLs documented for dev, staging, production

**Prerequisites:** Story 2.1 (Neon databases exist)

**Technical Notes:**
- Enable Neon Auth in Neon Console (Project Settings → Authentication)
- Choose OAuth provider: Google recommended (familiar to most users)
- Create Google OAuth application:
  - Go to Google Cloud Console → APIs & Services → Credentials
  - Create OAuth 2.0 Client ID (Web application)
  - Add authorized redirect URIs for all three environments
- Configure in Neon Auth with Client ID and Secret
- Note: Neon Auth auto-creates user tables in database
- Document OAuth setup steps with screenshots
- Store secrets in Google Secret Manager for Cloud Run injection

---

### Story 3.2: Neon Auth SDK Integration (Next.js)

As a **developer**,  
I want **the Neon Auth SDK integrated into the Next.js application**,  
So that **I can use pre-built authentication components and session management**.

**Acceptance Criteria:**

**Given** Neon Auth is configured in Neon Console  
**When** I integrate the SDK  
**Then** the following are set up:
- Neon Auth Next.js SDK installed: `npm install @neon/auth-nextjs`
- SDK initialized in `lib/auth.ts` or `lib/neon-auth.ts`
- Environment variables configured: `NEON_AUTH_PROJECT_ID`, `NEON_AUTH_SECRET_KEY`
- Auth provider wrapped around application (if required by SDK)
- Helper functions available: `getUser()`, `signIn()`, `signOut()`

**And** I can import auth utilities: `import { getUser } from '@/lib/auth'`  
**And** the SDK connects to the correct Neon database (reads `DATABASE_URL`)  
**And** user data is automatically synced to Neon PostgreSQL  
**And** SDK configuration is documented in code comments

**Prerequisites:** Story 3.1 (Neon Auth configured), Story 2.2 (Database connection working)

**Technical Notes:**
- Install Neon Auth SDK (check latest documentation for package name)
- Create `lib/auth.ts` with SDK initialization
- Configure SDK with environment variables
- Export helper functions for use in components and API routes
- Verify user data appears in database after first sign-in
- Document SDK setup in `docs/neon-auth-setup-guide.md`
- Note: Exact SDK API may vary - follow Neon Auth documentation

---

### Story 3.3: Sign-In Landing Page with OAuth

As a **collaborator**,  
I want **a landing page with a sign-in button**,  
So that **I can authenticate using my Google or GitHub account**.

**Acceptance Criteria:**

**Given** I visit the root URL of the application  
**When** I am not authenticated  
**Then** I see:
- Landing page at `/` with project title "role-directory"
- Brief description: "Infrastructure validation showcase"
- Sign-in button: "Sign in with Google" (or configured OAuth provider)
- Clean, functional design (using Tailwind CSS or shadcn/ui)

**And** when I click "Sign in with Google", I am redirected to Google OAuth consent screen  
**And** after granting permission, I am redirected back to the application  
**And** if authentication succeeds, I am redirected to `/dashboard`  
**And** if authentication fails, I see a clear error message

**Prerequisites:** Story 3.2 (Neon Auth SDK integrated)

**Technical Notes:**
- Create `app/page.tsx` for landing page
- Use Neon Auth pre-built component: `<SignIn />` or custom button with `signIn()` function
- Implement sign-in handler (SDK provides this)
- Redirect to `/dashboard` on successful authentication
- Style with Tailwind CSS (or shadcn/ui Button component)
- Handle OAuth errors gracefully (display user-friendly message)
- No custom authentication code needed - SDK handles flow

---

### Story 3.4: Email Whitelist Access Control

As a **developer**,  
I want **email whitelist enforcement for authenticated users**,  
So that **only approved collaborators can access the dashboard, even if they can authenticate via OAuth**.

**Acceptance Criteria:**

**Given** a user has authenticated via OAuth  
**When** their email is checked against the whitelist  
**Then** the following logic applies:
- Whitelist stored as environment variable: `ALLOWED_EMAILS="email1@example.com,email2@example.com"`
- After successful OAuth sign-in, check if user's email is in whitelist
- If email is whitelisted: Allow access to dashboard
- If email is NOT whitelisted: Show "Access restricted" message and sign out user

**And** the whitelist check happens on every protected route request (server-side)  
**And** unauthorized users see message: "Access restricted to approved collaborators only"  
**And** the whitelist can be updated without code changes (environment variable)  
**And** whitelist is documented in `.env.example` and README

**Prerequisites:** Story 3.3 (OAuth sign-in working)

**Technical Notes:**
- Read `ALLOWED_EMAILS` from environment variable
- Split by comma, trim whitespace: `process.env.ALLOWED_EMAILS?.split(',').map(e => e.trim())`
- After OAuth callback, check user's email against whitelist
- If not allowed: Sign out user and redirect to landing with error message
- Implement check in middleware or auth helper function
- Document whitelist format in `.env.example`: `ALLOWED_EMAILS=user1@example.com,user2@example.com`
- Add admin instructions: How to add/remove emails by updating environment variable

---

### Story 3.5: Protected Route Middleware

As a **developer**,  
I want **middleware that protects dashboard routes and enforces authentication**,  
So that **unauthenticated or unauthorized users cannot access protected pages**.

**Acceptance Criteria:**

**Given** I have protected routes (e.g., `/dashboard`)  
**When** a user requests a protected route  
**Then** the middleware:
1. Checks if user is authenticated (Neon Auth session exists)
2. Checks if user's email is in whitelist
3. If authenticated AND whitelisted: Allow access
4. If NOT authenticated: Redirect to `/` (sign-in page)
5. If authenticated but NOT whitelisted: Redirect to `/` with error message

**And** the middleware runs on every request to protected routes  
**And** the middleware is server-side (cannot be bypassed by client)  
**And** authentication check uses Neon Auth SDK helpers  
**And** middleware is efficient (<50ms overhead per request)

**Prerequisites:** Story 3.4 (Email whitelist working), Story 3.2 (Neon Auth SDK integrated)

**Technical Notes:**
- Create `middleware.ts` in project root (Next.js 15 middleware)
- Use Neon Auth SDK to check authentication status
- Implement email whitelist check
- Apply middleware to protected routes: `export const config = { matcher: ['/dashboard/:path*'] }`
- Return `NextResponse.redirect()` for unauthorized access
- Set error message in URL params or cookie for display on landing page
- Document protected routes in code comments
- Test: unauthenticated, authenticated but not whitelisted, authenticated and whitelisted

---

### Story 3.6: User Context Display (UserButton Component)

As a **collaborator**,  
I want **my profile information displayed in the dashboard**,  
So that **I know I'm signed in and can easily sign out**.

**Acceptance Criteria:**

**Given** I am authenticated and viewing the dashboard  
**When** the page loads  
**Then** I see:
- My name and/or email displayed (e.g., in header or top-right corner)
- User profile button or avatar (Neon Auth `<UserButton />` component if available)
- Dropdown or menu with "Sign out" option

**And** when I click "Sign out", I am signed out and redirected to landing page  
**And** the user context is fetched server-side (secure)  
**And** the user context is displayed using React components

**Prerequisites:** Story 3.5 (Protected routes working), Story 3.3 (Sign-in working)

**Technical Notes:**
- Use Neon Auth `<UserButton />` pre-built component (if available)
- Or create custom component that calls `getUser()` server-side
- Display in `app/dashboard/layout.tsx` or `app/dashboard/page.tsx`
- Fetch user context: `const user = await getUser()`
- Display: `<div>Welcome, {user.name || user.email}</div>`
- Sign out button: `<button onClick={() => signOut()}>Sign out</button>`
- Style with Tailwind CSS or shadcn/ui components
- Test: User info displays correctly, sign out works

---

### Story 3.7: Session Management Testing Across Cloud Run Instances

As a **developer**,  
I want **to verify that sessions work correctly across multiple Cloud Run container instances**,  
So that **users don't get signed out when requests hit different containers**.

**Acceptance Criteria:**

**Given** the application is deployed to Cloud Run  
**When** multiple container instances are running  
**Then** the following are verified:
- Sessions are stored in database (not in-memory)
- User remains authenticated across different container instances
- No session loss when container restarts
- No session leakage between users

**And** I can manually test by:
1. Sign in to dev environment
2. Make multiple requests (refresh page multiple times)
3. Verify session persists across requests
4. Check Cloud Run logs to see which instances handled requests

**And** session behavior is documented in README or `docs/neon-auth-setup-guide.md`  
**And** any session issues are logged for debugging

**Prerequisites:** Story 3.6 (Authentication fully integrated), Story 1.5 (Dev deployment working)

**Technical Notes:**
- Neon Auth should handle session storage in database automatically
- Verify: No in-memory session storage used
- Test in dev environment with Cloud Run instance count > 1 (if possible)
- Monitor Cloud Run logs to see instance IDs handling requests
- Document that Neon Auth uses database-backed sessions (stateless)
- If issues found: Review Neon Auth configuration and connection pooling
- Note: Neon's built-in connection pooling should handle multiple instances

---

### Story 3.8: Authentication Error Handling and User Feedback

As a **collaborator**,  
I want **clear error messages when authentication fails**,  
So that **I understand what went wrong and how to resolve it**.

**Acceptance Criteria:**

**Given** various authentication error scenarios  
**When** an error occurs  
**Then** I see helpful error messages:
- OAuth error: "Authentication failed. Please try again."
- Email not whitelisted: "Access restricted to approved collaborators. Contact administrator."
- Session expired: "Your session has expired. Please sign in again."
- Network error: "Unable to connect. Please check your internet connection."

**And** errors are displayed on the landing page or in an error toast/banner  
**And** errors do not expose sensitive information (OAuth tokens, session IDs)  
**And** errors are logged server-side for debugging (with correlation ID)  
**And** users have a clear path forward (e.g., "Try again" button)

**Prerequisites:** Story 3.5 (Protected routes), Story 3.3 (Sign-in flow)

**Technical Notes:**
- Implement error handling in OAuth callback
- Implement error handling in middleware (whitelist rejection)
- Display errors using URL params, cookies, or React state
- Create error display component (banner or toast)
- Log errors server-side with context: `console.error('[Auth Error]', { userId, error })`
- Style errors clearly (red background, error icon)
- Test error scenarios: OAuth failure, whitelist rejection, network issues
- Document common errors and resolutions in README

---

## Epic 4: Hello World Dashboard (Stack Validation)

**Epic Goal:** Create a single protected dashboard page that queries PostgreSQL and displays results, completing the end-to-end validation of the entire stack (authentication → Cloud Run → database → rendering).

**Value Statement:** This epic proves that ONE complete feature works successfully through all three environments, achieving the core MVP goal of infrastructure validation.

---

### Story 4.1: Dashboard Page Route and Layout

As a **collaborator**,  
I want **a dashboard page that I can access after signing in**,  
So that **I can see the application is working correctly**.

**Acceptance Criteria:**

**Given** I am authenticated and whitelisted  
**When** I navigate to `/dashboard`  
**Then** I see:
- Page title: "Hello World Dashboard"
- Header with user info (name/email from Story 3.6)
- Sign out button (from UserButton component)
- Clean layout with proper spacing and structure
- Loading state while data is being fetched

**And** the page is protected (requires authentication and whitelist)  
**And** the page uses Next.js 15 App Router conventions (`app/dashboard/page.tsx`)  
**And** the layout is responsive (functional on mobile and desktop)  
**And** the page has a clean, functional design (Tailwind CSS)

**Prerequisites:** Story 3.5 (Protected routes), Story 3.6 (User context available)

**Technical Notes:**
- Create `app/dashboard/page.tsx`
- Create `app/dashboard/layout.tsx` for shared dashboard layout (header, user button)
- Implement loading state: `<Suspense fallback={<LoadingSpinner />}>`
- Style with Tailwind CSS: centered content, proper padding, clean typography
- Display page title: `<h1 className="text-3xl font-bold">Hello World Dashboard</h1>`
- Include user greeting: `<p>Welcome, {user.name}!</p>`
- Add navigation structure (for future dashboard pages)

---

### Story 4.2: Database Query API Route

As a **developer**,  
I want **an API route that queries PostgreSQL and returns results**,  
So that **the dashboard can display database data and prove database connectivity works in Cloud Run**.

**Acceptance Criteria:**

**Given** the database contains role/pricing tables with data  
**When** the API route is called  
**Then** it:
- Executes a simple SELECT query: `SELECT * FROM role_profiles LIMIT 10` (or similar)
- Or if tables are empty: `SELECT version()` to return PostgreSQL version info
- Measures query execution time in milliseconds
- Returns JSON response: `{ "data": [...], "query_time_ms": 123, "row_count": 10 }`

**And** if the query fails, return 500 status with error: `{ "error": "Database query failed" }`  
**And** database errors are logged server-side (not exposed to client)  
**And** the route is protected (requires authentication)  
**And** the query completes in <200ms (warm) or <3 seconds (cold start acceptable)

**Prerequisites:** Story 2.2 (Database connection), Story 2.4 (Tables exist), Story 3.5 (Auth protection)

**Technical Notes:**
- Create `app/api/dashboard/hello/route.ts`
- Export `GET` handler
- Check authentication: `const user = await getUser()` (return 401 if not authenticated)
- Import database module: `import { query } from '@/lib/db'`
- Execute query: `const result = await query('SELECT * FROM role_profiles LIMIT 10')`
- Measure time: `const start = Date.now(); ... const duration = Date.now() - start`
- Return JSON: `NextResponse.json({ data: result.rows, query_time_ms: duration })`
- Wrap in try-catch for error handling
- Log errors with context: `console.error('[Dashboard API]', error)`

---

### Story 4.3: Dashboard Data Display Component

As a **collaborator**,  
I want **to see database query results displayed in a table on the dashboard**,  
So that **I can verify the full stack is working (auth → Cloud Run → database → rendering)**.

**Acceptance Criteria:**

**Given** I am on the dashboard page  
**When** the page loads  
**Then** I see:
- Data fetched from the API route (`/api/dashboard/hello`)
- Results displayed in an HTML table with proper formatting
- Table headers: Column names from query result
- Table rows: Data from query result
- Query metadata: "X rows returned in Yms"

**And** if the query is slow (>2 seconds), I see a loading spinner  
**And** if the query fails, I see an error message: "Unable to load data"  
**And** the table is responsive (horizontal scroll on mobile if needed)  
**And** the table has clean styling (alternating row colors, borders, proper spacing)

**Prerequisites:** Story 4.2 (API route returning data), Story 4.1 (Dashboard page exists)

**Technical Notes:**
- Fetch data in `app/dashboard/page.tsx`: `const response = await fetch('/api/dashboard/hello')`
- Parse JSON: `const { data, query_time_ms, row_count } = await response.json()`
- Render table:
  ```tsx
  <table>
    <thead>
      <tr>{Object.keys(data[0]).map(key => <th key={key}>{key}</th>)}</tr>
    </thead>
    <tbody>
      {data.map((row, i) => <tr key={i}>{Object.values(row).map((val, j) => <td key={j}>{val}</td>)}</tr>)}
    </tbody>
  </table>
  ```
- Display metadata: `<p>{row_count} rows returned in {query_time_ms}ms</p>`
- Style with Tailwind: `className="table-auto border-collapse border"`
- Handle loading state: Use Suspense or useState with loading flag
- Handle error state: Display error message if fetch fails

---

### Story 4.4: Query Performance Metric Display

As a **developer**,  
I want **query performance metrics displayed prominently on the dashboard**,  
So that **I can validate database performance meets the <200ms target for warm queries**.

**Acceptance Criteria:**

**Given** the dashboard is displaying query results  
**When** I view the page  
**Then** I see performance metrics:
- Query execution time: "Query executed in Xms"
- Visual indicator: Green if <200ms, yellow if 200-500ms, red if >500ms
- Cold start indicator (if applicable): "⚠️ Database cold start detected" (if >1000ms)

**And** the metric is updated on each page refresh  
**And** the metric is clearly visible (not hidden in console or logs)  
**And** the performance data can be used to validate NFR-1.2 (database query performance)

**Prerequisites:** Story 4.3 (Data display working), Story 4.2 (Query time returned from API)

**Technical Notes:**
- Display query time from API response: `query_time_ms`
- Add visual indicator:
  ```tsx
  const color = query_time_ms < 200 ? 'text-green-600' :
                query_time_ms < 500 ? 'text-yellow-600' : 'text-red-600'
  <p className={color}>Query executed in {query_time_ms}ms</p>
  ```
- Add cold start warning if query_time_ms > 1000ms
- Style prominently (larger font, badge, or callout box)
- Document expected performance in README (warm: <200ms, cold: <3s)

---

### Story 4.5: End-to-End Testing (Manual MVP Validation)

As a **developer**,  
I want **to manually test the complete feature flow through all three environments**,  
So that **I can validate the MVP is complete: ONE feature working dev → staging → production**.

**Acceptance Criteria:**

**Given** the application is deployed to all three environments  
**When** I perform end-to-end testing  
**Then** I verify the following in EACH environment (dev, staging, production):

**1. Authentication Flow:**
- ✅ Landing page loads with sign-in button
- ✅ OAuth sign-in works (Google/GitHub)
- ✅ Whitelisted email allows access to dashboard
- ✅ Non-whitelisted email shows "Access restricted" error
- ✅ Sign out works correctly

**2. Dashboard Functionality:**
- ✅ Dashboard page loads after sign-in
- ✅ User info displayed (name/email)
- ✅ Database query executes successfully
- ✅ Query results displayed in table
- ✅ Query performance metric shown

**3. Infrastructure Validation:**
- ✅ Application responds after cold start (<5 seconds)
- ✅ Database query completes in <200ms (warm) or <3s (cold)
- ✅ Health check endpoint returns 200 OK
- ✅ Logs visible in Cloud Run console
- ✅ No errors in Cloud Run logs during normal operation

**4. Deployment Pipeline:**
- ✅ Code committed to main → Auto-deploys to dev
- ✅ Dev deployment successful and feature works
- ✅ Manual promotion to staging works
- ✅ Staging deployment successful and feature works
- ✅ Manual promotion to production works
- ✅ Production deployment successful and feature works

**And** a testing checklist is documented in `docs/MVP-VALIDATION.md`  
**And** any issues found are documented and resolved before marking MVP complete

**Prerequisites:** All previous stories (complete application), Story 1.10 (All environments deployed)

**Technical Notes:**
- Create `docs/MVP-VALIDATION.md` with testing checklist
- Test each environment sequentially: dev → staging → production
- Document results: screenshot or screen recording of successful flow
- Test edge cases: unauthorized access, database errors, cold starts
- Verify non-functional requirements: performance thresholds, security (HTTPS, cookies)
- Test rollback in dev environment (deploy v1, deploy v2, rollback to v1)
- Mark MVP complete only when ALL acceptance criteria pass in ALL environments

---

### Story 4.6: Documentation Finalization (README and Setup Guides)

As a **new contributor or future maintainer**,  
I want **comprehensive documentation for the entire project**,  
So that **I can understand, run, and deploy the application without needing help**.

**Acceptance Criteria:**

**Given** the MVP is complete and validated  
**When** I read the documentation  
**Then** it includes:

**1. README.md:**
- Project overview and purpose (infrastructure validation)
- Features and tech stack
- Prerequisites (GCP account, Neon account, Node.js 22)
- Local development setup instructions
- Environment variable documentation (.env.example)
- Deployment instructions (how to run CI/CD, promote environments)
- Links to detailed setup guides

**2. docs/infrastructure-setup-neon.md:**
- Step-by-step Neon PostgreSQL setup
- Google Secret Manager configuration
- Cloud Run service creation
- Database migration instructions

**3. docs/neon-auth-setup-guide.md:**
- Neon Auth configuration steps
- OAuth provider setup (Google/GitHub)
- Email whitelist configuration
- Authentication testing

**4. docs/MVP-VALIDATION.md:**
- End-to-end testing checklist
- Expected performance metrics
- Troubleshooting common issues

**5. .env.example:**
- All required environment variables listed with descriptions
- Example values (non-sensitive)

**And** all documentation is up-to-date (reflects current implementation)  
**And** screenshots or code examples included where helpful  
**And** troubleshooting sections address common issues  
**And** links to external documentation (Neon, GCP, Next.js) provided

**Prerequisites:** Story 4.5 (MVP validated and working)

**Technical Notes:**
- Update or create all documentation files
- Review for accuracy: All commands, URLs, and configurations are correct
- Add screenshots from GCP Console, Neon Console (helpful for setup steps)
- Include troubleshooting section in README:
  - Cold start delays
  - Database connection errors
  - OAuth configuration issues
- Format with markdown: headings, code blocks, bullet points
- Spell check and proofread
- Test setup instructions by following them in a fresh environment (if possible)
- Link documents to each other for easy navigation

---

### Story 4.7: Cost Monitoring and Optimization Validation

As a **developer**,  
I want **to verify that monthly infrastructure costs stay within the ~$0-3 target**,  
So that **the MVP validation doesn't incur unexpected expenses**.

**Acceptance Criteria:**

**Given** the application has been running for at least one week  
**When** I review GCP billing and Neon usage  
**Then** I verify:
- **Cloud Run costs**: Effectively $0 (within free tier limits)
  - Free tier: 2 million requests/month, 360,000 GB-seconds, 180,000 vCPU-seconds
  - Verify: Request count, compute time within limits
- **Neon costs**: $0 (permanent free tier)
  - Free tier: 3GB storage, 100 compute hours/month
  - Verify: Compute hours < 100, storage < 3GB
- **Google Secret Manager**: Minimal cost (<$1/month for 3 secrets)
- **Container Registry / Artifact Registry**: Minimal cost (<$1/month for storage)

**And** cost tracking is documented: How to monitor GCP billing and Neon usage  
**And** cost optimization notes included: Scale to zero, Neon auto-suspend  
**And** any unexpected costs are investigated and explained  
**And** monthly cost projection documented in README: "Expected cost: ~$0-3/month"

**Prerequisites:** Story 4.5 (MVP validated), 1 week of running time

**Technical Notes:**
- Check GCP billing console: Billing → Reports → Filter by Cloud Run, Secret Manager, Container Registry
- Check Neon Console: Usage tab → Compute hours, Storage usage
- Document how to access billing:
  - GCP: Console → Billing → Reports
  - Neon: Console → Settings → Usage
- Identify cost drivers (if any): Request volume, compute time, storage
- Optimize if needed:
  - Reduce Cloud Run max instances
  - Optimize Docker image size
  - Verify Neon auto-suspend working
- Document expected usage patterns and costs in README
- Set up billing alerts in GCP (optional): Alert if cost exceeds $5/month

---

## Epic Breakdown Summary

### Total Stories: 38 stories across 4 epics

**Epic 1: Foundation & Deployment Pipeline** (11 stories)
- Project initialization, Docker, CI/CD, Cloud Run setup (3 environments), promotion workflows, rollback

**Epic 2: Database Infrastructure & Connectivity** (6 stories)
- Neon PostgreSQL setup, connection pooling, migrations, schema deployment, health checks, documentation

**Epic 3: Authentication & Access Control** (8 stories)
- Neon Auth setup, OAuth integration, sign-in flow, email whitelist, protected routes, session management, error handling

**Epic 4: Hello World Dashboard (Stack Validation)** (7 stories)
- Dashboard page, API route, data display, performance metrics, end-to-end testing, documentation, cost validation

### Story Sizing Philosophy

Every story is designed for **single-session completion** by a development agent:
- Vertically sliced (complete functionality, not just one layer)
- Clear BDD acceptance criteria (Given/When/Then)
- Sequential dependencies (no forward dependencies)
- Independently valuable when possible

### Critical Path

The **critical path** to MVP completion follows the epic sequence:

1. **Epic 1** → Enables deployment (Stories 1.1-1.11)
2. **Epic 2** → Enables database connectivity (Stories 2.1-2.6)
3. **Epic 3** → Enables authentication (Stories 3.1-3.8)
4. **Epic 4** → Completes validation (Stories 4.1-4.7)

**MVP Complete** when Story 4.5 (End-to-End Testing) passes in all three environments.

### Estimated Effort

Based on story count and complexity:

- **Epic 1**: 3-5 days (infrastructure setup, CI/CD configuration)
- **Epic 2**: 1-2 days (database setup, migrations)
- **Epic 3**: 1-2 days (Neon Auth integration significantly simpler than custom auth)
- **Epic 4**: 2-3 days (dashboard, testing, documentation)

**Total MVP Effort: 7-12 days** (1.5-2.5 weeks)

*Note: This assumes full-time focused work. Adjust for part-time work or interruptions.*

### Ready for Implementation

This epic breakdown is now ready for implementation using the BMM `dev-story` workflow. Each story can be handed to a development agent with clear acceptance criteria and technical guidance.

**Next Steps:**
1. Review and confirm epic breakdown with stakeholders
2. Begin Epic 1, Story 1.1: Project Initialization
3. Use `create-story` workflow to generate detailed implementation plans for each story
4. Track progress in `docs/sprint-status.yaml` or similar

---

_For implementation: Use the `create-story` workflow to generate individual story implementation plans from this epic breakdown._

