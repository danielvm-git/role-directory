#!/bin/bash

###############################################################################
# Deploy Initial Schema Migration
# 
# Deploys the periodic_table migration to staging or production environment.
# 
# Usage:
#   ./scripts/deploy-initial-schema.sh staging
#   ./scripts/deploy-initial-schema.sh production
#
# Prerequisites:
#   - DATABASE_URL_STG or DATABASE_URL_PRD environment variable set
#   - psql command available
#   - Migration files exist in migrations/ directory
###############################################################################

set -e  # Exit on error

ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
  echo "❌ Error: Environment not specified"
  echo ""
  echo "Usage: $0 <environment>"
  echo "  environment: staging or production"
  echo ""
  echo "Example:"
  echo "  $0 staging"
  exit 1
fi

# Normalize environment name
case "$ENVIRONMENT" in
  staging|stg|STG|STAGING)
    ENV="staging"
    DB_VAR="DATABASE_URL_STG"
    ;;
  production|prod|prd|PRD|PRODUCTION)
    ENV="production"
    DB_VAR="DATABASE_URL_PRD"
    ;;
  *)
    echo "❌ Error: Invalid environment: $ENVIRONMENT"
    echo "   Valid options: staging, production"
    exit 1
    ;;
esac

echo "=========================================="
echo "Initial Schema Migration Deployment"
echo "Environment: $ENV"
echo "=========================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "${!DB_VAR}" ]; then
  echo "❌ Error: $DB_VAR environment variable not set"
  echo ""
  echo "Please set the database URL for $ENV:"
  echo "  export $DB_VAR=\"postgresql://user:pass@host/dbname?sslmode=require\""
  echo ""
  exit 1
fi

DATABASE_URL="${!DB_VAR}"

# Check if psql is available
if ! command -v psql &> /dev/null; then
  echo "❌ Error: psql command not found"
  echo "   Please install PostgreSQL client tools"
  exit 1
fi

# Check if migration file exists
MIGRATION_FILE="migrations/20251109013210_initial_schema.up.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ Error: Migration file not found: $MIGRATION_FILE"
  exit 1
fi

echo "📋 Pre-deployment Checks"
echo "------------------------"
echo "✅ Database URL configured: $DB_VAR"
echo "✅ psql command available"
echo "✅ Migration file found: $MIGRATION_FILE"
echo ""

# Test database connection
echo "🔌 Testing database connection..."
if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
  echo "✅ Database connection successful"
else
  echo "❌ Error: Cannot connect to database"
  echo "   Check your DATABASE_URL and network connectivity"
  exit 1
fi
echo ""

# Check/Create schema_migrations table
echo "📊 Checking schema_migrations table..."
if psql "$DATABASE_URL" -c "SELECT 1 FROM schema_migrations LIMIT 1" > /dev/null 2>&1; then
  echo "✅ schema_migrations table exists"
else
  echo "⚙️  schema_migrations table not found - creating it..."
  psql "$DATABASE_URL" -c "
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      description TEXT
    )
  " > /dev/null
  if [ $? -eq 0 ]; then
    echo "✅ schema_migrations table created"
  else
    echo "❌ Error: Could not create schema_migrations table"
    exit 1
  fi
fi
echo ""

# Check if periodic_table already exists
echo "🔍 Checking for existing periodic_table..."
if psql "$DATABASE_URL" -c "SELECT 1 FROM periodic_table LIMIT 1" > /dev/null 2>&1; then
  echo "⚠️  Warning: periodic_table already exists"
  echo ""
  read -p "Do you want to drop and recreate? (yes/no): " RECREATE
  if [ "$RECREATE" = "yes" ]; then
    echo "🗑️  Dropping existing periodic_table..."
    psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS periodic_table CASCADE"
    psql "$DATABASE_URL" -c "DELETE FROM schema_migrations WHERE version LIKE '%initial_schema%'"
    echo "✅ Existing table dropped"
  else
    echo "❌ Deployment cancelled"
    exit 1
  fi
fi
echo ""

# Confirmation prompt for production
if [ "$ENV" = "production" ]; then
  echo "⚠️  WARNING: You are about to deploy to PRODUCTION"
  echo ""
  read -p "Type 'DEPLOY' to confirm: " CONFIRM
  if [ "$CONFIRM" != "DEPLOY" ]; then
    echo "❌ Deployment cancelled"
    exit 1
  fi
  echo ""
fi

# Apply migration
echo "🚀 Applying migration..."
echo "------------------------"
if psql "$DATABASE_URL" -f "$MIGRATION_FILE"; then
  echo ""
  echo "✅ Migration applied successfully"
else
  echo ""
  echo "❌ Error: Migration failed"
  exit 1
fi
echo ""

# Track migration
echo "📝 Recording migration in schema_migrations..."
MIGRATION_VERSION="20251109013210_initial_schema"
psql "$DATABASE_URL" -c "
  INSERT INTO schema_migrations (version, description, applied_at) 
  VALUES (
    '$MIGRATION_VERSION', 
    'Initial schema - periodic_table from Neon sample data',
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (version) DO NOTHING
" > /dev/null

if [ $? -eq 0 ]; then
  echo "✅ Migration tracked successfully"
else
  echo "⚠️  Warning: Could not track migration (may already be recorded)"
fi
echo ""

# Verify deployment
echo "🔎 Verifying deployment..."
echo "------------------------"

# Check element count
ELEMENT_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM periodic_table" | tr -d ' ')
if [ "$ELEMENT_COUNT" = "118" ]; then
  echo "✅ Element count correct: 118"
else
  echo "❌ Error: Element count incorrect: $ELEMENT_COUNT (expected 118)"
  exit 1
fi

# Test query for Neon (element 10)
NEON_SYMBOL=$(psql "$DATABASE_URL" -t -c "SELECT \"Symbol\" FROM periodic_table WHERE \"AtomicNumber\" = 10" | tr -d ' ')
if [ "$NEON_SYMBOL" = "Ne" ]; then
  echo "✅ Test query successful: Element 10 = Ne (Neon)"
else
  echo "❌ Error: Test query failed"
  exit 1
fi

# Check migration tracking
TRACKED=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM schema_migrations WHERE version LIKE '%initial_schema%'" | tr -d ' ')
if [ "$TRACKED" = "1" ]; then
  echo "✅ Migration tracked in schema_migrations"
else
  echo "⚠️  Warning: Migration not tracked properly"
fi

echo ""
echo "=========================================="
echo "✅ Deployment Complete"
echo "=========================================="
echo ""
echo "Environment: $ENV"
echo "Table: periodic_table"
echo "Elements: 118"
echo "Migration: 20251109013210_initial_schema"
echo ""
echo "Next steps:"
echo "  1. Verify queries work: psql \$DATABASE_URL -c 'SELECT * FROM periodic_table LIMIT 5'"
echo "  2. Document deployment timestamp in story completion notes"
if [ "$ENV" = "staging" ]; then
  echo "  3. Deploy to production: ./scripts/deploy-initial-schema.sh production"
fi
echo ""

