# Functional Requirements

## FR-1: Authentication with Neon Auth

**Purpose:** Provide secure, easy-to-use authentication for collaborators using Neon Auth's built-in OAuth and session management.

**Requirements:**

**FR-1.1: OAuth Sign-In Landing Page**
- Public landing page: `/` with sign-in options
- OAuth providers: Google and/or GitHub
- Or email/password authentication (Neon Auth credential-based)
- Use Neon Auth's pre-built `<SignIn />` component
- **Acceptance Criteria:**
  - ✅ Landing page displays sign-in options
  - ✅ OAuth flow works (Google/GitHub)
  - ✅ Users can sign in successfully
  - ✅ Redirects to dashboard after authentication

**FR-1.2: Email Whitelist Access Control**
- Restrict access to whitelisted collaborator emails only
- Check authenticated user's email against whitelist
- Whitelist configured via environment variable or hardcoded list
- Unauthorized users see clear "Access restricted" message
- **Acceptance Criteria:**
  - ✅ Only whitelisted emails can access dashboard
  - ✅ Non-whitelisted users see clear error message
  - ✅ Whitelist can be updated without code changes (env var)
  - ✅ Admin can add/remove emails easily

**FR-1.3: User Data Sync**
- Neon Auth automatically syncs user data to Neon PostgreSQL
- User profiles available for SQL queries
- No custom sync code required
- **Acceptance Criteria:**
  - ✅ User data appears in database after sign-in
  - ✅ User profile includes email, name, OAuth provider
  - ✅ Data updates automatically on profile changes
  - ✅ User data queryable via SQL (for analytics/joins)

**FR-1.4: Session Management (Handled by Neon Auth)**
- Sessions managed automatically by Neon Auth
- Sessions work across Cloud Run container instances
- No custom session tables needed
- **Acceptance Criteria:**
  - ✅ Users stay logged in across requests
  - ✅ Sessions work across multiple Cloud Run instances
  - ✅ Logout functionality works correctly
  - ✅ Session security handled by Neon Auth (HTTP-only cookies, etc.)

## FR-2: Protected Routes & Authorization

**Purpose:** Ensure only authenticated, whitelisted users can access the dashboard.

**FR-2.1: Middleware Protection**
- Protect dashboard route with Neon Auth middleware
- Check authentication status on every request
- Redirect unauthenticated users to sign-in page
- **Acceptance Criteria:**
  - ✅ Unauthenticated users redirected to sign-in
  - ✅ Authenticated users can access dashboard
  - ✅ Protection works across all Cloud Run instances
  - ✅ No bypass possible (server-side validation)

**FR-2.2: Email Whitelist Enforcement**
- Server-side check of user email against whitelist
- Applied on every protected route request
- Unauthorized users cannot access dashboard
- **Acceptance Criteria:**
  - ✅ Email check happens server-side (not client-side only)
  - ✅ Non-whitelisted users get 403 Forbidden
  - ✅ Clear error message displayed
  - ✅ No way to bypass check

**FR-2.3: User Context in Dashboard**
- Display authenticated user's name and email
- Show `<UserButton />` component (Neon Auth built-in)
- User can sign out from dashboard
- **Acceptance Criteria:**
  - ✅ User's name displayed in dashboard
  - ✅ UserButton shows profile menu
  - ✅ Sign out works correctly
  - ✅ User redirected to sign-in after logout

## FR-3: Hello World Dashboard

**Purpose:** Single protected page that validates complete stack (auth, database, rendering).

**FR-3.1: Dashboard Page**
- Protected route: `/dashboard` or `/hello`
- Requires authenticated user (Neon Auth)
- Displays authenticated user's info (name, email)
- Displays data fetched from PostgreSQL
- Shows query execution time in milliseconds
- **Acceptance Criteria:**
  - ✅ Page accessible only to authenticated users
  - ✅ Unauthenticated users redirected to sign-in
  - ✅ User info displayed correctly
  - ✅ Data displays correctly
  - ✅ Query time metric shown

**FR-3.2: Database Query**
- Execute simple SELECT query against existing role/pricing tables
- Example: `SELECT * FROM role_profiles LIMIT 10` or `SELECT version()`
- Measure and return query execution time
- Handle query errors gracefully
- **Acceptance Criteria:**
  - ✅ Query executes successfully
  - ✅ Query completes in <200ms (warm, target)
  - ✅ Results returned in structured format
  - ✅ Query errors display user-friendly message

**FR-3.3: Data Display**
- Render query results as HTML table
- Columns: Dynamic based on query result schema
- Rows: Display all returned data
- Display query metadata: row count, execution time
- **Acceptance Criteria:**
  - ✅ Table renders with proper headers
  - ✅ Data displays in rows with alternating colors
  - ✅ Metadata shown: "X rows returned in Yms"
  - ✅ Empty results handled gracefully

**FR-3.4: User Interface Elements**
- Display authenticated user info (name, email)
- `<UserButton />` component for profile/sign-out (Neon Auth)
- Page title: "Hello World Dashboard"
- (Future: Navigation menu when more pages added)
- **Acceptance Criteria:**
  - ✅ User info displayed from Neon Auth
  - ✅ UserButton component renders correctly
  - ✅ Sign out works via UserButton
  - ✅ Page title/heading displayed

## FR-4: Multi-Environment Deployment

**Purpose:** Validate three-environment promotion workflow (dev → staging → production).

**FR-4.1: Development Environment**
- Auto-deploy on commit to `main` branch
- Cloud Run service: `role-directory-dev`
- Database: `role_directory_dev` (Cloud SQL)
- Public URL: `https://role-directory-dev-[hash].run.app`
- **Acceptance Criteria:**
  - ✅ Commit to main triggers GitHub Actions workflow
  - ✅ Build completes successfully (lint, type check, build)
  - ✅ Deploys to dev Cloud Run service
  - ✅ Health check passes post-deployment
  - ✅ Application accessible at dev URL

**FR-4.2: Staging Environment**
- Manual promotion from dev environment
- Cloud Run service: `role-directory-stg`
- Database: `role_directory_stg` (Cloud SQL)
- Public URL: `https://role-directory-stg-[hash].run.app`
- **Acceptance Criteria:**
  - ✅ Manual workflow trigger promotes dev to staging
  - ✅ Same container image deployed (no rebuild)
  - ✅ Staging environment variables injected
  - ✅ Health check passes
  - ✅ Application accessible at staging URL

**FR-4.3: Production Environment**
- Manual promotion from staging environment
- Cloud Run service: `role-directory-prd`
- Database: `role_directory_prd` (Cloud SQL)
- Public URL: `https://role-directory-prd-[hash].run.app` (or custom domain)
- **Acceptance Criteria:**
  - ✅ Manual workflow trigger promotes staging to production
  - ✅ Same container image deployed (validated in staging)
  - ✅ Production environment variables injected
  - ✅ Health check passes
  - ✅ Application accessible at production URL

**FR-4.4: CI/CD Pipeline**
- GitHub Actions workflow for dev deployment
- Stages: Lint → Type Check → Build → Deploy to Dev → Health Check
- Manual promotion workflows for staging and production
- Rollback capability via Cloud Run revision management
- **Acceptance Criteria:**
  - ✅ Pipeline runs on every commit to main
  - ✅ All stages complete successfully
  - ✅ Failed stage stops pipeline (no deploy on failure)
  - ✅ Manual promotion workflows accessible
  - ✅ Rollback to previous revision possible

**FR-4.5: Environment-Specific Configuration**
- Separate `DATABASE_URL` per environment
- Separate `SESSION_SECRET` per environment
- `NODE_ENV` set correctly per environment
- Secrets managed in Google Secret Manager
- **Acceptance Criteria:**
  - ✅ Each environment connects to correct database
  - ✅ Environment variables inject correctly
  - ✅ Secrets not exposed in logs or repository
  - ✅ Configuration mismatch caught in health check

## FR-5: Database Infrastructure

**Purpose:** Provide PostgreSQL database access for all environments.

**FR-5.1: Neon PostgreSQL Setup**
- Three separate Neon PostgreSQL databases (free tier)
- Databases: `role_directory_dev`, `role_directory_stg`, `role_directory_prd`
- Serverless PostgreSQL (auto-suspend when idle)
- TLS/SSL encrypted connections (required, automatic)
- Built-in connection pooling by Neon
- **Acceptance Criteria:**
  - ✅ Neon account created (free tier)
  - ✅ Three databases created and accessible
  - ✅ Cloud Run can connect via standard PostgreSQL protocol
  - ✅ Connection strings stored in Google Secret Manager
  - ✅ TLS/SSL enabled (sslmode=require)

**FR-5.2: Database Schema**
- **Neon Auth tables** (auto-created by Neon Auth):
  - User profiles, sessions, OAuth providers
  - Automatically managed by Neon Auth
- **Existing tables**: `role_profiles`, `profile_pricing`, etc. (from sql/ directory)
- Migration scripts only for existing role/pricing tables
- Same schema deployed to all three databases
- **Acceptance Criteria:**
  - ✅ Neon Auth tables created automatically on first sign-in
  - ✅ Existing role/pricing tables present (manual migration)
  - ✅ Schema identical across all three databases
  - ✅ User data syncing correctly to database

**FR-5.3: Connection Pooling**
- Use connection pooling library (pg-pool or Prisma)
- Handle Cloud Run cold starts (connection retry logic)
- Handle Neon cold starts (database auto-resume after idle)
- Pool configuration: Max 3-5 connections per Cloud Run instance
- Graceful degradation on connection failures
- **Acceptance Criteria:**
  - ✅ Connection pool configured in application
  - ✅ Application cold start doesn't crash
  - ✅ Database cold start handled gracefully (2-3s delay acceptable)
  - ✅ Connection failures return user-friendly error
  - ✅ Retry logic with exponential backoff

**FR-5.4: Database Migrations**
- Manual migration execution before deployment (MVP approach)
- Migration tool: Prisma Migrate, Knex, or raw SQL
- Separate migration execution per environment (dev → stg → prd)
- Rollback capability for failed migrations
- **Acceptance Criteria:**
  - ✅ Migrations can be run manually against Neon databases
  - ✅ Migration state tracked (no duplicate runs)
  - ✅ Rollback possible if migration fails
  - ✅ Instructions documented for running migrations
  - ✅ Same migrations work for both Neon and Cloud SQL (future migration)

## FR-6: Containerization & Docker

**Purpose:** Package application for Cloud Run deployment.

**FR-6.1: Dockerfile**
- Multi-stage build: Build stage + Production stage
- Node.js 22.x base image
- Install dependencies, build Next.js, run production server
- Optimize for small image size (<500MB target)
- **Acceptance Criteria:**
  - ✅ Dockerfile builds successfully
  - ✅ Image size <500MB (or documented reason if larger)
  - ✅ Application runs in container locally
  - ✅ Production build (not dev server)

**FR-6.2: Environment Variable Injection**
- Accept environment variables at runtime (not build time)
- Required: DATABASE_URL, SESSION_SECRET, NODE_ENV, PORT
- Default PORT=8080 (Cloud Run standard)
- **Acceptance Criteria:**
  - ✅ Container starts with environment variables
  - ✅ Missing required variables cause startup failure with clear error
  - ✅ Variables not baked into image

**FR-6.3: Health Check Endpoint**
- Route: `GET /api/health` or `GET /health`
- Returns 200 OK with basic status
- Optional: Check database connectivity
- Used by Cloud Run and CI/CD pipeline
- **Acceptance Criteria:**
  - ✅ Health endpoint returns 200 when healthy
  - ✅ Returns 500 if critical issues (database down)
  - ✅ Response time <1 second

---
