# Fix Supabase Storage RLS Policies

## Problem
Error: "new row violates row-level security policy"

This happens when your storage bucket has Row Level Security enabled but doesn't have policies that allow uploads.

## Solution

Go to your Supabase Dashboard → Storage → Policies tab for the `LessonStorage` bucket.

### Option 1: Allow Public Uploads (Recommended for educational projects)

Run this SQL in your Supabase SQL Editor:

```sql
-- Allow anyone to upload files (public write access)
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'LessonStorage');

-- Allow anyone to update files
CREATE POLICY "Allow public updates"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'LessonStorage');

-- Allow anyone to delete files
CREATE POLICY "Allow public deletes"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'LessonStorage');

-- Allow anyone to select/read files (this should already exist if bucket is public)
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'LessonStorage');
```

### Option 2: Use Supabase Dashboard (Easier)

1. Go to **Storage** in your Supabase dashboard
2. Click on **LessonStorage** bucket
3. Go to **Policies** tab
4. Click **New Policy**
5. Add policies for:

**Policy 1: Public Read**
- Policy name: `Allow public reads`
- Allowed operation: `SELECT`
- Target roles: `public`
- USING expression: `bucket_id = 'LessonStorage'`

**Policy 2: Public Insert**
- Policy name: `Allow public inserts`
- Allowed operation: `INSERT`
- Target roles: `public`
- WITH CHECK expression: `bucket_id = 'LessonStorage'`

**Policy 3: Public Update**
- Policy name: `Allow public updates`
- Allowed operation: `UPDATE`
- Target roles: `public`
- USING expression: `bucket_id = 'LessonStorage'`

**Policy 4: Public Delete**
- Policy name: `Allow public deletes`
- Allowed operation: `DELETE`
- Target roles: `public`
- USING expression: `bucket_id = 'LessonStorage'`

### Verify

After adding the policies, try saving a design again. You should now see in the console:
- "Upload successful" instead of errors
- Files appearing in the SCIENCE/ENGLISH/MATH folders in Supabase

## Security Note

These policies make your bucket completely public (anyone can upload, read, update, delete). For production:
- Consider using Supabase Auth and user-specific policies
- Or restrict uploads to authenticated users only
- Add file size limits
- Add file type validation

## Quick Test

After applying the policies, run this in your browser console while testing:

```javascript
// Should return your files
const { data, error } = await supabase.storage.from('LessonStorage').list('SCIENCE');
console.log('Science files:', data, error);
```

