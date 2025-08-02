# Git Setup Script for TLDR Project
Write-Host "🚀 Setting up Git for TLDR Project..." -ForegroundColor Green
Write-Host ""

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "💡 Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "💡 Or run: winget install --id Git.Git -e --source winget" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "📁 Initializing Git repository..." -ForegroundColor Cyan
git init

Write-Host ""
Write-Host "📝 Configuring Git..." -ForegroundColor Cyan
$gitUsername = Read-Host "Please enter your Git username"
$gitEmail = Read-Host "Please enter your Git email"

git config user.name $gitUsername
git config user.email $gitEmail

Write-Host ""
Write-Host "📋 Adding files to Git..." -ForegroundColor Cyan
git add .

Write-Host ""
Write-Host "💾 Making initial commit..." -ForegroundColor Cyan
git commit -m "Initial commit: TLDR Personal Context Agent with OAuth integration"

Write-Host ""
Write-Host "✅ Git setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Create a repository on GitHub/GitLab" -ForegroundColor White
Write-Host "2. Add remote: git remote add origin <your-repo-url>" -ForegroundColor White
Write-Host "3. Push: git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "📖 See GIT_SETUP.md for detailed instructions" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit" 