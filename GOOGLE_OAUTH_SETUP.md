# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your application so users can sign in with their Google/Gmail accounts.

## Prerequisites

- A Supabase project (already set up)
- A Google Cloud Platform account (free)
- Access to your Supabase dashboard

## Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project** (or use existing)
   - Click the project dropdown at the top
   - Click "New Project"
   - Enter a project name (e.g., "Social Impact App")
   - Click "Create"

3. **Enable Google+ API**
   - In the left sidebar, go to "APIs & Services" → "Library"
   - Search for "Google+ API" or "People API"
   - Click on it and click "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure the OAuth consent screen first:
     - Choose "External" (for most use cases)
     - Fill in the required fields:
       - App name: Your app name
       - User support email: Your email
       - Developer contact: Your email
     - Click "Save and Continue" through the steps
     - Click "Back to Dashboard"

5. **Create OAuth Client ID**
   - Application type: Choose "Web application"
   - Name: "Social Impact App Web Client"
   - Authorized JavaScript origins:
     - Add: `http://localhost:3000` (for local development)
     - Add: `http://localhost:3001` (if using port 3001)
     - Add your production URL when ready (e.g., `https://yourdomain.com`)
   - Authorized redirect URIs:
     - Add: `https://fjrydnkfpdscskdcghqw.supabase.co/auth/v1/callback`
     - This is your Supabase project's OAuth callback URL
   - Click "Create"
   - **Copy the Client ID and Client Secret** (you'll need these next)

## Step 2: Configure Google OAuth in Supabase

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication**
   - In the left sidebar, click "Authentication"
   - Click "Providers" in the submenu

3. **Enable Google Provider**
   - Find "Google" in the list of providers
   - Toggle it to "Enabled"

4. **Enter Google OAuth Credentials**
   - **Client ID (for OAuth)**: Paste your Google Client ID
   - **Client Secret (for OAuth)**: Paste your Google Client Secret
   - **Allowed Email Domains** (optional): Leave empty to allow all Gmail accounts, or add specific domains
   - Click "Save"

## Step 3: Configure Redirect URLs

1. **In Supabase Dashboard**
   - Go to "Authentication" → "URL Configuration"
   - Add your site URLs:
     - **Site URL**: `http://localhost:3000` (or your production URL)
     - **Redirect URLs**: Add:
       - `http://localhost:3000/**` (for local development)
       - `http://localhost:3001/**` (if using port 3001)
       - Your production URLs when ready

## Step 4: Test the Integration

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Navigate to Login Page**
   - Go to `http://localhost:3000/auth/login`
   - You should see a "Sign in with Google" button

3. **Test Google Login**
   - Click "Sign in with Google"
   - You should be redirected to Google's sign-in page
   - Sign in with your Google account
   - You should be redirected back to your app

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure you added the correct redirect URI in Google Cloud Console:
  - `https://fjrydnkfpdscskdcghqw.supabase.co/auth/v1/callback`
- Make sure the Client ID and Secret in Supabase match your Google Cloud Console

### Error: "invalid_client"
- Double-check your Client ID and Client Secret in Supabase
- Make sure there are no extra spaces when copying

### OAuth consent screen shows warning
- If you see "This app isn't verified", that's normal for development
- Users can still click "Advanced" → "Go to [Your App] (unsafe)"
- To remove the warning, you'll need to verify your app with Google (more complex, not needed for development)

### Users redirected but not logged in
- Check that redirect URLs are correctly configured in Supabase
- Make sure the `auth/confirm` route is handling OAuth callbacks correctly

## Production Deployment

When deploying to production:

1. **Update Google Cloud Console**
   - Add your production domain to "Authorized JavaScript origins"
   - Add your production domain to "Authorized redirect URIs" (still use Supabase callback URL)

2. **Update Supabase**
   - Update "Site URL" in Supabase to your production URL
   - Add production redirect URLs

3. **Environment Variables**
   - Your environment variables should work the same in production
   - No additional configuration needed for OAuth

## Next Steps

Once OAuth is set up:
- Users can sign in with Google
- User profile information (name, email, avatar) will be automatically fetched from Google
- The Profile page will display real user data instead of mock data

## Additional Resources

- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

