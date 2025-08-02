# TLDR OAuth Callback Server - Permanent Solution

## 🚀 Quick Start

### Method 1: Windows Batch File
```bash
# Double-click or run:
start-oauth-server.bat
```

### Method 2: PowerShell Script
```powershell
# Run in PowerShell:
.\start-oauth-server.ps1
```

### Method 3: Manual Start
```bash
# Add Node.js to PATH and start:
$env:PATH += ";C:\Program Files\nodejs"
node oauth-callback-server.js
```

## 📋 What This Solves

✅ **Permanent OAuth Callback Server** - Always available on localhost:3000  
✅ **Google Cloud Console Styling** - Professional GCP design  
✅ **Automatic Code Extraction** - Extracts auth codes from URLs  
✅ **One-Click Copy** - Easy authorization code copying  
✅ **Error Handling** - Graceful error management  
✅ **Cross-Platform** - Works on Windows, Mac, Linux  

## 🔗 OAuth Callback URL

**Set this as your redirect URI in Google Cloud Console:**
```
http://localhost:3000/oauth/callback
```

## 🎯 How It Works

1. **Start the server** using any method above
2. **Configure Google Cloud Console** with the callback URL
3. **Complete OAuth flow** in Google Cloud Console
4. **Google redirects** to your server with authorization code
5. **Server displays** professional GCP-styled success page
6. **Copy the code** and complete your integration

## 📁 Files Included

- `oauth-callback-server.js` - Main server file
- `oauth-success.html` - GCP-styled success page
- `start-oauth-server.bat` - Windows batch startup
- `start-oauth-server.ps1` - PowerShell startup
- `gcp-demo.html` - GCP-styled demo page

## 🛠️ Features

### Server Features
- **Permanent availability** on localhost:3000
- **Automatic parameter extraction** from OAuth callbacks
- **Professional logging** of all requests
- **Error handling** and graceful shutdown
- **Static file serving** for demo pages

### UI Features
- **Google Cloud Console design** - Exact GCP styling
- **Responsive layout** - Works on all devices
- **One-click copy** - Authorization code copying
- **Professional typography** - Google Sans fonts
- **Status indicators** - Clear success/error states

## 🔧 Configuration

### Google Cloud Console Setup
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create or select your project
3. Enable the Gmail API
4. Create OAuth 2.0 credentials
5. Set redirect URI: `http://localhost:3000/oauth/callback`
6. Download the JSON credentials file

### Server Configuration
The server runs on:
- **Host:** localhost
- **Port:** 3000
- **Protocol:** HTTP
- **Callback Path:** /oauth/callback

## 📊 Usage Examples

### Example OAuth Callback URL
```
http://localhost:3000/oauth/callback?state=abc123&code=4/0AVMBsJ...&scope=gmail.readonly
```

### Server Response
The server will:
1. Extract the authorization code
2. Display it in a professional GCP interface
3. Provide one-click copy functionality
4. Show setup instructions

## 🚨 Troubleshooting

### Server Won't Start
```bash
# Check if Node.js is installed
node --version

# Check if port 3000 is available
netstat -ano | findstr :3000

# Kill process using port 3000 if needed
taskkill /PID <PID> /F
```

### OAuth Callback Not Working
1. **Verify server is running** - Check localhost:3000
2. **Check redirect URI** - Must match exactly
3. **Verify Google Cloud Console** - OAuth credentials correct
4. **Check browser console** - For any JavaScript errors

### Authorization Code Issues
1. **Copy the full code** - Don't truncate
2. **Use immediately** - Codes expire quickly
3. **Check scopes** - Ensure required permissions
4. **Verify state parameter** - For security

## 🔒 Security Notes

- **Local server only** - Not exposed to internet
- **HTTPS not required** - Local development only
- **State parameter validation** - Built-in security
- **Error logging** - Secure error handling
- **No data storage** - Codes not persisted

## 📈 Next Steps

1. **Start the server** using any method above
2. **Configure Google Cloud Console** with callback URL
3. **Test the OAuth flow** with your Gmail account
4. **Integrate with TLDR app** using the authorization codes
5. **Deploy to production** when ready

## 🎉 Success!

Your OAuth callback server is now permanently available and will handle all Google OAuth callbacks with a professional Google Cloud Console interface.

**Callback URL:** `http://localhost:3000/oauth/callback`  
**Server Status:** ✅ Running  
**UI Design:** 🎨 Google Cloud Console Style  
**Features:** 🚀 Professional & Reliable 