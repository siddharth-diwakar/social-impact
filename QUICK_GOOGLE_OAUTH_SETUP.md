# Quick Google OAuth Setup - Step by Step

Follow these steps to enable Google login in your app. This takes about 5-10 minutes.

## ✅ Part 1: Google Cloud Console (3-5 minutes)

1. **Go to Google Cloud Console**
   - Open: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select Project**
   - Click project dropdown (top left)
   - Click "New Project"
   - Name: "Social Impact App"
   - Click "Create"
   - Wait for project to be created, then select it

3. **Configure OAuth Consent Screen**
   - Go to: "APIs & Services" → "OAuth consent screen" (left sidebar)
   - Choose "External" → Click "CREATE"
   - Fill in:
     - **App name**: Social Impact App
     - **User support email**: Your email
     - **Developer contact**: Your email
   - Click "SAVE AND CONTINUE" (skip scopes for now)
   - Click "SAVE AND CONTINUE" (skip test users)
   - Click "BACK TO DASHBOARD"

4. **Create OAuth Credentials**
   - Go to: "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - If you see "OAuth consent screen" warning, you didn't complete step 3 - go back and finish it
   - Fill in:
     - **Application type**: Web application
     - **Name**: Social Impact App Web Client
     - **Authorized JavaScript origins**: Click "+ ADD URI"
       - Add: `http://localhost:3000`
       - Add: `http://localhost:3001`
     - **Authorized redirect URIs**: Click "+ ADD URI"
       - Add: `https://fjrydnkfpdscskdcghqw.supabase.co/auth/v1/callback`
   - Click "CREATE"
   - **IMPORTANT**: Copy the **Client ID** and **Client Secret** shown in the popup
     - You'll need these in the next step!

## ✅ Part 2: Supabase Dashboard (2-3 minutes)

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard
   - Select your project: `fjrydnkfpdscskdcghqw`

2. **Enable Google Provider**
   - Click "Authentication" (left sidebar)
   - Click "Providers" tab
   - Find "Google" in the list
   - Toggle the switch to **Enable** it

3. **Add Google Credentials**
   - In the Google provider settings:
     - **Client ID (for OAuth)**: Paste your Google Client ID from Part 1
     - **Client Secret (for OAuth)**: Paste your Google Client Secret from Part 1
   - Click "Save"

4. **Configure Redirect URLs**
   - Still in Authentication, click "URL Configuration"
   - **Site URL**: `http://localhost:3000` (or `http://localhost:3001` if that's what you're using)
   - **Redirect URLs**: Add these (one per line):
     ```
     http://localhost:3000/**
     http://localhost:3001/**
     ```
   - Click "Save"

## ✅ Part 3: Test It!

1. **Go to Login Page**
   - Open: http://localhost:3000/auth/login (or 3001 if that's your port)
   - You should see a "Sign in with Google" button

2. **Click "Sign in with Google"**
   - You'll be redirected to Google
   - Sign in with your Google account
   - You'll be redirected back to your app
   - You should be logged in!

3. **Check Profile Page**
   - Go to: http://localhost:3000/Profile
   - You should see your real name, email, and avatar from Google!

## 🔧 Troubleshooting

**"redirect_uri_mismatch" error:**
- Make sure you added `https://fjrydnkfpdscskdcghqw.supabase.co/auth/v1/callback` in Google Cloud Console
- Make sure there are no extra spaces when copying

**"invalid_client" error:**
- Double-check Client ID and Client Secret in Supabase match what's in Google Cloud Console
- Make sure Google provider is enabled in Supabase

**Button doesn't appear or doesn't work:**
- Make sure you saved the credentials in Supabase
- Check browser console for errors
- Restart your dev server: `npm run dev`

## 📝 Quick Checklist

- [ ] Created Google Cloud project
- [ ] Configured OAuth consent screen
- [ ] Created OAuth client ID
- [ ] Added redirect URI in Google Cloud: `https://fjrydnkfpdscskdcghqw.supabase.co/auth/v1/callback`
- [ ] Copied Client ID and Secret
- [ ] Enabled Google provider in Supabase
- [ ] Pasted Client ID and Secret in Supabase
- [ ] Configured redirect URLs in Supabase
- [ ] Tested login with Google
- [ ] Verified profile shows real data

Once you complete these steps, Google OAuth will be fully functional! 🎉

