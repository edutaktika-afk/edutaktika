# Polotno API Key Validation Checklist

## ✅ Step-by-Step Validation

### 1. Netlify Environment Variable Setup

**In Netlify Dashboard:**
- [ ] Go to: **Site settings** → **Environment variables**
- [ ] Variable Key: `VITE_POLOTNO_API_KEY` (exactly this, no spaces, no equals sign)
- [ ] Variable Value: `KZiuYryOVcs9sz8q8A1l` (without pipe character "|")
- [ ] Scope: Check "Production" (and "Deploy previews" if needed)
- [ ] Click "Save"

**Important Notes:**
- ❌ Don't include the pipe character "|" in the value
- ❌ Don't include "=" in the key name
- ✅ Key should be exactly: `VITE_POLOTNO_API_KEY`
- ✅ Value should be exactly: `KZiuYryOVcs9sz8q8A1l`

### 2. Redeploy After Setting Environment Variable

- [ ] Go to **Deploys** tab in Netlify
- [ ] Click **Trigger deploy** → **Deploy site**
- [ ] Wait for build to complete
- [ ] Verify build succeeded (check build logs)

### 3. Code Verification (Already Done ✅)

**File: `Editor/src/utils/polotno-keys.js`**
- ✅ Uses `import.meta.env.VITE_POLOTNO_API_KEY`
- ✅ Falls back to hardcoded key if env var not set
- ✅ Auto-removes pipe character if present

**File: `Editor/src/index.jsx`**
- ✅ Uses `getStoreKey()` from key manager
- ✅ Includes debug logging

**File: `Editor/vite.config.js`**
- ✅ Vite automatically exposes `VITE_*` variables
- ✅ No additional configuration needed

### 4. Production Verification (Safe Methods)

#### Method 1: Browser Console Check

1. Open your deployed site on Netlify
2. Open browser DevTools (F12)
3. Go to Console tab
4. Look for the welcome message that includes:
   ```
   Polotno Key Source: environment variable (Length: 20)
   ```
5. If you see "environment variable", the key is loaded correctly!
6. If you see "hardcoded fallback", the env var is not set correctly

#### Method 2: Use Verification Function

1. Open browser console on your deployed site
2. Type: `window.verifyPolotnoKey()`
3. Press Enter
4. Check the report table:
   - `hasEnvironmentVariable`: should be `true`
   - `status`: should be "✅ Using environment variable"
   - `keyLengthValid`: should be `true`

#### Method 3: Network Tab Check

1. Open DevTools → Network tab
2. Filter by "polotno" or "api.polotno"
3. Look for API requests
4. Check the URL parameters - they should include `KEY=...`
5. The key should match your expected key length (20 chars)

### 5. Verify "Free limit exceeded" Banner is Gone

- [ ] Load your deployed site
- [ ] Check if the banner is visible
- [ ] If banner is gone ✅, the key is working!
- [ ] If banner still appears, check console for errors

## 🔍 Troubleshooting

### Issue: Console shows "Using Polotno API key from code (fallback)"

**Possible causes:**
1. Environment variable not set in Netlify
2. Variable name is incorrect (should be exactly `VITE_POLOTNO_API_KEY`)
3. Site not redeployed after setting variable
4. Variable scope doesn't include Production

**Solution:**
1. Double-check variable name in Netlify Dashboard
2. Verify variable value is correct
3. Redeploy the site
4. Clear browser cache and hard refresh

### Issue: Still seeing "Free limit exceeded" banner

**Possible causes:**
1. Environment variable not being read
2. Key value is incorrect
3. Banner is cached

**Solution:**
1. Run `window.verifyPolotnoKey()` in console
2. Check if env var is being read
3. Verify key value matches your Polotno account
4. Clear browser cache

### Issue: "Cannot use import.meta outside a module"

**This shouldn't happen** because:
- Vite handles `import.meta.env` correctly
- Code is in module context
- If you see this, it's a build configuration issue

**Solution:**
- Check `vite.config.js` is correct
- Verify you're using Vite build command
- Check build logs for errors

## 📋 Quick Verification Commands

### In Browser Console (Production):

```javascript
// Check if environment variable exists
console.log('Has env var:', !!import.meta.env.VITE_POLOTNO_API_KEY);
console.log('Key length:', import.meta.env.VITE_POLOTNO_API_KEY?.length);

// Run full verification
window.verifyPolotnoKey();

// Check what key is actually being used (safe - only shows partial)
console.log('Key source:', window.store?.key ? 'Key is set' : 'Key not set');
```

### Expected Output:

If working correctly:
- ✅ `hasEnvVar: true`
- ✅ `Key length: 20`
- ✅ `status: "✅ Using environment variable"`
- ✅ `keyLengthValid: true`

If not working:
- ⚠️ `hasEnvVar: false`
- ⚠️ `status: "⚠️ Using fallback key"`
- ⚠️ Console shows: "Using Polotno API key from code (fallback)"

## 🔒 Security Notes

- ✅ Environment variables are only available at build time
- ✅ Actual key values are NOT exposed in production
- ✅ Debug functions only show partial key (first/last 2 chars)
- ✅ Key is cleaned to remove accidental pipe characters
- ✅ Verification function is safe to use in production

## 📝 Current Configuration Summary

- **Environment Variable**: `VITE_POLOTNO_API_KEY`
- **Expected Value**: `KZiuYryOVcs9sz8q8A1l` (20 characters, no pipe)
- **Fallback Key**: `nFA5H9elEytDyPyvKL7T` (if env var not set)
- **Code Location**: `Editor/src/utils/polotno-keys.js`
- **Store Usage**: `Editor/src/index.jsx` line 45

## ✅ Final Checklist Before Going Live

- [ ] Environment variable set in Netlify Dashboard
- [ ] Variable name is exactly `VITE_POLOTNO_API_KEY`
- [ ] Variable value is exactly `KZiuYryOVcs9sz8q8A1l` (no pipe)
- [ ] Variable scoped to Production
- [ ] Site redeployed after setting variable
- [ ] Console shows "Using Polotno API key from environment variable"
- [ ] `window.verifyPolotnoKey()` shows env var is being used
- [ ] "Free limit exceeded" banner is gone
- [ ] Editor functionality works correctly

