# role-directory - Product Requirements Document

**Author:** danielvm  
**Date:** 2025-11-06  
**Version:** 1.0

---

## Executive Summary

role-directory is a Next.js web application designed primarily to **validate a production-ready deployment infrastructure** on Google Cloud Run. The application implements time-limited invitation code access control, enabling secure collaboration with trusted stakeholders during development while maintaining confidentiality. 

The core value proposition is **infrastructure confidence**: validating the complete deployment pipeline (dev → stg → prd), database connectivity, CI/CD automation, and Cloud Run deployment patterns *before* investing in complex application features.

This is a *deployment proving ground* with useful collaboration features, not a feature-rich application seeking deployment infrastructure.

### What Makes This Special

**The magic of role-directory is infrastructure de-risking.** 

Every feature serves to validate another piece of the deployment stack: invitation codes prove authentication flow and session management work in Cloud Run; the dashboard proves database connectivity and file system access; multiple environments prove CI/CD and promotion workflows function correctly.

Success means danielvm can commit code with confidence, knowing the entire pipeline - from GitHub Actions to Cloud Run to PostgreSQL - has been battle-tested with real features, not toy examples.

---

## Project Classification

**Technical Type:** Web Application (Next.js SPA with App Router)  
**Domain:** General Software  
**Complexity:** Low-Medium (infrastructure focus, standard web patterns)

**Classification Details:**

- **Architecture**: Server-side rendered React application with API routes
- **Deployment Model**: Containerized (Docker) → Cloud Run (serverless)
- **Database**: PostgreSQL with connection pooling (cloud-optimized)
- **Authentication**: Custom session-based (invitation codes + server-side sessions)
- **CI/CD**: GitHub Actions with multi-environment promotion workflow
- **Scale**: Low traffic expected during MVP (proof-of-concept usage)

**Infrastructure-First Approach:**

This project inverts the typical development flow. Rather than building features and figuring out deployment later, we're **building just enough features to thoroughly validate deployment infrastructure**. Each capability tests a different infrastructure concern:

- Invitation codes → Session management in serverless environment
- Admin interface → Protected routes and authorization patterns
- Dashboard pages → Database queries and file system access
- Three environments → CI/CD pipeline and promotion workflows
- Docker deployment → Container optimization and Cloud Run specifics

---

## Success Criteria

**Primary Success: Infrastructure Validation**

✅ **Deployment Pipeline Confidence**
- GitHub Actions successfully builds, tests, and deploys on every commit
- Dev environment auto-deploys from `main` branch without manual intervention
- Staging promotion works smoothly (manual gate validated)
- Production promotion works smoothly (manual gate validated)
- Rollback procedures understood and tested

✅ **Cloud Run Validation**
- Application starts successfully in Cloud Run environment
- Cold starts are acceptable (<5 seconds for first request)
- Environment variables and secrets inject correctly
- Logging and error reporting work as expected
- Container size optimized (<500MB if possible)

✅ **Database Connectivity**
- PostgreSQL connection succeeds from Cloud Run
- Connection pooling handles serverless constraints (frequent cold starts)
- Queries execute with acceptable latency (<200ms for simple queries)
- Database migrations can be run safely
- Connection secrets managed securely

✅ **Session Management in Serverless**
- Server-side sessions work correctly across Cloud Run instances
- Session persistence survives container restarts
- 24-hour expiry enforced reliably
- No session leakage or security issues

**Secondary Success: Collaboration Enablement**

✅ **Access Control Functions**
- Valid invitation codes grant 24-hour access
- Expired codes properly rejected with clear messaging
- Multiple users can share the same code (reusable codes work)
- Admin can generate new codes easily

✅ **Functional Validation**
- Collaborators can view Hello World page with database data (proves full stack)
- Collaborators can view workflow status YAML (proves file system access)
- Collaborators can view sprint status YAML (when it exists)
- UI is functional, not necessarily beautiful

**Definition of Done**

The MVP is complete when **one complete feature flows successfully through all three environments**:

1. Code committed to `main` branch
2. CI/CD pipeline runs (lint, test, build)
3. Auto-deploys to Dev environment
4. Manually promoted to Staging
5. Validated in Staging
6. Manually promoted to Production
7. Feature works correctly in Production

**Specific Thresholds:**

- **Cold Start Performance**: <5 seconds acceptable for first request (serverless constraint understood)
- **Query Performance**: <200ms for simple database queries (SELECT with basic WHERE clause)
- **Database Strategy**: Separate databases per environment (dev, stg, prd) to validate migrations independently
- **Migration Strategy**: Manual migration step before deployment (safer for initial validation)
- **Rollback Strategy**: Manual rollback sufficient (via Cloud Run revision management)

**Metrics That Don't Matter (Yet)**

❌ User engagement or retention (this isn't production yet)  
❌ SEO or discoverability (access is invitation-only)  
❌ Performance beyond "acceptable" (no scale requirements)  
❌ Feature completeness (complex features explicitly deferred)  
❌ Uptime SLAs or high availability (not mission-critical during validation)

---

## Product Scope

### MVP - Minimum Viable Product

**Goal: Validate three-environment deployment workflow with one complete feature**

**Critical Path (In Priority Order):**

**1. Authentication with Neon Auth**
- OAuth sign-in (Google, GitHub, or other providers)
- Or email/password authentication (if OAuth not preferred)
- Email whitelist for access control (restrict to collaborators only)
- User data automatically synced to Neon PostgreSQL database
- Session management handled by Neon Auth (built-in)
- Pre-built UI components (`<SignIn />`, `<UserButton />`)
- **Initial Setup**: Configure OAuth providers in Neon Console, whitelist emails in code

**2. Single Protected Page: "Hello World" Dashboard**
- **ONE page that proves the entire stack:**
  - Requires authenticated user (OAuth or email/password via Neon Auth)
  - Fetches and displays data from PostgreSQL (proves database connectivity)
  - Simple query: SELECT from existing role/pricing tables or version info
  - Displays authenticated user info from Neon Auth
  - Renders query results as formatted display (proves full request cycle)
- **This single page validates**: OAuth → Neon Auth → Session → Cloud Run → PostgreSQL → Rendering

**3. Full Three-Environment Deployment Pipeline**
- **Dockerized Next.js Application**
  - Multi-stage build for size optimization
  - Production-ready Dockerfile
  - Environment variable injection (database URLs, secrets)
- **GitHub Actions CI/CD - Simplified Initial Pipeline**
  - Trigger on commit to `main`
  - Stages: **Lint → Type Check → Build → Deploy to Dev**
  - Manual promotion workflows: Dev → Staging, Staging → Production
  - Basic health check after deployment (HTTP 200 check)
- **Three Environments (Core Validation)**
  - **Dev**: Auto-deploy on commit to `main`, rapid iteration
  - **Staging**: Manual promotion from Dev, stable validation
  - **Production**: Manual promotion from Staging, protected showcase
  - Each environment has separate Cloud Run service + separate PostgreSQL database

**4. Database Schema (MVP Tables)**
- **Neon Auth Tables** (auto-created by Neon Auth):
  - User profiles, authentication data, sessions
  - Automatically synced by Neon Auth (no custom code needed)
- *(Periodic Table sample data loaded for Hello World page queries)*
- **No custom auth tables needed** - Neon Auth handles all user/session data

**5. Initial Testing Strategy (Minimal)**
- **CI Pipeline**: Lint (ESLint) + Type Check (TypeScript) + Build verification
- **Manual Testing**: Verify OAuth sign-in and Hello World dashboard work in each environment
- *(Comprehensive automated tests deferred to Growth phase)*

### Growth Features (Post-MVP)

**Phase 2: Testing & Quality Automation** *(Deferred from MVP)*
- **Unit & Integration Tests**: Vitest + React Testing Library (70%+ coverage target)
  - Test: Code validation logic, session management, API routes
- **API Integration Tests**: Supertest + Vitest (100% API route coverage)
  - Test: All endpoints, authentication, error cases
- **E2E Smoke Tests**: Playwright (5-10 critical user flows)
  - Test: Code entry → access, expiry handling, page rendering
- Add test stages to CI/CD pipeline (after build, before deploy)

**Phase 3: Admin Interface & Enhanced Access Control**
- **Admin UI** for code generation (instead of SQL scripts)
  - Generate new invitation codes (random alphanumeric, 8-12 characters)
  - View active codes with expiry timestamps
  - Protected by environment variable or simple admin password
- Usage analytics per code (how many users, when accessed)
- Limit number of uses per code (configurable)
- Admin dashboard with access logs and usage trends

**Phase 4: Additional Dashboard Pages** *(Deferred from MVP)*
- **Workflow Status Page**: Displays `docs/bmm-workflow-status.yaml`
  - Reads file from file system, proves file access in Cloud Run
- **Sprint Status Page**: Displays `docs/sprint-status.yaml`
  - Same pattern, graceful handling if file doesn't exist

**Phase 5: Monitoring & Operations**
- Structured logging with log levels (info, warn, error)
- Error tracking integration (Sentry or similar)
- Basic metrics dashboard (request counts, error rates)
- Automated health checks and alerting
- Email notifications when codes are generated or used

**Phase 6: Enhanced Features** *(Future)*
- Additional data visualization
- Advanced search capabilities
- Performance optimization
- Analytics integration

### Vision (Future)

**Phase 7: Public Launch**
- Remove or make invitation codes optional (early access mode)
- User accounts and authentication (if needed)
- Public marketing site
- Full feature set with validated infrastructure

---

## Out of Scope for MVP

**Explicitly NOT included to maintain focus on infrastructure validation:**

❌ **Multiple dashboard pages** - ONE page (Hello World) is sufficient to prove the stack  
❌ **Custom authentication system** - Using Neon Auth instead (faster, more robust)  
❌ **Automated testing in CI/CD** - Lint + Type Check + Build only; tests added in Phase 2  
❌ **File system access validation** - Deferred to Phase 4 (workflow/sprint status pages)  
❌ **Monitoring and alerting** - Basic Cloud Run logging sufficient initially  
❌ **Email notifications** - Not needed for MVP validation  
❌ **Advanced permissions/roles** - Email whitelist sufficient for MVP  
❌ **Complex business features** - Focus is infrastructure validation  
❌ **UI polish or design** - Functional only; aesthetics deferred  
❌ **SEO, analytics, or marketing** - OAuth-only access, no public discovery needed

---

---

## Web Application Specific Requirements

### Browser & Platform Support

**MVP: Modern Browsers Only**
- Chrome, Firefox, Safari, Edge (last 2 versions)
- No IE11 support (not needed for infrastructure validation)
- Desktop-first with basic responsive layout (functional on mobile, not polished)
- Basic keyboard navigation (tab order, enter/space for buttons)
- *(Full WCAG compliance and legacy browser support deferred to future phases)*

### API Endpoints

**Minimal API surface to support core features:**

**Authentication Endpoints:**
- `POST /api/auth/validate-code` - Validate invitation code, create session
  - Request: `{ code: string }`
  - Response: `{ success: boolean, error?: string }`
  - Sets session cookie on success
- `POST /api/auth/logout` - Destroy session
  - Response: `{ success: boolean }`
- `GET /api/auth/check-session` - Verify current session validity
  - Response: `{ valid: boolean, expires_at?: string }`

**Dashboard Endpoints:**
- `GET /api/dashboard/hello` - Fetch data from PostgreSQL for Hello World page
  - Requires valid session
  - Response: `{ data: any[], query_time_ms: number }`
  - Query: Simple SELECT from Periodic Table sample data or database version info

**Future Endpoints (Deferred):**
- Admin code generation endpoints (Phase 3)
- Workflow/sprint status file endpoints (Phase 4)
- Additional data endpoints (Phase 6)

### Session Management

**Database-Backed Sessions (Serverless-Optimized)**

**Requirements:**
- Server-side session storage in PostgreSQL `access_sessions` table
- HTTP-only secure cookies containing session ID (not session data)
- 24-hour TTL enforced on every request (check `expires_at`)
- Session refresh: Update `last_accessed` timestamp on each request
- Expired sessions: Automatic cleanup via database trigger or scheduled job
- No client-side storage of sensitive data

**Session Flow:**
1. User submits valid invitation code
2. Backend validates code against `invitation_codes` table
3. Create new session record in `access_sessions` table
4. Return session ID in HTTP-only cookie
5. Subsequent requests: Verify session ID exists and hasn't expired
6. On expiry: Clear cookie, redirect to code entry page

**Cloud Run Considerations:**
- Sessions must work across multiple container instances (stateless)
- Database connection pooling required (pg-pool library)
- Handle cold starts gracefully (connection retry logic)

### Environment Configuration

**Required Environment Variables (Per Environment):**

**Database:**
- `DATABASE_URL` - PostgreSQL connection string
  - Format: `postgresql://user:password@host:port/database`
  - Separate database per environment (dev, stg, prd)

**Neon Auth:**
- `NEON_AUTH_PROJECT_ID` - Neon Auth project identifier
- `NEON_AUTH_SECRET_KEY` - Neon Auth secret key (per environment)
- OAuth provider credentials (Google/GitHub client ID & secret)

**Application:**
- `NODE_ENV` - Environment name: `development`, `staging`, `production`
- `PORT` - Cloud Run port (default: 8080)
- `ALLOWED_EMAILS` - Comma-separated whitelist for access control (optional)

**Secrets Management:**
- Store in Google Secret Manager (not in repository)
- Inject via Cloud Run environment variables
- Neon Auth secrets managed through Neon Console

### PostgreSQL Infrastructure

**Cost-Optimized Setup: Neon PostgreSQL (Serverless)**

**Selected Provider: Neon PostgreSQL Free Tier**
- **Serverless PostgreSQL** - Auto-suspend when idle (zero cost at rest)
- **Storage**: 3GB included (free tier)
- **Compute**: 100 hours/month included (sufficient for MVP testing)
- **Cost**: **$0/month** (permanent free tier, not trial)
- **Standard PostgreSQL** - Full compatibility with existing schema

**Why Neon for MVP:**
- ✅ Zero cost for infrastructure validation phase
- ✅ True serverless (aligns with Cloud Run serverless architecture)
- ✅ Standard PostgreSQL protocol (no code changes vs Cloud SQL)
- ✅ Easy migration path to Cloud SQL when moving to production scale
- ✅ 3GB storage sufficient for MVP with sample data + session data
- ⚠️ Cold start: ~2-3 seconds after idle period (acceptable for validation)
- ⚠️ Not GCP-native (external service, connects via public internet)

**Per-Environment Setup (SELECTED):**
- **Three separate Neon databases** (all on free tier)
  - `role_directory_dev` - Development environment
  - `role_directory_stg` - Staging environment  
  - `role_directory_prd` - Production environment
  - Each environment gets independent database and connection string
  - Branch databases feature enables easy schema testing
  - Zero cost for all three environments

**Connection Pattern:**
- Standard PostgreSQL connection over public internet
- Connection string format: `postgresql://user:pass@ep-xxx.region.neon.tech/dbname?sslmode=require`
- Store connection strings in Google Secret Manager
- Built-in connection pooling (no pgBouncer needed)
- TLS/SSL encryption by default

**Migration Strategy:**
- Use migration tool (Prisma Migrate, Knex, or raw SQL files)
- Manual migration execution before deployment (MVP approach)
- Same PostgreSQL migrations work for both Neon and Cloud SQL
- Future migration to Cloud SQL: `pg_dump` → `pg_restore` (zero code changes)

**Future Migration Path:**
When ready for production scale or GCP-native requirement:
1. Export data from Neon: `pg_dump`
2. Create Cloud SQL instance
3. Import data: `pg_restore`
4. Update `DATABASE_URL` environment variable
5. Zero application code changes needed

---

## User Experience Principles

**Goal: Functional clarity over visual polish**

### Visual Design

**Clean and Functional Approach:**
- Use UI component library for speed (Tailwind CSS + shadcn/ui recommended)
- Simple layout: centered forms, clear hierarchy, adequate whitespace
- Minimal color palette: Primary action color, error red, neutral grays
- System fonts (no custom typography needed)
- No animations or transitions (unless provided by component library)
- Responsive grid: Single column on mobile, multi-column on desktop where appropriate

**Priority: Fast to build, easy to maintain**

### Key User Flows

**1. Invitation Code Entry**
- Landing page with centered code input form
- Clear call-to-action: "Enter Invitation Code"
- Real-time validation feedback (client-side format check)
- Clear success state: Immediate redirect to dashboard
- Clear error states (see Error Handling below)

**2. Authenticated Dashboard Experience**
- Simple navigation (if multiple pages exist in future)
- Hello World page displays query results clearly
- Table format for database results (sortable if easy, not required)
- Query performance metric displayed: "Query executed in Xms"
- Logout button clearly visible

**3. Session Expiry Handling**
- Session expiry detected on any protected page request
- Clear message: "Your session has expired (24-hour limit)"
- Automatic redirect to code entry page after 3 seconds (or immediate with button)
- Allow user to enter new code without losing context

### Error Handling

**Helpful and Specific:**

**Invalid Code Errors:**
- "Code not found. Please check your code and try again."
- "Code has expired. Please request a new code."
- "Code format invalid. Codes are 8-12 alphanumeric characters."

**Session Errors:**
- "Your session has expired. Please enter a new invitation code."
- "Session not found. Please log in again."

**Database/System Errors:**
- "Unable to connect to database. Please try again in a moment."
- "An unexpected error occurred. Please contact the administrator."
- (Include error ID for debugging in logs, not shown to user)

**Form Validation:**
- Inline validation with red border + error message below field
- Disable submit button until valid input provided
- Loading state during submission ("Validating code...")

### Interaction Patterns

**Forms:**
- Single-column layout
- Labels above inputs
- Focus state clearly visible (outline)
- Enter key submits form

**Buttons:**
- Primary: Solid background (call-to-action)
- Secondary: Outline or ghost style
- Disabled state: Reduced opacity + no hover effect
- Loading state: Spinner + "Processing..." text

**Data Display:**
- Tables for structured data (Hello World query results)
- Alternating row colors for readability
- Monospace font for technical data (database version, IDs)
- Responsive tables: Horizontal scroll on mobile if needed

**No Complex Interactions Required:**
- No drag-and-drop
- No modals or overlays (unless component library makes them trivial)
- No real-time updates or WebSockets
- No interactive charts or visualizations

---

## Functional Requirements

### FR-1: Authentication with Neon Auth

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

### FR-2: Protected Routes & Authorization

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

### FR-3: Hello World Dashboard

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
- Execute simple SELECT query against Periodic Table sample data
- Example: `SELECT * FROM periodic_table ORDER BY "AtomicNumber" LIMIT 10` or `SELECT version()`
- Sample data from: [Neon Periodic Table Dataset](https://neon.com/docs/import/import-sample-data#periodic-table-data)
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

### FR-4: Multi-Environment Deployment

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

### FR-5: Database Infrastructure

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
- **Sample data**: `periodic_table` (118 elements - from [Neon sample datasets](https://neon.com/docs/import/import-sample-data#periodic-table-data))
- Migration scripts for initial schema and sample data
- Same schema deployed to all three databases
- **Acceptance Criteria:**
  - ✅ Neon Auth tables created automatically on first sign-in
  - ✅ Periodic Table sample data loaded via migration
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

### FR-6: Containerization & Docker

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

## Non-Functional Requirements

### NFR-1: Performance

**Rationale:** Serverless Cloud Run has cold start constraints; user experience degrades with slow responses.

**Requirements:**

**NFR-1.1: Cold Start Performance**
- Target: Application responds within 5 seconds on cold start
- Acceptable: Up to 10 seconds (serverless constraint understood)
- Measurement: First request after container idle period
- **Acceptance Criteria:**
  - ✅ 90% of cold starts complete within 5 seconds
  - ✅ 100% of cold starts complete within 10 seconds
  - ✅ Cold start time logged for monitoring

**NFR-1.2: Warm Request Performance**
- Target: API responses within 500ms (excluding database query time)
- Database queries: <200ms for simple SELECT statements (warm)
- Page load: <2 seconds time-to-interactive (warm)
- **Acceptance Criteria:**
  - ✅ Code validation API: <500ms response time (warm)
  - ✅ Dashboard page: <2 seconds full page load (warm)
  - ✅ Database queries: <200ms for 10-row SELECT (warm)
  - ✅ Health check: <100ms response time (warm)

**NFR-1.3: Database Cold Start Handling (Neon Serverless)**
- Neon auto-suspends after ~5 minutes of inactivity
- First query after suspend: ~2-3 seconds resume time
- Subsequent queries: <100ms (normal PostgreSQL performance)
- Acceptable for MVP infrastructure validation
- **Acceptance Criteria:**
  - ✅ Application handles database cold starts gracefully (no crash)
  - ✅ User sees loading state during cold start
  - ✅ Cold start logged for monitoring
  - ✅ Warm performance meets <200ms target

**NFR-1.4: Database Connection Pool Efficiency**
- Neon includes built-in connection pooling (no pgBouncer needed)
- Connections managed by Neon infrastructure
- Client-side connection pooling via pg-pool or Prisma
- **Acceptance Criteria:**
  - ✅ Connection pool configured in application
  - ✅ Connections reused across requests
  - ✅ Connection timeout set (5 seconds max)
  - ✅ Failed connections retry with exponential backoff

**Out of Scope:**
- Load testing or stress testing (low traffic expected)
- CDN or caching optimization (premature for MVP)
- Query optimization beyond basic indexing

---

### NFR-2: Security

**Rationale:** Handles session authentication and database access; basic security essential.

**Requirements:**

**NFR-2.1: Session Security**
- HTTP-only cookies (prevent XSS access to session ID)
- Secure flag enabled in production (HTTPS only)
- Session ID cryptographically random (UUID v4 or similar)
- Session signing with `SESSION_SECRET` to prevent tampering
- **Acceptance Criteria:**
  - ✅ Cookies marked HTTP-only
  - ✅ Cookies marked Secure in production
  - ✅ Session IDs are UUIDs or equivalent randomness
  - ✅ Tampered session IDs rejected

**NFR-2.2: Database Security**
- Database credentials stored in Google Secret Manager (not in code/env files)
- TLS/SSL encrypted connection (required by Neon, automatic)
- Database connection string includes `sslmode=require`
- Database user has minimum required permissions (no superuser)
- No SQL injection vulnerabilities (use parameterized queries)
- **Acceptance Criteria:**
  - ✅ Connection string stored in Secret Manager
  - ✅ Connection uses TLS/SSL (sslmode=require)
  - ✅ Database user limited to required tables/operations
  - ✅ All queries use parameterized inputs (no string concatenation)
  - ✅ No credentials exposed in logs or client-side code

**NFR-2.3: Input Validation**
- Client-side validation: Code format (8-12 alphanumeric)
- Server-side validation: Always validate, never trust client
- SQL injection prevention: Parameterized queries only
- XSS prevention: Escape all user input in HTML output
- **Acceptance Criteria:**
  - ✅ Client-side validation prevents bad format submission
  - ✅ Server-side validation rejects invalid input
  - ✅ Parameterized queries used throughout
  - ✅ HTML output properly escaped (React default behavior)

**NFR-2.4: Secrets Management**
- No secrets in repository (use .env.example templates only)
- Secrets injected via Cloud Run environment variables
- Secret rotation supported (change secrets without code deploy)
- **Acceptance Criteria:**
  - ✅ No secrets in git history
  - ✅ .gitignore excludes .env files
  - ✅ Secrets injectable via Cloud Run console/CLI
  - ✅ Application restarts pick up new secrets

**Out of Scope:**
- Rate limiting or DDoS protection (Cloud Run provides basic protection)
- Advanced authentication (OAuth, MFA, SSO)
- Vulnerability scanning or penetration testing
- Compliance certifications (SOC2, ISO 27001, etc.)

---

### NFR-3: Reliability

**Rationale:** Need confidence in deployment stability, but not mission-critical uptime.

**Requirements:**

**NFR-3.1: Error Handling**
- All API routes have try-catch error handling
- Database errors caught and logged (not exposed to user)
- User-friendly error messages (see UX section)
- Errors include correlation ID for debugging
- **Acceptance Criteria:**
  - ✅ No unhandled promise rejections
  - ✅ Database errors return user-friendly message
  - ✅ Error details logged to Cloud Run logs
  - ✅ Correlation ID included in error response

**NFR-3.2: Graceful Degradation**
- Database connection failure: Show error page, don't crash
- Session validation failure: Redirect to code entry
- Health check reflects actual system state
- **Acceptance Criteria:**
  - ✅ Database down → Error page displayed
  - ✅ Invalid session → Redirect to code entry
  - ✅ Health check returns 500 when database unreachable
  - ✅ Application doesn't crash on transient errors

**NFR-3.3: Logging**
- Cloud Run standard logging (stdout/stderr)
- Log levels: INFO, WARN, ERROR
- Structured logs preferred (JSON format)
- Include: Timestamp, log level, message, correlation ID
- **Acceptance Criteria:**
  - ✅ Logs visible in Cloud Run console
  - ✅ Error logs include stack traces
  - ✅ Request logs include method, path, status code
  - ✅ Sensitive data not logged (passwords, session IDs)

**NFR-3.4: Rollback Capability**
- Cloud Run maintains revision history
- Previous revision can be activated via console/CLI
- Database migrations support rollback (down migrations)
- **Acceptance Criteria:**
  - ✅ Previous Cloud Run revision available
  - ✅ Rollback to previous revision possible
  - ✅ Migration rollback documented
  - ✅ Rollback tested at least once

**Out of Scope:**
- High availability or multi-region deployment
- Automatic failover or disaster recovery
- SLA guarantees (uptime percentage)
- Advanced monitoring or alerting (Datadog, New Relic, etc.)

---

### NFR-4: Maintainability

**Rationale:** Code should be easy to understand and modify; infrastructure validation project may be reference for future work.

**Requirements:**

**NFR-4.1: Code Quality**
- TypeScript for type safety (Next.js 15 + TypeScript 5.8)
- ESLint configured with recommended rules
- Consistent code formatting (Prettier)
- **Acceptance Criteria:**
  - ✅ TypeScript compilation passes with no errors
  - ✅ ESLint runs in CI pipeline (no errors)
  - ✅ Prettier configured
  - ✅ Type coverage >90% (minimal `any` usage)

**NFR-4.2: Documentation**
- README with setup instructions
- Environment variable documentation (.env.example)
- Database migration instructions
- CI/CD workflow documentation
- **Acceptance Criteria:**
  - ✅ README explains project purpose and setup
  - ✅ .env.example lists all required variables
  - ✅ Migration instructions documented
  - ✅ CI/CD workflows have inline comments

**NFR-4.3: Project Structure**
- Next.js App Router conventions
- Clear separation: routes, components, lib (utilities), types
- Database code isolated in lib/db or similar
- **Acceptance Criteria:**
  - ✅ Standard Next.js folder structure
  - ✅ Components reusable (not route-specific unless necessary)
  - ✅ Database access layer centralized
  - ✅ Type definitions in dedicated files

**Out of Scope:**
- Comprehensive inline code comments (code should be self-documenting)
- API documentation (Swagger/OpenAPI) - only 4 endpoints
- Architecture diagrams (premature for MVP)

---

### NFR-5: Scalability

**Rationale:** Minimal scale requirements for MVP; validate that architecture *can* scale.

**Requirements:**

**NFR-5.1: Horizontal Scaling (Cloud Run)**
- Cloud Run auto-scales based on request volume
- Application is stateless (sessions in database, not memory)
- Multiple instances can run concurrently
- **Acceptance Criteria:**
  - ✅ Application runs correctly with multiple instances
  - ✅ No shared in-memory state between requests
  - ✅ Cloud Run auto-scaling enabled (default)
  - ✅ Max instances capped at 10 (cost control)

**NFR-5.2: Database Connection Limits**
- Neon free tier: Reasonable connection limits (100+ concurrent)
- Each Cloud Run instance limited to 3-5 connections (pool)
- Neon auto-suspends after inactivity (saves compute hours)
- Connection pool doesn't leak connections
- **Acceptance Criteria:**
  - ✅ Connection pool max = 3-5 per Cloud Run instance
  - ✅ Connections released after use
  - ✅ No connection leak over time
  - ✅ Compute hours stay within 100 hours/month (Neon free tier)

**NFR-5.3: Cost Optimization**
- Minimize idle Cloud Run charges (scale to zero enabled)
- Minimize idle database charges (Neon auto-suspend)
- Optimize Docker image size (<500MB)
- Stay within free tiers (Cloud Run + Neon)
- **Acceptance Criteria:**
  - ✅ Cloud Run scales to zero when idle
  - ✅ Neon auto-suspends after ~5 minutes idle
  - ✅ Image size optimized (multi-stage build)
  - ✅ No unnecessary dependencies in production image
  - ✅ Monthly cost **<$5** for all infrastructure (target: $0-3)

**Out of Scope:**
- Load testing beyond 10 concurrent users
- CDN or edge caching
- Database read replicas or sharding
- Advanced auto-scaling policies

---

### NFR-6: Deployment & Operations

**Rationale:** Deployment automation is a primary validation goal.

**Requirements:**

**NFR-6.1: Automated Deployment**
- Commit to `main` → Automatic deploy to dev
- Manual promotion to staging and production
- Zero-downtime deployments (Cloud Run handles gracefully)
- **Acceptance Criteria:**
  - ✅ Push to main triggers GitHub Actions
  - ✅ Dev deployment completes in <10 minutes
  - ✅ Staging/production promotion via manual trigger
  - ✅ No downtime during deployment

**NFR-6.2: Environment Parity**
- Same Docker image deployed to all environments
- Only environment variables differ between environments
- Same database schema in all environments
- **Acceptance Criteria:**
  - ✅ Single Docker image used for all environments
  - ✅ Environment-specific config via env vars only
  - ✅ Schema migrations applied to all databases
  - ✅ Parity verified in CI/CD

**NFR-6.3: Observability**
- Cloud Run logs accessible via GCP console
- Health check endpoint for monitoring
- Deployment success/failure visible in GitHub Actions
- **Acceptance Criteria:**
  - ✅ Logs queryable in GCP console
  - ✅ Health check endpoint returns meaningful status
  - ✅ GitHub Actions shows clear success/failure
  - ✅ Failed deployments don't affect running service

**Out of Scope:**
- Infrastructure as Code (Terraform, Pulumi) - manual GCP setup acceptable
- Advanced monitoring dashboards
- Automated rollback on failure detection
- Blue-green or canary deployments

---

## PRD Summary

### What We're Building

**role-directory** is a deployment proving ground disguised as a functional web application. The primary goal is to validate a complete production-ready infrastructure stack on Google Cloud Platform before investing in complex features.

### Core Value Proposition

**Infrastructure confidence through practical validation.** Every feature serves to test a different layer of the deployment stack:

- **Invitation codes** → Session management in serverless environment
- **Hello World dashboard** → Database connectivity and query execution  
- **Three environments** → CI/CD pipeline and promotion workflows
- **Docker deployment** → Container optimization and Cloud Run specifics

### MVP Scope (Ruthlessly Focused)

**ONE complete feature flowing through all three environments:**

1. ✅ User enters invitation code
2. ✅ System validates code and creates session
3. ✅ User sees Hello World dashboard with database query results
4. ✅ Feature deployed: Dev → Staging → Production

**What we cut to stay focused:**
- ❌ Admin UI (SQL scripts sufficient)
- ❌ Automated tests in CI/CD (lint + type check + build only)
- ❌ Multiple dashboard pages (one page proves the stack)
- ❌ Comprehensive monitoring (basic Cloud Run logging sufficient)

### Technical Architecture

**Frontend:** Next.js 15 (App Router) + React 18 + TypeScript 5.8  
**Backend:** Next.js API Routes  
**Database:** Neon PostgreSQL Serverless (3 separate databases - free tier)  
**Deployment:** Docker → Cloud Run (3 services: dev, stg, prd)  
**CI/CD:** GitHub Actions  
**Cost Target:** ~$0-3/month (Cloud Run free tier + Neon free tier)

### Success Criteria

**The MVP is complete when:**
- Code committed to `main` → Auto-deploys to Dev
- Manually promoted to Staging → Validated
- Manually promoted to Production → Feature works

**Specific thresholds:**
- Application cold start: <5 seconds (acceptable: <10s)
- Database cold start: <3 seconds (Neon serverless auto-resume)
- Warm database queries: <200ms
- CI/CD pipeline: <10 minutes
- Monthly cost: **~$0-3** (Cloud Run free tier + Neon free tier)

### Requirements Summary

**Functional Requirements:** 6 major areas, 21 specific requirements
- FR-1: Authentication with Neon Auth (4 sub-requirements)
- FR-2: Protected Routes & Authorization (3 sub-requirements)
- FR-3: Hello World Dashboard (4 sub-requirements)
- FR-4: Multi-Environment Deployment (5 sub-requirements)
- FR-5: Database Infrastructure (4 sub-requirements)
- FR-6: Containerization & Docker (3 sub-requirements)

**Non-Functional Requirements:** 6 categories
- NFR-1: Performance (cold start, warm requests, connection pooling)
- NFR-2: Security (sessions, database, input validation, secrets)
- NFR-3: Reliability (error handling, logging, rollback)
- NFR-4: Maintainability (code quality, documentation, structure)
- NFR-5: Scalability (horizontal scaling, cost optimization)
- NFR-6: Deployment & Operations (automation, parity, observability)

### The Magic Thread

**What makes this special:** Infrastructure de-risking through deliberate, incremental validation. danielvm can commit code with confidence, knowing the entire pipeline—from GitHub Actions to Cloud Run to PostgreSQL—has been battle-tested with real features, not toy examples.

This isn't about building a feature-rich application. It's about **earning confidence in the foundation** before building anything complex on top of it.

---

## Next Steps After PRD

### Immediate Next Steps

1. **Epic & Story Breakdown** (Required)
   - Run: `*create-epics-and-stories` workflow
   - Decompose these requirements into implementable stories
   - Estimate effort and sequence work

2. **Architecture Design** (Recommended)
   - Run: `*create-architecture` workflow  
   - Document technical decisions
   - Create deployment architecture diagram
   - Define database schema details

3. **Solutioning Gate Check** (Required)
   - Run: `*solutioning-gate-check` workflow
   - Validate PRD + Architecture completeness
   - Get final approval before implementation

### Implementation Approach

**Recommended sequence:**

**Sprint 0: Infrastructure Setup**
- Set up Cloud SQL instance and databases
- Configure Google Secret Manager
- Create GitHub repository and Actions workflows

**Sprint 1: Authentication & Core Features** (Reduced from 2-3 days to 4-6 hours)
- Install and configure Neon Auth SDK
- Set up OAuth providers (Google/GitHub)
- Implement email whitelist
- Build Hello World dashboard with database query

**Sprint 2: Deployment Pipeline**
- Complete Dockerfile and Cloud Run deployment
- Configure environment variables (Neon Auth secrets)
- Deploy through all three environments
- Test OAuth flow in each environment

**Sprint 3: Hardening & Documentation**
- Error handling and logging
- Documentation (README, .env.example, Neon Auth setup)
- Validate all acceptance criteria

### Future Phases (Post-MVP)

**Phase 2:** Testing automation (unit, integration, E2E)  
**Phase 3:** Admin UI for code generation  
**Phase 4:** Additional dashboard pages (workflow/sprint status)  
**Phase 5:** Monitoring and operations enhancements  
**Phase 6:** Enhanced features and optimization  
**Phase 7:** Public launch

---

## References

- **Product Brief**: docs/product-brief-role-directory-2025-11-06.md

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-06 | danielvm + John (PM) | Initial PRD through collaborative discovery |

---

_This PRD captures the essence of role-directory: a deployment proving ground that validates infrastructure confidence through practical, incremental feature development._

_Created through collaborative discovery between danielvm and Product Manager facilitator._


