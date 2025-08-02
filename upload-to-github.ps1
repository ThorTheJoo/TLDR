# Upload TLDR Project to GitHub for ThorTheJoo
Write-Host "🚀 Uploading TLDR Project to GitHub..." -ForegroundColor Green
Write-Host ""

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed" -ForegroundColor Red
    Write-Host "💡 Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "💡 Then run this script again" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "📁 Setting up Git repository..." -ForegroundColor Cyan
git init

Write-Host ""
Write-Host "📝 Configuring Git for ThorTheJoo..." -ForegroundColor Cyan
git config user.name "ThorTheJoo"
git config user.email "your-email@example.com"

Write-Host ""
Write-Host "📋 Adding all files to Git..." -ForegroundColor Cyan
git add .

Write-Host ""
Write-Host "💾 Making initial commit..." -ForegroundColor Cyan
git commit -m "Initial commit: TLDR Personal Context Agent with OAuth integration"

Write-Host ""
Write-Host "🔗 Connecting to GitHub..." -ForegroundColor Cyan
Write-Host "Please enter your GitHub repository URL (e.g., https://github.com/ThorTheJoo/tldr-app.git):" -ForegroundColor Yellow
$repoUrl = Read-Host

git remote add origin $repoUrl

Write-Host ""
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan
git branch -M main
git push -u origin main

Write-Host ""
Write-Host "✅ Upload complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your project is now live at: $repoUrl" -ForegroundColor Green
Write-Host "📖 You can view it on GitHub" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Next time you make changes:" -ForegroundColor Yellow
Write-Host "1. git add ." -ForegroundColor White
Write-Host "2. git commit -m 'Your message'" -ForegroundColor White
Write-Host "3. git push" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit" 