#!/bin/bash
# Script to commit R2 integration changes

echo "📦 Staging R2 integration files..."

# Core R2 files
git add Editor/src/r2.js
git add Editor/src/r2-api.js
git add Editor/src/media-extractor.js

# Updated API files
git add Editor/src/supabase-api.js
git add Editor/src/api.js
git add Editor/src/project.js

# Configuration
git add Editor/env.template
git add Editor/package.json

# Documentation
git add Editor/R2_*.md
git add Editor/STORAGE_ARCHITECTURE.md
git add Editor/TESTING_CHECKLIST.md
git add Editor/PRE_COMMIT_CHECKLIST.md
git add Editor/create-env.js
git add Editor/test-r2-connection.js
git add CHANGES_SUMMARY.md

echo "✅ Files staged!"
echo ""
echo "📝 Review changes with: git status"
echo "💬 Commit with: git commit -m 'feat: Add Cloudflare R2 integration and organize files by subject/grade'"
echo "🚀 Push with: git push origin Eric"

