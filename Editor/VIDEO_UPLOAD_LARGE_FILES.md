# Large Video File Upload Workaround

## Overview

Supabase free tier has a **50MB file upload limit**. This document explains the workaround implemented for handling large video files in the editor.

## Solution Implemented

### 1. **File Size Detection**
- Files over 50MB are detected before upload
- Users are warned with a confirmation dialog
- File size is displayed in a human-readable format (MB)

### 2. **Attempt Direct Upload**
- Large files are still attempted to upload directly
- **Why?** Users on Supabase Pro plan can upload files up to 500GB
- If the upload succeeds, the file is uploaded normally

### 3. **Error Handling**
- If upload fails due to size limits, clear error messages are shown
- Users receive instructions on how to compress videos
- Helpful links and suggestions are provided

### 4. **Progress Tracking**
- Upload progress is simulated for large files (since Supabase JS client doesn't provide real progress)
- Progress updates are logged to console

## Files Modified

1. **`Editor/src/chunked-upload.js`** - New utility for handling large file uploads
2. **`Editor/src/supabase-api.js`** - Updated `writeFile` and `uploadAsset` functions
3. **`Editor/src/sections/upload-section.jsx`** - Updated upload handler with error handling

## User Experience

### When Uploading Large Files (>50MB):

1. **Warning Dialog** appears:
   ```
   ⚠️ Large file detected: XX.XX MB
   
   This file exceeds Supabase's 50MB limit for free tier.
   
   Options:
   - Cancel and compress the file first (recommended)
   - Continue to try upload (may fail if on free tier)
   
   Would you like to continue with the upload?
   ```

2. **If User Continues:**
   - Upload is attempted
   - If successful (Pro plan): File uploads normally
   - If failed (Free tier): Clear error message shown

3. **Error Message Example:**
   ```
   ❌ Upload Failed: video.mp4
   
   ⚠️ File too large (75.50MB)
   
   Supabase free tier limits uploads to 50MB.
   
   Options:
   1. Compress the video before uploading (recommended)
      - Use HandBrake (free): https://handbrake.fr/
      - Use FFmpeg or online video compressors
      - Reduce video resolution/quality
   
   2. Upgrade to Supabase Pro (supports up to 500GB)
      - Visit: https://supabase.com/pricing
   
   3. Split long videos into shorter segments
   ```

## Limitations

### Current Implementation:
- ✅ Detects large files
- ✅ Warns users before upload
- ✅ Attempts upload (works for Pro plan users)
- ✅ Provides clear error messages
- ✅ Shows progress (simulated)

### Not Implemented:
- ❌ True chunked uploads (Supabase doesn't support client-side multipart assembly)
- ❌ Browser-based video compression (unreliable across browsers)
- ❌ Alternative storage service integration (requires additional setup)

## Workarounds for Users

### Option 1: Compress Videos (Recommended)
Use video compression tools:
- **HandBrake** (Free): https://handbrake.fr/
- **FFmpeg** (Command-line): https://ffmpeg.org/
- **Online compressors**: Various online tools available
- **Reduce resolution**: Lower video resolution reduces file size significantly

### Option 2: Upgrade to Supabase Pro
- Supabase Pro plan supports files up to **500GB**
- Visit: https://supabase.com/pricing
- No code changes required - uploads will work automatically

### Option 3: Split Videos
- Break long videos into shorter segments
- Upload each segment separately
- Combine in the editor if needed

### Option 4: Use External Storage (Advanced)
For a true workaround, you could:
1. Set up AWS S3, Cloudflare R2, or similar service
2. Upload large files directly to external storage
3. Store URLs in Supabase
4. This requires server-side infrastructure

## Technical Details

### File Size Threshold
- **LARGE_FILE_THRESHOLD**: 50MB (50 * 1024 * 1024 bytes)
- Files over this threshold trigger special handling

### Bucket Selection
- Files in `uploads/` folder → `BUCKET_ASSETS`
- Files in `SCIENCE/`, `ENGLISH/`, `MATH/` → `BUCKET_LESSON_STORAGE`
- Other files → `BUCKET_LESSON_STORAGE` (default)

### Error Detection
The system detects size limit errors by checking for:
- Error message contains "size", "limit", or "50"
- Error message contains "Payload too large"
- HTTP status code 413 (Payload Too Large)

## Future Improvements

### Possible Enhancements:
1. **TUS Resumable Uploads**: Implement TUS protocol for true resumable uploads
2. **Client-side Compression**: Use WebAssembly-based compression (ffmpeg.wasm)
3. **External Storage Integration**: Support for AWS S3, Cloudflare R2, etc.
4. **Real Progress Tracking**: Use Supabase's progress events if available
5. **Automatic Compression**: Compress videos automatically before upload

### Considerations:
- Browser-based video compression is resource-intensive
- May not work reliably across all browsers
- Compression quality vs. file size trade-off
- User experience (compression takes time)

## Testing

To test large file uploads:

1. **Test with file < 50MB**: Should upload normally
2. **Test with file > 50MB on Free tier**: Should show error with instructions
3. **Test with file > 50MB on Pro tier**: Should upload successfully
4. **Test error handling**: Verify error messages are user-friendly

## Support

If you encounter issues:
1. Check Supabase plan (Free vs Pro)
2. Verify file size
3. Check browser console for detailed error messages
4. Try compressing the video and uploading again

## References

- [Supabase Storage File Limits](https://supabase.com/docs/guides/storage/uploads/file-limits)
- [Supabase Pricing](https://supabase.com/pricing)
- [HandBrake Video Compression](https://handbrake.fr/)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)

