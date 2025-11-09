# Deployment Guide: Story 2.4 - Initial Schema Migration

**Date:** 2025-11-09  
**Story:** 2.4 - Initial Database Schema Migration (Periodic Table)  
**Deployment Target:** Staging and Production environments

---

## Prerequisites

Before deploying, ensure you have:

1. ✅ **Dev environment deployed** (already complete)
2. ✅ **psql command installed** (`which psql` should return a path)
3. ⚠️ **Database URLs configured** for staging and production
4. ✅ **Migration files present** in `migrations/` directory

---

## Step 1: Configure Database URLs

You need to set environment variables for staging and production databases.

### Get Database URLs from Neon Console

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Get connection strings for:
   - **Staging:** `role_directory_stg` database
   - **Production:** `role_directory_prd` database

### Set Environment Variables

```bash
# Add to your shell profile (~/.zshrc or ~/.bashrc)
export DATABASE_URL_STG="postgresql://user:password@ep-xxx.region.neon.tech/role_directory_stg?sslmode=require"
export DATABASE_URL_PRD="postgresql://user:password@ep-xxx.region.neon.tech/role_directory_prd?sslmode=require"

# Or set for current session only
export DATABASE_URL_STG="postgresql://..."
export DATABASE_URL_PRD="postgresql://..."

# Reload shell or source the file
source ~/.zshrc  # or ~/.bashrc
```

### Verify Configuration

```bash
# Test staging connection
psql "$DATABASE_URL_STG" -c "SELECT 1"
# Expected: Should connect and return 1

# Test production connection
psql "$DATABASE_URL_PRD" -c "SELECT 1"
# Expected: Should connect and return 1
```

---

## Step 2: Deploy to Staging

### Automated Deployment (Recommended)

```bash
cd /Users/me/role-directory

# Run deployment script
./scripts/deploy-initial-schema.sh staging
```

**The script will:**
1. ✅ Verify DATABASE_URL_STG is set
2. ✅ Test database connection
3. ✅ Check schema_migrations table exists
4. ✅ Check if periodic_table already exists
5. 🚀 Apply migration (COPY 118 elements)
6. 📝 Record migration in schema_migrations
7. 🔎 Verify 118 elements loaded
8. ✅ Test query (element 10 = Neon)

**Expected Output:**
```
==========================================
Initial Schema Migration Deployment
Environment: staging
==========================================

📋 Pre-deployment Checks
------------------------
✅ Database URL configured: DATABASE_URL_STG
✅ psql command available
✅ Migration file found: migrations/20251109013210_initial_schema.up.sql

🔌 Testing database connection...
✅ Database connection successful

📊 Checking schema_migrations table...
✅ schema_migrations table exists

🔍 Checking for existing periodic_table...

🚀 Applying migration...
------------------------
COPY 118
✅ Migration applied successfully

📝 Recording migration in schema_migrations...
✅ Migration tracked successfully

🔎 Verifying deployment...
------------------------
✅ Element count correct: 118
✅ Test query successful: Element 10 = Ne (Neon)
✅ Migration tracked in schema_migrations

==========================================
✅ Deployment Complete
==========================================

Environment: staging
Table: periodic_table
Elements: 118
Migration: 20251109013210_initial_schema
```

### Manual Deployment (Alternative)

If you prefer manual steps:

```bash
# Set DATABASE_URL
export DATABASE_URL="$DATABASE_URL_STG"

# Apply migration
psql "$DATABASE_URL" -f migrations/20251109013210_initial_schema.up.sql

# Track migration
psql "$DATABASE_URL" -c "
  INSERT INTO schema_migrations (version, description) 
  VALUES ('20251109013210_initial_schema', 'Initial schema - periodic_table')
  ON CONFLICT (version) DO NOTHING
"

# Verify
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM periodic_table"
# Expected: 118

psql "$DATABASE_URL" -c "SELECT * FROM periodic_table WHERE \"AtomicNumber\" = 10"
# Expected: Neon (Ne)
```

---

## Step 3: Deploy to Production

### Automated Deployment (Recommended)

```bash
cd /Users/me/role-directory

# Run deployment script
./scripts/deploy-initial-schema.sh production
```

**⚠️ Production Confirmation:**

The script will prompt:
```
⚠️  WARNING: You are about to deploy to PRODUCTION

Type 'DEPLOY' to confirm:
```

Type `DEPLOY` and press Enter to proceed.

**Expected Output:** Same as staging deployment

### Manual Deployment (Alternative)

```bash
# Set DATABASE_URL
export DATABASE_URL="$DATABASE_URL_PRD"

# Apply migration
psql "$DATABASE_URL" -f migrations/20251109013210_initial_schema.up.sql

# Track migration
psql "$DATABASE_URL" -c "
  INSERT INTO schema_migrations (version, description) 
  VALUES ('20251109013210_initial_schema', 'Initial schema - periodic_table')
  ON CONFLICT (version) DO NOTHING
"

# Verify
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM periodic_table"
psql "$DATABASE_URL" -c "SELECT * FROM periodic_table WHERE \"AtomicNumber\" = 10"
```

---

## Step 4: Verify Schema Consistency

After deploying to both environments, verify consistency:

```bash
# Count tables in each environment
echo "=== DEV ==="
psql "$DATABASE_URL" -c "
  SELECT COUNT(*) FROM information_schema.tables 
  WHERE table_schema='public' AND table_type='BASE TABLE'
"

echo "=== STAGING ==="
psql "$DATABASE_URL_STG" -c "
  SELECT COUNT(*) FROM information_schema.tables 
  WHERE table_schema='public' AND table_type='BASE TABLE'
"

echo "=== PRODUCTION ==="
psql "$DATABASE_URL_PRD" -c "
  SELECT COUNT(*) FROM information_schema.tables 
  WHERE table_schema='public' AND table_type='BASE TABLE'
"

# Expected: Same count in all environments (2 tables: schema_migrations + periodic_table)
```

---

## Step 5: Document Deployment Timestamps

After successful deployment, record the timestamps in the story completion notes:

```bash
# Get deployment timestamps
echo "=== Staging Deployment ==="
psql "$DATABASE_URL_STG" -c "
  SELECT version, applied_at 
  FROM schema_migrations 
  WHERE version LIKE '%initial_schema%'
"

echo "=== Production Deployment ==="
psql "$DATABASE_URL_PRD" -c "
  SELECT version, applied_at 
  FROM schema_migrations 
  WHERE version LIKE '%initial_schema%'
"
```

Add to story completion notes:
```
- Migration applied to staging: [timestamp]
- Migration applied to production: [timestamp]
- Schema consistent across all three environments: ✅
```

---

## Troubleshooting

### Issue: DATABASE_URL not set

**Error:**
```
❌ Error: DATABASE_URL_STG environment variable not set
```

**Solution:**
```bash
# Get connection string from Neon Console
# Set environment variable
export DATABASE_URL_STG="postgresql://user:pass@host/dbname?sslmode=require"
```

### Issue: Cannot connect to database

**Error:**
```
❌ Error: Cannot connect to database
```

**Solution:**
1. Check connection string is correct
2. Verify network connectivity
3. Check Neon database is not suspended (wake it by accessing in Neon Console)

### Issue: schema_migrations table not found

**Error:**
```
❌ Error: schema_migrations table not found
```

**Solution:**
Deploy Story 2.3 bootstrap migration first:
```bash
psql "$DATABASE_URL_STG" -f migrations/20251108233706_create_schema_migrations.up.sql
```

### Issue: periodic_table already exists

**Warning:**
```
⚠️  Warning: periodic_table already exists
```

**Solution:**
The script will prompt to drop and recreate. Type `yes` if you want to replace it.

Or manually drop:
```bash
psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS periodic_table CASCADE"
psql "$DATABASE_URL" -c "DELETE FROM schema_migrations WHERE version LIKE '%initial_schema%'"
```

---

## Rollback Procedure (Emergency Only)

If you need to rollback the deployment:

```bash
# Set DATABASE_URL to environment (staging or production)
export DATABASE_URL="$DATABASE_URL_STG"  # or DATABASE_URL_PRD

# Apply rollback migration
psql "$DATABASE_URL" -f migrations/20251109013210_initial_schema.down.sql

# Remove from tracking
psql "$DATABASE_URL" -c "DELETE FROM schema_migrations WHERE version LIKE '%initial_schema%'"

# Verify
psql "$DATABASE_URL" -c "\dt"
# Expected: Only schema_migrations table should remain
```

---

## Success Criteria

✅ **Deployment is successful when:**

1. ✅ Staging deployment completes without errors
2. ✅ Production deployment completes without errors
3. ✅ All three environments have 118 elements in periodic_table
4. ✅ Test query returns Neon (Ne) for element 10 in all environments
5. ✅ Migration recorded in schema_migrations in all environments
6. ✅ Schema is consistent across dev, staging, and production

---

## Next Steps After Deployment

1. ✅ Mark Story 2.4 as **done** in sprint-status.yaml
2. ✅ Update story completion notes with deployment timestamps
3. ✅ Move to Story 2.5 (Database Connection Testing in Health Check)

---

**Need Help?**

If you encounter issues during deployment:
1. Check this troubleshooting guide
2. Verify prerequisites are met
3. Test database connections manually
4. Check Neon Console for database status

---

**Deployment Checklist:**

- [ ] DATABASE_URL_STG configured
- [ ] DATABASE_URL_PRD configured
- [ ] psql command available
- [ ] Migration files present
- [ ] Story 2.3 deployed to staging/production
- [ ] Staging deployment completed
- [ ] Staging verification passed
- [ ] Production deployment completed
- [ ] Production verification passed
- [ ] Schema consistency verified
- [ ] Deployment timestamps documented
- [ ] Story 2.4 marked done

