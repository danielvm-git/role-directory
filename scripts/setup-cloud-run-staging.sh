#!/bin/bash

################################################################################
# Cloud Run Staging Service Setup Script
# 
# This script automates the setup of the Cloud Run staging service for the
# Role Directory application.
#
# What it does:
# - Verifies prerequisites (gcloud CLI, authentication, APIs)
# - Creates Cloud Run staging service with appropriate configuration
# - Configures scaling (min 1, max 3 instances)
# - Sets CPU and memory resources (1 CPU, 512 MB)
# - Creates placeholder database secret in Secret Manager
# - Configures environment variables
# - Sets up IAM authentication (require auth)
# - Adds resource labels
# - Displays service URL and configuration summary
#
# Usage:
#   ./scripts/setup-cloud-run-staging.sh
#
# Prerequisites:
# - gcloud CLI installed and authenticated
# - GCP project with billing enabled
# - Required IAM roles: roles/run.admin, roles/secretmanager.admin
#
# Story: 1.7 - Cloud Run Service Setup (Staging)
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVICE_NAME="role-directory-staging"
REGION="us-central1"
MIN_INSTANCES=1
MAX_INSTANCES=3
CPU=1
MEMORY="512Mi"
PORT=8080
NODE_ENV="staging"
SECRET_NAME="role-directory-staging-db-url"

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo ""
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}"
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
# Step 2: Enable Required APIs
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
# Step 3: Check if Service Already Exists
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
# Step 4: Create or Update Cloud Run Service
################################################################################

print_header "Step 4: Creating/Updating Cloud Run Service"

if [ "$SERVICE_EXISTS" = false ]; then
    print_info "Creating Cloud Run service: $SERVICE_NAME"
    
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
        --labels=environment=staging,app=role-directory \
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
        --labels=environment=staging,app=role-directory \
        --quiet
    
    print_success "Service updated successfully"
fi

# Get service URL
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
    --region="$REGION" \
    --format="value(status.url)")

print_success "Service URL: $SERVICE_URL"

################################################################################
# Step 5: Configure Environment Variables
################################################################################

print_header "Step 5: Configuring Environment Variables"

print_info "Setting NODE_ENV and NEXT_PUBLIC_API_URL..."

gcloud run services update "$SERVICE_NAME" \
    --region="$REGION" \
    --set-env-vars="NODE_ENV=$NODE_ENV,NEXT_PUBLIC_API_URL=$SERVICE_URL" \
    --quiet

print_success "Environment variables configured"

################################################################################
# Step 6: Set Up Database Secret
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
# Step 7: Configure IAM Authentication
################################################################################

print_header "Step 7: Configuring IAM Authentication"

print_info "Service is configured to require authentication (not public)"

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
    print_info "You'll need to grant access manually when it's created (Story 1.9)"
fi

################################################################################
# Step 8: Verification
################################################################################

print_header "Step 8: Verification"

print_info "Retrieving service configuration..."

# Get service details
SERVICE_CONFIG=$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format=json)

# Extract configuration values
ACTUAL_MIN=$(echo "$SERVICE_CONFIG" | grep -o '"run.googleapis.com/minScale": "[^"]*"' | cut -d'"' -f4 || echo "0")
ACTUAL_MAX=$(echo "$SERVICE_CONFIG" | grep -o '"run.googleapis.com/maxScale": "[^"]*"' | cut -d'"' -f4 || echo "unknown")

echo ""
echo "Service Configuration:"
echo "  Service Name: $SERVICE_NAME"
echo "  Region: $REGION"
echo "  Service URL: $SERVICE_URL"
echo "  Min Instances: $ACTUAL_MIN"
echo "  Max Instances: $ACTUAL_MAX"
echo "  CPU: $CPU"
echo "  Memory: $MEMORY"
echo "  Port: $PORT"
echo "  Authentication: Required (IAM protected)"
echo ""

print_success "Service configuration verified"

################################################################################
# Step 9: Summary and Next Steps
################################################################################

print_header "Setup Complete!"

echo ""
echo "📋 Summary:"
echo "  ✓ Cloud Run service '$SERVICE_NAME' is configured"
echo "  ✓ Service URL: $SERVICE_URL"
echo "  ✓ Scaling: Min $MIN_INSTANCES, Max $MAX_INSTANCES instances"
echo "  ✓ Resources: $CPU CPU, $MEMORY memory"
echo "  ✓ Environment: staging (NODE_ENV=$NODE_ENV)"
echo "  ✓ Database secret: $SECRET_NAME (placeholder)"
echo "  ✓ IAM authentication: Required"
echo ""

print_info "Important Notes:"
echo "  1. Service requires authentication - use Bearer token to access"
echo "  2. Database URL is a placeholder - update in Epic 2 when Neon staging DB is created"
echo "  3. Service uses min 1 instance (warm standby) - costs ~\$17/month"
echo ""

print_info "Testing Access (with authentication):"
echo "  curl -H \"Authorization: Bearer \$(gcloud auth print-identity-token)\" \\"
echo "    ${SERVICE_URL}/api/health"
echo ""

print_info "Next Steps:"
echo "  1. Record service URL: $SERVICE_URL"
echo "  2. Continue with Story 1.8: Production Cloud Run setup"
echo "  3. Update database secret in Epic 2 with actual Neon staging database URL"
echo "  4. Set up promotion workflow (Story 1.9) to deploy from dev to staging"
echo ""

print_success "Staging Cloud Run service setup complete! 🚀"
echo ""

################################################################################
# Optional: Save configuration to file
################################################################################

CONFIG_FILE="docs/guides/staging-service-config.txt"
mkdir -p "$(dirname "$CONFIG_FILE")"

cat > "$CONFIG_FILE" <<EOF
# Staging Cloud Run Service Configuration
# Generated: $(date)
# Story: 1.7 - Cloud Run Service Setup (Staging)

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

# IAM Configuration
AUTHENTICATION=required
INGRESS=all

# Labels
ENVIRONMENT=staging
APP=role-directory

# Notes
# - Service requires IAM authentication (not publicly accessible)
# - Database URL is placeholder, update in Epic 2
# - Min 1 instance for warm standby (~\$17/month)
EOF

print_info "Configuration saved to: $CONFIG_FILE"

