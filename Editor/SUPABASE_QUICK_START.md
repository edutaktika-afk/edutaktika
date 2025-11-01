# Supabase Integration - Quick Start

## What Was Added

✅ **Supabase SDK** (`@supabase/supabase-js`) added to `package.json`  
✅ **Nanoid** added to dependencies  
✅ `src/supabase.js` - Supabase client configuration  
✅ `src/supabase-api.js` - Complete API implementation  
✅ `SUPABASE_SETUP.md` - Detailed setup guide  

## Quick Switch to Supabase

To switch from Firebase/Puter to Supabase in your app, simply change the import in files that use the API:

### Before (using Firebase/Puter):
```javascript
import * as api from './api';
```

### After (using Supabase):
```javascript
import * as api from './supabase-api';
```

### Example: Update `project.js`

```javascript
// Change line 5 in src/project.js from:
import * as api from './api';

// To:
import * as api from './supabase-api';
```

## Setup Required

1. **Create Supabase account** at https://supabase.com
2. **Create 2 storage buckets**: `designs` and `uploads`
3. **Create database table**: `designs_metadata`
4. **Add environment variables** to `.env` file:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. **Run** `npm install` in the Editor directory

See `SUPABASE_SETUP.md` for detailed instructions.

## Automatic Fallback

The integration automatically falls back to local storage when:
- Supabase credentials are not configured
- API calls fail
- User is not authenticated

This means your app will continue working even without Supabase setup!

## API Functions Available

All functions work exactly like the original Firebase implementation:

- `saveDesign()` - Save designs
- `loadById()` - Load designs
- `listDesigns()` - List all designs
- `deleteDesign()` - Delete designs
- `getPreview()` - Get preview images
- `uploadAsset()` - Upload assets
- `listAssets()` - List assets
- And more...

See `src/supabase-api.js` for the complete list.

## Need Help?

📖 Read `SUPABASE_SETUP.md` for detailed setup instructions  
🐛 Check browser console for error messages  
🔗 Visit https://supabase.com/docs for Supabase documentation
