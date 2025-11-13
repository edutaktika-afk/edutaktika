# Cloudflare R2 Migration Summary

## Overview

The codebase has been updated to use **Cloudflare R2** as the primary storage for files, while keeping **Supabase** for metadata management (thumbnails, references, design lists).

## What Changed

### Architecture
- **Before**: Supabase Storage for all files + Supabase Database for metadata
- **After**: R2 Storage for files + Supabase Database for metadata

### Benefits
1. **Cost-effective**: R2 has no egress fees (unlike S3)
2. **Scalable**: No file size limits (Supabase free tier has 50MB limit)
3. **Fast**: Global CDN distribution
4. **Metadata preserved**: All design lists and references remain in Supabase

## Files Created

1. **`Editor/src/r2.js`**
   - R2 client configuration
   - Credentials and bucket setup
   - Public URL generation

2. **`Editor/src/r2-api.js`**
   - R2 API functions (upload, download, delete, list)
   - S3-compatible operations using AWS SDK

3. **`Editor/R2_SETUP.md`**
   - Complete setup guide
   - Configuration instructions
   - Troubleshooting tips

## Files Modified

1. **`Editor/src/supabase-api.js`**
   - Updated `writeFile()` to use R2 first, then Supabase fallback
   - Updated `readFile()` to use R2 first, then Supabase fallback
   - Updated `deleteFile()` to use R2 first, then Supabase fallback
   - Updated `getPreview()`, `getAssetSrc()`, `getAssetPreviewSrc()` to use R2 URLs
   - **Metadata functions unchanged**: `readKv()`, `writeKv()` still use Supabase

2. **`Editor/src/media-extractor.js`**
   - Updated to upload extracted media to R2 first, then Supabase fallback
   - Function renamed from `uploadMediaToSupabase()` to `uploadMediaToStorage()`

3. **`package.json`**
   - Added `@aws-sdk/client-s3` dependency (R2 is S3-compatible)

## Backward Compatibility

The system maintains **full backward compatibility**:
- If R2 is not configured, it falls back to Supabase Storage
- If Supabase is not configured, it falls back to local storage
- Existing Supabase Storage files continue to work
- No breaking changes to the API interface

## Migration Path

### For New Deployments
1. Set up Cloudflare R2 bucket
2. Configure environment variables
3. Start using the system (files go to R2 automatically)

### For Existing Deployments
1. Set up Cloudflare R2 bucket
2. Configure environment variables
3. Optionally migrate existing files from Supabase to R2
4. System will use R2 for new files, Supabase for old files (until migrated)

## Environment Variables Required

```env
# R2 Configuration (for file storage)
VITE_R2_ACCOUNT_ID=your_account_id
VITE_R2_ACCESS_KEY_ID=your_access_key_id
VITE_R2_SECRET_ACCESS_KEY=your_secret_access_key
VITE_R2_BUCKET_NAME=edutaktika-storage
VITE_R2_PUBLIC_URL=https://your-domain.com  # Optional

# Supabase Configuration (for metadata)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing

To test the integration:
1. Configure R2 credentials
2. Upload a design file
3. Check R2 bucket to verify file is stored
4. Check Supabase database to verify metadata is stored
5. Load the design to verify it works

## Next Steps

1. **Install dependencies**: `npm install`
2. **Configure R2**: Follow `Editor/R2_SETUP.md`
3. **Test upload**: Upload a design and verify it works
4. **Optional migration**: Migrate existing files from Supabase to R2

## Support

- **Setup Guide**: See `Editor/R2_SETUP.md`
- **R2 Documentation**: https://developers.cloudflare.com/r2/
- **Code**: Check `Editor/src/r2-api.js` for implementation details

