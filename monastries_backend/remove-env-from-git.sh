#!/bin/bash

# Script to remove .env file from git history
# WARNING: This will rewrite git history. Make sure to backup your repository first!

echo "⚠️  WARNING: This script will rewrite git history!"
echo "Make sure you have a backup of your repository before proceeding."
echo ""
read -p "Do you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "🔍 Checking if .env exists in git history..."

if git log --all --full-history -- "*/.env" | grep -q "commit"; then
    echo "✓ Found .env in git history"
    echo ""
    echo "🗑️  Removing .env from git history..."
    
    # Remove .env from all commits
    git filter-branch --force --index-filter \
        "git rm --cached --ignore-unmatch monastries_backend/.env" \
        --prune-empty --tag-name-filter cat -- --all
    
    echo ""
    echo "🧹 Cleaning up..."
    
    # Clean up
    rm -rf .git/refs/original/
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive
    
    echo ""
    echo "✅ .env has been removed from git history"
    echo ""
    echo "⚠️  IMPORTANT NEXT STEPS:"
    echo "1. Force push to remote (this will affect all collaborators):"
    echo "   git push origin --force --all"
    echo "   git push origin --force --tags"
    echo ""
    echo "2. Notify all team members to:"
    echo "   - Backup their local changes"
    echo "   - Delete their local repository"
    echo "   - Clone the repository again"
    echo ""
    echo "3. Rotate all secrets that were in the .env file:"
    echo "   - JWT_SECRET"
    echo "   - Database credentials"
    echo "   - API keys (Google Maps, etc.)"
    echo ""
    echo "4. Update .env with new secrets (use .env.example as template)"
    
else
    echo "✓ .env not found in git history"
    echo "No action needed."
fi
