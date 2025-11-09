# Database Migrations Guide

This guide explains how to manage database schema changes using the migration system.

## Overview

The migration system provides a CLI-based approach to managing database schema changes across all environments (dev, staging, production). It uses:

- **Raw SQL files** for maximum control and simplicity
- **Timestamp-based ordering** to ensure consistent migration order
- **Up/Down migrations** for applying and rolling back changes
- **Tracking table** (`schema_migrations`) to record applied migrations

## Quick Start

```bash
# Create a new migration
npm run migrate:create create_users_table

# Edit the generated files in migrations/ directory
# - migrations/YYYYMMDDHHMMSS_create_users_table.up.sql   (forward migration)
# - migrations/YYYYMMDDHHMMSS_create_users_table.down.sql (rollback migration)

# Check migration status
DATABASE_URL="postgresql://..." npm run migrate:status

# Apply pending migrations
DATABASE_URL="postgresql://..." npm run migrate:up

# Rollback last migration (if needed)
DATABASE_URL="postgresql://..." npm run migrate:down
```

## Available Commands

### `npm run migrate:create <name>`

Creates a new migration file pair with timestamp prefix.

**Example:**
```bash
npm run migrate:create add_user_roles
```

**Generated files:**
- `migrations/20231106120000_add_user_roles.up.sql`
- `migrations/20231106120000_add_user_roles.down.sql`

**Naming conventions:**
- Use lowercase with underscores: `create_users`, `add_email_index`
- Be descriptive but concise
- One logical change per migration

### `npm run migrate:up`

Applies all pending migrations in chronological order.

**Example:**
```bash
DATABASE_URL="postgresql://user:pass@host/db" npm run migrate:up
```

**Behavior:**
- Skips already-applied migrations (idempotent)
- Stops on first error (fail-fast)
- Records successful migrations in `schema_migrations` table
- Exits with code 0 on success, non-zero on failure

### `npm run migrate:down`

Rolls back the last applied migration.

**Example:**
```bash
DATABASE_URL="postgresql://user:pass@host/db" npm run migrate:down
```

**Behavior:**
- Only rolls back ONE migration at a time (safety feature)
- Requires corresponding `.down.sql` file
- Removes migration record from `schema_migrations`
- For multiple rollbacks, run command multiple times

### `npm run migrate:status`

Shows current migration status (applied vs pending).

**Example:**
```bash
DATABASE_URL="postgresql://user:pass@host/db" npm run migrate:status
```

**Output:**
```
📊 Migration Status:

  ✅ 20231106120000_create_schema_migrations (applied 2023-11-06T12:00:00Z)
  ✅ 20231106130000_create_users_table (applied 2023-11-06T13:00:00Z)
  ❌ 20231106140000_add_indexes (pending)
```

## Migration Workflow by Environment

### Development Environment

1. **Create migration:**
   ```bash
   npm run migrate:create add_feature
   ```

2. **Edit migration files:**
   - Edit `.up.sql` with your schema changes
   - Edit `.down.sql` with rollback logic

3. **Apply to dev database:**
   ```bash
   DATABASE_URL="postgresql://...dev..." npm run migrate:up
   ```

4. **Test thoroughly:**
   - Verify schema changes
   - Test application functionality
   - Check data integrity

5. **Test rollback (recommended):**
   ```bash
   DATABASE_URL="postgresql://...dev..." npm run migrate:down
   DATABASE_URL="postgresql://...dev..." npm run migrate:up
   ```

### Staging Environment

1. **Apply to staging:**
   ```bash
   DATABASE_URL="postgresql://...stg..." npm run migrate:up
   ```

2. **Validate in staging:**
   - Run smoke tests
   - Verify schema matches expectations
   - Test with staging data

3. **Monitor for issues:**
   - Check application logs
   - Verify performance
   - Confirm no errors

### Production Environment

1. **Schedule maintenance window (if needed):**
   - For breaking changes or long-running migrations
   - Communicate with stakeholders

2. **Apply to production:**
   ```bash
   DATABASE_URL="postgresql://...prd..." npm run migrate:up
   ```

3. **Verify production health:**
   ```bash
   curl https://your-app.com/api/health
   ```

4. **Monitor closely:**
   - Watch application metrics
   - Check error rates
   - Verify data integrity

## Best Practices

### ✅ Always Create Rollback Migrations

Even if you don't plan to use them, always create `.down.sql` files:

```sql
-- Up migration
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL
);

-- Down migration
DROP TABLE IF EXISTS users;
```

### ✅ Test Rollback in Dev Before Production

Test the complete lifecycle:
1. Apply migration (`migrate:up`)
2. Rollback migration (`migrate:down`)
3. Re-apply migration (`migrate:up`)

### ✅ Make Migrations Idempotent

Use `IF EXISTS` / `IF NOT EXISTS` clauses:

```sql
-- Good: Idempotent
CREATE TABLE IF NOT EXISTS users (...);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Bad: Fails if run twice
CREATE TABLE users (...);
ALTER TABLE users ADD COLUMN email VARCHAR(255);
```

### ✅ Prefer Additive Migrations

Add new columns/tables instead of modifying existing ones:

```sql
-- Good: Additive (backward compatible)
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Risky: Modifies existing column (breaking change)
ALTER TABLE users ALTER COLUMN email TYPE TEXT;

-- Dangerous: Drops column (data loss)
ALTER TABLE users DROP COLUMN email;
```

### ✅ One Logical Change Per Migration

Keep migrations focused:

```sql
-- Good: Single purpose
-- Migration 1: Create users table
CREATE TABLE users (...);

-- Migration 2: Add indexes to users
CREATE INDEX idx_users_email ON users(email);

-- Bad: Multiple unrelated changes
CREATE TABLE users (...);
CREATE TABLE products (...);
CREATE TABLE orders (...);
```

### ✅ Never Modify Applied Migrations

Once a migration is applied to any environment beyond dev, **never modify it**.

Instead, create a new migration:

```bash
# Don't edit: 20231106120000_create_users.up.sql
# Do create: 20231106150000_add_users_index.up.sql
npm run migrate:create add_users_index
```

### ✅ Document Complex Migrations

Add comments explaining why:

```sql
-- Up migration: add_email_verification
-- Context: Implementing two-factor authentication (Epic 3, Story 3.2)
-- This migration adds email verification status tracking

ALTER TABLE users 
  ADD COLUMN email_verified BOOLEAN DEFAULT false NOT NULL;

-- Backfill: Mark existing users as verified (they signed up before this feature)
UPDATE users SET email_verified = true WHERE created_at < '2023-11-01';

CREATE INDEX idx_users_email_verified ON users(email_verified)
  WHERE email_verified = false;  -- Partial index for unverified users only
```

## Schema Migrations Table

The system automatically creates and manages a `schema_migrations` table:

```sql
CREATE TABLE schema_migrations (
  version VARCHAR(255) PRIMARY KEY,       -- Migration filename without .up.sql
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT                        -- Optional description
);
```

**Example data:**
```sql
SELECT * FROM schema_migrations ORDER BY version;

version                              | applied_at          | description
-------------------------------------|---------------------|-------------------------
20231106120000_create_users_table   | 2023-11-06 12:00:00 | Migration: 20231106...
20231106130000_add_user_roles       | 2023-11-06 13:00:00 | Migration: 20231106...
```

**⚠️ Never manually modify this table** - let the migration system manage it.

## Safety Features

### DATABASE_URL Required

All commands (except `create`) require `DATABASE_URL` environment variable:

```bash
# ❌ Error: DATABASE_URL not set
npm run migrate:up

# ✅ Correct
DATABASE_URL="postgresql://..." npm run migrate:up
```

### Production Warning

When running against production database:

```bash
DATABASE_URL="postgresql://...production..." npm run migrate:up

⚠️  WARNING: Running against PRODUCTION database!
⚠️  DATABASE_URL: postgresql://user:***@host/db_prd

📦 Applying migrations...
```

### Fail-Fast Behavior

Migration stops immediately on first error:

```
  ✅ 20231106120000_create_users applied
  ⏳ Applying 20231106130000_add_roles...
  ❌ Migration failed: 20231106130000_add_roles
     Error: syntax error at or near "CREATEE"
```

Migration was NOT recorded in `schema_migrations`. Fix the error and run again.

### File Format Validation

Migration files must follow naming convention:

```
✅ 20231106120000_create_users.up.sql
❌ 2023-11-06_create_users.up.sql      (wrong timestamp format)
❌ create_users.up.sql                  (missing timestamp)
❌ 20231106120000_CreateUsers.up.sql   (uppercase not allowed)
```

## Troubleshooting

### Migration Failed Mid-Execution

**Problem:** Migration ran partially, then failed.

**Solution:**
1. Check database state manually: `psql $DATABASE_URL`
2. Manually rollback partial changes if needed
3. Fix the migration SQL
4. Run `migrate:up` again

### Rollback File Not Found

**Problem:** `migrate:down` fails with "Rollback file not found"

**Solution:**
1. Create the missing `.down.sql` file
2. Add appropriate rollback SQL
3. Run `migrate:down` again

### Migration Already Applied Error

**Problem:** Trying to re-apply a migration that's already in `schema_migrations`.

**Solution:**
- This is expected behavior (idempotency)
- Migration will be skipped automatically
- Check `migrate:status` to see current state

### Need to Rollback Multiple Migrations

**Problem:** Need to rollback more than the last migration.

**Solution:**
Run `migrate:down` multiple times:

```bash
# Rollback last 3 migrations
npm run migrate:down  # Rolls back last migration
npm run migrate:down  # Rolls back new "last" migration
npm run migrate:down  # Rolls back new "last" migration
```

### Different Migration Order in Environments

**Problem:** Migrations applied in different order across environments.

**Solution:**
- **Prevention:** Always apply migrations in timestamp order
- **Fix:** Rollback all migrations, re-apply in correct order
- **Note:** This is why timestamp-based naming is critical

## Example: Complete Migration Lifecycle

Let's walk through creating a `users` table:

### 1. Create Migration

```bash
$ npm run migrate:create create_users_table

✅ Created migration: 20231106120000_create_users_table
   - migrations/20231106120000_create_users_table.up.sql
   - migrations/20231106120000_create_users_table.down.sql
```

### 2. Edit Up Migration

`migrations/20231106120000_create_users_table.up.sql`:

```sql
-- Up migration: create_users_table
-- Created: 2023-11-06T12:00:00Z

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add helpful comments
COMMENT ON TABLE users IS 'Application users with email-based authentication';
COMMENT ON COLUMN users.email IS 'Unique email address for login';
```

### 3. Edit Down Migration

`migrations/20231106120000_create_users_table.down.sql`:

```sql
-- Down migration: create_users_table
-- Created: 2023-11-06T12:00:00Z

-- Drop index first (dependencies)
DROP INDEX IF EXISTS idx_users_email;

-- Drop table
DROP TABLE IF EXISTS users;
```

### 4. Check Status (Dev Environment)

```bash
$ export DATABASE_URL="postgresql://user:pass@localhost/roledb_dev"
$ npm run migrate:status

📊 Migration Status:

  ❌ 20231106120000_create_users_table (pending)
```

### 5. Apply Migration

```bash
$ npm run migrate:up

📦 Applying migrations...

  ⏳ Applying 20231106120000_create_users_table...
  ✅ 20231106120000_create_users_table applied

✅ Successfully applied 1 migration(s)
```

### 6. Verify in Database

```bash
$ psql $DATABASE_URL -c "\dt"
           List of relations
 Schema |        Name        | Type  | Owner 
--------+--------------------+-------+-------
 public | schema_migrations  | table | user
 public | users              | table | user

$ psql $DATABASE_URL -c "\d users"
                                          Table "public.users"
   Column   |            Type             | Collation | Nullable |              Default              
------------+-----------------------------+-----------+----------+-----------------------------------
 id         | integer                     |           | not null | nextval('users_id_seq'::regclass)
 email      | character varying(255)      |           | not null | 
 name       | character varying(255)      |           | not null | 
 created_at | timestamp without time zone |           |          | CURRENT_TIMESTAMP
 updated_at | timestamp without time zone |           |          | CURRENT_TIMESTAMP
```

### 7. Test Rollback

```bash
$ npm run migrate:down

🔄 Rolling back last migration...

  ⏳ Rolling back 20231106120000_create_users_table...
  ✅ 20231106120000_create_users_table rolled back

$ npm run migrate:status

📊 Migration Status:

  ❌ 20231106120000_create_users_table (pending)
```

### 8. Re-Apply (Verify Idempotency)

```bash
$ npm run migrate:up

📦 Applying migrations...

  ⏳ Applying 20231106120000_create_users_table...
  ✅ 20231106120000_create_users_table applied

✅ Successfully applied 1 migration(s)
```

### 9. Apply to Staging

```bash
$ export DATABASE_URL="postgresql://user:pass@host/roledb_stg"
$ npm run migrate:up

📦 Applying migrations...

  ⏳ Applying 20231106120000_create_users_table...
  ✅ 20231106120000_create_users_table applied

✅ Successfully applied 1 migration(s)
```

### 10. Apply to Production

```bash
$ export DATABASE_URL="postgresql://user:pass@host/roledb_prd"
$ npm run migrate:up

⚠️  WARNING: Running against PRODUCTION database!
⚠️  DATABASE_URL: postgresql://user:***@host/roledb_prd

📦 Applying migrations...

  ⏳ Applying 20231106120000_create_users_table...
  ✅ 20231106120000_create_users_table applied

✅ Successfully applied 1 migration(s)
```

## File Structure Reference

```
role-directory/
├── migrations/
│   ├── .gitkeep
│   ├── 20231106120000_create_periodic_table.up.sql
│   ├── 20231106120000_create_periodic_table.down.sql
│   ├── 20231106130000_create_users_table.up.sql
│   └── 20231106130000_create_users_table.down.sql
├── scripts/
│   └── migrate.js                         # Migration CLI
└── package.json                           # Contains npm run migrate:* scripts
```

## Migration Naming Conventions

### Timestamp Format

`YYYYMMDDHHMMSS` - 14 digits, no separators:
- `YYYY` - 4-digit year (2023)
- `MM` - 2-digit month (01-12)
- `DD` - 2-digit day (01-31)
- `HH` - 2-digit hour (00-23)
- `MM` - 2-digit minute (00-59)
- `SS` - 2-digit second (00-59)

**Example:** `20231106142530` = November 6, 2023, 14:25:30

### Name Format

- Lowercase only: `create_users_table`
- Underscores for spaces: `add_email_index`
- Descriptive but concise: `add_user_roles`, not `add_roles_column_to_users_table_for_permissions`
- Action-oriented: `create_`, `add_`, `drop_`, `modify_`

## Additional Resources

- [Neon PostgreSQL Documentation](https://neon.tech/docs)
- [PostgreSQL CREATE TABLE](https://www.postgresql.org/docs/current/sql-createtable.html)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
- [Migration Best Practices](https://www.postgresql.org/docs/current/ddl-depend.html)

## Support

For questions or issues:
1. Check this documentation first
2. Review existing migrations in `migrations/` directory
3. Check `schema_migrations` table for current state
4. Review application logs for detailed error messages
5. Contact the development team for assistance

---

**Version:** 1.0  
**Last Updated:** 2025-11-09  
**Maintained By:** Development Team

