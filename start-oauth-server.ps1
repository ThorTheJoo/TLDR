# TLDR OAuth Callback Server Startup Script
Write-Host "🚀 Starting TLDR OAuth Callback Server..." -ForegroundColor Green
Write-Host ""
Write-Host "This server will handle Google OAuth callbacks permanently." -ForegroundColor Yellow
Write-Host "Callback URL: http://localhost:3000/oauth/callback" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host ""

# Add Node.js to PATH
$env:PATH += ";C:\Program Files\nodejs"

# Start the OAuth server
try {
    node oauth-callback-server.js
} catch {
    Write-Host "❌ Error starting server: $_" -ForegroundColor Red
    Write-Host "💡 Make sure Node.js is installed at C:\Program Files\nodejs" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 