@echo off
echo 🚀 Flexible TLDR Project Upload Script
echo.
echo 📍 This script can upload to ANY repository (public or private)
echo.

REM Get repository URL from user
echo Please enter your GitHub repository URL:
echo Example: https://github.com/ThorTheJoo/tldr-app.git
echo.
set /p repo_url=

echo.
echo 📍 Target Repository: %repo_url%
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
echo 📝 Configuring Git...
echo Please enter your Git username:
set /p git_username=
echo Please enter your Git email:
set /p git_email=

git config user.name "%git_username%"
git config user.email "%git_email%"

echo.
echo 📋 Adding all files to Git...
git add .

echo.
echo 💾 Making initial commit...
git commit -m "Complete TLDR Personal Context Agent with OAuth integration and Google Cloud Console UI"

echo.
echo 🔗 Connecting to GitHub repository...
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
echo 🎉 TLDR Project Successfully Uploaded!
echo.
echo 📋 What's now on GitHub:
echo ✅ Complete TLDR app with OAuth integration
echo ✅ Permanent OAuth callback server
echo ✅ Google Cloud Console UI
echo ✅ Complete documentation
echo ✅ Security configuration
echo ✅ Startup scripts
echo.
echo 💡 Next time you make changes:
echo 1. git add .
echo 2. git commit -m "Your message"
echo 3. git push
echo.

pause 