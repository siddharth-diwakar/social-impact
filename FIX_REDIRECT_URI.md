# Fix: Being Redirected to Google Help Page After OAuth

If you're being redirected to a Google help page (like `support.google.com/accounts/answer/14012355`) after clicking "Continue" on the OAuth consent screen, it means the **redirect URI doesn't match** what's configured in Google Cloud Console.

## Quick Fix

### Step 1: Check Your Redirect URI in Code

Your app is configured to use:
```
http://localhost:3001/api/calendar/callback
```

### Step 2: Verify in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Click on your OAuth 2.0 Client ID (the one starting with `1098786978429-...`)
5. Scroll down to **"Authorized redirect URIs"**
6. Make sure you see this EXACT URL:
   ```
   http://localhost:3001/api/calendar/callback
   ```

### Step 3: Add/Update the Redirect URI

If the URI is missing or incorrect:

1. Click **"+ ADD URI"** or edit the existing one
2. Add this EXACT URL:
   ```
   http://localhost:3001/api/calendar/callback
   ```
3. **Important points:**
   - Must be `http://` (not `https://`) for localhost
   - Must include `/api/calendar/callback` at the end
   - No trailing slash
   - Must match your app's URL exactly (port 3001)
4. Click **"Save"**

### Step 4: Test Again

1. Go back to your app
2. Click "Sync with calendar" again
3. Click "Continue" on Google's warning page
4. You should now be redirected back to your app (not the help page)

## Common Issues

### Issue 1: Wrong Port
- If your app runs on port 3000, change to: `http://localhost:3000/api/calendar/callback`
- Check your terminal to see which port Next.js is using

### Issue 2: Wrong Protocol
- For localhost, use `http://` (not `https://`)
- For production, use `https://`

### Issue 3: Trailing Slash
- Don't add a trailing slash: `http://localhost:3001/api/calendar/callback` ✅
- Not: `http://localhost:3001/api/calendar/callback/` ❌

### Issue 4: Missing Path
- Must include the full path: `/api/calendar/callback`
- Not just: `http://localhost:3001` ❌

## After Fixing

Once the redirect URI matches, the OAuth flow should work:
1. Click "Sync with calendar"
2. Click your Google account
3. Click "Continue" on the warning page
4. You'll be redirected back to your app
5. You should see "Calendar connected successfully!"

