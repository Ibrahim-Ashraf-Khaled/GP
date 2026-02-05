#!/bin/bash

echo "🚀 Starting Gamasa Properties Test Environment Setup..."

# 1. Clean up port 3000
echo "🧹 Cleaning up port 3000..."
# Note: On Windows via Git Bash, lsof might not be available or work as expected for Windows processes.
# Windows equivalent would be: Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "Port 3000 is free."

# 2. Generate dummy test assets
echo "🖼️ Generating dummy test assets..."
mkdir -p /tmp/test-assets
curl https://via.placeholder.com/600x400.jpg -o /tmp/house1.jpg
curl https://via.placeholder.com/600x400.jpg -o /tmp/house2.jpg
echo "✅ Test assets created at /tmp/house1.jpg & /tmp/house2.jpg"

# 3. Build for production
echo "🏗️ Building for production to avoid timeout errors..."
npm run build

# 4. Start production server
echo "🟢 Starting production server..."
npm run start &
SERVER_PID=$!

# 5. Wait for server (Health Check)
echo "⏳ Waiting for localhost:3000 to be live..."
while ! nc -z localhost 3000; do   
 sleep 1
done

echo "✅ Server is UP and READY for TestSprite!"
echo "⚠️  Do not close this terminal. Press Ctrl+C to stop the server when done."
wait $SERVER_PID
