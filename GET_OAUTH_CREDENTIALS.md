# 🔑 Get Your OAuth Credentials

## ❌ **Error: invalid_client**

The error means you need to use **real OAuth credentials** from Google Cloud Console instead of placeholder values.

## 🎯 **Get Your Real Credentials:**

### **Step 1: Go to Google Cloud Console**
1. Visit: [console.cloud.google.com](https://console.cloud.google.com)
2. **Select your project** (or create one)
3. **Enable Gmail API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click "Enable"

### **Step 2: Create OAuth Credentials**
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set **Authorized redirect URIs**:
   ```
   http://localhost:3000/oauth/callback
   ```
5. Click "Create"
6. **Download the JSON file** or copy the credentials

### **Step 3: Get Your Credentials**
From the OAuth credentials page, you'll see:
- **Client ID**: `123456789-abcdefghijklmnop.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-abcdefghijklmnopqrstuvwxyz`

## 🚀 **Use Your Real Credentials:**

### **Step 1: Go to Demo**
Visit: **http://localhost:3000/gmail-demo-simple.html**

### **Step 2: Initialize with Real Credentials**
1. **Click "Initialize with Auth Code"**
2. **Enter your authorization code**: `4/0AVMBsJjUrpSO7kNIaP2q54IpvExLGo9csvG13GxiJg4TwEHXYhYr3aJQ7ypNeUYx1ktguA`
3. **Enter your Client ID**: (from Google Cloud Console)
4. **Enter your Client Secret**: (from Google Cloud Console)

### **Step 3: Test**
1. **Click "Test Connection"** - Should show your email
2. **Click "Load Real Emails"** - Should show your Gmail messages

## 🔧 **Alternative: Quick Demo Mode**
If you want to test the interface first:
- **Click "Quick Initialize (Demo)"** to see the interface
- **Then use real credentials**

## 🚨 **Common Issues:**

### **"Invalid Client" Error:**
- **Check Client ID** - Must be from your Google Cloud Console
- **Check Client Secret** - Must be from your Google Cloud Console
- **Check redirect URI** - Must be exactly: `http://localhost:3000/oauth/callback`

### **"Authorization Code Expired":**
- **Get new authorization code** by completing OAuth flow again
- **Use fresh authorization code** (they expire quickly)

## 🎯 **Success Indicators:**

### ✅ **When Working:**
- **No "invalid_client" error**
- **Status shows**: "Connected to Gmail API - User: your-email@gmail.com"
- **Load Real Emails**: Shows your actual Gmail messages

### ❌ **Current Issue:**
- **Using placeholder credentials** instead of real ones
- **Need to get real Client ID and Client Secret** from Google Cloud Console

**Get your real OAuth credentials and try again!** 🎉 