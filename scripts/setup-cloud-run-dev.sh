#!/bin/bash

# Cloud Run Dev Environment Setup Script
# This script automates the setup of Cloud Run service for the dev environment
# Run this after authenticating with gcloud CLI

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="role-directory-dev"
SECRET_NAME="role-directory-dev-db-url"

echo -e "${GREEN}=== Cloud Run Dev Environment Setup ===${NC}"
echo ""

# Step 1: Check prerequisites
echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"

if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}ERROR: gcloud CLI not found. Please install it first.${NC}"
    echo "Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q @; then
    echo -e "${RED}ERROR: Not authenticated with gcloud. Please run 'gcloud auth login'${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites checked${NC}"
echo ""

# Step 2: Set/verify project
echo -e "${YELLOW}Step 2: Setting up GCP project...${NC}"

if [ -z "$PROJECT_ID" ]; then
    CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")
    
    if [ -z "$CURRENT_PROJECT" ]; then
        echo -e "${YELLOW}No project set. Available projects:${NC}"
        gcloud projects list
        echo ""
        read -p "Enter project ID (or press Enter to create new): " PROJECT_ID
        
        if [ -z "$PROJECT_ID" ]; then
            read -p "Enter new project ID: " PROJECT_ID
            echo -e "${YELLOW}Creating project: $PROJECT_ID${NC}"
            gcloud projects create "$PROJECT_ID" --name="Role Directory Dev"
        fi
    else
        PROJECT_ID="$CURRENT_PROJECT"
        echo -e "${GREEN}Using current project: $PROJECT_ID${NC}"
    fi
fi

gcloud config set project "$PROJECT_ID"
echo -e "${GREEN}✓ Project set: $PROJECT_ID${NC}"
echo ""

# Step 3: Check billing
echo -e "${YELLOW}Step 3: Verifying billing...${NC}"

BILLING_ENABLED=$(gcloud billing projects describe "$PROJECT_ID" \
    --format="value(billingEnabled)" 2>/dev/null || echo "false")

if [ "$BILLING_ENABLED" != "True" ]; then
    echo -e "${RED}WARNING: Billing not enabled for this project!${NC}"
    echo "Cloud Run requires an active billing account."
    echo ""
    gcloud billing accounts list
    echo ""
    read -p "Enter billing account ID: " BILLING_ACCOUNT_ID
    
    if [ -n "$BILLING_ACCOUNT_ID" ]; then
        gcloud billing projects link "$PROJECT_ID" \
            --billing-account="$BILLING_ACCOUNT_ID"
        echo -e "${GREEN}✓ Billing enabled${NC}"
    else
        echo -e "${RED}ERROR: Billing account required. Exiting.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Billing already enabled${NC}"
fi
echo ""

# Step 4: Enable APIs
echo -e "${YELLOW}Step 4: Enabling required APIs...${NC}"

APIS=(
    "run.googleapis.com"
    "artifactregistry.googleapis.com"
    "secretmanager.googleapis.com"
    "cloudbuild.googleapis.com"
)

for API in "${APIS[@]}"; do
    echo "Enabling $API..."
    gcloud services enable "$API" --quiet
done

echo -e "${GREEN}✓ APIs enabled${NC}"
echo ""

# Step 5: Create secret
echo -e "${YELLOW}Step 5: Creating Secret Manager secret...${NC}"

if gcloud secrets describe "$SECRET_NAME" &>/dev/null; then
    echo -e "${YELLOW}Secret already exists: $SECRET_NAME${NC}"
else
    echo "postgresql://placeholder-will-be-replaced-in-epic-2" | \
        gcloud secrets create "$SECRET_NAME" \
        --data-file=- \
        --replication-policy="automatic"
    echo -e "${GREEN}✓ Secret created: $SECRET_NAME${NC}"
fi
echo ""

# Step 6: Configure IAM for secrets
echo -e "${YELLOW}Step 6: Configuring IAM permissions...${NC}"

PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" \
    --format="value(projectNumber)")

SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "Granting access to service account: $SERVICE_ACCOUNT"

gcloud secrets add-iam-policy-binding "$SECRET_NAME" \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet

echo -e "${GREEN}✓ IAM permissions configured${NC}"
echo ""

# Step 7: Deploy Cloud Run service
echo -e "${YELLOW}Step 7: Creating Cloud Run service...${NC}"

read -p "Deploy placeholder container now? (y/n) [default: y]: " DEPLOY_NOW
DEPLOY_NOW=${DEPLOY_NOW:-y}

if [ "$DEPLOY_NOW" = "y" ] || [ "$DEPLOY_NOW" = "Y" ]; then
    echo "Deploying Hello World placeholder container..."
    
    gcloud run deploy "$SERVICE_NAME" \
        --image=us-docker.pkg.dev/cloudrun/container/hello \
        --region="$REGION" \
        --platform=managed \
        --allow-unauthenticated \
        --min-instances=0 \
        --max-instances=3 \
        --cpu=1 \
        --memory=512Mi \
        --set-env-vars NODE_ENV=development,PORT=8080 \
        --set-secrets=DATABASE_URL="${SECRET_NAME}:latest" \
        --quiet
    
    echo -e "${GREEN}✓ Service deployed${NC}"
else
    echo -e "${YELLOW}Skipping deployment. You can deploy later with Story 1.5${NC}"
fi
echo ""

# Step 8: Get service information
echo -e "${YELLOW}Step 8: Retrieving service information...${NC}"

if gcloud run services describe "$SERVICE_NAME" --region="$REGION" &>/dev/null; then
    SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
        --region="$REGION" \
        --format="value(status.url)")
    
    echo -e "${GREEN}✓ Service configured successfully!${NC}"
    echo ""
    echo "=== Dev Environment Configuration ==="
    echo "Project ID:      $PROJECT_ID"
    echo "Project Number:  $PROJECT_NUMBER"
    echo "Region:          $REGION"
    echo "Service Name:    $SERVICE_NAME"
    echo "Service URL:     $SERVICE_URL"
    echo ""
    echo "=== For GitHub Secrets (Story 1.5) ==="
    echo "GCP_PROJECT_ID:  $PROJECT_ID"
    echo "GCP_REGION:      $REGION"
    echo ""
    echo "Test the service:"
    echo "  curl $SERVICE_URL"
    echo ""
    echo "View logs:"
    echo "  gcloud run services logs read $SERVICE_NAME --region=$REGION"
else
    echo -e "${YELLOW}Service not deployed yet. Will be created in Story 1.5${NC}"
fi

echo ""
echo -e "${GREEN}=== Setup Complete ===${NC}"
echo ""
echo "Next steps:"
echo "1. Note the configuration values above for GitHub Secrets"
echo "2. Proceed to Story 1.5 to configure automated deployment"
echo "3. For detailed documentation, see: docs/CLOUD_RUN_SETUP.md"

