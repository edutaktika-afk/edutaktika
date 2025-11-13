# Cloudflare R2 Configuration - Your Setup

This document contains your specific Cloudflare R2 configuration details.

## Your R2 Configuration

### Account Details
- **Account ID**: `87001b07874e84e7839c624361f60a3d`
- **Bucket Name**: `lessonflarer2`
- **S3 API Endpoint**: `https://87001b07874e84e7839c624361f60a3d.r2.cloudflarestorage.com`
- **Public Development URL**: `https://pub-5debe0c02d2d436787b8bc5adc76b013.r2.dev`

### Environment Variables Required

Add these to your `.env` file in the `Editor` directory:

```env
VITE_R2_ACCOUNT_ID=87001b07874e84e7839c624361f60a3d
VITE_R2_ACCESS_KEY_ID=your_access_key_id_here
VITE_R2_SECRET_ACCESS_KEY=your_secret_access_key_here
VITE_R2_BUCKET_NAME=lessonflarer2
VITE_R2_PUBLIC_URL=https://pub-5debe0c02d2d436787b8bc5adc76b013.r2.dev
```

### Getting Your Access Keys

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **R2** → **Manage R2 API Tokens**
3. Click **Create API Token**
4. Set permissions:
   - **Object Read**: Allow
   - **Object Write**: Allow
   - **Object Delete**: Allow (optional)
5. Copy the **Access Key ID** and **Secret Access Key**
6. Add them to your `.env` file

### File Access URLs

Files stored in R2 will be accessible via:
```
https://pub-5debe0c02d2d436787b8bc5adc76b013.r2.dev/lessonflarer2/<file-path>
```

For example:
- `https://pub-5debe0c02d2d436787b8bc5adc76b013.r2.dev/lessonflarer2/SCIENCE/grade5/quarter1/design.json`

### Testing Your Configuration

Once you've added your access keys to `.env`:

1. Restart your development server
2. Try uploading a design file
3. Check the browser console for R2 upload messages
4. Verify files appear in your R2 bucket dashboard

### Troubleshooting

**"R2 not configured" warnings:**
- Verify all environment variables are set in `.env`
- Make sure `.env` is in the `Editor` directory
- Restart your dev server after changing `.env`

**Files not accessible:**
- Check that public access is enabled on your R2 bucket
- Verify the public URL matches: `https://pub-5debe0c02d2d436787b8bc5adc76b013.r2.dev`
- Check CORS settings if accessing from browser

**Upload failures:**
- Verify API token permissions include Object Write
- Check that the bucket name is correct: `lessonflarer2`
- Review Cloudflare dashboard for errors

