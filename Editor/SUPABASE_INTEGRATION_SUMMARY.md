# Supabase Integration Summary

## Overview
Supabase has been integrated as a cloud storage solution for lesson designs, working alongside Firebase. Designs are organized by subject folders in Supabase Storage.

## Setup

### 1. Supabase Configuration
- **URL**: `https://liiwqyodlzivzzethyrj.supabase.co`
- **Bucket**: `LessonStorage` (public)
- **Folders**: `SCIENCE`, `ENGLISH`, `MATH`

### 2. Files Modified

#### Editor (React/Polotno)
- `src/supabase.js` - Supabase client initialization
- `src/supabase-api.js` - API functions for Supabase operations
- `src/topbar/supabase-save-button.jsx` - Save button with quarter selection
- `src/topbar/topbar.jsx` - Added Supabase save button
- `src/App.jsx` - Added `loadSupabaseDesign` function to load Supabase designs

#### Subject Pages (Teacher)
- `Teacher/subject_math.html`
- `Teacher/subject_english.html`
- `Teacher/subject_science.html`
- Added combined loader: `loadAllDesignsForQuarter()` - loads both Firebase and Supabase designs

#### Loader Script
- `assets/js/loadSupabaseDesigns.js` - Loads and displays Supabase designs

## Features

### Save Button
- **Location**: Editor topbar (next to Firebase save button)
- **Features**:
  - Subject dropdown (Science, English, Math)
  - Quarter dropdown (1-4)
  - Design name input
  - Connection status indicator
  - Auto-generates design name from content

### Loading System
- **Combined Loader**: Loads both Firebase and Supabase designs together
- **Filtering**: Filters by subject and quarter automatically
- **Display**: Shows all designs in a unified gallery with source labels
- **Permissions**: Teachers can edit, students can view only

### File Organization
Files are saved to Supabase Storage with this structure:
```
LessonStorage/
  ├── MATH/
  │   ├── {id}.jpg (preview)
  │   └── {id}.json (design data)
  ├── ENGLISH/
  │   ├── {id}.jpg
  │   └── {id}.json
  └── SCIENCE/
      ├── {id}.jpg
      └── {id}.json
```

### Metadata Storage
Design metadata (name, subject, quarter) is stored in:
- Supabase Database table: `designs_metadata`
- Key: `designs-list`
- Value: Array of design objects with `{id, name, subject, quarter}`

## Usage

### Saving a Design
1. Open the Editor
2. Create or edit your lesson design
3. Click "Save to Supabase" button
4. Select:
   - Design name
   - Subject (Math, English, or Science)
   - Quarter (1, 2, 3, or 4)
5. Click "Save"

### Viewing Designs
1. Navigate to Teacher subject page (e.g., `subject_math.html`)
2. Select a Quarter tab
3. All designs (Firebase + Supabase) will be displayed
4. Click "View Design" to see
5. Click "Edit Design" to edit (teachers only)

## Console Logging
Debug logs have been added to help diagnose issues:
- Saving: Shows subject, folder mapping, and upload paths
- Loading: Shows loaded designs, counts, and any errors

## Troubleshooting

### Files Not Saving to Correct Folder
Check console logs for:
- `Subject: "{subject}" → Folder: "{folder}"` - confirms mapping
- `Upload paths: preview="{path}", design="{path}"` - shows actual paths

### Designs Not Loading
1. Check browser console for errors
2. Verify Supabase connection (green indicator on save button)
3. Check that folder names in Supabase match exactly (all caps)
4. Ensure `designs_metadata` table exists in Supabase Database

### Editor Opens but Content Not Loading
1. Check console for download errors
2. Verify Supabase RLS policies allow public read access
3. Check file paths match exactly (case-sensitive)

## Next Steps
1. Test the save functionality
2. Check console logs to verify file paths
3. Verify files appear in correct Supabase folders
4. Test loading designs in subject pages
5. Test editing and re-saving

