# Story 2.2: Database Connection Configuration with Zod-Validated Config

Status: ready-for-dev

## Story

As a **developer**,  
I want **a type-safe configuration module with Zod validation and a database connection module with proper pooling**,  
so that **the application validates configuration on startup and can reliably connect to PostgreSQL from Cloud Run**.

## Acceptance Criteria

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

## Tasks / Subtasks

- [ ] Task 1: Create configuration module with Zod validation (AC: lib/config.ts with type-safe validation)
  - [ ] Create directory: `lib/`
  - [ ] Create file: `lib/config.ts`
  - [ ] Import Zod: `import { z } from 'zod'`
  - [ ] Define configuration schema with all environment variables
  - [ ] Implement `getConfig()` function with validation
  - [ ] Export `Config` type inferred from schema
  - [ ] Add detailed error messages for validation failures

- [ ] Task 2: Define Zod schema for database configuration (AC: DATABASE_URL validated)
  - [ ] Add `databaseUrl` field to schema:
    ```typescript
    databaseUrl: z.string()
      .url()
      .startsWith('postgresql://')
      .describe('PostgreSQL connection string from Neon')
    ```
  - [ ] Validate URL format (must start with postgresql://)
  - [ ] Make required (no default value)
  - [ ] Add descriptive error message if missing or invalid

- [ ] Task 3: Define Zod schema for authentication configuration (AC: ALLOWED_EMAILS validated)
  - [ ] Add `allowedEmails` field:
    ```typescript
    allowedEmails: z.string()
      .transform(s => s.split(',').map(e => e.trim().toLowerCase()))
      .pipe(z.array(z.string().email()))
      .describe('Comma-separated list of allowed email addresses')
    ```
  - [ ] Transform: Split by comma, trim whitespace, lowercase
  - [ ] Validate: Each email must be valid email format
  - [ ] Make required (no default value for security)

- [ ] Task 4: Define Zod schema for environment and runtime (AC: NODE_ENV and PORT validated)
  - [ ] Add `nodeEnv` field:
    ```typescript
    nodeEnv: z.enum(['development', 'staging', 'production'])
      .default('development')
    ```
  - [ ] Add `port` field:
    ```typescript
    port: z.string()
      .default('8080')
      .transform(Number)
      .pipe(z.number().int().positive().max(65535))
    ```
  - [ ] Add optional fields for Neon Auth (Epic 3):
    ```typescript
    neonAuthProjectId: z.string().min(1).optional()
    neonAuthSecretKey: z.string().min(1).optional()
    ```

- [ ] Task 5: Implement getConfig() function with fail-fast validation (AC: Detailed error messages)
  - [ ] Implement function:
    ```typescript
    export function getConfig(): Config {
      const parsed = configSchema.safeParse(process.env);
      
      if (!parsed.success) {
        const errors = parsed.error.errors
          .map(e => `  ${e.path.join('.')}: ${e.message}`)
          .join('\n');
        throw new Error(`Configuration validation failed:\n${errors}`);
      }
      
      return parsed.data;
    }
    ```
  - [ ] Use `safeParse()` to catch validation errors
  - [ ] Format error messages clearly (field: message)
  - [ ] Throw error immediately (fail-fast, don't start server)
  - [ ] Return type-safe Config object on success

- [ ] Task 6: Create database connection module (AC: lib/db.ts with query function)
  - [ ] Create file: `lib/db.ts`
  - [ ] Import dependencies:
    ```typescript
    import { neon } from '@neondatabase/serverless';
    import { getConfig } from '@/lib/config';
    ```
  - [ ] Get validated configuration
  - [ ] Initialize Neon client with DATABASE_URL
  - [ ] Export `query()` function

- [ ] Task 7: Initialize Neon client with validated DATABASE_URL (AC: Client initialized on module load)
  - [ ] Get config: `const config = getConfig();`
  - [ ] Initialize Neon client: `const sql = neon(config.databaseUrl);`
  - [ ] Note: Neon client is stateless (HTTP-based), no connection pooling needed
  - [ ] Client handles Neon auto-suspend/resume automatically

- [ ] Task 8: Implement query() function with parameterized queries (AC: Safe SQL execution)
  - [ ] Implement function:
    ```typescript
    export async function query<T = any>(
      text: string,
      params?: any[]
    ): Promise<T[]> {
      const start = Date.now();
      
      try {
        const result = await sql(text, params);
        const duration = Date.now() - start;
        
        if (duration > 200) {
          console.warn(`[DB] Slow query (${duration}ms): ${text}`);
        }
        
        return result as T[];
      } catch (error) {
        console.error('[DB] Query error:', { text, error });
        throw new Error('Database query failed');
      }
    }
    ```
  - [ ] Accept SQL text and optional parameters
  - [ ] Execute query via Neon client
  - [ ] Measure execution time
  - [ ] Return typed result

- [ ] Task 9: Add slow query logging (AC: Queries >200ms logged)
  - [ ] Measure query duration: `Date.now() - start`
  - [ ] Log if duration > 200ms threshold
  - [ ] Include query text and duration in log
  - [ ] Use console.warn for visibility
  - [ ] Format: `[DB] Slow query (350ms): SELECT * FROM ...`

- [ ] Task 10: Add error handling and sanitization (AC: Descriptive errors, no raw database errors)
  - [ ] Wrap query execution in try-catch
  - [ ] Log full error details server-side (console.error)
  - [ ] Include query text and error in log
  - [ ] Throw sanitized error message (not raw database error)
  - [ ] Error message: "Database query failed" (generic, safe for client)

- [ ] Task 11: Create .env.local for local development (AC: Local configuration works)
  - [ ] Create file: `.env.local` (gitignored)
  - [ ] Add environment variables:
    ```
    DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/role_directory_dev?sslmode=require
    ALLOWED_EMAILS=your-email@example.com
    NODE_ENV=development
    PORT=3000
    ```
  - [ ] Replace DATABASE_URL with actual Neon dev connection string
  - [ ] Replace ALLOWED_EMAILS with your email for testing
  - [ ] Verify .env.local is in .gitignore
  - [ ] Document in README: Copy .env.example to .env.local

- [ ] Task 12: Test configuration validation (AC: Invalid config fails fast)
  - [ ] Start dev server with missing DATABASE_URL
  - [ ] Verify: Application crashes with clear error message
  - [ ] Start dev server with invalid DATABASE_URL (not a URL)
  - [ ] Verify: Application crashes with validation error
  - [ ] Start dev server with invalid ALLOWED_EMAILS (not email format)
  - [ ] Verify: Application crashes with validation error
  - [ ] Start dev server with valid .env.local
  - [ ] Verify: Application starts successfully

- [ ] Task 13: Test database connection (AC: Can execute queries)
  - [ ] Create test file: `lib/db.test.ts` or test in API route
  - [ ] Import query function: `import { query } from '@/lib/db'`
  - [ ] Execute test query: `const result = await query('SELECT version()')`
  - [ ] Verify: Result contains PostgreSQL version string
  - [ ] Execute test query: `const result = await query('SELECT $1 as value', [42])`
  - [ ] Verify: Result contains `[{ value: 42 }]`
  - [ ] Measure query time (should be <3s cold, <200ms warm)

- [ ] Task 14: Test error handling (AC: Errors are logged and sanitized)
  - [ ] Execute invalid query: `await query('SELECT FROM invalid')`
  - [ ] Verify: Error thrown with message "Database query failed"
  - [ ] Verify: Server logs show full error details (console.error)
  - [ ] Verify: Client does NOT see raw database error
  - [ ] Test connection timeout (if possible)
  - [ ] Verify: Timeout error handled gracefully

- [ ] Task 15: Document configuration and database modules (AC: Usage documented)
  - [ ] Update README with configuration section
  - [ ] Document required environment variables
  - [ ] Document how to set up .env.local
  - [ ] Document how to use getConfig() in code
  - [ ] Document how to use query() function
  - [ ] Add examples of parameterized queries
  - [ ] Link to architecture.md for patterns

## Dev Notes

### Technical Context

**Architecture References:**
- **Epic 2 Tech Spec**: Configuration Management Pattern and Database Connection Pattern
- **Architecture Decision**: Zod for validation, @neondatabase/serverless for database
- **PRD NFR-1**: Performance targets (<200ms queries)

**Key Implementation Details:**

1. **Configuration Module Structure:**
   ```typescript
   // lib/config.ts
   import { z } from 'zod';
   
   // Define schema
   export const configSchema = z.object({
     // Database
     databaseUrl: z.string()
       .url()
       .startsWith('postgresql://')
       .describe('PostgreSQL connection string from Neon'),
     
     // Authentication
     allowedEmails: z.string()
       .transform(s => s.split(',').map(e => e.trim().toLowerCase()))
       .pipe(z.array(z.string().email()))
       .describe('Comma-separated list of allowed email addresses'),
     
     // Neon Auth (optional, Epic 3)
     neonAuthProjectId: z.string().min(1).optional(),
     neonAuthSecretKey: z.string().min(1).optional(),
     
     // Environment
     nodeEnv: z.enum(['development', 'staging', 'production'])
       .default('development'),
     port: z.string()
       .default('8080')
       .transform(Number)
       .pipe(z.number().int().positive().max(65535)),
     
     // Runtime
     nextPublicApiUrl: z.string().url().optional(),
   });
   
   // Infer type from schema
   export type Config = z.infer<typeof configSchema>;
   
   // Cached config instance
   let cachedConfig: Config | null = null;
   
   // Get validated configuration
   export function getConfig(): Config {
     if (cachedConfig) {
       return cachedConfig;
     }
     
     const parsed = configSchema.safeParse(process.env);
     
     if (!parsed.success) {
       const errors = parsed.error.errors
         .map(e => `  ${e.path.join('.')}: ${e.message}`)
         .join('\n');
       throw new Error(`Configuration validation failed:\n${errors}`);
     }
     
     cachedConfig = parsed.data;
     return cachedConfig;
   }
   ```

2. **Database Connection Module Structure:**
   ```typescript
   // lib/db.ts
   import { neon } from '@neondatabase/serverless';
   import { getConfig } from '@/lib/config';
   
   // Get validated configuration
   const config = getConfig();
   
   // Initialize Neon client (HTTP-based, stateless)
   const sql = neon(config.databaseUrl);
   
   // Query function with logging and error handling
   export async function query<T = any>(
     text: string,
     params?: any[]
   ): Promise<T[]> {
     const start = Date.now();
     
     try {
       // Execute query via Neon HTTP driver
       const result = await sql(text, params);
       const duration = Date.now() - start;
       
       // Log slow queries (>200ms)
       if (duration > 200) {
         console.warn(`[DB] Slow query (${duration}ms):`, {
           query: text.substring(0, 100),
           duration,
           timestamp: new Date().toISOString(),
         });
       }
       
       return result as T[];
     } catch (error) {
       // Log full error details server-side
       console.error('[DB] Query error:', {
         query: text,
         params,
         error: error instanceof Error ? error.message : String(error),
         timestamp: new Date().toISOString(),
       });
       
       // Throw sanitized error (don't expose database details)
       throw new Error('Database query failed');
     }
   }
   
   // Optional: Helper for single row queries
   export async function queryOne<T = any>(
     text: string,
     params?: any[]
   ): Promise<T | null> {
     const results = await query<T>(text, params);
     return results.length > 0 ? results[0] : null;
   }
   ```

3. **Environment Variables (.env.local for local dev):**
   ```bash
   # Database (from Neon Console)
   DATABASE_URL=postgresql://user:password@ep-xxx-xxx.region.neon.tech/role_directory_dev?sslmode=require
   
   # Authentication (Epic 3)
   ALLOWED_EMAILS=your-email@example.com,teammate@example.com
   
   # Neon Auth (optional, Epic 3)
   # NEON_AUTH_PROJECT_ID=your-project-id
   # NEON_AUTH_SECRET_KEY=your-secret-key
   
   # Environment
   NODE_ENV=development
   PORT=3000
   
   # Runtime (optional)
   # NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. **Configuration Validation Error Examples:**
   ```
   # Missing DATABASE_URL
   Configuration validation failed:
     databaseUrl: Required
   
   # Invalid DATABASE_URL format
   Configuration validation failed:
     databaseUrl: Invalid url
   
   # Invalid email in ALLOWED_EMAILS
   Configuration validation failed:
     allowedEmails.0: Invalid email
   
   # Invalid PORT (not a number)
   Configuration validation failed:
     port: Expected number, received nan
   ```

5. **Query Usage Examples:**
   ```typescript
   // Simple query
   const version = await query('SELECT version()');
   console.log(version);
   // Output: [{ version: 'PostgreSQL 17.0...' }]
   
   // Parameterized query (safe from SQL injection)
   const users = await query(
     'SELECT * FROM users WHERE email = $1',
     ['user@example.com']
   );
   
   // Multiple parameters
   const filtered = await query(
     'SELECT * FROM role_profiles WHERE career_path_id = $1 AND role_name ILIKE $2',
     [5, '%engineer%']
   );
   
   // Insert with RETURNING
   const inserted = await query(
     'INSERT INTO career_paths (career_path_name) VALUES ($1) RETURNING *',
     ['Data Science']
   );
   
   // Typed result
   interface User {
     id: number;
     email: string;
     name: string;
   }
   const typedUsers = await query<User>('SELECT * FROM users LIMIT 10');
   ```

6. **Neon Serverless Driver Features:**
   - **HTTP-based**: No persistent connections, stateless
   - **Built-in pooling**: Handles connection management automatically
   - **Auto-suspend handling**: Transparently resumes Neon database (2-3s)
   - **No connection limits**: HTTP protocol avoids traditional connection pooling issues
   - **Edge runtime compatible**: Works in Vercel Edge, Cloudflare Workers, etc.
   - **Query queueing**: Automatically queues concurrent queries

7. **Performance Characteristics:**
   - **Warm query** (database active): <50ms for simple queries
   - **Cold start** (database suspended): ~2-3 seconds for first query (Neon resume)
   - **Subsequent queries** (after cold start): <50ms (database remains active)
   - **Slow query threshold**: 200ms (log for investigation)
   - **Connection timeout**: Neon driver has built-in timeout (~30 seconds)

8. **Error Handling Strategy:**
   - **Configuration errors**: Crash immediately on startup (fail-fast)
   - **Query errors**: Log full details server-side, throw sanitized error
   - **Connection errors**: Handled by Neon driver, retry automatically
   - **Timeout errors**: Logged and thrown as "Database query failed"
   - **Never expose**: Database schema details, connection strings, raw errors

### Project Structure Notes

**Files Created/Modified:**
```
role-directory/
├── lib/
│   ├── config.ts                # NEW: Configuration module with Zod validation
│   └── db.ts                    # NEW: Database connection module
├── .env.local                   # NEW: Local development environment variables (gitignored)
├── .env.example                 # MODIFIED: Add all required environment variables
└── README.md                    # MODIFIED: Document configuration setup
```

**Dependencies (already installed in Story 1.1):**
- `zod` v3.23.8 - Runtime validation and type inference
- `@neondatabase/serverless` v0.10.1 - HTTP-based PostgreSQL client

### Testing Standards Summary

**For This Story:**
- **Manual Testing**: Configuration validation and database queries
- **Verification Steps**:
  1. Test configuration validation with missing DATABASE_URL
  2. Test configuration validation with invalid DATABASE_URL format
  3. Test configuration validation with invalid ALLOWED_EMAILS
  4. Test configuration validation with valid .env.local (should succeed)
  5. Test database connection: `SELECT version()`
  6. Test parameterized queries: `SELECT $1 as value`
  7. Test slow query logging: Execute query >200ms (if possible)
  8. Test error handling: Execute invalid SQL query
  9. Verify errors are sanitized (no raw database errors exposed)
  10. Verify server logs show full error details
  11. Test cold start behavior: Wait 5+ minutes, execute query (should take 2-3s)
  12. Test warm query performance: Execute query immediately after (<200ms)
  13. Create test API route that uses query() function
  14. Verify API route works in dev server

**Expected Results:**
- Configuration validation fails fast with clear error messages
- Application starts successfully with valid configuration
- Database queries execute successfully
- Slow queries (>200ms) are logged
- Query errors are logged server-side with full details
- Client sees sanitized error message "Database query failed"
- Cold start queries complete in <3 seconds
- Warm queries complete in <200ms
- Parameterized queries work correctly

### Constraints and Patterns

**MUST Follow:**
1. **Configuration Management Pattern** (architecture.md):
   - Use Zod for runtime validation
   - Fail fast on invalid configuration (crash on startup)
   - Cache validated configuration (don't re-validate on every access)
   - Provide type-safe Config type inferred from schema

2. **Database Connection Pattern** (architecture.md):
   - Use @neondatabase/serverless driver (not pg or pg-pool)
   - Simple query() function with parameterized query support
   - Slow query logging for performance monitoring
   - Connection timeout handling
   - Error sanitization (don't expose database details to client)

3. **Security Requirements** (PRD NFR-3):
   - Never commit DATABASE_URL to git
   - Use parameterized queries (prevent SQL injection)
   - Sanitize error messages (don't expose database schema)
   - Validate all configuration inputs

4. **Performance Requirements** (PRD NFR-1):
   - Log queries >200ms (slow query threshold)
   - Target <200ms for warm queries
   - Accept 2-3s for cold start (Neon auto-resume)

5. **Error Handling Pattern** (architecture.md):
   - Log full error details server-side
   - Return generic error messages to client
   - Use structured JSON logging
   - Include timestamp and context in logs

### References

- [Source: docs/2-planning/epics.md#Story-2.2] - Story definition and acceptance criteria
- [Source: docs/tech-spec-epic-2.md#Configuration-Module] - Configuration pattern specification
- [Source: docs/tech-spec-epic-2.md#Database-Connection] - Database connection pattern specification
- [Source: docs/3-solutioning/architecture.md#Configuration-Management-Pattern] - Architecture pattern
- [Source: docs/3-solutioning/architecture.md#Database-Connection-Pattern] - Architecture pattern
- [Source: Zod Documentation] - https://zod.dev/
- [Source: Neon Serverless Driver Docs] - https://neon.tech/docs/serverless/serverless-driver

### Learnings from Previous Story

**From Story 2-1 (Status: drafted):**
- Story 2.1 not yet implemented - no completion learnings available
- Will incorporate learnings once Story 2.1 is completed

**Expected Dependencies from Previous Stories:**
- ✅ Story 1.1 (done): Next.js project with TypeScript, Zod, and @neondatabase/serverless installed
- ✅ Story 2.1 (drafted): Neon databases created, DATABASE_URL in Secret Manager, Cloud Run configured

**Assumptions:**
- DATABASE_URL available in environment (from Story 2.1)
- Zod already installed (from Story 1.1: `npm install zod`)
- @neondatabase/serverless already installed (from Story 1.1)
- .env.local will be used for local development (gitignored)
- Cloud Run will inject DATABASE_URL from Secret Manager (Story 2.1)

**Important Notes:**
- This story creates the **configuration and database foundation** for all subsequent stories
- Configuration module will be **extended in Epic 3** for Neon Auth credentials
- Database connection will be **used in Epic 4** for dashboard queries
- Slow query logging provides **performance visibility** without additional monitoring tools
- Neon serverless driver **automatically handles** connection pooling and auto-suspend/resume
- No additional connection pooling library needed (e.g., pg-pool not required)

## Dev Agent Record

### Context Reference

- `docs/stories/2-2-database-connection-configuration-with-zod-validated-config.context.xml` - Generated 2025-11-07

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


