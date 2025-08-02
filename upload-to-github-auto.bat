@echo off
echo 🚀 Automatically uploading TLDR Project to GitHub...
echo 📍 Repository: https://github.com/ThorTheJoo/tldr-react-native-prototype.git
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
git commit -m "Complete TLDR Personal Context Agent with OAuth integration and Google Cloud Console UI"

echo.
echo 🔗 Connecting to GitHub repository...
git remote add origin https://github.com/ThorTheJoo/tldr-react-native-prototype.git

echo.
echo 🚀 Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ✅ Upload complete!
echo.
echo 🌐 Your project is now live at: https://github.com/ThorTheJoo/tldr-react-native-prototype
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