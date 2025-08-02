# Start TLDR Gmail API Server
Write-Host "🚀 Starting TLDR Gmail API Server" -ForegroundColor Green
Write-Host ""

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "💡 Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "💡 Then run this script again" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "📧 Starting Gmail API Server..." -ForegroundColor Cyan
Write-Host "📍 Server will run on: http://localhost:3001" -ForegroundColor Cyan
Write-Host "📧 Demo will be at: http://localhost:3001/gmail-demo-working.html" -ForegroundColor Cyan
Write-Host ""

# Add Node.js to PATH if not already there
$env:PATH += ";C:\Program Files\nodejs"

# Start the Gmail API server
node gmail-api-server.js

Write-Host ""
Write-Host "🛑 Gmail API Server stopped" -ForegroundColor Yellow
Read-Host "Press Enter to exit" 