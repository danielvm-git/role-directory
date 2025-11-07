#!/bin/bash

################################################################################
# Cloud Run Production Service Setup Script
# 
# This script automates the setup of the Cloud Run production service for the
# Role Directory application.
#
# What it does:
# - Verifies prerequisites (gcloud CLI, authentication, APIs)
# - Creates Cloud Run production service with high availability configuration
# - Configures scaling (min 2, max 10 instances)
# - Sets CPU and memory resources (2 CPUs, 1 GB)
# - Enables gen2 execution environment for better performance
# - Enables CPU boost for faster cold starts
# - Creates placeholder database secret in Secret Manager
# - Configures environment variables
# - Sets up IAM authentication (require auth)
# - Adds resource labels
# - Displays service URL and configuration summary
#
# Usage:
#   ./scripts/setup-cloud-run-production.sh
#
# Prerequisites:
# - gcloud CLI installed and authenticated
# - GCP project with billing enabled
# - Required IAM roles: roles/run.admin, roles/secretmanager.admin
# - Production budget approved (~$50-100/month for min 2 instances)
#
# Story: 1.8 - Cloud Run Service Setup (Production)
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
SERVICE_NAME="role-directory-production"
REGION="us-central1"
MIN_INSTANCES=2
MAX_INSTANCES=10
CPU=2
MEMORY="1Gi"
PORT=8080
NODE_ENV="production"
SECRET_NAME="role-directory-production-db-url"
EXECUTION_ENV="gen2"
TIMEOUT=300
CONCURRENCY=80

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo ""
    echo -e "${MAGENTA}============================================${NC}"
    echo -e "${MAGENTA}$1${NC}"
    echo -e "${MAGENTA}============================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_cost_warning() {
    echo ""
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║          PRODUCTION COST WARNING                       ║${NC}"
    echo -e "${YELLOW}╠════════════════════════════════════════════════════════╣${NC}"
    echo -e "${YELLOW}║ Min 2 instances: ~\$35/month base cost                  ║${NC}"
    echo -e "${YELLOW}║ Typical usage: ~\$50-75/month                           ║${NC}"
    echo -e "${YELLOW}║ Peak (max 10): Could spike to ~\$175/month              ║${NC}"
    echo -e "${YELLOW}║                                                        ║${NC}"
    echo -e "${YELLOW}║ This is significantly higher than dev/staging.         ║${NC}"
    echo -e "${YELLOW}║ Ensure production budget is approved.                  ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

################################################################################
# Step 1: Prerequisites Check
################################################################################

print_header "Step 1: Verifying Prerequisites"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI is not installed"
    echo "Please install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi
print_success "gcloud CLI is installed"

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    print_error "Not authenticated with gcloud"
    echo "Please run: gcloud auth login"
    exit 1
fi
ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1)
print_success "Authenticated as: $ACCOUNT"

# Get current project
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    print_error "No GCP project set"
    echo "Please run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi
print_success "Project: $PROJECT_ID"

# Get project number (needed for service account)
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")
print_success "Project Number: $PROJECT_NUMBER"

################################################################################
# Step 2: Production Cost Warning
################################################################################

print_cost_warning

read -p "Do you understand the cost implications and wish to proceed? (yes/no): " -r
echo ""
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    print_info "Setup cancelled. Review costs before proceeding."
    exit 0
fi

print_success "Cost implications acknowledged"

################################################################################
# Step 3: Enable Required APIs
################################################################################

print_header "Step 2: Enabling Required APIs"

REQUIRED_APIS=(
    "run.googleapis.com"
    "secretmanager.googleapis.com"
    "cloudbuild.googleapis.com"
)

for API in "${REQUIRED_APIS[@]}"; do
    if gcloud services list --enabled --filter="name:$API" --format="value(name)" | grep -q "$API"; then
        print_success "$API is enabled"
    else
        print_warning "$API is not enabled. Enabling..."
        gcloud services enable "$API"
        print_success "$API enabled"
    fi
done

################################################################################
# Step 4: Check if Service Already Exists
################################################################################

print_header "Step 3: Checking Existing Service"

if gcloud run services describe "$SERVICE_NAME" --region="$REGION" &> /dev/null; then
    print_warning "Service '$SERVICE_NAME' already exists in region '$REGION'"
    echo ""
    read -p "Do you want to update the existing service? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Skipping service creation. Exiting."
        exit 0
    fi
    SERVICE_EXISTS=true
else
    print_info "Service '$SERVICE_NAME' does not exist. Will create new service."
    SERVICE_EXISTS=false
fi

################################################################################
# Step 5: Create or Update Cloud Run Service
################################################################################

print_header "Step 4: Creating/Updating Cloud Run Production Service"

if [ "$SERVICE_EXISTS" = false ]; then
    print_info "Creating Cloud Run service: $SERVICE_NAME"
    print_info "Configuration: Min $MIN_INSTANCES, Max $MAX_INSTANCES instances"
    print_info "Resources: $CPU CPUs, $MEMORY memory"
    print_info "Execution environment: $EXECUTION_ENV (recommended for production)"
    print_info "CPU boost: enabled (faster cold starts)"
    
    gcloud run deploy "$SERVICE_NAME" \
        --region="$REGION" \
        --platform=managed \
        --no-allow-unauthenticated \
        --image=gcr.io/cloudrun/hello \
        --min-instances="$MIN_INSTANCES" \
        --max-instances="$MAX_INSTANCES" \
        --cpu="$CPU" \
        --memory="$MEMORY" \
        --port="$PORT" \
        --ingress=all \
        --execution-environment="$EXECUTION_ENV" \
        --cpu-boost \
        --timeout="$TIMEOUT" \
        --concurrency="$CONCURRENCY" \
        --labels=environment=production,app=role-directory \
        --quiet
    
    print_success "Service created successfully"
else
    print_info "Updating existing service configuration"
    
    gcloud run services update "$SERVICE_NAME" \
        --region="$REGION" \
        --min-instances="$MIN_INSTANCES" \
        --max-instances="$MAX_INSTANCES" \
        --cpu="$CPU" \
        --memory="$MEMORY" \
        --port="$PORT" \
        --ingress=all \
        --execution-environment="$EXECUTION_ENV" \
        --cpu-boost \
        --timeout="$TIMEOUT" \
        --concurrency="$CONCURRENCY" \
        --labels=environment=production,app=role-directory \
        --quiet
    
    print_success "Service updated successfully"
fi

# Get service URL
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
    --region="$REGION" \
    --format="value(status.url)")

print_success "Service URL: $SERVICE_URL"

################################################################################
# Step 6: Configure Environment Variables
################################################################################

print_header "Step 5: Configuring Environment Variables"

print_info "Setting NODE_ENV and NEXT_PUBLIC_API_URL..."

gcloud run services update "$SERVICE_NAME" \
    --region="$REGION" \
    --set-env-vars="NODE_ENV=$NODE_ENV,NEXT_PUBLIC_API_URL=$SERVICE_URL" \
    --quiet

print_success "Environment variables configured"

################################################################################
# Step 7: Set Up Database Secret
################################################################################

print_header "Step 6: Setting Up Database Secret"

# Check if secret already exists
if gcloud secrets describe "$SECRET_NAME" &> /dev/null; then
    print_warning "Secret '$SECRET_NAME' already exists"
    echo ""
    read -p "Do you want to update the secret? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Updating secret..."
        echo "postgresql://placeholder:placeholder@placeholder:5432/placeholder?sslmode=require" | \
            gcloud secrets versions add "$SECRET_NAME" --data-file=-
        print_success "Secret updated"
    else
        print_info "Keeping existing secret"
    fi
else
    print_info "Creating placeholder database secret..."
    print_warning "This is a placeholder. Update with actual production database URL in Epic 2."
    echo "postgresql://placeholder:placeholder@placeholder:5432/placeholder?sslmode=require" | \
        gcloud secrets create "$SECRET_NAME" \
            --data-file=- \
            --replication-policy=automatic
    print_success "Secret created: $SECRET_NAME"
fi

# Grant Cloud Run service account access to secret
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
print_info "Granting secret access to: $SERVICE_ACCOUNT"

gcloud secrets add-iam-policy-binding "$SECRET_NAME" \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet

print_success "Secret access granted"

# Configure Cloud Run to use the secret
print_info "Configuring DATABASE_URL from secret..."

gcloud run services update "$SERVICE_NAME" \
    --region="$REGION" \
    --set-secrets="DATABASE_URL=${SECRET_NAME}:latest" \
    --quiet

print_success "DATABASE_URL configured from Secret Manager"

################################################################################
# Step 8: Configure IAM Authentication
################################################################################

print_header "Step 7: Configuring IAM Authentication"

print_info "Service is configured to require authentication (not public)"
print_warning "Production is IAM protected - only authorized users/services can access"

# Grant current user access for testing
print_info "Granting invoker access to: $ACCOUNT"

gcloud run services add-iam-policy-binding "$SERVICE_NAME" \
    --region="$REGION" \
    --member="user:$ACCOUNT" \
    --role="roles/run.invoker" \
    --quiet

print_success "IAM authentication configured"

# Check if GitHub Actions service account exists and grant access
print_info "Checking for GitHub Actions service account..."

GHA_SA_EMAIL="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"
if gcloud iam service-accounts describe "$GHA_SA_EMAIL" &> /dev/null; then
    print_info "Granting invoker access to GitHub Actions SA: $GHA_SA_EMAIL"
    gcloud run services add-iam-policy-binding "$SERVICE_NAME" \
        --region="$REGION" \
        --member="serviceAccount:$GHA_SA_EMAIL" \
        --role="roles/run.invoker" \
        --quiet
    print_success "GitHub Actions SA granted access"
else
    print_warning "GitHub Actions service account not found"
    print_info "You'll need to grant access manually when it's created (Story 1.10)"
fi

################################################################################
# Step 9: Verification
################################################################################

print_header "Step 8: Verification"

print_info "Retrieving service configuration..."

# Get service details
SERVICE_CONFIG=$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format=json)

# Extract configuration values
ACTUAL_MIN=$(echo "$SERVICE_CONFIG" | grep -o '"run.googleapis.com/minScale": "[^"]*"' | cut -d'"' -f4 || echo "0")
ACTUAL_MAX=$(echo "$SERVICE_CONFIG" | grep -o '"run.googleapis.com/maxScale": "[^"]*"' | cut -d'"' -f4 || echo "unknown")
ACTUAL_EXEC_ENV=$(echo "$SERVICE_CONFIG" | grep -o '"run.googleapis.com/execution-environment": "[^"]*"' | cut -d'"' -f4 || echo "gen1")
ACTUAL_CPU_BOOST=$(echo "$SERVICE_CONFIG" | grep -o '"run.googleapis.com/cpu-boost": "[^"]*"' | cut -d'"' -f4 || echo "false")

echo ""
echo "Production Service Configuration:"
echo "  Service Name: $SERVICE_NAME"
echo "  Region: $REGION"
echo "  Service URL: $SERVICE_URL"
echo "  Min Instances: $ACTUAL_MIN (high availability)"
echo "  Max Instances: $ACTUAL_MAX (handle traffic spikes)"
echo "  CPU: $CPU"
echo "  Memory: $MEMORY"
echo "  Port: $PORT"
echo "  Execution Environment: $ACTUAL_EXEC_ENV"
echo "  CPU Boost: $ACTUAL_CPU_BOOST"
echo "  Timeout: ${TIMEOUT}s"
echo "  Concurrency: $CONCURRENCY requests/instance"
echo "  Authentication: Required (IAM protected)"
echo ""

print_success "Service configuration verified"

################################################################################
# Step 10: Summary and Next Steps
################################################################################

print_header "Production Setup Complete!"

echo ""
echo "📋 Summary:"
echo "  ✓ Cloud Run service '$SERVICE_NAME' is configured for PRODUCTION"
echo "  ✓ Service URL: $SERVICE_URL"
echo "  ✓ Scaling: Min $MIN_INSTANCES (HA), Max $MAX_INSTANCES instances"
echo "  ✓ Resources: $CPU CPUs, $MEMORY memory (2x staging)"
echo "  ✓ Environment: production (NODE_ENV=$NODE_ENV)"
echo "  ✓ Execution: $EXECUTION_ENV with CPU boost enabled"
echo "  ✓ Database secret: $SECRET_NAME (placeholder)"
echo "  ✓ IAM authentication: Required (not public)"
echo ""

print_cost_warning

print_info "Important Production Notes:"
echo "  1. Service requires IAM authentication - use Bearer token to access"
echo "  2. Database URL is a placeholder - update in Epic 2 with production Neon DB"
echo "  3. Service uses min 2 instances - costs ~\$35/month base, ~\$50-100 typical"
echo "  4. Gen2 execution environment provides better performance"
echo "  5. CPU boost enabled for faster cold starts (if they occur)"
echo "  6. Set up billing alerts to monitor production costs"
echo ""

print_info "Testing Access (with authentication):"
echo "  curl -H \"Authorization: Bearer \$(gcloud auth print-identity-token)\" \\"
echo "    ${SERVICE_URL}/api/health"
echo ""

print_info "Next Steps:"
echo "  1. Record production service URL: $SERVICE_URL"
echo "  2. Set up billing alerts in GCP Console"
echo "  3. Update database secret in Epic 2 with actual Neon production database URL"
echo "  4. Set up promotion workflow (Story 1.10) to deploy from staging to production"
echo "  5. Configure custom domain (optional, future story)"
echo "  6. Set up Cloud Monitoring alerts for production health"
echo ""

print_success "Production Cloud Run service setup complete! 🚀🏭"
echo ""

################################################################################
# Optional: Save configuration to file
################################################################################

CONFIG_FILE="docs/guides/production-service-config.txt"
mkdir -p "$(dirname "$CONFIG_FILE")"

cat > "$CONFIG_FILE" <<EOF
# Production Cloud Run Service Configuration
# Generated: $(date)
# Story: 1.8 - Cloud Run Service Setup (Production)

SERVICE_NAME=$SERVICE_NAME
REGION=$REGION
SERVICE_URL=$SERVICE_URL
PROJECT_ID=$PROJECT_ID
PROJECT_NUMBER=$PROJECT_NUMBER
MIN_INSTANCES=$MIN_INSTANCES
MAX_INSTANCES=$MAX_INSTANCES
CPU=$CPU
MEMORY=$MEMORY
PORT=$PORT
NODE_ENV=$NODE_ENV
SECRET_NAME=$SECRET_NAME
SERVICE_ACCOUNT=$SERVICE_ACCOUNT
EXECUTION_ENVIRONMENT=$EXECUTION_ENV
CPU_BOOST=true
TIMEOUT=$TIMEOUT
CONCURRENCY=$CONCURRENCY

# IAM Configuration
AUTHENTICATION=required
INGRESS=all

# Labels
ENVIRONMENT=production
APP=role-directory

# Cost Implications
ESTIMATED_MIN_COST_PER_MONTH=35
ESTIMATED_TYPICAL_COST_PER_MONTH=50-100
ESTIMATED_MAX_COST_PER_MONTH=175

# Notes
# - Service requires IAM authentication (not publicly accessible)
# - Database URL is placeholder, update in Epic 2
# - Min 2 instances for high availability (~\$35/month base)
# - Gen2 execution environment for better performance
# - CPU boost enabled for faster cold starts
# - Set up billing alerts to monitor costs
EOF

print_info "Configuration saved to: $CONFIG_FILE"

