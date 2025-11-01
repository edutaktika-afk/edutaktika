# Supabase Integration Setup Guide

This document explains how to set up and use Supabase as an alternative to Firebase for saving designs in the Edutaktika Editor.

## Overview

The Supabase integration provides the same functionality as the Firebase/Puter implementation but uses Supabase for cloud storage. It includes automatic fallback to local storage when Supabase is not configured or when the user is not authenticated.

## Files Created

1. **`src/supabase.js`** - Supabase client initialization and configuration
2. **`src/supabase-api.js`** - API functions mirroring Firebase functionality but using Supabase
3. **`SUPABASE_SETUP.md`** - This documentation file

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created
3. Supabase Storage configured
4. Supabase Database configured (for metadata storage)

## Setup Instructions

### Step 1: Create Storage Buckets

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Create two buckets:
   - **`designs`** - For storing design JSON files and preview images
   - **`uploads`** - For storing user-uploaded assets

4. Set bucket policies to your needs:
   ```sql
   -- Public read access for designs bucket
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'designs');

   -- Authenticated users can insert
   CREATE POLICY "Authenticated users can upload"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'designs');
   
   -- Users can update their own files
   CREATE POLICY "Users can update own files"
   ON storage.objects FOR UPDATE
   TO authenticated
   USING (bucket_id = 'designs');

   -- Users can delete their own files
   CREATE POLICY "Users can delete own files"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'designs');
   ```

### Step 2: Create Database Table

Create a table for storing key-value metadata (like design lists):

1. Go to **Table Editor** in Supabase dashboard
2. Create a new table called `designs_metadata`:
   ```sql
   CREATE TABLE designs_metadata (
     id BIGSERIAL PRIMARY KEY,
     key TEXT UNIQUE NOT NULL,
     value JSONB NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. Set up RLS policies:
   ```sql
   -- Enable RLS
   ALTER TABLE designs_metadata ENABLE ROW LEVEL SECURITY;

   -- Public read access
   CREATE POLICY "Public read access"
   ON designs_metadata FOR SELECT
   TO public
   USING (true);

   -- Authenticated users can insert
   CREATE POLICY "Authenticated users can insert"
   ON designs_metadata FOR INSERT
   TO authenticated
   WITH CHECK (true);

   -- Authenticated users can update
   CREATE POLICY "Authenticated users can update"
   ON designs_metadata FOR UPDATE
   TO authenticated
   USING (true);
   ```

### Step 3: Configure Environment Variables

1. Get your Supabase credentials:
   - Go to **Project Settings** > **API**
   - Copy your **Project URL**
   - Copy your **anon public** key

2. Create a `.env` file in the `Editor` directory:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Important**: Add `.env` to `.gitignore` to keep your keys secure:
   ```
   # Environment variables
   .env
   .env.local
   .env.production
   ```

### Step 4: Install Dependencies

Run the following command in the `Editor` directory:

```bash
npm install
```

This will install the `@supabase/supabase-js` and `nanoid` dependencies.

## Usage

### Importing the API

To use the Supabase API instead of the default API, import from `supabase-api.js`:

```javascript
// Instead of:
import { saveDesign, loadById, listDesigns } from './api';

// Use:
import { saveDesign, loadById, listDesigns } from './supabase-api';
```

### Available Functions

All functions from the original `api.js` are available in `supabase-api.js`:

- `saveDesign({ storeJSON, preview, name, id })` - Save a design
- `loadById({ id })` - Load a design by ID
- `listDesigns()` - List all designs
- `deleteDesign({ id })` - Delete a design
- `getPreview({ id })` - Get preview URL
- `listAssets()` - List all assets
- `getAssetSrc({ id })` - Get asset source URL
- `getAssetPreviewSrc({ id })` - Get asset preview URL
- `uploadAsset({ file, preview, type })` - Upload an asset
- `deleteAsset({ id })` - Delete an asset
- `backupFromLocalToCloud()` - Backup local designs to Supabase

### Example Usage

```javascript
import { saveDesign } from './supabase-api';

// Save a design
const result = await saveDesign({
  storeJSON: canvas.toJSON(),
  preview: blob,
  name: 'My Design',
  id: 'optional-design-id'
});

console.log('Saved with ID:', result.id);
```

## Authentication (Optional)

To enable Supabase authentication:

1. Go to **Authentication** in Supabase dashboard
2. Set up your preferred authentication methods
3. Update the `isSignedIn()` function in `src/supabase.js`:

```javascript
const isSignedIn = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session !== null;
};
```

4. Initialize authentication in your app:

```javascript
import { supabase } from './supabase';

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Sign out
await supabase.auth.signOut();
```

## Fallback Behavior

The Supabase integration includes automatic fallback to local storage when:
- Supabase credentials are not configured
- User is not authenticated (if you enable auth)
- API calls fail

This ensures the editor continues to work even without Supabase configured.

## Differences from Firebase Implementation

1. **Storage**: Uses Supabase Storage instead of Firebase Storage
2. **Metadata**: Uses PostgreSQL table instead of Firebase Realtime Database
3. **Authentication**: Uses Supabase Auth (configurable)
4. **Fallback**: Automatic fallback to local storage

## Troubleshooting

### "Failed to upload to Supabase, falling back to local storage"
- Check that your Supabase credentials are correct
- Verify storage buckets exist and have proper policies
- Check browser console for detailed error messages

### "Supabase read KV error"
- Ensure the `designs_metadata` table exists
- Verify RLS policies allow public read access
- Check that the table schema matches expectations

### Images not loading
- Verify storage bucket policies allow public read access
- Check that files are uploaded with correct content types
- Ensure bucket names match the constants in `supabase.js`

## Security Considerations

1. **Anon Key**: The anon key is safe to expose in client-side code, but has limited permissions based on your RLS policies
2. **RLS Policies**: Always set up Row Level Security policies to protect your data
3. **Storage Policies**: Configure storage bucket policies to restrict access as needed
4. **Environment Variables**: Never commit `.env` files to version control

## Cost Considerations

Supabase offers a free tier with:
- 500 MB database space
- 1 GB file storage
- 2 GB bandwidth

For production use, consider upgrading to a paid plan based on your needs.

## Support

For issues related to:
- **Supabase**: Visit https://supabase.com/docs or join their Discord
- **Integration**: Check the implementation in `src/supabase-api.js`
- **Editor**: Refer to the main project documentation

## Migration from Firebase

To migrate existing Firebase data to Supabase:

1. Export data from Firebase Storage
2. Use the Supabase dashboard to import files
3. Export Firebase Realtime Database metadata
4. Import into Supabase PostgreSQL table
5. Update your code to use `supabase-api.js` instead of `api.js`

For large migrations, consider writing a migration script.
