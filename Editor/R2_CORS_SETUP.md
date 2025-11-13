# R2 CORS Configuration Guide

## Problem

You're getting `NetworkError when attempting to fetch resource` when uploading to R2 from the browser. This is because R2 buckets need CORS (Cross-Origin Resource Sharing) configuration to allow browser requests.

## Solution: Configure CORS on Your R2 Bucket

### Step 1: Go to Cloudflare Dashboard

1. Visit: https://dash.cloudflare.com
2. Navigate to **R2** in the left sidebar
3. Click on your bucket: **`lessonflarer2`**

### Step 2: Configure CORS

1. Click on **Settings** tab
2. Scroll down to **CORS Policy** section
3. Click **Edit CORS Policy** or **Add CORS Policy**

### Step 3: Add CORS Configuration

Add this CORS configuration:

```json
[
  {
    "AllowedOrigins": [
      "*"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag",
      "x-amz-request-id"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

**For Production (More Secure):**

Replace `"*"` in `AllowedOrigins` with your specific domain(s):

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://yourdomain.com"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag",
      "x-amz-request-id"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

### Step 4: Save CORS Configuration

1. Click **Save** or **Update**
2. Wait a few seconds for changes to propagate

### Step 5: Test

1. Refresh your browser
2. Try uploading a file again
3. Check browser console - the NetworkError should be gone

## Alternative: Using Cloudflare Dashboard UI

If the JSON editor is not available, you can also:

1. Go to R2 → **lessonflarer2** bucket
2. Click **Settings** → **CORS Policy**
3. Use the UI form to add:
   - **Allowed Origins**: `*` (or your specific domains)
   - **Allowed Methods**: Select all (GET, PUT, POST, DELETE, HEAD)
   - **Allowed Headers**: `*`
   - **Max Age**: `3600`

## Troubleshooting

### Still Getting NetworkError?

1. **Check CORS is saved**: Go back to Settings → CORS Policy and verify it's there
2. **Wait a few minutes**: CORS changes can take a few minutes to propagate
3. **Clear browser cache**: Hard refresh (Ctrl+Shift+R)
4. **Check browser console**: Look for specific CORS error messages
5. **Verify bucket name**: Make sure it's exactly `lessonflarer2` (case-sensitive)

### CORS Error Messages

- `Access to fetch at ... has been blocked by CORS policy` → CORS not configured
- `NetworkError` → Could be CORS or network issue
- `403 Forbidden` → API token permissions issue (not CORS)

### Security Note

Using `"*"` in `AllowedOrigins` allows any website to access your bucket. For production:
- Use specific domains only
- Consider using presigned URLs for uploads
- Or use a backend proxy for uploads

## Next Steps

After configuring CORS:
1. ✅ CORS configured on `lessonflarer2` bucket
2. ✅ Refresh browser
3. ✅ Test upload again
4. ✅ Should work now!

If you still have issues after configuring CORS, the problem might be:
- API token permissions (need Object Write)
- Network/firewall blocking
- Browser security settings

