# Cloudflare R2 Storage Setup Guide

This document explains how to set up and use Cloudflare R2 as the primary storage for files, while keeping Supabase for metadata management.

## Overview

The system now uses a hybrid approach:
- **Cloudflare R2**: Stores actual files (JSON designs, images, media files)
- **Supabase**: Stores metadata (thumbnails, references, design lists, key-value pairs)

This provides:
- **Cost-effective storage**: R2 has no egress fees
- **Scalability**: R2 can handle large files without size limits
- **Metadata management**: Supabase provides fast queries for design lists and references

## Prerequisites

1. A Cloudflare account (sign up at https://dash.cloudflare.com)
2. R2 enabled on your Cloudflare account
3. A Supabase project (for metadata storage)

## Setup Instructions

### Step 1: Create R2 Bucket

1. Go to your Cloudflare dashboard
2. Navigate to **R2** in the left sidebar
3. Click **Create bucket**
4. Enter a bucket name (e.g., `edutaktika-storage`)
5. Choose a location (optional, for performance)
6. Click **Create bucket**

### Step 2: Generate API Tokens

1. In the R2 section, click **Manage R2 API Tokens**
2. Click **Create API Token**
3. Set permissions:
   - **Object Read**: Allow
   - **Object Write**: Allow
   - **Object Delete**: Allow (optional, for cleanup)
4. Click **Create API Token**
5. **Save the credentials**:
   - Access Key ID
   - Secret Access Key
   - Account ID (found in the R2 dashboard URL or settings)

### Step 3: Configure Public Access (Optional)

R2 buckets are private by default. You have three options:

#### Option A: Public Bucket (Simplest)
1. Go to your bucket settings
2. Enable **Public Access**
3. Files will be accessible via: `https://pub-<account-id>.r2.dev/<bucket-name>/<file-path>`

#### Option B: Custom Domain (Recommended for Production)
1. Add a custom domain in R2 bucket settings
2. Configure DNS records as instructed
3. Files will be accessible via: `https://your-domain.com/<file-path>`

#### Option C: Presigned URLs (Most Secure)
- Files are private but can be accessed via temporary presigned URLs
- Requires additional code changes (not implemented by default)

### Step 4: Configure Environment Variables

Add these to your `.env` file in the Editor directory:

```env
# Cloudflare R2 Configuration
VITE_R2_ACCOUNT_ID=your_account_id_here
VITE_R2_ACCESS_KEY_ID=your_access_key_id_here
VITE_R2_SECRET_ACCESS_KEY=your_secret_access_key_here
VITE_R2_BUCKET_NAME=edutaktika-storage
VITE_R2_PUBLIC_URL=https://your-domain.com  # Optional: custom domain, or leave empty for default R2 URL

# Supabase Configuration (for metadata)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 5: Install Dependencies

The AWS SDK for S3 (R2-compatible) is already included in `package.json`:

```bash
npm install
```

## File Organization

Files are stored in R2 with the same structure as before:

```
edutaktika-storage/
├── SCIENCE/
│   ├── grade5/
│   │   ├── quarter1/
│   │   │   ├── design_123.json
│   │   │   ├── design_123.jpg
│   │   │   └── images/
│   │   │       └── img_123.png
│   │   └── quarter2/
│   └── grade6/
├── ENGLISH/
│   └── ...
├── MATH/
│   └── ...
└── uploads/
    └── design_id/
        └── media/
            └── media_123.png
```

## How It Works

### File Storage Flow

1. **Upload**: Files are uploaded to R2 Storage
2. **Metadata**: File references and thumbnails are stored in Supabase
3. **Retrieval**: 
   - Metadata is queried from Supabase
   - Files are downloaded from R2 using the stored paths

### Fallback Behavior

The system gracefully falls back if R2 is not configured:
1. **R2** (primary) → **Supabase Storage** (fallback) → **Local Storage** (last resort)

This ensures backward compatibility with existing setups.

## Migration from Supabase Storage

If you're migrating from Supabase Storage to R2:

1. **Export files from Supabase**:
   - Use Supabase dashboard to download files
   - Or use the Supabase CLI

2. **Upload to R2**:
   - Use the R2 dashboard
   - Or use a migration script

3. **Update metadata** (if needed):
   - Metadata in Supabase should remain unchanged
   - Only file paths might need updating if structure changed

## Troubleshooting

### "R2 not configured" warnings
- Check that all environment variables are set correctly
- Verify credentials are valid
- Ensure bucket name matches

### Files not accessible
- Check bucket public access settings
- Verify custom domain DNS configuration
- Check CORS settings if accessing from browser

### Upload failures
- Verify API token permissions
- Check file size limits (R2 has no hard limit, but check your plan)
- Review Cloudflare dashboard for errors

### Metadata issues
- Supabase should continue working as before
- Check Supabase connection and credentials

## Cost Considerations

### R2 Pricing
- **Storage**: $0.015 per GB/month
- **Class A Operations** (writes): $4.50 per million
- **Class B Operations** (reads): $0.36 per million
- **No egress fees** (unlike S3)

### Supabase Pricing
- Metadata storage is minimal (just references and thumbnails)
- Database queries are fast and cheap
- Free tier should be sufficient for metadata

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for all secrets
3. **Restrict API token permissions** to minimum required
4. **Enable bucket versioning** for important files
5. **Set up CORS** properly if accessing from web
6. **Use custom domains** with HTTPS in production

## Support

For issues related to:
- **R2**: Visit https://developers.cloudflare.com/r2/ or Cloudflare support
- **Integration**: Check the implementation in `Editor/src/r2-api.js`
- **Editor**: Refer to the main project documentation

## Files Modified

- `Editor/src/r2.js` - R2 client configuration
- `Editor/src/r2-api.js` - R2 API functions
- `Editor/src/supabase-api.js` - Updated to use R2 for files, Supabase for metadata
- `Editor/src/media-extractor.js` - Updated to upload media to R2
- `package.json` - Added `@aws-sdk/client-s3` dependency

