# Web Application Specific Requirements

## Browser & Platform Support

**MVP: Modern Browsers Only**
- Chrome, Firefox, Safari, Edge (last 2 versions)
- No IE11 support (not needed for infrastructure validation)
- Desktop-first with basic responsive layout (functional on mobile, not polished)
- Basic keyboard navigation (tab order, enter/space for buttons)
- *(Full WCAG compliance and legacy browser support deferred to future phases)*

## API Endpoints

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
  - Query: Simple SELECT from existing role/pricing tables or database version info

**Future Endpoints (Deferred):**
- Admin code generation endpoints (Phase 3)
- Workflow/sprint status file endpoints (Phase 4)
- Role catalog data endpoints (Phase 6)

## Session Management

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

## Environment Configuration

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

## PostgreSQL Infrastructure

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
- ✅ 3GB storage sufficient for MVP with role/pricing tables + session data
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
