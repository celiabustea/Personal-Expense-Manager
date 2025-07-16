@echo off
echo 🧹 Clearing Next.js and npm caches...

:: Remove Next.js build cache
if exist .next rmdir /s /q .next

:: Remove TypeScript build info
if exist tsconfig.tsbuildinfo del tsconfig.tsbuildinfo

:: Clear npm cache
npm cache clean --force

:: Remove node_modules and reinstall (optional - uncomment if needed)
:: rmdir /s /q node_modules
:: npm install

echo ✅ Cache cleared! Run 'npm run dev' to start fresh.
