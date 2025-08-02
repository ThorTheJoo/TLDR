@echo off
echo 🚀 Starting TLDR Gmail API Server
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo 💡 Please install Node.js from: https://nodejs.org/
    echo 💡 Then run this script again
    pause
    exit /b 1
)

echo ✅ Node.js found:
node --version

echo.
echo 📧 Starting Gmail API Server...
echo 📍 Server will run on: http://localhost:3001
echo 📧 Demo will be at: http://localhost:3001/gmail-demo-working.html
echo.

REM Add Node.js to PATH if not already there
set PATH=%PATH%;C:\Program Files\nodejs

REM Start the Gmail API server
node gmail-api-server.js

echo.
echo 🛑 Gmail API Server stopped
pause 