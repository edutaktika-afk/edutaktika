# How Editing and Saving Works

## Overview
Yes, **editing and saving DOES update the actual JSON files and designs in Supabase Storage**. Here's how the complete flow works:

## Step-by-Step Flow

### 1. **Clicking "Edit Design" Button**
- When you click the purple "Edit Design" button on a lesson card:
  - The system calls `openDesignEditor(designId, subject, designName, quarter)`
  - It fetches the JSON file from Supabase Storage using the design ID
  - Opens the Polotno editor in a new window with the design loaded
  - Stores the design ID in `sessionStorage` so the editor knows it's editing an existing design

### 2. **Loading the Design in Editor**
- The editor receives the design ID via URL parameters
- It fetches the JSON file from Supabase: `GradeLevel/Subject/Quarter/designId.json`
- The design is loaded into the Polotno editor canvas
- You can now make changes to slides, add content, modify text, etc.

### 3. **Saving Changes**
- When you click "Upload to Cloud" button in the editor:
  - The save function checks if there's an existing design ID:
    ```javascript
    const existingDesignId = project?.id || sessionStorage.getItem('supabase-design-id');
    const isEditing = !!existingDesignId;
    ```
  - If `isEditing` is true, it uses the **same ID** to save
  - This means it will **overwrite** the existing files

### 4. **What Gets Updated**
When saving an edited design, the system:

1. **Overwrites the JSON file**:
   - Path: `GradeLevel/Subject/Quarter/designId.json`
   - Contains all the design data (slides, objects, text, images, etc.)
   - Uses the **same filename** as the original, so it overwrites

2. **Overwrites the thumbnail**:
   - Path: `GradeLevel/Subject/Quarter/designId.jpg`
   - Generates a new preview image from the first slide
   - Replaces the old thumbnail

3. **Updates metadata**:
   - Updates `design-ids.json` in the folder with the new name (if changed)
   - Updates global metadata if available
   - Updates the design name in the metadata list

### 5. **The Save Function**
The `saveDesignBySubject` function in `Editor/src/supabase-api.js`:

```javascript
// If ID is provided (editing existing design), it uses that ID
if (!id) {
  // Only generates new ID if creating new design
  id = sanitizeFilename(name);
}

// Uses the same path structure, so it overwrites existing files
previewPath = `${normalizedGradeLevel}/${subjectFolder}/${quarterFolder}/${id}.jpg`;
storePath = `${normalizedGradeLevel}/${subjectFolder}/${quarterFolder}/${id}.json`;

// Writes files (overwrites if they exist)
await writeThumbnailToSupabase(previewPath, preview);
await writeFile(storePath, designJSON);
```

### 6. **File Overwriting**
The `writeFile` function uses Supabase Storage's `upload` method with `upsert: true`:

```javascript
await supabase.storage
  .from(BUCKET_LESSON_STORAGE)
  .upload(filePath, fileBlob, {
    contentType: 'application/json',
    upsert: true  // This means: create if new, update if exists
  });
```

The `upsert: true` option means:
- If the file doesn't exist → Creates a new file
- If the file exists → **Overwrites/updates** the existing file

## Important Notes

✅ **Yes, it really updates**: When you edit and save, the original JSON file and thumbnail are **replaced** with the new versions.

✅ **Same ID = Same File**: Because the same design ID is used, it saves to the exact same path, overwriting the original.

✅ **Immediate Effect**: After saving, if you refresh the subject page, you'll see the updated design with the new thumbnail and content.

✅ **Name Changes**: If you change the design name in the editor, it updates the metadata but keeps the same file ID (unless you create a new design).

## Example Flow

1. **Original Design**:
   - ID: `t_OsA5q94m`
   - File: `Grade5/MATH/Quarter3/t_OsA5q94m.json`
   - Name: "Number Patterns"

2. **Edit in Editor**:
   - Add new slide
   - Change text on slide 2
   - Modify colors

3. **Save**:
   - Uses same ID: `t_OsA5q94m`
   - Overwrites: `Grade5/MATH/Quarter3/t_OsA5q94m.json`
   - Overwrites: `Grade5/MATH/Quarter3/t_OsA5q94m.jpg`
   - Updates metadata with new name (if changed)

4. **Result**:
   - The original file is **replaced** with the new version
   - All changes are saved permanently
   - The design ID stays the same (so it appears in the same place)

## Verification

To verify it's working:
1. Edit a design and make a visible change (e.g., change text color)
2. Save it
3. Close the editor
4. Refresh the subject page
5. Click "View Design" on the same lesson
6. You should see your changes!

The system is designed to **update in place** when editing, not create duplicates.

