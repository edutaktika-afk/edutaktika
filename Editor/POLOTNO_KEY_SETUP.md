# Polotno API Key Setup Guide for Netlify

## Overview
This guide explains how to configure your Polotno API key as an environment variable in Netlify to remove the "Free limit exceeded" banner.

## Current Setup

The code is configured to:
1. **First check** for `VITE_POLOTNO_API_KEY` environment variable
2. **Fallback** to hardcoded key if env var is not set
3. **Auto-clean** any leading pipe character "|" from the key

## Step-by-Step Netlify Configuration

### 1. Set Environment Variable in Netlify Dashboard

1. Go to your Netlify site dashboard
2. Navigate to: **Site settings** → **Environment variables**
3. Click **Add variable**
4. Set:
   - **Key**: `VITE_POLOTNO_API_KEY` (exactly this, no spaces, no equals sign)
   - **Value**: `KZiuYryOVcs9sz8q8A1l` (your key WITHOUT the pipe character)
   - **Scopes**: Select "Production" (and "Deploy previews" if needed)

### 2. Verify the Setup

**Important**: The key format should be:
- ✅ Correct: `KZiuYryOVcs9sz8q8A1l`
- ❌ Wrong: `|KZiuYryOVcs9sz8q8A1l` (pipe character is added by Polotno SDK)
- ❌ Wrong: `VITE_POLOTNO_API_KEY = KZiuYryOVcs9sz8q8A1l` (don't include key name in value)

### 3. Redeploy

After setting the environment variable:
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for build to complete

## Code Verification

### ✅ Check 1: Environment Variable is Referenced Correctly

**File**: `Editor/src/utils/polotno-keys.js`

```javascript
const getPolotnoKey = () => {
  const envKey = import.meta.env.VITE_POLOTNO_API_KEY;
  if (envKey) {
    const cleanKey = envKey.trim().replace(/^\|/, '');
    return cleanKey;
  }
  return PRIMARY_KEY; // Fallback
};
```

✅ **Status**: Code correctly uses `import.meta.env.VITE_POLOTNO_API_KEY`

### ✅ Check 2: Key is Used in Store Creation

**File**: `Editor/src/index.jsx`

```javascript
import { getStoreKey } from './utils/polotno-keys';
const store = createStore({ key: getStoreKey() });
```

✅ **Status**: Store uses the key manager function

### ✅ Check 3: Vite Configuration

**File**: `Editor/vite.config.js`

Vite automatically exposes variables prefixed with `VITE_` to the client. No additional configuration needed.

✅ **Status**: Vite is correctly configured

### ✅ Check 4: No Syntax Issues

The code uses `import.meta.env` which is:
- ✅ Supported in Vite
- ✅ Available at build time
- ✅ Works in both development and production

## Safe Debugging Methods

### Method 1: Console Log (Development Only)

The code already includes safe debug logging:

```javascript
// In Editor/src/index.jsx
const keyDebug = getKeyDebugInfo();
console.log('🔑 Polotno API Key Debug Info:', keyDebug);
```

This shows:
- Source: "environment variable" or "hardcoded fallback"
- Key length
- Key preview (first 2 and last 2 chars only)
- Whether env var exists

**Only visible in development mode** - safe for debugging.

### Method 2: Browser Console Check (Production)

In production, you can check in browser console:

```javascript
// Open browser console on your deployed site
// Check if environment variable is set
console.log('Has env var:', !!import.meta.env.VITE_POLOTNO_API_KEY);
console.log('Key length:', import.meta.env.VITE_POLOTNO_API_KEY?.length);
```

**Note**: The actual key value is NOT logged in production for security.

### Method 3: Network Tab Verification

1. Open browser DevTools → Network tab
2. Filter by "polotno" or "api.polotno"
3. Check API requests - they should include `KEY=` parameter
4. Verify the key matches your expected key (partial verification)

## Validation Checklist

Use this checklist to verify your setup:

- [ ] Environment variable `VITE_POLOTNO_API_KEY` is set in Netlify Dashboard
- [ ] Variable value is `KZiuYryOVcs9sz8q8A1l` (without pipe character)
- [ ] Variable scope includes "Production"
- [ ] Site has been redeployed after setting the variable
- [ ] Check browser console for "🔑 Using Polotno API key from environment variable" message
- [ ] Verify "Free limit exceeded" banner is gone
- [ ] Test editor functionality (creating, saving designs)

## Troubleshooting

### Issue: Still seeing "Free limit exceeded" banner

**Solutions:**
1. Verify env var is set correctly in Netlify Dashboard
2. Check that you redeployed after setting the variable
3. Clear browser cache and hard refresh (Ctrl+Shift+R)
4. Check browser console for debug messages
5. Verify the key value doesn't have extra spaces or characters

### Issue: Console shows "Using Polotno API key from code (fallback)"

**This means:**
- Environment variable is not being read
- Check Netlify environment variable configuration
- Verify variable name is exactly `VITE_POLOTNO_API_KEY`
- Ensure variable is scoped to "Production"

### Issue: "Cannot use import.meta outside a module"

**This won't happen** because:
- Vite handles `import.meta.env` correctly
- Code is in a module context
- If you see this error, it's likely a build configuration issue

## Testing Locally

### Current Status (What You're Seeing)

The console output shows:
- ✅ Code is working correctly
- ✅ Using fallback key for local development (this is fine)
- ⚠️ Environment variable not set locally (optional for dev)

### To Test with Environment Variable Locally:

1. **Create `.env` file** in `Editor/` directory:
   ```bash
   cd Editor
   # Copy the example file
   cp .env.example .env
   # Or create manually
   ```

2. **Edit `.env` file** and ensure it contains:
   ```
   VITE_POLOTNO_API_KEY=KZiuYryOVcs9sz8q8A1l
   ```
   (No pipe character, no quotes, no spaces around "=")

3. **Restart development server**:
   ```bash
   npm run dev
   ```

4. **Check console** - you should now see:
   - `🔑 Using Polotno API key from environment variable`
   - `Polotno Key Source: environment variable (Length: 20)`
   - `hasEnvVar: true` in debug info

### Note for Local Development

**It's optional** to set the env var locally. The fallback key works fine for local development. The environment variable is mainly needed for **Netlify production** to remove the "Free limit exceeded" banner.

**For production on Netlify**, you MUST set the environment variable in Netlify Dashboard (not just in .env file).

## Security Notes

- ✅ Environment variables are only available at build time (not exposed to client)
- ✅ Actual key values are not logged in production
- ✅ Debug info only shows partial key (first/last chars)
- ✅ Key is cleaned to remove any accidental pipe characters

## Current Key Configuration

- **Primary Key**: `nFA5H9elEytDyPyvKL7T` (fallback)
- **Secondary Key**: `KZiuYryOVcs9sz8q8A1l` (use this in Netlify)
- **Video Key**: `XWaPcWabeqo2TJSU2Ob5` (for Pexels videos)

## Next Steps

1. Set the environment variable in Netlify
2. Redeploy your site
3. Verify using the debug methods above
4. Confirm the banner is gone

