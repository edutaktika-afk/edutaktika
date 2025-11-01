# Supabase Usage Guide for Edutaktika Editor

## ✅ Configuration Complete!

Your Supabase integration is now configured with:
- **Project URL**: `https://liiwqyodlzivzzethyrj.supabase.co`
- **Bucket**: `LessonStorage` (public)
- **Subject Folders**: SCIENCE, ENGLISH, MATH

## Quick Usage Examples

### Save a Design to a Subject Folder

```javascript
import { saveDesignBySubject } from './supabase-api';

// Save a science lesson design
const result = await saveDesignBySubject({
  storeJSON: canvas.toJSON(),
  preview: blob,
  name: 'Solar System Lesson',
  subject: 'science',
  id: 'optional-id' // optional, will auto-generate if not provided
});

console.log('Saved!', result.id, result.subject);
```

### Load a Design from a Subject Folder

```javascript
import { loadByIdAndSubject } from './supabase-api';

// Load a math lesson design
const design = await loadByIdAndSubject({
  id: 'abc123',
  subject: 'math'
});

// Use the design
canvas.loadJSON(design.storeJSON);
```

### List All Designs in a Subject

```javascript
import { listDesignsBySubject } from './supabase-api';

// Get all science lessons
const scienceLessons = await listDesignsBySubject('science');

console.log('Science lessons:', scienceLessons);
// Output: [{ name: 'lesson1.json', id: 'lesson1', type: 'json' }, ...]
```

### Get Preview Image URL

```javascript
import { getPreviewBySubject } from './supabase-api';

// Get preview URL for an English lesson
const previewUrl = await getPreviewBySubject({
  id: 'abc123',
  subject: 'english'
});

// Use the URL
<img src={previewUrl} alt="Lesson Preview" />
```

### Delete a Design

```javascript
import { deleteDesignBySubject } from './supabase-api';

// Delete a science lesson
await deleteDesignBySubject({
  id: 'abc123',
  subject: 'science'
});
```

## Available Subject-Aware Functions

All subject-aware functions use lowercase subject names (`'science'`, `'english'`, `'math'`):

| Function | Description |
|----------|-------------|
| `saveDesignBySubject({ storeJSON, preview, name, subject, id })` | Save design to subject folder |
| `loadByIdAndSubject({ id, subject })` | Load design by ID and subject |
| `deleteDesignBySubject({ id, subject })` | Delete design from subject folder |
| `getPreviewBySubject({ id, subject })` | Get preview image URL |
| `listDesignsBySubject(subject)` | List all files in subject folder |

## Subject Mapping

The system automatically maps subject names to folder names:

```javascript
'science' → 'SCIENCE'
'english' → 'ENGLISH'
'math'    → 'MATH'
```

## Integration with Existing Editor

To use these functions in your editor, update your import in `src/project.js` or wherever you save designs:

```javascript
// In your editor component
import { saveDesignBySubject } from '../supabase-api';

// When saving a lesson
await saveDesignBySubject({
  storeJSON: store.toJSON(),
  preview: previewBlob,
  name: 'My Lesson',
  subject: 'science' // Get this from your UI/form
});
```

## Automatic Fallback

If Supabase fails for any reason, the system automatically falls back to local storage. You don't need to handle errors - it just works!

## Bucket Structure

Your Supabase storage is organized as:

```
LessonStorage/
├── SCIENCE/
│   ├── lesson1.json
│   ├── lesson1.jpg
│   ├── lesson2.json
│   └── lesson2.jpg
├── ENGLISH/
│   ├── lesson1.json
│   └── lesson1.jpg
└── MATH/
    ├── lesson1.json
    └── lesson1.jpg
```

## Testing

You can test the integration by running:

```bash
cd Editor
npm install
npm run dev
```

Then open your browser console and try:

```javascript
import { listDesignsBySubject } from './src/supabase-api';
listDesignsBySubject('science').then(console.log);
```

## Security

Your bucket is public, so anyone with the URL can access the files. For production:
- Consider using Supabase Auth
- Implement Row Level Security (RLS)
- Use signed URLs for sensitive content

## Need Help?

- Check `SUPABASE_SETUP.md` for detailed setup
- Visit https://supabase.com/docs for Supabase documentation
- Check browser console for error messages
