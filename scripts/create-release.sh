#!/bin/bash

# Create Release Script
# Usage: ./scripts/create-release.sh <version>
# Example: ./scripts/create-release.sh 1.0.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if version argument is provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: Version number required${NC}"
  echo "Usage: ./scripts/create-release.sh <version>"
  echo "Example: ./scripts/create-release.sh 1.0.0"
  exit 1
fi

VERSION=$1
TAG="v${VERSION}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Creating Release ${TAG}${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Validate version format (semantic versioning)
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo -e "${RED}Error: Invalid version format. Use semantic versioning (e.g., 1.0.0)${NC}"
  exit 1
fi

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo -e "${YELLOW}Warning: You're not on the main branch (current: $CURRENT_BRANCH)${NC}"
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo -e "${RED}Error: You have uncommitted changes. Please commit or stash them first.${NC}"
  exit 1
fi

# Check if tag already exists
if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo -e "${RED}Error: Tag $TAG already exists${NC}"
  exit 1
fi

echo -e "${YELLOW}Step 1: Updating package.json version...${NC}"
# Update package.json version
npm version $VERSION --no-git-tag-version
echo -e "${GREEN}✓ Updated package.json to version $VERSION${NC}"
echo ""

echo -e "${YELLOW}Step 2: Committing version bump...${NC}"
git add package.json package-lock.json
git commit -m "chore: bump version to $VERSION"
echo -e "${GREEN}✓ Committed version bump${NC}"
echo ""

echo -e "${YELLOW}Step 3: Creating git tag...${NC}"
# Create annotated tag
git tag -a "$TAG" -m "Release $TAG - See GitHub Release for details"
echo -e "${GREEN}✓ Created tag $TAG${NC}"
echo ""

echo -e "${YELLOW}Step 4: Pushing commit and tag to origin...${NC}"
git push origin $CURRENT_BRANCH
git push origin "$TAG"
echo -e "${GREEN}✓ Pushed to origin${NC}"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Release preparation complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Go to: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/releases/new"
echo "2. Select tag: ${TAG}"
echo "3. Generate release notes (or write custom ones)"
echo "4. Publish the release"
echo ""
echo -e "${BLUE}After publishing:${NC}"
echo "- The CI/CD pipeline will deploy with version $VERSION"
echo "- The app will display 'v$VERSION' in the bottom-right corner"
echo ""

