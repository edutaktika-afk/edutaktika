# Supabase Table Setup Guide

## Issue
The `designs_metadata` table doesn't exist in your Supabase database, causing errors when trying to save/load design metadata.

## Solution
The code now handles the missing table gracefully - it will work without the table by listing files directly. However, creating the table will improve performance.

## Create the Table (Optional but Recommended)

### Step 1: Go to Supabase SQL Editor
1. Open your Supabase dashboard
2. Go to **SQL Editor**
3. Click **New Query**

### Step 2: Run This SQL

```sql
-- Create the designs_metadata table
CREATE TABLE IF NOT EXISTS designs_metadata (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE designs_metadata ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can read)
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

-- Authenticated users can delete
CREATE POLICY "Authenticated users can delete"
ON designs_metadata FOR DELETE
TO authenticated
USING (true);
```

### Step 3: Run the Query
Click **Run** to execute the SQL.

## What This Table Does

The `designs_metadata` table stores:
- **Key**: `designs-list` - List of all saved designs
- **Value**: JSON array of design objects with `{id, name, subject, quarter}`

This allows the system to:
- Quickly list all designs without scanning storage
- Track design metadata separately from files
- Improve loading performance

## Without the Table

The system will still work! It will:
- List files directly from storage (slower but works)
- Skip metadata operations gracefully
- Show warnings in console but continue functioning

## Verification

After creating the table:
1. Save a design in the Editor
2. Check browser console - should see "✅ Metadata saved" instead of warnings
3. Loading should be faster

## Troubleshooting

### Still Getting Errors?
1. Make sure you ran the SQL in the correct Supabase project
2. Check that RLS policies are enabled
3. Verify the table exists: Go to **Table Editor** → Look for `designs_metadata`

### Table Created But Still Errors?
1. Check RLS policies are correct
2. Verify your Supabase API key has proper permissions
3. Check browser console for specific error codes

