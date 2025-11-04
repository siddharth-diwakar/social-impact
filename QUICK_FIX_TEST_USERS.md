# Quick Fix: Can't Find Test Users Section

If you don't see the "Test users" section, follow these steps:

## Option 1: Make Sure You're on the Right Page

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Or navigate: **APIs & Services** → **OAuth consent screen**
3. Make sure you're NOT on the "Credentials" page (that's different)

## Option 2: Complete the Consent Screen Setup First

If you don't see "Test users", the consent screen might not be fully set up:

1. On the OAuth consent screen page, check if you see any incomplete steps
2. Fill in all required fields:
   - **App name**: compl.io (or your app name)
   - **User support email**: Your email
   - **Developer contact information**: Your email
3. Click **"Save and Continue"** through all steps
4. Make sure you add these scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
5. After completing all steps, the "Test users" section should appear

## Option 3: Look for Different UI Layouts

The "Test users" section might appear in different places:

**If you see tabs:**
- Click the **"Test users"** tab (after Scopes)

**If you see a single page:**
- Scroll down to the bottom
- Look for a section that says "Test users" or "Test users (optional)"
- It's usually after the "Scopes" section

## Option 4: Check Publishing Status

1. At the top of the OAuth consent screen, look for "Publishing status"
2. It should say **"Testing"** (not "In production")
3. If it says "In production", click the **"BACK TO TESTING"** button
4. Then you should see the "Test users" section

## Still Can't Find It?

Take a screenshot of your OAuth consent screen page and share it, or try this:

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Look at the URL - it should end with `/consent`
3. Scroll through the entire page
4. Look for any button that says "Add" or "+" near test users

The section should definitely be there if your app is in "Testing" mode!

