# Storage Architecture - R2 + Supabase Hybrid

## Overview

The Polotno Editor uses a hybrid storage approach that optimizes costs and performance:

- **Cloudflare R2**: Large files (JSON lessons, media) - **NO egress fees**, unlimited size
- **Supabase Storage**: Thumbnails/previews (small files) - free tier bandwidth sufficient
- **Supabase Database**: Metadata (design lists, references) - fast queries

## Why This Architecture?

### R2 for Large Files
- ✅ **No egress fees** - Download as much as you want, no charges
- ✅ **No size limits** - Store 10MB, 100MB, or even 1GB+ JSON files
- ✅ **Fast global CDN** - Files served from edge locations worldwide
- ✅ **S3-compatible API** - Easy integration

### Supabase for Thumbnails
- ✅ **Small files** - Thumbnails are typically 50-200KB
- ✅ **Free tier bandwidth** - 2GB/month is plenty for thumbnails
- ✅ **Frequently accessed** - Thumbnails loaded in lists/galleries
- ✅ **Reduces R2 operations** - Keeps R2 focused on large files

### Supabase Database for Metadata
- ✅ **Fast queries** - PostgreSQL is optimized for structured data
- ✅ **Design lists** - Quick retrieval of all designs
- ✅ **References** - Fast lookups for design relationships
- ✅ **Free tier sufficient** - Metadata is tiny (KB, not MB)

## File Storage Flow

### When Saving a Design:

1. **Thumbnail/Preview** (50-200KB)
   - → **Supabase Storage** (`LessonStorage` bucket)
   - Path: `SCIENCE/grade5/quarter1/design-id.jpg`

2. **Design JSON** (can be 10MB+)
   - → **R2 Storage** (`lessonflarer2` bucket)
   - Path: `SCIENCE/grade5/quarter1/design-id.json`
   - No size limits, no egress fees

3. **Extracted Media** (images, videos from design)
   - → **R2 Storage** (`lessonflarer2` bucket)
   - Path: `SCIENCE/grade5/quarter1/images/media-id.png`
   - Large files benefit from R2's no-egress policy

4. **Metadata** (design list, references)
   - → **Supabase Database** (`designs_metadata` table)
   - Key-value pairs for fast queries

### When Loading a Design:

1. **List Designs** (gallery view)
   - Query Supabase Database for design list
   - Load thumbnails from Supabase Storage
   - Fast, uses free tier bandwidth

2. **Load Full Design**
   - Load JSON from R2 (large file, no egress fees)
   - Load media files from R2 (no egress fees)
   - Display thumbnail from Supabase (already cached)

## Cost Optimization

### R2 Costs
- **Storage**: $0.015/GB/month
- **Class A Operations** (writes): $4.50 per million
- **Class B Operations** (reads): $0.36 per million
- **Egress**: **$0.00** (FREE!) 🎉

### Supabase Free Tier
- **Storage**: 1GB (enough for thousands of thumbnails)
- **Bandwidth**: 2GB/month (sufficient for thumbnail traffic)
- **Database**: 500MB (metadata is tiny)

### Example Monthly Costs

**Scenario**: 1000 designs, each with:
- 1 thumbnail (100KB) = 100MB in Supabase
- 1 JSON file (5MB average) = 5GB in R2
- 5 media files (2MB each) = 10GB in R2

**Total**:
- Supabase: ~100MB storage (well within free tier)
- R2: ~15GB storage = $0.23/month
- R2 operations: ~$0.01/month (minimal)
- **Total: ~$0.24/month** 🎉

## Benefits

1. **No Egress Fees** - Download lessons unlimited times
2. **No Size Limits** - Store large lesson files without worry
3. **Fast Thumbnails** - Small files load quickly from Supabase
4. **Cost Effective** - Optimized for free/low-cost tiers
5. **Scalable** - Can handle thousands of designs

## File Locations

### R2 Storage (`lessonflarer2` bucket)
```
SCIENCE/
  grade5/
    quarter1/
      design-123.json          ← Large JSON lesson file
      images/
        media-456.png         ← Extracted media
        media-789.jpg
ENGLISH/
  grade6/
    quarter2/
      design-456.json
```

### Supabase Storage (`LessonStorage` bucket)
```
SCIENCE/
  grade5/
    quarter1/
      design-123.jpg          ← Thumbnail/preview
ENGLISH/
  grade6/
    quarter2/
      design-456.jpg          ← Thumbnail/preview
```

### Supabase Database (`designs_metadata` table)
```json
{
  "key": "designs-list",
  "value": [
    { "id": "design-123", "name": "Science Lesson 1" },
    { "id": "design-456", "name": "English Lesson 2" }
  ]
}
```

## Configuration

### R2 Configuration (`.env`)
```env
VITE_R2_ACCOUNT_ID=87001b07874e84e7839c624361f60a3d
VITE_R2_ACCESS_KEY_ID=your_access_key_id
VITE_R2_SECRET_ACCESS_KEY=your_secret_access_key
VITE_R2_BUCKET_NAME=lessonflarer2
VITE_R2_PUBLIC_URL=https://pub-5debe0c02d2d436787b8bc5adc76b013.r2.dev
```

### Supabase Configuration (`.env`)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Summary

✅ **Large JSON lesson files** → R2 (no egress fees, unlimited size)  
✅ **Thumbnails/previews** → Supabase Storage (small files, free tier)  
✅ **Metadata** → Supabase Database (fast queries)  
✅ **Media files** → R2 (no egress fees)

This architecture gives you:
- Unlimited downloads (no egress fees)
- No size limits on lesson files
- Fast thumbnail loading
- Low monthly costs (~$0.25/month for 1000 designs)

🎉 Perfect for educational content with frequent access!

