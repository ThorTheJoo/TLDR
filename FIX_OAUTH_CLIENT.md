# 🔧 Fix OAuth Client Error

## ❌ **Error: invalid_client**

The error means your **OAuth client is not found** or not configured correctly in Google Cloud Console.

## 🎯 **Quick Fix - Create Proper OAuth Client:**

### **Step 1: Go to Google Cloud Console**
1. **Visit**: [console.cloud.google.com](https://console.cloud.google.com)
2. **Select your project** (or create one)
3. **Enable Gmail API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click "Enable"

### **Step 2: Create OAuth 2.0 Client**
1. **Go to "APIs & Services"** → "Credentials"
2. **Click "Create Credentials"** → "OAuth 2.0 Client IDs"
3. **Choose "Web application"**
4. **Set Authorized redirect URIs**:
   ```
   http://localhost:3000/oauth/callback
   ```
5. **Click "Create"**
6. **Copy your credentials**:
   - **Client ID**: `123456789-abcdefghijklmnop.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-abcdefghijklmnopqrstuvwxyz`

### **Step 3: Test OAuth Flow**
1. **Go to**: http://localhost:3000/gmail-demo-simple.html
2. **Click "Get Fresh Auth Code"**
3. **Enter your new Client ID**
4. **Complete OAuth flow** in browser
5. **Copy the authorization code**

### **Step 4: Initialize Gmail API**
1. **Click "Initialize with Auth Code"**
2. **Enter the authorization code**
3. **Enter your Client ID** (the new one you just created)
4. **Enter your Client Secret** (the new one you just created)

## 🚨 **Common Issues:**

### **"OAuth client was not found"**
- **Check Client ID** - Must be from your Google Cloud Console
- **Check project** - Must be in the same project as Gmail API
- **Check redirect URI** - Must be exactly: `http://localhost:3000/oauth/callback`

### **"Error 401: invalid_client"**
- **Create new OAuth client** - Your current one might be invalid
- **Check credentials** - Copy from Google Cloud Console exactly
- **Enable Gmail API** - Must be enabled in the same project

## 🎯 **Success Indicators:**

### ✅ **When Working:**
- **OAuth client created** in Google Cloud Console
- **Gmail API enabled** in the same project
- **Redirect URI set** to: `http://localhost:3000/oauth/callback`
- **No "invalid_client" error**
- **Authorization code received** successfully

### ❌ **Current Issue:**
- **OAuth client not found** - Need to create new one
- **Wrong Client ID** - Using invalid or wrong credentials
- **Project mismatch** - OAuth client not in same project as Gmail API

## 🚀 **Quick Action:**

1. **Create new OAuth client** in Google Cloud Console
2. **Enable Gmail API** in the same project
3. **Set redirect URI** to: `http://localhost:3000/oauth/callback`
4. **Get fresh authorization code** using new credentials
5. **Initialize Gmail API** with new credentials

**Create a new OAuth client and try again!** 🎉

**Try it now**: http://localhost:3000/gmail-demo-simple.html 