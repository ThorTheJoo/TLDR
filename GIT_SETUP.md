# Git Setup for TLDR Project

## 🚀 Quick Git Setup

### Prerequisites
1. **Install Git** (if not already installed):
   ```bash
   # Download from: https://git-scm.com/download/win
   # Or use winget (if available):
   winget install --id Git.Git -e --source winget
   ```

### Manual Git Setup

#### Step 1: Initialize Git Repository
```bash
# Navigate to your project directory
cd "C:\Users\thagra01\OneDrive - CSG Systems Inc\Build and Code Projects\TLDR"

# Initialize Git repository
git init

# Configure Git (replace with your details)
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

#### Step 2: Add Files to Git
```bash
# Add all files
git add .

# Check status
git status

# Make initial commit
git commit -m "Initial commit: TLDR Personal Context Agent with OAuth integration"
```

#### Step 3: Connect to Remote Repository
```bash
# Add remote repository (replace with your repo URL)
git remote add origin https://github.com/yourusername/tldr-app.git

# Push to remote
git branch -M main
git push -u origin main
```

## 📁 Files Included in Git

### Core Application Files
- `src/` - React Native source code
- `package.json` - Dependencies and scripts
- `app.json` - Expo configuration
- `tsconfig.json` - TypeScript configuration
- `babel.config.js` - Babel configuration
- `metro.config.js` - Metro bundler configuration

### OAuth Server Files
- `oauth-callback-server.js` - Permanent OAuth callback server
- `oauth-success.html` - GCP-styled OAuth success page
- `start-oauth-server.bat` - Windows startup script
- `start-oauth-server.ps1` - PowerShell startup script

### Demo and Documentation
- `demo.html` - Google Cloud Console-styled demo page
- `gcp-demo.html` - Alternative GCP demo page
- `README.md` - Project documentation
- `OAUTH_SETUP.md` - OAuth setup guide
- `GIT_README.md` - Git documentation

### Configuration Files
- `.gitignore` - Git ignore rules
- `.eslintrc.js` - ESLint configuration
- `expo-env.d.ts` - TypeScript declarations

## 🔒 Security Notes

### Files NOT Included in Git
- `node_modules/` - Dependencies (install with npm)
- `credentials.json` - OAuth credentials (never commit)
- `*.key` - Private keys
- `*.pem` - Certificate files
- `.env` - Environment variables

### Sensitive Data Protection
- ✅ OAuth credentials are excluded
- ✅ Private keys are ignored
- ✅ Environment variables are protected
- ✅ Log files are excluded

## 📋 Git Commands Reference

### Basic Commands
```bash
# Check status
git status

# Add files
git add .

# Commit changes
git commit -m "Your commit message"

# Push to remote
git push

# Pull latest changes
git pull

# View history
git log --oneline
```

### Branch Management
```bash
# Create new branch
git checkout -b feature/oauth-integration

# Switch branches
git checkout main

# Merge branch
git merge feature/oauth-integration

# Delete branch
git branch -d feature/oauth-integration
```

### Remote Repository
```bash
# Add remote
git remote add origin <repository-url>

# List remotes
git remote -v

# Push to remote
git push origin main

# Clone repository
git clone <repository-url>
```

## 🚨 Troubleshooting

### Git Not Found
```bash
# Check if Git is installed
git --version

# If not found, install Git:
# Download from: https://git-scm.com/download/win
```

### Permission Issues
```bash
# Configure Git credentials
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Store credentials (Windows)
git config --global credential.helper wincred
```

### Large Files
```bash
# Check for large files
git ls-files | xargs ls -la | sort -k5 -nr | head -10

# Remove large files from Git history
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch <file>' --prune-empty --tag-name-filter cat -- --all
```

## 📈 Next Steps

1. **Install Git** if not already installed
2. **Initialize repository** using the commands above
3. **Add remote repository** (GitHub, GitLab, etc.)
4. **Push initial commit** to remote
5. **Set up CI/CD** if needed
6. **Configure branch protection** rules

## 🎉 Success!

Your TLDR project is now ready for Git version control with:
- ✅ Complete source code
- ✅ OAuth server files
- ✅ Documentation
- ✅ Configuration files
- ✅ Security exclusions
- ✅ Professional setup

**Repository Status:** Ready for Git  
**Security:** ✅ Protected  
**Documentation:** ✅ Complete  
**OAuth Server:** ✅ Functional 