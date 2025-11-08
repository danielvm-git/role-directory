#!/bin/bash

# GitHub Actions Service Account Setup Script
# This script creates a GCP service account for GitHub Actions CI/CD

set -e  # Exit on any error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVICE_ACCOUNT_NAME="github-actions-deployer"
SERVICE_ACCOUNT_DISPLAY="GitHub Actions Deployer"
KEY_FILE="github-actions-key.json"

echo -e "${GREEN}=== GitHub Actions Service Account Setup ===${NC}"
echo ""

# Check gcloud CLI
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}ERROR: gcloud CLI not found${NC}"
    exit 1
fi

# Get current project
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}ERROR: No GCP project set${NC}"
    echo "Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo -e "${BLUE}Project ID: $PROJECT_ID${NC}"
echo ""

# Step 1: Create service account
echo -e "${YELLOW}Step 1: Creating service account...${NC}"

SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

if gcloud iam service-accounts describe "$SERVICE_ACCOUNT_EMAIL" &>/dev/null; then
    echo -e "${YELLOW}Service account already exists: $SERVICE_ACCOUNT_EMAIL${NC}"
else
    gcloud iam service-accounts create "$SERVICE_ACCOUNT_NAME" \
        --display-name="$SERVICE_ACCOUNT_DISPLAY" \
        --description="Service account for GitHub Actions CI/CD pipeline"
    echo -e "${GREEN}✓ Service account created${NC}"
fi

echo ""

# Step 2: Grant IAM roles
echo -e "${YELLOW}Step 2: Granting IAM roles...${NC}"

ROLES=(
    "roles/run.developer"
    "roles/iam.serviceAccountUser"
    "roles/artifactregistry.writer"
    "roles/cloudbuild.builds.editor"
)

for ROLE in "${ROLES[@]}"; do
    echo "Granting $ROLE..."
    gcloud projects add-iam-policy-binding "$PROJECT_ID" \
        --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
        --role="$ROLE" \
        --quiet
done

echo -e "${GREEN}✓ IAM roles granted${NC}"
echo ""

# Step 3: Generate service account key
echo -e "${YELLOW}Step 3: Generating service account key...${NC}"

if [ -f "$KEY_FILE" ]; then
    echo -e "${YELLOW}Warning: $KEY_FILE already exists${NC}"
    read -p "Overwrite? (y/n): " OVERWRITE
    if [ "$OVERWRITE" != "y" ]; then
        echo "Skipping key generation"
        KEY_FILE=""
    else
        rm "$KEY_FILE"
    fi
fi

if [ -n "$KEY_FILE" ]; then
    gcloud iam service-accounts keys create "$KEY_FILE" \
        --iam-account="$SERVICE_ACCOUNT_EMAIL"
    echo -e "${GREEN}✓ Key generated: $KEY_FILE${NC}"
fi

echo ""
echo -e "${GREEN}=== Setup Complete ===${NC}"
echo ""
echo -e "${BLUE}Service Account Email:${NC} $SERVICE_ACCOUNT_EMAIL"
echo ""

if [ -f "$KEY_FILE" ]; then
    echo -e "${YELLOW}⚠️  IMPORTANT: Add this key to GitHub Secrets${NC}"
    echo ""
    echo "1. Go to GitHub repository → Settings → Secrets and variables → Actions"
    echo "2. Click 'New repository secret'"
    echo "3. Name: ${BLUE}GCP_SERVICE_ACCOUNT_KEY${NC}"
    echo "4. Value: Copy the entire contents of ${BLUE}$KEY_FILE${NC}"
    echo ""
    echo "To copy the key contents:"
    echo -e "${BLUE}cat $KEY_FILE${NC}"
    echo ""
    echo "5. Add another secret:"
    echo "   Name: ${BLUE}GCP_PROJECT_ID${NC}"
    echo "   Value: ${BLUE}$PROJECT_ID${NC}"
    echo ""
    echo -e "${RED}⚠️  After adding to GitHub, securely delete the key file:${NC}"
    echo -e "${BLUE}shred -vfz -n 10 $KEY_FILE  # Linux${NC}"
    echo -e "${BLUE}rm -P $KEY_FILE  # macOS${NC}"
else
    echo "Key file already exists or generation was skipped"
fi

echo ""
echo "For detailed instructions, see: docs/GITHUB_ACTIONS_SETUP.md"

