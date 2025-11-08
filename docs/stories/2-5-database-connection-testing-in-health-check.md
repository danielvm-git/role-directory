# Story 2.5: Database Connection Testing in Health Check

Status: drafted

## Story

As a **developer**,  
I want **the health check endpoint to verify database connectivity**,  
so that **deployment health checks catch database connection issues early**.

## Acceptance Criteria

**Given** the database connection module is working  
**When** the health check endpoint runs  
**Then** it executes a simple database query (e.g., `SELECT 1` or `SELECT version()`)  
**And** if the query succeeds within 2 seconds, return `{ "status": "ok", "database": "connected" }`  
**And** if the query fails or times out, return 500 status with `{ "status": "error", "database": "disconnected" }`  
**And** database errors are logged (not exposed in response)  
**And** health check still responds quickly (<3 seconds total including cold start)

## Tasks / Subtasks

- [ ] Task 1: Update health check endpoint with database connectivity test (AC: Health check queries database)
  - [ ] Open `app/api/health/route.ts` for editing
  - [ ] Import database query function: `import { query } from '@/lib/db'`
  - [ ] Import configuration: `import { getConfig } from '@/lib/config'`
  - [ ] Add database connection check logic to existing health check
  - [ ] Execute simple query: `SELECT 1 AS health_check`
  - [ ] Set timeout for database check: 2 seconds max
  - [ ] Return enhanced response with database status
  - [ ] Handle both success and failure cases

- [ ] Task 2: Implement query execution with timeout (AC: Query times out if >2 seconds)
  - [ ] Create timeout wrapper for database query
  - [ ] Use `Promise.race()` pattern:
    ```typescript
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database timeout')), 2000)
    );
    const queryPromise = query('SELECT 1 AS health_check');
    await Promise.race([queryPromise, timeoutPromise]);
    ```
  - [ ] Or use `AbortController` if supported by Neon driver
  - [ ] Catch timeout errors separately from query errors
  - [ ] Log timeout events: `console.warn('[Health] Database check timeout after 2s')`

- [ ] Task 3: Implement success response format (AC: Success returns 200 with database status)
  - [ ] Define successful response structure:
    ```typescript
    {
      "status": "ok",
      "timestamp": "2025-11-06T15:30:00.000Z",
      "database": "connected"
    }
    ```
  - [ ] Return HTTP 200 OK status code
  - [ ] Include timestamp in ISO 8601 format
  - [ ] Log successful health check: `console.log('[Health] Database check passed')`
  - [ ] Optionally include query duration in response (for monitoring)

- [ ] Task 4: Implement failure response format (AC: Failure returns 500 with database status)
  - [ ] Define error response structure:
    ```typescript
    {
      "status": "error",
      "timestamp": "2025-11-06T15:30:00.000Z",
      "database": "disconnected"
    }
    ```
  - [ ] Return HTTP 500 Internal Server Error status code
  - [ ] DO NOT expose error details in response (security)
  - [ ] Log full error details server-side:
    ```typescript
    console.error('[Health] Database check failed', {
      error: error.message,
      timestamp: new Date().toISOString(),
      queryText: 'SELECT 1 AS health_check'
    });
    ```
  - [ ] Include error type for debugging (timeout vs connection error)

- [ ] Task 5: Add error handling and logging (AC: Errors logged server-side)
  - [ ] Wrap database check in try-catch block
  - [ ] Catch specific error types:
    - Connection errors (Neon database unreachable)
    - Timeout errors (query took >2 seconds)
    - Query execution errors (syntax errors, permission issues)
  - [ ] Log errors with structured JSON format:
    ```typescript
    console.error('[Health] Database error', {
      errorType: 'connection' | 'timeout' | 'query',
      errorMessage: error.message,
      errorStack: error.stack,
      timestamp: new Date().toISOString()
    });
    ```
  - [ ] DO NOT log sensitive data (connection strings, credentials)
  - [ ] Return generic error response to client (no details)

- [ ] Task 6: Test health check locally with database connected (AC: Health check passes)
  - [ ] Start local development server: `npm run dev`
  - [ ] Ensure DATABASE_URL is set in .env.local
  - [ ] Ensure database is accessible (Neon database running)
  - [ ] Test health endpoint:
    ```bash
    curl -s http://localhost:3000/api/health | jq
    ```
  - [ ] Expected response:
    ```json
    {
      "status": "ok",
      "timestamp": "2025-11-06T15:30:00.000Z",
      "database": "connected"
    }
    ```
  - [ ] Verify HTTP status code: 200 OK
  - [ ] Verify response time: <3 seconds (including cold start)
  - [ ] Check server logs for success message

- [ ] Task 7: Test health check locally with database disconnected (AC: Health check fails gracefully)
  - [ ] Stop database or set invalid DATABASE_URL temporarily:
    ```bash
    export DATABASE_URL="postgresql://invalid:invalid@nonexistent.neon.tech/db?sslmode=require"
    ```
  - [ ] Restart development server: `npm run dev`
  - [ ] Test health endpoint:
    ```bash
    curl -s -w "\nHTTP Status: %{http_code}\n" http://localhost:3000/api/health | jq
    ```
  - [ ] Expected response:
    ```json
    {
      "status": "error",
      "timestamp": "2025-11-06T15:30:00.000Z",
      "database": "disconnected"
    }
    ```
  - [ ] Verify HTTP status code: 500 Internal Server Error
  - [ ] Check server logs for error details (connection refused, timeout, etc.)
  - [ ] Verify error details NOT exposed in response body
  - [ ] Restore valid DATABASE_URL after testing

- [ ] Task 8: Test health check with slow database (AC: Timeout works correctly)
  - [ ] Simulate slow query (if possible):
    ```typescript
    // Temporarily modify lib/db.ts to add artificial delay
    await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
    ```
  - [ ] Or use `pg_sleep()` in query:
    ```sql
    SELECT pg_sleep(3), 1 AS health_check
    ```
  - [ ] Test health endpoint
  - [ ] Expected: Timeout after 2 seconds
  - [ ] Expected response: 500 status with "database": "disconnected"
  - [ ] Expected log: `[Health] Database check timeout after 2s`
  - [ ] Remove artificial delay after testing
  - [ ] Note: Real Neon cold starts may take 2-3 seconds naturally

- [ ] Task 9: Update GitHub Actions CI/CD to use health check (AC: Deployment validates health)
  - [ ] Open `.github/workflows/ci-cd.yml`
  - [ ] Locate deployment health check step (Story 1.5)
  - [ ] Verify health check includes database status:
    ```yaml
    - name: Health Check
      run: |
        RESPONSE=$(curl -s https://role-directory-dev-xxx.run.app/api/health)
        echo "Health check response: $RESPONSE"
        STATUS=$(echo $RESPONSE | jq -r '.status')
        DB_STATUS=$(echo $RESPONSE | jq -r '.database')
        if [ "$STATUS" != "ok" ] || [ "$DB_STATUS" != "connected" ]; then
          echo "Health check failed: status=$STATUS, database=$DB_STATUS"
          exit 1
        fi
        echo "Health check passed ✅"
    ```
  - [ ] If health check step missing, add it after deployment step
  - [ ] Test in dev deployment: Commit and push changes
  - [ ] Verify GitHub Actions workflow passes health check

- [ ] Task 10: Test health check in dev environment (AC: Health check works in Cloud Run)
  - [ ] Deploy to dev environment (if not auto-deployed)
  - [ ] Get Cloud Run service URL:
    ```bash
    gcloud run services describe role-directory-dev \
      --region=southamerica-east1 \
      --format='value(status.url)'
    ```
  - [ ] Test health endpoint:
    ```bash
    curl -s https://role-directory-dev-xxx.run.app/api/health | jq
    ```
  - [ ] Expected response: `{ "status": "ok", "database": "connected" }`
  - [ ] Expected status code: 200 OK
  - [ ] Test cold start behavior:
    - Wait 5+ minutes for Cloud Run to scale to zero
    - Request health endpoint again
    - Verify response time <5 seconds (includes cold start + Neon resume)
    - Database status should still be "connected"
  - [ ] Check Cloud Run logs for health check messages:
    ```bash
    gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=role-directory-dev" \
      --limit=20 \
      --format=json | jq -r '.[].jsonPayload.message | select(contains("[Health]"))'
    ```

- [ ] Task 11: Document health check behavior (AC: Health check documented)
  - [ ] Update `docs/CLOUD_RUN_SETUP.md` (or create if not exists)
  - [ ] Add section: "Health Check Endpoint"
  - [ ] Document endpoint: `GET /api/health`
  - [ ] Document response formats:
    - Success: `{ "status": "ok", "database": "connected" }`
    - Failure: `{ "status": "error", "database": "disconnected" }`
  - [ ] Document expected response times:
    - Warm: <500ms
    - Cold start: <5 seconds (includes Neon database resume)
  - [ ] Document troubleshooting:
    - If database status "disconnected": Check DATABASE_URL in Secret Manager
    - If timeout: Check Neon database region (latency issue)
    - If persistent failures: Check Cloud Run service account permissions
  - [ ] Add example curl commands for testing
  - [ ] Update README.md to reference health check documentation

- [ ] Task 12: Optional - Add query duration to response (AC: Response includes timing)
  - [ ] Measure query execution time:
    ```typescript
    const start = Date.now();
    await query('SELECT 1 AS health_check');
    const duration = Date.now() - start;
    ```
  - [ ] Include in success response:
    ```typescript
    {
      "status": "ok",
      "timestamp": "2025-11-06T15:30:00.000Z",
      "database": "connected",
      "query_time_ms": 45
    }
    ```
  - [ ] Log slow queries (>1 second):
    ```typescript
    if (duration > 1000) {
      console.warn('[Health] Slow database check', { duration });
    }
    ```
  - [ ] Use for monitoring and performance validation

## Dev Notes

### Technical Context

**Architecture References:**
- **Epic 2 Tech Spec**: Health check integration requirements
- **Story 1.6**: Existing health check endpoint (created in Epic 1)
- **Story 2.2**: Database connection module (`lib/db.ts`)
- **Architecture**: Health Check Integration pattern

**Key Implementation Details:**

1. **Health Check Query:**
   ```typescript
   // Simple, fast query to verify connectivity
   SELECT 1 AS health_check;
   
   // Alternative: Get PostgreSQL version
   SELECT version();
   
   // Recommended: SELECT 1 (fastest, minimal load)
   ```

2. **Timeout Implementation:**
   ```typescript
   // app/api/health/route.ts
   import { query } from '@/lib/db';
   import { NextResponse } from 'next/server';

   export async function GET() {
     const timestamp = new Date().toISOString();
     
     try {
       // Create timeout promise (2 seconds)
       const timeoutPromise = new Promise<never>((_, reject) =>
         setTimeout(() => reject(new Error('Database timeout')), 2000)
       );
       
       // Create query promise
       const queryPromise = query('SELECT 1 AS health_check');
       
       // Race: query vs timeout
       const start = Date.now();
       await Promise.race([queryPromise, timeoutPromise]);
       const duration = Date.now() - start;
       
       console.log('[Health] Database check passed', { duration });
       
       return NextResponse.json({
         status: 'ok',
         timestamp,
         database: 'connected',
         query_time_ms: duration,
       }, { status: 200 });
       
     } catch (error: any) {
       console.error('[Health] Database check failed', {
         errorMessage: error.message,
         errorType: error.message.includes('timeout') ? 'timeout' : 'connection',
         timestamp,
       });
       
       return NextResponse.json({
         status: 'error',
         timestamp,
         database: 'disconnected',
       }, { status: 500 });
     }
   }
   ```

3. **Error Handling Strategy:**
   ```
   Try:
     1. Execute database query with timeout
     2. Log success
     3. Return 200 OK with "connected" status
   
   Catch:
     1. Log error details (server-side only)
     2. Determine error type (timeout, connection, query)
     3. Return 500 with generic "disconnected" status
     4. DO NOT expose error details to client
   ```

4. **Response Formats:**
   
   **Success Response (200 OK):**
   ```json
   {
     "status": "ok",
     "timestamp": "2025-11-06T15:30:00.000Z",
     "database": "connected",
     "query_time_ms": 45
   }
   ```
   
   **Failure Response (500 Internal Server Error):**
   ```json
   {
     "status": "error",
     "timestamp": "2025-11-06T15:30:00.000Z",
     "database": "disconnected"
   }
   ```
   
   **Error Log (Server-Side Only):**
   ```json
   {
     "message": "[Health] Database check failed",
     "errorType": "timeout",
     "errorMessage": "Database timeout",
     "timestamp": "2025-11-06T15:30:00.000Z"
   }
   ```

5. **CI/CD Integration:**
   
   GitHub Actions health check validation:
   ```yaml
   - name: Health Check with Database Validation
     run: |
       echo "Waiting for service to be ready..."
       sleep 5
       
       echo "Testing health endpoint..."
       RESPONSE=$(curl -s -w "\n%{http_code}" https://role-directory-dev-xxx.run.app/api/health)
       BODY=$(echo "$RESPONSE" | head -n 1)
       STATUS_CODE=$(echo "$RESPONSE" | tail -n 1)
       
       echo "Response body: $BODY"
       echo "Status code: $STATUS_CODE"
       
       # Parse JSON response
       STATUS=$(echo "$BODY" | jq -r '.status')
       DB_STATUS=$(echo "$BODY" | jq -r '.database')
       
       # Validate response
       if [ "$STATUS_CODE" != "200" ]; then
         echo "❌ Health check failed: HTTP $STATUS_CODE"
         exit 1
       fi
       
       if [ "$STATUS" != "ok" ]; then
         echo "❌ Health check failed: status=$STATUS"
         exit 1
       fi
       
       if [ "$DB_STATUS" != "connected" ]; then
         echo "❌ Database check failed: database=$DB_STATUS"
         exit 1
       fi
       
       echo "✅ Health check passed (status=$STATUS, database=$DB_STATUS)"
   ```

6. **Cold Start Behavior:**
   
   Expected timings:
   - **Warm container + active database**: <200ms
   - **Warm container + suspended database**: 2-3 seconds (Neon auto-resume)
   - **Cold container + active database**: 1-2 seconds (Cloud Run startup)
   - **Cold container + suspended database**: 3-5 seconds (both cold starts)
   
   Health check timeout set to 2 seconds to catch issues quickly, but deployment health checks should allow up to 5 seconds for full cold start scenario.

### Project Structure Notes

**Files Modified:**
```
role-directory/
├── app/
│   └── api/
│       └── health/
│           └── route.ts                          # MODIFIED: Add database check
├── .github/
│   └── workflows/
│       └── ci-cd.yml                             # MODIFIED: Validate database in health check
└── docs/
    ├── CLOUD_RUN_SETUP.md                        # MODIFIED: Document health check
    └── README.md                                 # MODIFIED: Reference health check
```

**No New Files Created** - This story modifies existing health check endpoint from Story 1.6.

### Testing Standards Summary

**For This Story:**
- **Manual Testing**: Test health check locally with connected/disconnected database
- **Integration Testing**: Test health check in dev Cloud Run environment
- **CI/CD Validation**: GitHub Actions validates database connectivity on deployment

**Test Checklist:**
1. ✅ Health check returns 200 OK when database connected
2. ✅ Health check returns 500 when database disconnected
3. ✅ Database errors logged server-side (not exposed to client)
4. ✅ Health check responds within 3 seconds (including cold start)
5. ✅ Health check timeout works (2 seconds max for query)
6. ✅ GitHub Actions deployment validates database connectivity
7. ✅ Cloud Run logs show health check status
8. ✅ Health check works after Neon cold start (2-3 second resume)

**Expected Results:**
- Health endpoint enhanced with database connectivity check
- Deployment failures caught early if database unreachable
- Clear logging for troubleshooting connection issues
- Fast health check response (<3 seconds worst case)

### Constraints and Patterns

**MUST Follow:**

1. **Security** (architecture.md):
   - ✅ DO NOT expose database errors in response body
   - ✅ Log full error details server-side only
   - ✅ Use generic error messages for clients
   - ✅ No connection strings or credentials in logs

2. **Performance** (Epic 2 Tech Spec):
   - ✅ Health check timeout: 2 seconds max for database query
   - ✅ Total health check response: <3 seconds (including cold start)
   - ✅ Use simplest possible query (`SELECT 1`)
   - ✅ Log slow queries (>1 second) for monitoring

3. **Reliability** (architecture.md):
   - ✅ Health check MUST return 500 if database unreachable
   - ✅ Deployment should fail if health check fails
   - ✅ Handle all error types (connection, timeout, query)
   - ✅ Graceful degradation if database down (app continues, health check fails)

4. **Logging** (Epic 2 Tech Spec):
   - ✅ Structured JSON logs to stdout
   - ✅ Include error type, message, timestamp
   - ✅ Use consistent log prefix: `[Health]`
   - ✅ Log level: `console.log` (success), `console.warn` (slow), `console.error` (failure)

5. **Response Format** (architecture.md):
   - ✅ Always include `status` field ("ok" or "error")
   - ✅ Always include `timestamp` (ISO 8601 format)
   - ✅ Always include `database` field ("connected" or "disconnected")
   - ✅ Optionally include `query_time_ms` for monitoring

### References

- [Source: docs/2-planning/epics.md#Story-2.5] - Story definition and acceptance criteria
- [Source: docs/tech-spec-epic-2.md#Health-Check-Integration] - Technical specification
- [Source: docs/3-solutioning/architecture.md#Health-Check-Pattern] - Health check architecture
- [Source: docs/stories/1-6-health-check-endpoint.md] - Original health check endpoint (Story 1.6)
- [Source: docs/stories/2-2-database-connection-configuration-with-zod-validated-config.md] - Database connection module (Story 2.2)

### Learnings from Previous Story

**From Story 2-4 (Initial Database Schema Migration) (Status: drafted):**
- Story 2-4 not yet implemented - no completion learnings available
- Will incorporate learnings once Story 2-4 is completed

**Expected Dependencies from Previous Stories:**
- ✅ Story 1.1 (done): Project structure with Next.js 15
- ✅ Story 1.6 (done): Health check endpoint exists at `/api/health`
- ✅ Story 2.1 (drafted): Neon databases created, DATABASE_URL available
- ✅ Story 2.2 (drafted): Database connection module (`lib/db.ts`) with `query()` function
- ✅ Story 2.3 (drafted): Migration system working (schema_migrations table exists)
- ✅ Story 2.4 (drafted): Database tables created (can query any table for health check)

**Assumptions:**
- DATABASE_URL configured in all three environments (dev, staging, production)
- Health check endpoint already exists from Story 1.6
- Database connection module (`lib/db.ts`) working from Story 2.2
- Neon database accessible from Cloud Run (firewall, IAM permissions correct)
- Cloud Run service account has `secretAccessor` role for DATABASE_URL

**Important Notes:**
- This story **enhances** the existing health check endpoint (does not create new endpoint)
- Health check query should be **simple and fast** (`SELECT 1` recommended)
- **DO NOT** expose database error details in response (security risk)
- **Timeout is critical** - Neon cold starts can take 2-3 seconds
- GitHub Actions **should fail deployment** if health check fails
- Next story (2.6) will document the complete database setup including health check

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

<!-- Fill in when implementing: e.g., Claude Sonnet 4.5 -->

### Debug Log References

<!-- Add links to debug logs or issues encountered during implementation -->

### Completion Notes List

<!-- Dev agent fills in after completing story:
- New patterns/services created
- Architectural deviations or decisions made
- Technical debt deferred to future stories
- Warnings or recommendations for next story
- Interfaces/methods created for reuse
-->

### File List

<!-- Dev agent fills in after completing story:
Format: [STATUS] path/to/file.ext
- NEW: file created
- MODIFIED: file changed
- DELETED: file removed
-->

## Change Log

| Date | Author | Changes |
|------|--------|---------|
| 2025-11-06 | danielvm (SM - Bob) | Initial story creation from epics.md |

