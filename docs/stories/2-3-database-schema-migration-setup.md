# Story 2.3: Database Schema Migration Setup

Status: ready-for-dev

## Story

As a **developer**,  
I want **a migration system to manage database schema changes across environments**,  
so that **schema updates can be applied consistently and safely to dev, staging, and production**.

## Acceptance Criteria

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

## Tasks / Subtasks

- [ ] Task 1: Choose migration tool approach (AC: Decision documented)
  - [ ] Evaluate options:
    - Option A: Prisma Migrate (full ORM, heavyweight)
    - Option B: node-pg-migrate (SQL-based, lightweight)
    - Option C: Knex migrations (query builder)
    - Option D: Custom Node.js script (full control)
  - [ ] Recommendation: **node-pg-migrate** or **custom script**
  - [ ] Rationale: SQL-based (no ORM), simple, explicit control
  - [ ] Document decision in story completion notes
  - [ ] Note: This story uses custom Node.js script for MVP simplicity

- [ ] Task 2: Create migrations directory structure (AC: migrations/ directory exists)
  - [ ] Create directory: `migrations/`
  - [ ] Create subdirectories (optional):
    - `migrations/up/` for forward migrations
    - `migrations/down/` for rollback migrations
  - [ ] Alternative: Single directory with `.up.sql` and `.down.sql` suffixes
  - [ ] Document structure in README

- [ ] Task 3: Create migration tracking table (AC: schema_migrations table defined)
  - [ ] Create initial migration: `migrations/000_create_schema_migrations.sql`
  - [ ] Define schema_migrations table:
    ```sql
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      description TEXT
    );
    ```
  - [ ] This migration is always run first (bootstrap)
  - [ ] Track all subsequent migrations in this table

- [ ] Task 4: Create migration CLI script (AC: scripts/migrate.js executable)
  - [ ] Create file: `scripts/migrate.js`
  - [ ] Add Node.js shebang: `#!/usr/bin/env node`
  - [ ] Make executable: `chmod +x scripts/migrate.js`
  - [ ] Import dependencies:
    ```javascript
    const { neon } = require('@neondatabase/serverless');
    const fs = require('fs');
    const path = require('path');
    ```
  - [ ] Accept commands: `up`, `down`, `status`, `create`
  - [ ] Read DATABASE_URL from environment

- [ ] Task 5: Implement migrate:up command (AC: Apply pending migrations)
  - [ ] Read all migration files from `migrations/` directory
  - [ ] Sort by timestamp (alphabetical order)
  - [ ] Query schema_migrations to get applied migrations
  - [ ] Filter pending migrations (not in schema_migrations)
  - [ ] Apply each pending migration in order:
    1. Read SQL file content
    2. Execute SQL via neon client
    3. Insert record into schema_migrations
    4. Log success/failure
  - [ ] Handle errors: Rollback on failure, log details
  - [ ] Exit with code 0 on success, non-zero on failure

- [ ] Task 6: Implement migrate:down command (AC: Rollback last migration)
  - [ ] Query schema_migrations to get last applied migration
  - [ ] Find corresponding rollback file (e.g., `*.down.sql` or `down/` directory)
  - [ ] Execute rollback SQL
  - [ ] Remove record from schema_migrations
  - [ ] Log success/failure
  - [ ] Note: Only rollback ONE migration at a time (safety)

- [ ] Task 7: Implement migrate:status command (AC: Show migration state)
  - [ ] Query schema_migrations to get applied migrations
  - [ ] Read all migration files from `migrations/` directory
  - [ ] Compare and display:
    ```
    Migration Status:
    ✓ 20231106120000_create_schema_migrations.sql (applied 2023-11-06 12:00:00)
    ✓ 20231106130000_create_role_tables.sql (applied 2023-11-06 13:00:00)
    ✗ 20231106140000_add_indexes.sql (pending)
    ```
  - [ ] Exit with code 0

- [ ] Task 8: Implement migrate:create command (AC: Generate new migration file)
  - [ ] Accept migration name as argument: `npm run migrate:create add_user_roles`
  - [ ] Generate timestamp: `YYYYMMDDHHMMSS`
  - [ ] Create migration files:
    - `migrations/${timestamp}_${name}.up.sql` (forward migration)
    - `migrations/${timestamp}_${name}.down.sql` (rollback migration)
  - [ ] Add template content:
    ```sql
    -- Up migration: ${name}
    -- Add your SQL statements here
    
    -- Example:
    -- CREATE TABLE example (
    --   id SERIAL PRIMARY KEY,
    --   name VARCHAR(255) NOT NULL
    -- );
    ```
  - [ ] Log: "Created migration: ${timestamp}_${name}"

- [ ] Task 9: Add npm scripts for migration commands (AC: npm run migrate:* commands work)
  - [ ] Update `package.json`:
    ```json
    {
      "scripts": {
        "migrate:up": "node scripts/migrate.js up",
        "migrate:down": "node scripts/migrate.js down",
        "migrate:status": "node scripts/migrate.js status",
        "migrate:create": "node scripts/migrate.js create"
      }
    }
    ```
  - [ ] Verify scripts run successfully
  - [ ] Document usage in README

- [ ] Task 10: Test migration system with sample migration (AC: Can create and apply migration)
  - [ ] Create test migration: `npm run migrate:create test_table`
  - [ ] Edit up migration:
    ```sql
    CREATE TABLE test_table (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```
  - [ ] Edit down migration:
    ```sql
    DROP TABLE IF EXISTS test_table;
    ```
  - [ ] Set DATABASE_URL for dev environment
  - [ ] Run: `npm run migrate:up`
  - [ ] Verify: Table created, schema_migrations updated
  - [ ] Run: `npm run migrate:status` (should show applied)
  - [ ] Run: `npm run migrate:down`
  - [ ] Verify: Table dropped, schema_migrations updated
  - [ ] Clean up test migration files

- [ ] Task 11: Document migration workflow (AC: docs/DATABASE.md with migration guide)
  - [ ] Create file: `docs/DATABASE.md` (or update existing)
  - [ ] Document migration commands:
    - Create migration: `npm run migrate:create migration_name`
    - Apply migrations: `DATABASE_URL=... npm run migrate:up`
    - Rollback migration: `DATABASE_URL=... npm run migrate:down`
    - Check status: `DATABASE_URL=... npm run migrate:status`
  - [ ] Document workflow for each environment:
    1. Create migration in dev
    2. Apply to dev: Test thoroughly
    3. Apply to staging: Validate before production
    4. Apply to production: Run during maintenance window
  - [ ] Document best practices:
    - Always create rollback migrations
    - Test rollback in dev before production
    - Prefer additive migrations (avoid breaking changes)
    - Never modify applied migrations (create new one)
  - [ ] Add troubleshooting section

- [ ] Task 12: Add migration safety checks (AC: Prevent common mistakes)
  - [ ] Check DATABASE_URL is set before running migrations
  - [ ] Warn if running against production database
  - [ ] Require confirmation for production migrations (optional)
  - [ ] Validate migration file format (timestamp_name.sql)
  - [ ] Check for duplicate migration versions
  - [ ] Log DATABASE_URL (masked) to confirm target environment

- [ ] Task 13: Document migration naming conventions (AC: Consistent naming)
  - [ ] Document in README or docs/DATABASE.md:
    - Timestamp format: YYYYMMDDHHMMSS
    - Name format: lowercase_with_underscores
    - Example: `20231106120000_create_users_table.sql`
  - [ ] Document migration file structure:
    - Forward: `${timestamp}_${name}.up.sql`
    - Rollback: `${timestamp}_${name}.down.sql`
  - [ ] Document SQL conventions:
    - Use `IF EXISTS` / `IF NOT EXISTS` for idempotency
    - Include comments for complex migrations
    - One logical change per migration

## Dev Notes

### Technical Context

**Architecture References:**
- **Epic 2 Tech Spec**: Migration system requirements
- **Architecture Decision**: SQL-based migrations (not ORM)
- **PRD**: Schema consistency across environments

**Key Implementation Details:**

1. **Migration Directory Structure:**
   ```
   role-directory/
   ├── migrations/
   │   ├── 000_create_schema_migrations.sql  # Bootstrap migration
   │   ├── 001_create_role_tables.up.sql     # Forward migration
   │   ├── 001_create_role_tables.down.sql   # Rollback migration
   │   ├── 002_add_indexes.up.sql
   │   └── 002_add_indexes.down.sql
   └── scripts/
       └── migrate.js                         # Migration CLI
   ```

2. **schema_migrations Table:**
   ```sql
   CREATE TABLE IF NOT EXISTS schema_migrations (
     version VARCHAR(255) PRIMARY KEY,       -- Timestamp_name
     applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     description TEXT                        -- Optional description
   );
   
   -- Example data:
   -- version                              | applied_at          | description
   -- ------------------------------------|---------------------|------------------
   -- 001_create_role_tables              | 2023-11-06 12:00:00 | Initial schema
   -- 002_add_indexes                     | 2023-11-06 13:00:00 | Performance indexes
   ```

3. **Migration CLI Script (scripts/migrate.js):**
   ```javascript
   #!/usr/bin/env node
   const { neon } = require('@neondatabase/serverless');
   const fs = require('fs');
   const path = require('path');
   
   // Read DATABASE_URL from environment
   const DATABASE_URL = process.env.DATABASE_URL;
   if (!DATABASE_URL) {
     console.error('❌ DATABASE_URL environment variable is required');
     process.exit(1);
   }
   
   // Initialize Neon client
   const sql = neon(DATABASE_URL);
   
   // Get command
   const command = process.argv[2];
   
   // Command handlers
   async function up() {
     console.log('📦 Applying migrations...');
     
     // Ensure schema_migrations table exists
     await sql(`
       CREATE TABLE IF NOT EXISTS schema_migrations (
         version VARCHAR(255) PRIMARY KEY,
         applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         description TEXT
       )
     `);
     
     // Get applied migrations
     const applied = await sql('SELECT version FROM schema_migrations');
     const appliedVersions = new Set(applied.map(r => r.version));
     
     // Get all migration files
     const migrationsDir = path.join(__dirname, '..', 'migrations');
     const files = fs.readdirSync(migrationsDir)
       .filter(f => f.endsWith('.up.sql'))
       .sort();
     
     // Apply pending migrations
     for (const file of files) {
       const version = file.replace('.up.sql', '');
       if (appliedVersions.has(version)) {
         console.log(`  ✓ ${version} (already applied)`);
         continue;
       }
       
       console.log(`  ⏳ Applying ${version}...`);
       const migrationSql = fs.readFileSync(
         path.join(migrationsDir, file),
         'utf-8'
       );
       
       try {
         await sql(migrationSql);
         await sql(
           'INSERT INTO schema_migrations (version) VALUES ($1)',
           [version]
         );
         console.log(`  ✅ ${version} applied`);
       } catch (error) {
         console.error(`  ❌ ${version} failed:`, error.message);
         process.exit(1);
       }
     }
     
     console.log('✅ All migrations applied successfully');
   }
   
   async function down() {
     console.log('🔄 Rolling back last migration...');
     
     // Get last applied migration
     const result = await sql(`
       SELECT version FROM schema_migrations
       ORDER BY applied_at DESC LIMIT 1
     `);
     
     if (result.length === 0) {
       console.log('No migrations to rollback');
       return;
     }
     
     const version = result[0].version;
     console.log(`  ⏳ Rolling back ${version}...`);
     
     // Read rollback migration
     const migrationsDir = path.join(__dirname, '..', 'migrations');
     const downFile = path.join(migrationsDir, `${version}.down.sql`);
     
     if (!fs.existsSync(downFile)) {
       console.error(`  ❌ Rollback file not found: ${version}.down.sql`);
       process.exit(1);
     }
     
     const migrationSql = fs.readFileSync(downFile, 'utf-8');
     
     try {
       await sql(migrationSql);
       await sql('DELETE FROM schema_migrations WHERE version = $1', [version]);
       console.log(`  ✅ ${version} rolled back`);
     } catch (error) {
       console.error(`  ❌ Rollback failed:`, error.message);
       process.exit(1);
     }
   }
   
   async function status() {
     // Get applied migrations
     const applied = await sql(`
       SELECT version, applied_at FROM schema_migrations
       ORDER BY version
     `);
     const appliedVersions = new Set(applied.map(r => r.version));
     
     // Get all migration files
     const migrationsDir = path.join(__dirname, '..', 'migrations');
     const files = fs.readdirSync(migrationsDir)
       .filter(f => f.endsWith('.up.sql'))
       .sort();
     
     console.log('\n📊 Migration Status:\n');
     
     for (const file of files) {
       const version = file.replace('.up.sql', '');
       if (appliedVersions.has(version)) {
         const migration = applied.find(m => m.version === version);
         console.log(`  ✅ ${version} (applied ${migration.applied_at})`);
       } else {
         console.log(`  ❌ ${version} (pending)`);
       }
     }
     
     console.log('');
   }
   
   async function create() {
     const name = process.argv[3];
     if (!name) {
       console.error('❌ Migration name is required');
       console.error('Usage: npm run migrate:create migration_name');
       process.exit(1);
     }
     
     // Generate timestamp
     const now = new Date();
     const timestamp = now.toISOString()
       .replace(/[-:]/g, '')
       .replace('T', '')
       .split('.')[0];
     
     const version = `${timestamp}_${name}`;
     const migrationsDir = path.join(__dirname, '..', 'migrations');
     
     // Create up migration
     const upFile = path.join(migrationsDir, `${version}.up.sql`);
     fs.writeFileSync(upFile, `-- Up migration: ${name}\n-- Add your SQL statements here\n\n`);
     
     // Create down migration
     const downFile = path.join(migrationsDir, `${version}.down.sql`);
     fs.writeFileSync(downFile, `-- Down migration: ${name}\n-- Add your rollback SQL statements here\n\n`);
     
     console.log(`✅ Created migration: ${version}`);
     console.log(`  - ${upFile}`);
     console.log(`  - ${downFile}`);
   }
   
   // Execute command
   (async () => {
     try {
       switch (command) {
         case 'up': await up(); break;
         case 'down': await down(); break;
         case 'status': await status(); break;
         case 'create': await create(); break;
         default:
           console.error('Unknown command:', command);
           console.error('Usage: npm run migrate:[up|down|status|create]');
           process.exit(1);
       }
     } catch (error) {
       console.error('❌ Migration error:', error);
       process.exit(1);
     }
   })();
   ```

4. **Migration Workflow by Environment:**
   ```bash
   # DEV ENVIRONMENT
   # 1. Create migration
   npm run migrate:create add_user_roles
   
   # 2. Edit migration files
   # migrations/20231106120000_add_user_roles.up.sql
   # migrations/20231106120000_add_user_roles.down.sql
   
   # 3. Apply to dev
   DATABASE_URL="postgresql://..." npm run migrate:up
   
   # 4. Test thoroughly in dev
   # Verify schema changes, test application
   
   # 5. Test rollback (optional but recommended)
   DATABASE_URL="postgresql://..." npm run migrate:down
   DATABASE_URL="postgresql://..." npm run migrate:up
   
   # STAGING ENVIRONMENT
   # 6. Apply to staging
   DATABASE_URL="postgresql://...staging..." npm run migrate:up
   
   # 7. Validate in staging
   # Run smoke tests, verify schema
   
   # PRODUCTION ENVIRONMENT
   # 8. Schedule maintenance window (if needed)
   # 9. Apply to production
   DATABASE_URL="postgresql://...production..." npm run migrate:up
   
   # 10. Verify production health
   curl https://production-url/api/health
   ```

5. **Migration Best Practices:**
   - ✅ **Always create rollback migrations** (even if you don't plan to use them)
   - ✅ **Test rollback in dev** before applying to production
   - ✅ **Prefer additive migrations** (add columns, don't drop columns)
   - ✅ **Make migrations idempotent** (use IF EXISTS / IF NOT EXISTS)
   - ✅ **One logical change per migration** (don't combine unrelated changes)
   - ✅ **Never modify applied migrations** (create a new migration instead)
   - ✅ **Document complex migrations** (add comments explaining why)
   - ✅ **Test with real data** (use copy of production data in staging)

6. **Migration Safety Checks:**
   ```javascript
   // In scripts/migrate.js
   
   // Check DATABASE_URL is set
   if (!DATABASE_URL) {
     console.error('❌ DATABASE_URL is required');
     process.exit(1);
   }
   
   // Warn if production
   if (DATABASE_URL.includes('prd') || DATABASE_URL.includes('production')) {
     console.warn('⚠️  WARNING: Running against PRODUCTION database!');
     console.warn('⚠️  DATABASE_URL:', DATABASE_URL.replace(/:[^@]+@/, ':***@'));
     // Optional: Require confirmation
     // const confirm = prompt('Type "YES" to continue: ');
     // if (confirm !== 'YES') process.exit(1);
   }
   ```

### Project Structure Notes

**Files Created/Modified:**
```
role-directory/
├── migrations/
│   └── 000_create_schema_migrations.sql  # NEW: Bootstrap migration
├── scripts/
│   └── migrate.js                        # NEW: Migration CLI script
├── package.json                          # MODIFIED: Add migration scripts
├── docs/
│   └── DATABASE.md                       # NEW: Migration documentation
└── README.md                             # MODIFIED: Link to DATABASE.md
```

**Dependencies:**
- `@neondatabase/serverless` - Already installed (Story 1.1)
- Node.js `fs` and `path` - Built-in modules

### Testing Standards Summary

**For This Story:**
- **Manual Testing**: Create, apply, and rollback test migrations
- **Verification Steps**:
  1. Run `npm run migrate:create test_table`
  2. Verify migration files created with timestamp
  3. Edit up migration: CREATE TABLE test_table
  4. Edit down migration: DROP TABLE test_table
  5. Set DATABASE_URL for dev environment
  6. Run `npm run migrate:status` (should show pending)
  7. Run `npm run migrate:up`
  8. Verify table created: `psql $DATABASE_URL -c "\dt"`
  9. Verify schema_migrations updated: `psql $DATABASE_URL -c "SELECT * FROM schema_migrations"`
  10. Run `npm run migrate:status` (should show applied)
  11. Run `npm run migrate:down`
  12. Verify table dropped: `psql $DATABASE_URL -c "\dt"`
  13. Verify schema_migrations updated (migration removed)
  14. Run `npm run migrate:up` again (should re-apply)
  15. Test idempotency: Run `npm run migrate:up` again (should skip, no error)

**Expected Results:**
- Migration files created with timestamp_name format
- schema_migrations table tracks applied migrations
- `migrate:up` applies pending migrations in order
- `migrate:down` rolls back last migration
- `migrate:status` shows current migration state
- Idempotent migrations work (can run multiple times)
- Clear error messages on failure
- DATABASE_URL required to run migrations

### Constraints and Patterns

**MUST Follow:**
1. **SQL-Based Migrations** (architecture.md):
   - Use raw SQL files (not ORM migrations)
   - Keep migrations simple and readable
   - Prefer explicit SQL over abstractions

2. **Migration Tracking** (Epic 2 Tech Spec):
   - Use schema_migrations table to track state
   - Never run same migration twice
   - Apply migrations in timestamp order

3. **Safety Requirements** (PRD NFR-3):
   - Require DATABASE_URL to be set
   - Warn when running against production
   - Log target database (masked credentials)
   - Fail fast on errors (don't continue after failure)

4. **Rollback Support** (Epic 2 Tech Spec):
   - Every migration must have rollback
   - Test rollback in dev before production
   - Only rollback one migration at a time

5. **Documentation Required** (architecture.md):
   - Document migration commands in README
   - Document workflow for each environment
   - Document best practices and conventions
   - Add troubleshooting section

### References

- [Source: docs/2-planning/epics.md#Story-2.3] - Story definition and acceptance criteria
- [Source: docs/3-solutioning/tech-spec-epic-2.md#Migration-System] - Technical specification
- [Source: docs/3-solutioning/architecture.md#Database] - Database decisions
- [Source: node-pg-migrate] - https://github.com/salsita/node-pg-migrate (alternative option)

### Learnings from Previous Story

**From Story 2-2 (Status: drafted):**
- Story 2.2 not yet implemented - no completion learnings available
- Will incorporate learnings once Story 2.2 is completed

**Expected Dependencies from Previous Stories:**
- ✅ Story 1.1 (done): Project structure, Node.js installed
- ✅ Story 2.1 (drafted): Neon databases created, DATABASE_URL available
- ✅ Story 2.2 (drafted): Database connection module (lib/db.ts) exists

**Assumptions:**
- DATABASE_URL available for all three environments
- @neondatabase/serverless installed (Story 1.1)
- Developer has Node.js >=18 installed
- Developer can run npm scripts locally
- Migrations run manually (not automated in CI/CD for MVP)

**Important Notes:**
- This story creates the **migration foundation** for all schema changes
- Migrations are **manual for MVP** (not automated in CI/CD)
- Story 2.4 will create the **first real migration** (existing role tables)
- Migration system is **simple and explicit** (no ORM magic)
- **Custom script approach** chosen for MVP simplicity and full control
- Can be replaced with node-pg-migrate or Prisma Migrate post-MVP if needed

## Dev Agent Record

### Context Reference

- `docs/stories/2-3-database-schema-migration-setup.context.xml` - Generated 2025-11-07

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


