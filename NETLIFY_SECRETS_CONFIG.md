# Netlify Secrets Scanning Configuration

## Issue
Netlify's secrets scanner is detecting Firebase API keys and blocking the build. Firebase API keys are **safe to expose** in client-side code (they're meant to be public), but Netlify's scanner doesn't know this.

## Solution

### Option 1: Allow Specific Firebase API Key (Recommended)

1. Go to your **Netlify Dashboard**
2. Navigate to: **Site settings** → **Environment variables**
3. Click **Add variable**
4. Add the following:
   - **Key**: `SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES`
   - **Value**: `AIzaSyB5BbeLLvPX8l1c4Lq0f-CmIUml4hQOQlE`
5. Click **Save**
6. Redeploy your site

This tells Netlify to ignore this specific Firebase API key while still scanning for other secrets.

### Option 2: Disable Smart Detection (Not Recommended)

If you want to disable smart detection entirely (less secure):

1. Go to **Netlify Dashboard** → **Site settings** → **Environment variables**
2. Add:
   - **Key**: `SECRETS_SCAN_SMART_DETECTION_ENABLED`
   - **Value**: `false`
3. Redeploy

⚠️ **Warning**: This disables all smart detection, which is less secure. Option 1 is preferred.

## Why Firebase API Keys Are Safe

Firebase API keys are **designed to be public** in client-side applications. They:
- Are restricted by Firebase Security Rules
- Cannot access your Firebase project without proper authentication
- Are visible in browser DevTools anyway (by design)
- Are protected by Firebase's domain restrictions (if configured)

The real security comes from:
- Firebase Security Rules (database/storage rules)
- Authentication (user login)
- Domain restrictions (if configured in Firebase Console)

## Additional Notes

- The Firebase API key `AIzaSyB5BbeLLvPX8l1c4Lq0f-CmIUml4hQOQlE` is used throughout the codebase for client-side Firebase initialization
- This is the standard way to use Firebase in web applications
- Moving it to environment variables would require significant refactoring and wouldn't improve security (since it's still exposed to clients)

## After Configuration

Once you've added the environment variable:
1. The build should pass
2. Secrets scanning will still work for actual secrets
3. Only this specific Firebase API key will be ignored

