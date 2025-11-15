# How to Rename Lessons

## Quick Guide

You can rename any lesson (including old lessons created before the naming update) directly from the subject pages.

## Steps to Rename a Lesson

### 1. Navigate to Subject Page
- Go to **Teacher** → **Subjects** → Select your subject (Math, English, or Science)
- Select the **Quarter** where your lesson is located

### 2. Find the Lesson Card
- Look for the lesson card you want to rename
- Old lessons may show IDs like `t_OsA5q94m` instead of proper names

### 3. Click the "Rename" Button
- On each lesson card, you'll see three buttons:
  - **View** (blue) - View the lesson
  - **Edit** (orange) - Edit the lesson
  - **Rename** (purple) - Rename the lesson ⭐
- Click the purple **"Rename"** button

### 4. Enter New Name
- A prompt dialog will appear showing:
  - Current name (or ID if it's an old lesson)
  - Input field with the current name pre-filled
- Type your new lesson name
- Click **OK** to save or **Cancel** to abort

### 5. Wait for Confirmation
- You'll see a success message: `✅ Lesson renamed successfully!`
- The page will automatically refresh after 1 second
- The lesson will now show with the new name

## Example

**Before:**
- Lesson shows as: `t_OsA5q94m`

**After clicking Rename:**
- Prompt shows: "Rename lesson: Current name: t_OsA5q94m"
- You type: "Number Patterns and Sequence"
- Click OK
- Page refreshes
- Lesson now shows as: "Number Patterns and Sequence"

## Important Notes

- ✅ **Only teachers can rename** - Students don't see the Rename button
- ✅ **Works for all lessons** - Both old and new lessons can be renamed
- ✅ **Updates everywhere** - The name is updated in both `design-ids.json` and global metadata
- ✅ **No file changes** - Only the name/metadata is updated, the actual lesson file stays the same
- ✅ **Automatic refresh** - Page refreshes automatically to show the new name

## Troubleshooting

### Rename Button Not Showing
- Make sure you're logged in as a **Teacher** (not Student)
- Check that you're on a Teacher subject page (e.g., `Teacher/subject_english.html`)

### Error When Renaming
- Check browser console for error messages
- Make sure you have internet connection (needs Supabase access)
- Try refreshing the page and trying again

### Name Doesn't Update After Rename
- The page should auto-refresh after 1 second
- If it doesn't, manually refresh the page (F5 or Ctrl+R)
- Check browser console for any errors

## Alternative: Rename When Editing

You can also rename a lesson when editing it:

1. Click **Edit** button on the lesson card
2. In the Editor, click **"Upload to Cloud"** button
3. Change the **Design Name** in the dialog
4. Click **"Upload to Cloud"** to save
5. The lesson will be saved with the new name

This method also works and updates the name in the same way.

