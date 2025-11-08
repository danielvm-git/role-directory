# Non-Functional Requirements

## NFR-1: Performance

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

## NFR-2: Security

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

## NFR-3: Reliability

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

## NFR-4: Maintainability

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

## NFR-5: Scalability

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

## NFR-6: Deployment & Operations

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
