#!/bin/bash
# Cache clearing script for development performance issues

echo "🧹 Clearing Next.js and npm caches..."

# Remove Next.js build cache
rm -rf .next

# Remove TypeScript build info
rm -f tsconfig.tsbuildinfo

# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall (optional - uncomment if needed)
# rm -rf node_modules
# npm install

echo "✅ Cache cleared! Run 'npm run dev' to start fresh."
