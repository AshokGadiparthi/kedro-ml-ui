#!/bin/bash

# 🚀 Auto-Deploy Script for ML Platform
# This script automatically commits and pushes all changes to GitHub

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   🚀 ML Platform - Auto Deploy to GitHub${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo -e "${YELLOW}⚠️  Git not initialized. Initializing...${NC}"
    git init
    echo -e "${GREEN}✅ Git initialized${NC}"
    echo ""
fi

# Check if remote exists
if ! git remote | grep -q origin; then
    echo -e "${RED}❌ No GitHub remote found${NC}"
    echo -e "${YELLOW}Please add your GitHub repository:${NC}"
    echo -e "${BLUE}git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git${NC}"
    echo ""
    exit 1
fi

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
if [ -z "$BRANCH" ]; then
    BRANCH="main"
    echo -e "${YELLOW}⚠️  No branch found. Creating 'main' branch...${NC}"
fi

echo -e "${BLUE}📍 Current branch: ${GREEN}$BRANCH${NC}"
echo ""

# Check for changes
if git diff-index --quiet HEAD -- 2>/dev/null; then
    echo -e "${YELLOW}✨ No changes to commit${NC}"
    echo ""
    exit 0
fi

# Show status
echo -e "${BLUE}📝 Changes to be committed:${NC}"
git status --short
echo ""

# Generate commit message with timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
COMMIT_MSG="🚀 Auto-deploy: Updates from Figma Make - $TIMESTAMP"

# Allow custom commit message
if [ ! -z "$1" ]; then
    COMMIT_MSG="$1"
fi

echo -e "${BLUE}💬 Commit message:${NC} $COMMIT_MSG"
echo ""

# Stage all changes
echo -e "${YELLOW}📦 Staging changes...${NC}"
git add .

# Commit
echo -e "${YELLOW}💾 Committing...${NC}"
git commit -m "$COMMIT_MSG"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Committed successfully${NC}"
else
    echo -e "${RED}❌ Commit failed${NC}"
    exit 1
fi

echo ""

# Push to GitHub
echo -e "${YELLOW}🚀 Pushing to GitHub...${NC}"
git push origin $BRANCH

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}   ✅ Successfully deployed to GitHub!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
    echo ""
    
    # Get repository URL
    REPO_URL=$(git config --get remote.origin.url | sed 's/\.git$//')
    if [[ $REPO_URL == git@* ]]; then
        REPO_URL=$(echo $REPO_URL | sed 's/:/\//' | sed 's/git@/https:\/\//')
    fi
    
    echo -e "${BLUE}🔗 View on GitHub:${NC}"
    echo -e "${BLUE}$REPO_URL${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}═══════════════════════════════════════════════════════${NC}"
    echo -e "${RED}   ❌ Push failed${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}💡 Possible solutions:${NC}"
    echo -e "  1. Make sure you have push access to the repository"
    echo -e "  2. Check your GitHub credentials"
    echo -e "  3. Try: git pull origin $BRANCH --rebase"
    echo -e "  4. Check if repository URL is correct: git remote -v"
    echo ""
    exit 1
fi
