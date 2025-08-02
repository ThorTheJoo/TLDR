@echo off
echo 🚀 Starting TLDR Services with AI Email Analyzer...
echo.

REM Kill any existing Node.js processes
echo 🛑 Stopping existing Node.js processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

REM Set Node.js path
set PATH=%PATH%;C:\Program Files\nodejs

echo 📡 Starting OAuth Callback Server (Port 3000)...
start "OAuth Callback Server" cmd /k "node oauth-callback-server.js"

echo 📧 Starting Persistent OAuth Manager (Port 3002)...
start "Persistent OAuth Manager" cmd /k "node persistent-oauth-manager.js"

echo 🔍 Starting Server Discovery Service (Port 3003)...
start "Server Discovery" cmd /k "node server-discovery.js"

echo 🧠 Starting AI Email Analyzer (Port 3004)...
start "AI Email Analyzer" cmd /k "node ai-email-analyzer.js"

echo.
echo ✅ All services started successfully!
echo.
echo 🌐 Available Services:
echo    • OAuth Callback: http://localhost:3000
echo    • Persistent OAuth: http://localhost:3002
echo    • Server Discovery: http://localhost:3003
echo    • AI Email Analyzer: http://localhost:3004
echo.
echo 🎯 Quick Links:
echo    • Gmail Demo: http://localhost:3000/gmail-demo-simple.html
echo    • Smart Demo: http://localhost:3000/gmail-demo-smart.html
echo    • AI Dashboard: http://localhost:3004
echo.
echo 💡 AI Features:
echo    • Invoice detection
echo    • Content analysis
echo    • Batch processing
echo    • AI-powered insights
echo.
pause 