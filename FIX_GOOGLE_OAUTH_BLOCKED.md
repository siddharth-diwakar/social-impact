# Fix: "Access blocked: compl.io has not completed the Google verification process"

If you're seeing this error when trying to connect Google Calendar, it means your OAuth app is in "Testing" mode and your email isn't added as a test user.

## IMPORTANT: Check Redirect URI Configuration

**The redirect URI must match EXACTLY in Google Cloud Console!**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Check the **"Authorized redirect URIs"** section
5. Make sure you have this EXACT URL:
   ```
   http://localhost:3001/api/calendar/callback
   ```
   - No trailing slash
   - Exact match (case-sensitive)
   - Must include `http://` (not `https://` for localhost)

If it's not there or doesn't match exactly, add it or update it.

## Quick Fix (2 minutes)

### Step 1: Navigate to OAuth Consent Screen

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (the one with your OAuth credentials)
3. In the left sidebar, click **APIs & Services**
4. Click **OAuth consent screen** (it should be in the left menu under "APIs & Services")

### Step 2: Check Publishing Status

At the top of the OAuth consent screen page, you'll see:
- **Publishing status**: Should say "Testing" (not "In production")
- If it says "In production", you need to go back to "Testing" mode first

### Step 3: Find Test Users Section

The "Test users" section appears in different places depending on your setup:

**Option A: If you see tabs at the top**
- Click the **"Test users"** tab (after "Scopes" tab)
- You should see a list of test users (might be empty)
- Click **"+ ADD USERS"** button

**Option B: If you see a single page layout**
- Scroll down past the "Scopes" section
- Look for a section titled **"Test users"** or **"Test users (optional)"**
- It should be near the bottom of the page
- Click **"+ ADD USERS"** or **"Add Users"** button

**Option C: If you don't see it at all**
- Make sure you're on the OAuth consent screen page (not the Credentials page)
- The URL should be something like: `console.cloud.google.com/apis/credentials/consent`
- If you still don't see it, try completing the consent screen setup first:
  1. Make sure all required fields are filled (App name, User support email, etc.)
  2. Click "Save and Continue" through all steps
  3. Then come back to the OAuth consent screen page

### Step 4: Add Your Email

1. Click **"+ ADD USERS"** or **"Add Users"** button
2. Enter your Google email address:
   - Example: `Ved.Puranik@gmail.com`
3. Click **Add** or **Save**
4. Your email should now appear in the test users list
5. Try connecting Google Calendar again - it should work now!

## Why This Happens

When you create an OAuth app in Google Cloud Console, it defaults to "Testing" mode. In this mode:
- Only users explicitly added to the "Test users" list can access the app
- This is a security feature to prevent unauthorized access during development

## Alternative: Add Multiple Test Users

If you need to allow multiple people to test:
1. Follow steps 1-4 above
2. Click **"+ ADD USERS"** multiple times
3. Add each email address you want to allow
4. All added users will be able to connect their Google Calendar

## Production Mode (For Later)

Once you're ready to launch publicly:
1. Go to **OAuth consent screen**
2. Click **"PUBLISH APP"**
3. Complete Google's verification process (this can take several days)
4. After verification, anyone can use your app

For now, **adding test users is the quickest solution** for development! ✅

