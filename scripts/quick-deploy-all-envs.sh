#!/bin/bash

###############################################################################
# Quick Deploy: Fetch Secrets and Deploy to Staging + Production
# 
# This script fetches database URLs from Google Secret Manager and deploys
# the initial schema migration to both staging and production.
###############################################################################

set -e  # Exit on error

echo "=========================================="
echo "Multi-Environment Deployment"
echo "Story 2.4: Initial Schema Migration"
echo "=========================================="
echo ""

# Check if gcloud is available
if command -v gcloud &> /dev/null; then
  echo "🔑 Fetching database URLs from Secret Manager..."
  
  # Fetch staging URL
  if DATABASE_URL_STG=$(gcloud secrets versions access latest --secret="staging-database-url" 2>/dev/null); then
    echo "✅ Staging URL retrieved from Secret Manager"
    export DATABASE_URL_STG
  else
    echo "⚠️  Could not retrieve staging-database-url from Secret Manager"
    echo "   Please set manually: export DATABASE_URL_STG=\"postgresql://...\""
  fi
  
  # Fetch production URL
  if DATABASE_URL_PRD=$(gcloud secrets versions access latest --secret="production-database-url" 2>/dev/null); then
    echo "✅ Production URL retrieved from Secret Manager"
    export DATABASE_URL_PRD
  else
    echo "⚠️  Could not retrieve production-database-url from Secret Manager"
    echo "   Please set manually: export DATABASE_URL_PRD=\"postgresql://...\""
  fi
  echo ""
else
  echo "⚠️  gcloud command not found"
  echo "   Please set environment variables manually:"
  echo "   export DATABASE_URL_STG=\"postgresql://...\""
  echo "   export DATABASE_URL_PRD=\"postgresql://...\""
  echo ""
  exit 1
fi

# Check if URLs are set
if [ -z "$DATABASE_URL_STG" ] || [ -z "$DATABASE_URL_PRD" ]; then
  echo "❌ Error: Database URLs not configured"
  exit 1
fi

echo "=========================================="
echo "STAGING DEPLOYMENT"
echo "=========================================="
echo ""

# Deploy to staging
if ./scripts/deploy-initial-schema.sh staging; then
  echo ""
  echo "✅ Staging deployment successful"
  STAGING_SUCCESS=true
else
  echo ""
  echo "❌ Staging deployment failed"
  STAGING_SUCCESS=false
fi

echo ""
echo "=========================================="
echo "PRODUCTION DEPLOYMENT"
echo "=========================================="
echo ""

if [ "$STAGING_SUCCESS" = true ]; then
  echo "⚠️  Staging deployment succeeded. Ready to deploy to production."
  echo ""
  
  # Deploy to production
  if ./scripts/deploy-initial-schema.sh production; then
    echo ""
    echo "✅ Production deployment successful"
    PRODUCTION_SUCCESS=true
  else
    echo ""
    echo "❌ Production deployment failed"
    PRODUCTION_SUCCESS=false
  fi
else
  echo "❌ Skipping production deployment (staging failed)"
  PRODUCTION_SUCCESS=false
fi

echo ""
echo "=========================================="
echo "DEPLOYMENT SUMMARY"
echo "=========================================="
echo ""

if [ "$STAGING_SUCCESS" = true ]; then
  echo "✅ Staging: DEPLOYED"
else
  echo "❌ Staging: FAILED"
fi

if [ "$PRODUCTION_SUCCESS" = true ]; then
  echo "✅ Production: DEPLOYED"
else
  echo "❌ Production: FAILED (or skipped)"
fi

echo ""

if [ "$STAGING_SUCCESS" = true ] && [ "$PRODUCTION_SUCCESS" = true ]; then
  echo "🎉 All deployments successful!"
  echo ""
  echo "Next steps:"
  echo "  1. Verify deployments with test queries"
  echo "  2. Document deployment timestamps in story"
  echo "  3. Mark Story 2.4 as done"
  echo ""
  exit 0
else
  echo "⚠️  Some deployments failed. Check logs above."
  exit 1
fi

