@echo off
echo 🚀 Uploading TLDR Project to GitHub...
echo.

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed
    echo 💡 Please install Git from: https://git-scm.com/download/win
    echo 💡 Then run this script again
    pause
    exit /b 1
)

echo ✅ Git found: 
git --version

echo.
echo 📁 Setting up Git repository...
git init

echo.
echo 📝 Configuring Git for ThorTheJoo...
git config user.name "ThorTheJoo"
git config user.email "your-email@example.com"

echo.
echo 📋 Adding all files to Git...
git add .

echo.
echo 💾 Making initial commit...
git commit -m "Initial commit: TLDR Personal Context Agent with OAuth integration"

echo.
echo 🔗 Connecting to GitHub...
echo Please enter your GitHub repository URL (e.g., https://github.com/ThorTheJoo/tldr-app.git):
set /p repo_url=

git remote add origin %repo_url%

echo.
echo 🚀 Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ✅ Upload complete!
echo.
echo 🌐 Your project is now live at: %repo_url%
echo 📖 You can view it on GitHub
echo.
echo 💡 Next time you make changes:
echo 1. git add .
echo 2. git commit -m "Your message"
echo 3. git push
echo.

pause 