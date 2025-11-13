# ✅ R2 Integration with Polotno Editor - Complete!

## Status: Ready to Use! 🎉

Your Polotno Editor is now fully configured to use:
- **R2** for large JSON lesson files (no egress fees, unlimited size)
- **Supabase Storage** for thumbnails (small files, free tier)
- **Supabase Database** for metadata (fast queries)

## How It Works

### When You Save a Design in Polotno Editor:

1. **Thumbnail/Preview** (50-200KB)
   - ✅ Saved to **Supabase Storage** (`LessonStorage` bucket)
   - Path: `SCIENCE/grade5/quarter1/design-id.jpg`
   - Uses free tier bandwidth (2GB/month)

2. **Design JSON** (can be 10MB+)
   - ✅ Saved to **R2 Storage** (`lessonflarer2` bucket)
   - Path: `SCIENCE/grade5/quarter1/design-id.json`
   - **No size limits, no egress fees!**

3. **Extracted Media** (images, videos from design)
   - ✅ Saved to **R2 Storage** (`lessonflarer2` bucket)
   - Path: `SCIENCE/grade5/quarter1/images/media-id.png`
   - Large files benefit from R2's no-egress policy

4. **Metadata** (design list)
   - ✅ Saved to **Supabase Database** (`designs_metadata` table)
   - Fast queries for design lists

### When You Load a Design:

1. **Gallery/List View**
   - Queries Supabase Database for design list
   - Loads thumbnails from Supabase Storage (fast, free tier)
   - Shows preview images quickly

2. **Full Design Load**
   - Loads JSON from R2 (large file, **no egress fees**)
   - Loads media files from R2 (**no egress fees**)
   - Displays thumbnail from Supabase (already cached)

## Benefits

✅ **No Egress Fees** - Download lessons unlimited times from R2  
✅ **No Size Limits** - Store 10MB, 100MB, or even 1GB+ JSON files  
✅ **Fast Thumbnails** - Small files load quickly from Supabase  
✅ **Cost Effective** - Optimized for free/low-cost tiers  
✅ **Scalable** - Can handle thousands of designs  

## What's Configured

### ✅ R2 Configuration
- Account ID: `87001b07874e84e7839c624361f60a3d`
- Bucket: `lessonflarer2`
- Access Key: Configured in `.env`
- Public URL: `https://pub-5debe0c02d2d436787b8bc5adc76b013.r2.dev`
- **Status**: Ready (just need to enable write permissions on API token)

### ✅ Supabase Configuration
- URL: Configured (default or from `.env`)
- Storage Bucket: `LessonStorage`
- Database Table: `designs_metadata`
- **Status**: Ready

### ✅ Code Updates
- Thumbnails automatically go to Supabase Storage
- Large JSON files automatically go to R2
- Media files automatically go to R2
- Metadata automatically goes to Supabase Database
- **Status**: Complete!

## Next Steps

### 1. Enable R2 Write Permissions (If Not Done)

Your API token needs write permissions:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. R2 → Manage R2 API Tokens
3. Edit "EdutaktikaEditor" token
4. Enable **Object Write** permission
5. Save

### 2. Test the Integration

1. **Start your dev server:**
   ```bash
   cd Editor
   npm run dev
   ```

2. **Open Polotno Editor** in browser

3. **Create or open a design**

4. **Save the design:**
   - Click Save button
   - Check browser console for messages:
     - `📸 Uploading thumbnail to Supabase...`
     - `✅ Thumbnail saved to Supabase`
     - `📤 Uploading to R2: ...`
     - `✅ Upload successful to R2`

5. **Verify in Cloudflare:**
   - Go to R2 dashboard
   - Check `lessonflarer2` bucket
   - You should see your JSON file

6. **Verify in Supabase:**
   - Go to Supabase dashboard
   - Check Storage → `LessonStorage` bucket
   - You should see your thumbnail

## Testing

Run the connection test:
```bash
cd Editor
node test-r2-connection.js
```

This will verify:
- ✅ R2 connection works
- ✅ Read permissions work
- ✅ Write permissions work (if enabled)

## File Locations

### R2 Storage (`lessonflarer2`)
```
SCIENCE/
  grade5/
    quarter1/
      design-123.json          ← Large JSON lesson file
      images/
        media-456.png         ← Extracted media
```

### Supabase Storage (`LessonStorage`)
```
SCIENCE/
  grade5/
    quarter1/
      design-123.jpg          ← Thumbnail/preview
```

### Supabase Database (`designs_metadata`)
```json
{
  "key": "designs-list",
  "value": [
    { "id": "design-123", "name": "Science Lesson 1" }
  ]
}
```

## Cost Estimate

**Example**: 1000 designs, each with:
- 1 thumbnail (100KB) = 100MB in Supabase ✅ Free tier
- 1 JSON file (5MB average) = 5GB in R2 = $0.08/month
- 5 media files (2MB each) = 10GB in R2 = $0.15/month

**Total: ~$0.23/month** 🎉

Plus unlimited downloads with **$0 egress fees**!

## Troubleshooting

### "R2 not configured" warnings
- Check `.env` file exists in `Editor` directory
- Verify all R2 variables are set
- Restart dev server after changing `.env`

### "Access Denied" when saving
- Enable "Object Write" permission on R2 API token
- Check bucket name is correct: `lessonflarer2`

### Thumbnails not loading
- Check Supabase Storage bucket `LessonStorage` exists
- Verify public access is enabled on bucket
- Check browser console for errors

### JSON files not uploading
- Check R2 write permissions
- Verify file size (should work for any size with R2)
- Check browser console for detailed errors

## Summary

🎉 **Your Polotno Editor is ready!**

- ✅ R2 configured for large files (no egress fees)
- ✅ Supabase configured for thumbnails (free tier)
- ✅ Code updated to use optimal storage
- ✅ Ready to save and load designs

Just enable R2 write permissions and you're good to go!

For more details, see:
- `STORAGE_ARCHITECTURE.md` - Detailed architecture explanation
- `R2_SETUP.md` - R2 setup guide
- `R2_QUICK_SETUP.md` - Quick setup steps

