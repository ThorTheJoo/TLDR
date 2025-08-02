# 🔄 Get Fresh Authorization Code

## ❌ **Error: invalid_grant**

The error means your **authorization code has expired**. Authorization codes expire quickly (usually within 10 minutes), so you need to get a fresh one.

## 🎯 **Quick Fix - Get Fresh Authorization Code:**

### **Step 1: Complete OAuth Flow Again**
1. **Go to Google Cloud Console**: [console.cloud.google.com](https://console.cloud.google.com)
2. **Go to your project** → "APIs & Services" → "Credentials"
3. **Find your OAuth 2.0 Client ID**
4. **Click on it** to see the details
5. **Copy your Client ID** (you'll need this)

### **Step 2: Complete OAuth Flow**
1. **Visit this URL** (replace YOUR_CLIENT_ID with your actual Client ID):
   ```
   https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000/oauth/callback&scope=https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify&response_type=code&access_type=offline
   ```
2. **Sign in with your Google account**
3. **Grant permissions** to your app
4. **You'll be redirected** to: `http://localhost:3000/oauth/callback?code=FRESH_CODE_HERE`
5. **Copy the NEW authorization code** from the success page

### **Step 3: Use Fresh Authorization Code**
1. **Go to**: http://localhost:3000/gmail-demo-simple.html
2. **Click "Initialize with Auth Code"**
3. **Enter the FRESH authorization code** (the new one you just got)
4. **Enter your Client ID** (from Google Cloud Console)
5. **Enter your Client Secret** (from Google Cloud Console)

## 🔧 **Alternative: Use the Demo Button**
1. **Go to**: http://localhost:3000/gmail-demo-simple.html
2. **Click "Get Fresh Auth Code"**
3. **Follow the instructions** to get a new authorization code

## 🚨 **Why Authorization Codes Expire:**

### **Security Reasons:**
- **Short lifespan** - Usually 10 minutes or less
- **One-time use** - Can only be used once
- **Prevents replay attacks** - Old codes can't be reused

### **Common Issues:**
- **Using old authorization code** - Get a fresh one
- **Waiting too long** - Use immediately after getting
- **Wrong credentials** - Check Client ID and Secret

## 🎯 **Success Indicators:**

### ✅ **When Working:**
- **Fresh authorization code** (less than 10 minutes old)
- **Correct Client ID and Secret** from Google Cloud Console
- **No "invalid_grant" error**
- **Status shows**: "Connected to Gmail API"

### ❌ **Current Issue:**
- **Expired authorization code** - Need fresh one
- **Wrong OAuth credentials** - Need real Client ID/Secret

## 🚀 **Quick Action:**

1. **Get fresh authorization code** by completing OAuth flow again
2. **Use it immediately** (don't wait)
3. **Enter correct credentials** (Client ID and Secret)
4. **Test connection** - Should work now

**Authorization codes expire quickly - get a fresh one!** 🎉

**Try it now**: http://localhost:3000/gmail-demo-simple.html 