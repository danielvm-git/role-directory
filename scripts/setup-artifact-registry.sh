#!/bin/bash

# Artifact Registry Setup Script
# This script creates an Artifact Registry repository for Docker images

set -e  # Exit on any error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPOSITORY_NAME="role-directory"
REPOSITORY_FORMAT="docker"
REGION="southamerica-east1"
DESCRIPTION="Docker images for Role Directory application"

echo -e "${GREEN}=== Artifact Registry Setup ===${NC}"
echo ""

# Check gcloud CLI
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}ERROR: gcloud CLI not found${NC}"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
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
echo -e "${BLUE}Region: $REGION${NC}"
echo -e "${BLUE}Repository: $REPOSITORY_NAME${NC}"
echo ""

# Step 1: Enable Artifact Registry API
echo -e "${YELLOW}Step 1: Enabling Artifact Registry API...${NC}"

if gcloud services list --enabled --filter="name:artifactregistry.googleapis.com" --format="value(name)" | grep -q artifactregistry; then
    echo -e "${GREEN}✓ Artifact Registry API already enabled${NC}"
else
    gcloud services enable artifactregistry.googleapis.com
    echo -e "${GREEN}✓ Artifact Registry API enabled${NC}"
fi

echo ""

# Step 2: Create Artifact Registry repository
echo -e "${YELLOW}Step 2: Creating Artifact Registry repository...${NC}"

# Check if repository already exists
if gcloud artifacts repositories describe "$REPOSITORY_NAME" \
    --location="$REGION" &>/dev/null; then
    echo -e "${YELLOW}Repository already exists: $REPOSITORY_NAME${NC}"
    echo -e "${BLUE}Repository URL: ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_NAME}${NC}"
else
    gcloud artifacts repositories create "$REPOSITORY_NAME" \
        --repository-format="$REPOSITORY_FORMAT" \
        --location="$REGION" \
        --description="$DESCRIPTION"
    
    echo -e "${GREEN}✓ Repository created successfully${NC}"
    echo -e "${BLUE}Repository URL: ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_NAME}${NC}"
fi

echo ""

# Step 3: Configure Docker authentication
echo -e "${YELLOW}Step 3: Configuring Docker authentication...${NC}"

gcloud auth configure-docker ${REGION}-docker.pkg.dev

echo -e "${GREEN}✓ Docker authentication configured${NC}"
echo ""

# Step 4: Display repository information
echo -e "${YELLOW}Step 4: Repository Information...${NC}"

gcloud artifacts repositories describe "$REPOSITORY_NAME" \
    --location="$REGION" \
    --format="table(
        name,
        format,
        createTime.date('%Y-%m-%d %H:%M:%S'),
        sizeBytes.size()
    )"

echo ""
echo -e "${GREEN}=== Setup Complete ===${NC}"
echo ""
echo -e "${BLUE}Repository Details:${NC}"
echo "  Name:   $REPOSITORY_NAME"
echo "  Region: $REGION"
echo "  Format: Docker"
echo "  URL:    ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_NAME}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Push your Docker images to:"
echo -e "   ${BLUE}${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_NAME}/app:TAG${NC}"
echo ""
echo "2. Example commands:"
echo -e "   ${BLUE}docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_NAME}/app:latest .${NC}"
echo -e "   ${BLUE}docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_NAME}/app:latest${NC}"
echo ""
echo "3. Your GitHub Actions workflows have been updated to use Artifact Registry"
echo ""
echo "For more information:"
echo "  https://cloud.google.com/artifact-registry/docs"

