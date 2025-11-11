/**
 * Polotno JSON Upload Helper for Supabase
 * 
 * This script optimizes Polotno JSON files by:
 * - Detecting and uploading embedded base64 images to Supabase Storage
 * - Replacing base64 data with Supabase public URLs
 * - Minifying the JSON
 * - Splitting large files (>50MB) into multiple parts
 * 
 * Usage:
 *   const { uploadPolotno } = require('./uploadPolotno.js');
 *   await uploadPolotno('path/to/file.json');
 * 
 * Or in browser:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="./uploadPolotno.js"></script>
 *   await uploadPolotno(jsonObject, 'design-name');
 */

// ============================================================================
// CONFIGURATION - EDIT THESE VALUES
// ============================================================================
const SUPABASE_URL = 'https://liiwqyodlzivzzethyrj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpaXdxeW9kbHppdnp6ZXRoeXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDY0MTYsImV4cCI6MjA3NzU4MjQxNn0.5sPzjw-DLvZ5bA7NlRF5YdunBD-nOsQ0GC8ALz03sFE';
const STORAGE_BUCKET = 'LessonStorage'; // Default bucket name

// ============================================================================
// DEPENDENCIES
// ============================================================================

// Check if we're in Node.js environment
const isNode = typeof require !== 'undefined' && typeof window === 'undefined';

let supabase;
let fs;
let path;

if (isNode) {
  // Node.js environment
  const { createClient } = require('@supabase/supabase-js');
  fs = require('fs').promises;
  path = require('path');
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
  // Browser environment - expects supabase to be loaded globally
  if (typeof supabase === 'undefined' || typeof supabase.createClient === 'undefined') {
    console.error('Supabase SDK not loaded. Please include: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
  } else {
    supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a string is a base64 data URI
 */
function isBase64DataUri(str) {
  if (typeof str !== 'string') return false;
  return /^data:([a-zA-Z][a-zA-Z0-9]*\/[a-zA-Z0-9][a-zA-Z0-9]*);base64,/.test(str);
}

/**
 * Extract MIME type from data URI
 */
function getMimeTypeFromDataUri(dataUri) {
  const match = dataUri.match(/^data:([a-zA-Z][a-zA-Z0-9]*\/[a-zA-Z0-9][a-zA-Z0-9]*);base64,/);
  return match ? match[1] : 'image/png';
}

/**
 * Convert base64 data URI to Buffer/Uint8Array
 */
function base64ToBuffer(dataUri) {
  const base64String = dataUri.split(',')[1];
  if (isNode) {
    return Buffer.from(base64String, 'base64');
  } else {
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
}

/**
 * Generate a unique filename for uploaded image
 */
function generateImageFilename(mimeType, index = 0) {
  const ext = mimeType.split('/')[1] || 'png';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `img_${timestamp}_${random}_${index}.${ext}`;
}

/**
 * Recursively find all base64 data URIs in an object
 */
function findBase64Images(obj, path = '', images = []) {
  if (obj === null || obj === undefined) return images;

  if (typeof obj === 'string') {
    if (isBase64DataUri(obj)) {
      images.push({ path, value: obj });
    }
    return images;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      findBase64Images(item, `${path}[${index}]`, images);
    });
    return images;
  }

  if (typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      const newPath = path ? `${path}.${key}` : key;
      findBase64Images(obj[key], newPath, images);
    });
    return images;
  }

  return images;
}

/**
 * Replace a value at a specific path in an object
 */
function setValueAtPath(obj, path, newValue) {
  const keys = path.split('.');
  let current = obj;

  // Handle array indices like "pages[0].children[1].src"
  const processedKeys = [];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const arrayMatch = key.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      processedKeys.push({ type: 'object', key: arrayMatch[1] });
      processedKeys.push({ type: 'array', index: parseInt(arrayMatch[2]) });
    } else {
      processedKeys.push({ type: 'object', key });
    }
  }

  // Navigate to the parent of the target
  for (let i = 0; i < processedKeys.length - 1; i++) {
    const item = processedKeys[i];
    if (item.type === 'object') {
      current = current[item.key];
    } else if (item.type === 'array') {
      current = current[item.index];
    }
  }

  // Set the final value
  const last = processedKeys[processedKeys.length - 1];
  if (last.type === 'object') {
    current[last.key] = newValue;
  } else if (last.type === 'array') {
    current[last.index] = newValue;
  }
}

/**
 * Minify JSON by removing unnecessary whitespace
 */
function minifyJson(jsonString) {
  try {
    const obj = JSON.parse(jsonString);
    return JSON.stringify(obj);
  } catch (error) {
    console.warn('⚠️  Could not minify JSON, using original:', error.message);
    return jsonString;
  }
}

/**
 * Calculate size of a string in bytes
 */
function getStringSize(str) {
  return new Blob([str]).size || Buffer.byteLength(str, 'utf8');
}

/**
 * Split JSON into smaller chunks if it exceeds the size limit
 */
function splitJson(jsonString, maxSizeBytes = 50 * 1024 * 1024) {
  const size = getStringSize(jsonString);
  
  if (size <= maxSizeBytes) {
    return [jsonString];
  }

  console.log(`📦 JSON size (${(size / 1024 / 1024).toFixed(2)} MB) exceeds limit (${(maxSizeBytes / 1024 / 1024).toFixed(2)} MB), splitting...`);
  
  try {
    const obj = JSON.parse(jsonString);
    const parts = [];
    
    // If it's a Polotno design, try to split by pages
    if (obj.pages && Array.isArray(obj.pages)) {
      const pagesPerPart = Math.ceil(obj.pages.length / Math.ceil(size / maxSizeBytes));
      let currentPart = { ...obj, pages: [] };
      let currentSize = getStringSize(JSON.stringify(currentPart));
      
      for (let i = 0; i < obj.pages.length; i++) {
        const page = obj.pages[i];
        const pageSize = getStringSize(JSON.stringify(page));
        
        if (currentSize + pageSize > maxSizeBytes && currentPart.pages.length > 0) {
          parts.push(JSON.stringify(currentPart));
          currentPart = { ...obj, pages: [] };
          currentSize = getStringSize(JSON.stringify(currentPart));
        }
        
        currentPart.pages.push(page);
        currentSize += pageSize;
      }
      
      if (currentPart.pages.length > 0) {
        parts.push(JSON.stringify(currentPart));
      }
    } else {
      // Generic splitting - just divide the object
      const keys = Object.keys(obj);
      const keysPerPart = Math.ceil(keys.length / Math.ceil(size / maxSizeBytes));
      
      for (let i = 0; i < keys.length; i += keysPerPart) {
        const partKeys = keys.slice(i, i + keysPerPart);
        const part = {};
        partKeys.forEach(key => {
          part[key] = obj[key];
        });
        parts.push(JSON.stringify(part));
      }
    }
    
    console.log(`✅ Split into ${parts.length} parts`);
    return parts;
  } catch (error) {
    console.error('❌ Error splitting JSON:', error);
    // Fallback: return as single part (will fail upload but at least we tried)
    return [jsonString];
  }
}

// ============================================================================
// MAIN UPLOAD FUNCTION
// ============================================================================

/**
 * Upload a Polotno JSON file to Supabase Storage
 * 
 * @param {string|Object} filePathOrJson - Path to JSON file (Node.js) or JSON object (browser)
 * @param {Object} options - Optional configuration
 * @param {string} options.designName - Name for the design (used in file path)
 * @param {string} options.subject - Subject folder (MATH, SCIENCE, ENGLISH)
 * @param {string} options.quarter - Quarter folder (quarter1, quarter2, etc.)
 * @param {string} options.gradeLevel - Grade level folder (grade5, grade6, etc.)
 * @param {string} options.customPath - Custom storage path (overrides subject/quarter/grade)
 * @returns {Promise<Object>} Upload result with URLs and metadata
 */
async function uploadPolotno(filePathOrJson, options = {}) {
  const {
    designName = 'design',
    subject = '',
    quarter = '',
    gradeLevel = '',
    customPath = ''
  } = options;

  console.log('🚀 Starting Polotno JSON upload...');
  console.log(`📁 Design: ${designName}`);

  // Validate configuration
  if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes('YOUR_SUPABASE') || SUPABASE_KEY.includes('YOUR_SUPABASE')) {
    throw new Error('❌ Please configure SUPABASE_URL and SUPABASE_KEY at the top of uploadPolotno.js');
  }

  // Load JSON
  let jsonData;
  let originalJsonString;

  if (isNode && typeof filePathOrJson === 'string') {
    // Node.js: Read from file
    console.log(`📖 Reading file: ${filePathOrJson}`);
    originalJsonString = await fs.readFile(filePathOrJson, 'utf8');
    jsonData = JSON.parse(originalJsonString);
  } else if (typeof filePathOrJson === 'object') {
    // Browser: Use provided object
    console.log('📖 Using provided JSON object');
    jsonData = filePathOrJson;
    originalJsonString = JSON.stringify(jsonData);
  } else {
    throw new Error('Invalid input: expected file path (Node.js) or JSON object (browser)');
  }

  // Step 1: Find all base64 images
  console.log('🔍 Optimizing JSON: Finding embedded base64 images...');
  const base64Images = findBase64Images(jsonData);
  console.log(`   Found ${base64Images.length} embedded image(s)`);

  // Step 2: Upload images to Supabase Storage
  const imageReplacements = {};
  if (base64Images.length > 0) {
    console.log('📤 Uploading images to Supabase Storage...');
    
    // Build storage path for images
    let imageStoragePath = 'images';
    if (customPath) {
      imageStoragePath = customPath;
    } else if (subject) {
      const subjectFolder = subject.toUpperCase();
      imageStoragePath = subjectFolder;
      if (gradeLevel) {
        imageStoragePath += `/${gradeLevel}`;
      }
      if (quarter) {
        imageStoragePath += `/${quarter}`;
      }
      imageStoragePath += '/images';
    }

    for (let i = 0; i < base64Images.length; i++) {
      const image = base64Images[i];
      const mimeType = getMimeTypeFromDataUri(image.value);
      const filename = generateImageFilename(mimeType, i);
      const storagePath = `${imageStoragePath}/${filename}`;

      console.log(`   Uploading image ${i + 1}/${base64Images.length}: ${filename} (${mimeType})`);

      try {
        const imageBuffer = base64ToBuffer(image.value);
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(storagePath, imageBuffer, {
            contentType: mimeType,
            upsert: true
          });

        if (error) {
          console.error(`   ❌ Error uploading image ${i + 1}:`, error.message);
          throw error;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(storagePath);

        const publicUrl = urlData.publicUrl;
        imageReplacements[image.path] = publicUrl;
        console.log(`   ✅ Uploaded: ${publicUrl}`);
      } catch (error) {
        console.error(`   ❌ Failed to upload image ${i + 1}:`, error);
        throw error;
      }
    }
  }

  // Step 3: Replace base64 with Supabase URLs
  if (Object.keys(imageReplacements).length > 0) {
    console.log('🔄 Replacing base64 images with Supabase URLs...');
    Object.keys(imageReplacements).forEach(path => {
      setValueAtPath(jsonData, path, imageReplacements[path]);
      console.log(`   Replaced: ${path}`);
    });
  }

  // Step 4: Minify JSON
  console.log('🗜️  Minifying JSON...');
  let optimizedJson = JSON.stringify(jsonData);
  optimizedJson = minifyJson(optimizedJson);
  const optimizedSize = getStringSize(optimizedJson);
  const originalSize = getStringSize(originalJsonString);
  const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
  console.log(`   Original: ${(originalSize / 1024).toFixed(2)} KB`);
  console.log(`   Optimized: ${(optimizedSize / 1024).toFixed(2)} KB (${savings}% reduction)`);

  // Step 5: Split if necessary
  const maxSizeBytes = 50 * 1024 * 1024; // 50 MB
  const parts = splitJson(optimizedJson, maxSizeBytes);
  console.log(`📦 Prepared ${parts.length} part(s) for upload`);

  // Step 6: Upload JSON parts to Supabase Storage
  console.log('📤 Uploading JSON to Supabase Storage...');
  
  // Build storage path for JSON
  let jsonStoragePath = '';
  if (customPath) {
    jsonStoragePath = customPath;
  } else if (subject) {
    const subjectFolder = subject.toUpperCase();
    jsonStoragePath = subjectFolder;
    if (gradeLevel) {
      jsonStoragePath += `/${gradeLevel}`;
    }
    if (quarter) {
      jsonStoragePath += `/${quarter}`;
    }
  }

  const uploadResults = [];
  const designId = designName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const partFilename = parts.length > 1 ? `${designId}_part${i + 1}.json` : `${designId}.json`;
    const partPath = jsonStoragePath ? `${jsonStoragePath}/${partFilename}` : partFilename;

    console.log(`   Uploading design part ${i + 1}/${parts.length}: ${partFilename}`);

    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(partPath, part, {
          contentType: 'application/json',
          upsert: true
        });

      if (error) {
        console.error(`   ❌ Error uploading part ${i + 1}:`, error.message);
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(partPath);

      const publicUrl = urlData.publicUrl;
      uploadResults.push({
        part: i + 1,
        filename: partFilename,
        path: partPath,
        url: publicUrl,
        size: getStringSize(part)
      });

      console.log(`   ✅ Uploaded design part ${i + 1}: ${publicUrl}`);
    } catch (error) {
      console.error(`   ❌ Failed to upload part ${i + 1}:`, error);
      throw error;
    }
  }

  // Step 7: Summary
  console.log('✅ Upload complete!');
  console.log('📊 Summary:');
  console.log(`   - Images uploaded: ${base64Images.length}`);
  console.log(`   - JSON parts uploaded: ${parts.length}`);
  console.log(`   - Total size: ${(optimizedSize / 1024 / 1024).toFixed(2)} MB`);

  return {
    success: true,
    designId,
    designName,
    imagesUploaded: base64Images.length,
    imageReplacements,
    parts: uploadResults,
    totalSize: optimizedSize,
    originalSize,
    savings: `${savings}%`
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

if (isNode) {
  // Node.js: CommonJS export
  module.exports = { uploadPolotno };
} else {
  // Browser: Global export
  window.uploadPolotno = uploadPolotno;
}

