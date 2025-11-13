# Testing Checklist - R2 Integration & File Organization

## ✅ Changes Made

### 1. R2 Configuration
- ✅ R2 Account ID: `87001b07874e84e7839c624361f60a3d`
- ✅ Bucket Name: `lessonflarer2`
- ✅ Access Keys: Configured in `.env`
- ✅ Public URL: `https://pub-5debe0c02d2d436787b8bc5adc76b013.r2.dev`

### 2. File Organization
- ✅ Files organized by: `{SUBJECT}/{gradeLevel}/{quarter}/{id}.json`
- ✅ Thumbnails: `{SUBJECT}/{gradeLevel}/{quarter}/{id}.jpg`
- ✅ Media files: `{SUBJECT}/{gradeLevel}/{quarter}/{id}/media/{mediaId}.{ext}`

### 3. Code Updates
- ✅ Thumbnails go to Supabase Storage (small files)
- ✅ Large JSON files go to R2 (no egress fees)
- ✅ Media files go to R2 with subject/grade structure
- ✅ Fixed `getPreview` to handle non-Blob values
- ✅ Editor starts with blank canvas (no auto-load)

## 🧪 Testing Steps

### Test 1: R2 Connection
```bash
cd Editor
node test-r2-connection.js
```
**Expected**: Should connect and list files successfully

### Test 2: CORS Configuration
1. Go to Cloudflare Dashboard → R2 → `lessonflarer2` bucket
2. Settings → CORS Policy
3. Verify CORS is configured (see `R2_CORS_SETUP.md`)

### Test 3: Save a Design
1. Open Polotno Editor in browser
2. Create a new design
3. Add some content (text, images, etc.)
4. Click Save
5. Select Subject (Science/English/Math)
6. Select Quarter
7. Enter design name
8. Click Save

**Check Console For:**
- `📸 Uploading thumbnail to Supabase...`
- `✅ Thumbnail saved to Supabase`
- `📤 Uploading to R2: path="SCIENCE/grade5/quarter1/..."`
- `✅ Upload successful to R2`

**Check R2 Bucket:**
- Should see: `SCIENCE/grade5/quarter1/{designId}.json`
- Should see: `SCIENCE/grade5/quarter1/{designId}/media/` (if media extracted)

**Check Supabase Storage:**
- Should see: `SCIENCE/grade5/quarter1/{designId}.jpg` (thumbnail)

### Test 4: Load a Design
1. Open "My Designs" sidebar
2. Click on a saved design
3. Design should load correctly
4. Preview images should display

**Check Console:**
- No `TypeError: URL.createObjectURL` errors
- Preview images load from Supabase

### Test 5: File Organization
1. Go to R2 Dashboard → `lessonflarer2` bucket
2. Verify structure:
   ```
   SCIENCE/
     grade5/
       quarter1/
         design-123.json
         design-123.jpg
         design-123/
           media/
             media-456.png
   ```

### Test 6: Blank Canvas on Startup
1. Close browser
2. Reopen Polotno Editor
3. Should start with blank canvas
4. "My Designs" should still show all saved designs

## ⚠️ Known Issues to Check

1. **CORS**: Must be configured on R2 bucket (see `R2_CORS_SETUP.md`)
2. **R2 Write Permissions**: API token needs "Object Write" permission
3. **Grade Level**: Must be set in Firebase or sessionStorage for proper organization

## 📝 Test Results

- [ ] R2 connection test passed
- [ ] CORS configured
- [ ] Design save works
- [ ] Design load works
- [ ] File organization correct
- [ ] Blank canvas on startup
- [ ] No console errors

## 🐛 If Tests Fail

1. **NetworkError**: Check CORS configuration
2. **Access Denied**: Check R2 API token permissions
3. **Preview errors**: Check Supabase Storage bucket exists
4. **File not found**: Check grade level is set correctly

