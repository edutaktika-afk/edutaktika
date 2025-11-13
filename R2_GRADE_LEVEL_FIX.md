# R2 Grade Level Loading Fix

## Issue
Grade 5 lessons were opening on Grade 6 (and vice versa) because the loading code was falling back to paths without grade level when grade-specific paths didn't exist.

## Root Cause
The lesson loading functions had fallback mechanisms that would try non-grade-specific paths even when a grade level was provided:

1. **`assets/js/loadSupabaseDesigns.js`**: Would fall back to `${subjectFolder}/${quarterFolder}` and `${subjectFolder}` even when `gradeLevel` was provided
2. **`Editor/src/App.jsx`**: Would fall back to non-grade paths when loading designs

This meant:
- Grade 6 teacher's lessons might not exist in `ENGLISH/grade6/quarter1/`
- System would fall back to `ENGLISH/quarter1/` (no grade)
- That path might contain Grade 5 lessons
- Result: Wrong grade's lessons loaded

## Fix Applied

### 1. Fixed `loadSupabaseDesigns.js`
- **Before**: Tried grade paths, then fell back to non-grade paths
- **After**: Only uses grade-specific paths when `gradeLevel` is provided
- **Paths tried** (when grade provided):
  - `${subjectFolder}/${gradeLevel}/${quarterFolder}` (primary)
  - `${subjectFolder}/${gradeLevel}` (fallback - all quarters)
- **No fallback** to paths without grade level

### 2. Fixed `Editor/src/App.jsx`
- **Before**: Tried grade paths, then fell back to non-grade paths
- **After**: Only uses grade-specific paths when `gradeLevel` is provided
- **Paths tried** (when grade provided):
  - `${subjectFolder}/${gradeLevel}/${quarterFolder}/${designId}.json`
  - `${subjectFolder}/${gradeLevel}/${designId}.json`
- **No fallback** to paths without grade level

## Benefits
1. ✅ **Grade Isolation**: Each grade's lessons are completely isolated
2. ✅ **No Cross-Grade Loading**: Grade 5 lessons won't load for Grade 6 teachers
3. ✅ **Clear Error Messages**: Shows specific message when grade-specific lessons aren't found
4. ✅ **Better Logging**: Console logs show which grade-specific paths are being tried

## Testing Checklist
- [ ] Grade 5 teacher only sees Grade 5 lessons
- [ ] Grade 6 teacher only sees Grade 6 lessons
- [ ] Lessons load correctly from R2/Supabase
- [ ] Error message shows if no lessons found for specific grade
- [ ] Console logs show grade-specific paths being used

## File Structure (Expected)
```
R2 Bucket: lessonflarer2
├── ENGLISH/
│   ├── grade5/
│   │   ├── quarter1/
│   │   │   ├── design1.json
│   │   │   └── design1.jpg
│   │   └── quarter2/
│   └── grade6/
│       ├── quarter1/
│       │   ├── design1.json
│       │   └── design1.jpg
│       └── quarter2/
├── MATH/
│   ├── grade5/
│   └── grade6/
└── SCIENCE/
    ├── grade5/
    └── grade6/
```

## Notes
- Old lessons saved without grade level may not be accessible if grade level is required
- Teachers should ensure their `gradelevel` is set correctly in Firebase
- Grade level is normalized: "5" → "grade5", "grade5" → "grade5"

