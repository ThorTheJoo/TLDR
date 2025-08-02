@echo off
echo 🚀 Setting up Git for TLDR Project...
echo.

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed or not in PATH
    echo 💡 Please install Git from: https://git-scm.com/download/win
    echo 💡 Or run: winget install --id Git.Git -e --source winget
    pause
    exit /b 1
)

echo ✅ Git found: 
git --version

echo.
echo 📁 Initializing Git repository...
git init

echo.
echo 📝 Configuring Git...
echo Please enter your Git username:
set /p git_username=
echo Please enter your Git email:
set /p git_email=

git config user.name "%git_username%"
git config user.email "%git_email%"

echo.
echo 📋 Adding files to Git...
git add .

echo.
echo 💾 Making initial commit...
git commit -m "Initial commit: TLDR Personal Context Agent with OAuth integration"

echo.
echo ✅ Git setup complete!
echo.
echo 📋 Next steps:
echo 1. Create a repository on GitHub/GitLab
echo 2. Add remote: git remote add origin <your-repo-url>
echo 3. Push: git push -u origin main
echo.
echo 📖 See GIT_SETUP.md for detailed instructions
echo.

pause 