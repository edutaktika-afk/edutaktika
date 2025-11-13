# Testing Guide for Polotno Upload/Load System

This guide shows you how to test the `uploadPolotno.js` and `loadPolotnoDesign.js` functions.

## 📋 Prerequisites

1. **Configure Supabase credentials** in both files:
   - Open `uploadPolotno.js` and set:
     - `SUPABASE_URL` - Your Supabase project URL
     - `SUPABASE_KEY` - Your Supabase anon key
     - `STORAGE_BUCKET` - Your bucket name (default: 'LessonStorage')
   
   - Open `loadPolotnoDesign.js` and set the same values

2. **Install dependencies** (for Node.js testing):
   ```bash
   npm install @supabase/supabase-js
   ```

## 🧪 Testing Methods

### Method 1: Node.js Test Script (Recommended)

This is the most comprehensive test that verifies the complete workflow.

**Steps:**

1. Open terminal in your project root
2. Run:
   ```bash
   node test-polotno-upload-load.js
   ```

**What it does:**
- ✅ Creates a test Polotno JSON with embedded base64 images
- ✅ Uploads it to Supabase
- ✅ Waits 2 seconds for processing
- ✅ Loads it back from Supabase
- ✅ Verifies data integrity (pages, dimensions, images)
- ✅ Shows detailed results

**Expected output:**
```
🧪 Starting Polotno Upload/Load Test
============================================================
📝 Creating test Polotno JSON file...
✅ Created test file: test-polotno-design.json

📤 STEP 1: Testing uploadPolotno...
🚀 Starting Polotno JSON upload...
🔍 Optimizing JSON: Finding embedded base64 images...
📤 Uploading images to Supabase Storage...
✅ Uploaded: https://...
📥 STEP 2: Testing loadPolotnoDesign...
✅ Design loaded successfully!
🎉 ALL TESTS PASSED! ✅
```

### Method 2: Browser Test (Interactive)

This provides a visual interface for testing.

**Steps:**

1. Make sure you have a local web server running (required for loading JS modules)
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Or using Node.js http-server
   npx http-server -p 8000
   ```

2. Open your browser and go to:
   ```
   http://localhost:8000/test-polotno-browser.html
   ```

3. Click the buttons to test:
   - **Test Upload** - Upload a test design
   - **Test Load** - Load a design by ID
   - **Run Full Test** - Complete upload + load workflow

**Features:**
- ✅ Visual interface with logs
- ✅ Easy to test individual functions
- ✅ Shows real-time progress
- ✅ Copy design IDs easily

### Method 3: Manual Testing in Your Code

You can also test directly in your own JavaScript files:

```javascript
// In Node.js
const { uploadPolotno } = require('./uploadPolotno.js');
const { loadPolotnoDesign } = require('./loadPolotnoDesign.js');

async function test() {
  // Upload
  const result = await uploadPolotno('./path/to/your/design.json', {
    designName: 'My Test Design',
    subject: 'SCIENCE',
    quarter: 'quarter1'
  });
  
  console.log('Uploaded! Design ID:', result.designId);
  
  // Load
  const design = await loadPolotnoDesign(result.designId, {
    subject: 'SCIENCE',
    quarter: 'quarter1'
  });
  
  console.log('Loaded! Pages:', design.pages.length);
}

test();
```

## 🔍 What to Check

When testing, verify:

1. **Upload works:**
   - ✅ Images are detected and uploaded
   - ✅ Base64 images are replaced with Supabase URLs
   - ✅ JSON is minified
   - ✅ Files appear in Supabase Storage

2. **Load works:**
   - ✅ Design files are found
   - ✅ All parts are downloaded
   - ✅ Pages/slides are merged correctly
   - ✅ Complete design is returned

3. **Data integrity:**
   - ✅ Page count matches
   - ✅ Dimensions match
   - ✅ Images are URLs (not base64)
   - ✅ All content is preserved

## ⚠️ Common Issues

### "Please configure SUPABASE_URL and SUPABASE_KEY"
- **Solution:** Edit the configuration at the top of both `uploadPolotno.js` and `loadPolotnoDesign.js`

### "No design files found"
- **Solution:** Check that:
  - The design ID is correct
  - The search path (subject/quarter) matches where you uploaded
  - Files exist in Supabase Storage dashboard

### "Supabase SDK not loaded" (Browser)
- **Solution:** Make sure you include the Supabase SDK script before loading the functions:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  ```

### Upload fails with permission error
- **Solution:** Check your Supabase Storage bucket policies allow uploads

## 📊 Expected Test Results

A successful test should show:

```
✅ Upload successful!
   - Images uploaded: 2
   - JSON parts uploaded: 1
   - Total size: ~X KB

✅ Load successful!
   - Parts found: 1
   - Total pages/slides: 2
   - Design dimensions: 1920x1080

🎉 ALL TESTS PASSED! ✅
```

## 🚀 Next Steps

Once testing passes:

1. Use `uploadPolotno()` in your editor to save designs
2. Use `loadPolotnoDesign()` to load designs for viewing/editing
3. Integrate with your existing Polotno editor workflow

## 💡 Tips

- **Test with small files first** - Make sure everything works before uploading large designs
- **Check Supabase Storage dashboard** - Verify files are actually uploaded
- **Use unique design names** - Avoid conflicts when testing multiple times
- **Monitor console logs** - They provide detailed information about each step

---

Happy testing! 🎉
