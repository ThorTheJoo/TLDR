@echo off
echo 🚀 Starting TLDR OAuth Callback Server...
echo.
echo This server will handle Google OAuth callbacks permanently.
echo Callback URL: http://localhost:3000/oauth/callback
echo.
echo Press Ctrl+C to stop the server
echo.

REM Add Node.js to PATH if not already there
set PATH=%PATH%;C:\Program Files\nodejs

REM Start the OAuth server
node oauth-callback-server.js

pause 