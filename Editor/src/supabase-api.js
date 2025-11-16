import { nanoid } from 'nanoid';
import { storage } from './storage';
import { supabase, BUCKET_DESIGNS, BUCKET_ASSETS, shouldUseSupabase, BUCKET_LESSON_STORAGE, getSubjectFolder } from './supabase';
import { uploadFileInChunks, needsChunkedUpload, getFileSizeString } from './chunked-upload';

/**
 * Supabase Storage API Implementation
 * 
 * This file provides the same interface as api.js but uses Supabase Storage exclusively.
 * 
 * Architecture:
 * - All files (JSON lessons, images, media, thumbnails) → Supabase Storage
 * - Metadata (design lists, references) → Supabase Database (fast queries)
 * 
 * Setup Required:
 * 1. Supabase Project:
 *    - Create a Supabase project at https://supabase.com
 *    - Create 'LessonStorage' bucket in Storage
 *    - Create 'designs_metadata' table for key-value storage (optional)
 *    - Add environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
 * 
 * Note: Supabase Pro supports files up to 500GB. Free tier supports up to 50MB per file.
 */

/**
 * Ensure folder path exists in Supabase Storage
 * In Supabase, folders are created implicitly, but we verify the path exists
 * @param {string} folderPath - Path to check (e.g., "ENGLISH/grade5/quarter1")
 * @param {string} bucket - Bucket name (defaults to BUCKET_LESSON_STORAGE)
 * @returns {Promise<boolean>} - True if path exists or was created, false on error
 */
const ensureFolderExists = async function ensureFolderExists(folderPath, bucket = BUCKET_LESSON_STORAGE) {
  if (!shouldUseSupabase() || !folderPath) {
    return true; // Skip check if not using Supabase or no path
  }

  try {
    // Remove trailing slash if present
    const cleanPath = folderPath.replace(/\/$/, '');
    
    // Check if path exists by listing it
    // If the path exists (even if empty), list() will succeed
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(cleanPath, {
        limit: 1,
        offset: 0
      });

    if (error) {
      // If error is "not found" or similar, the folder doesn't exist
      // In Supabase, folders are created automatically when you upload a file
      // So we just log and continue - the upload will create the folder structure
      if (error.message && error.message.includes('not found')) {
        console.log(`📁 Folder path "${cleanPath}" doesn't exist yet - will be created on first file upload`);
        return false;
      }
      // Other errors might mean the path structure needs to be created
      console.warn(`⚠️ Could not verify folder path "${cleanPath}":`, error.message);
      return false;
    }

    // Path exists (list succeeded)
    console.log(`✅ Folder path "${cleanPath}" exists`);
    return true;
  } catch (error) {
    console.warn(`⚠️ Error checking folder path "${folderPath}":`, error);
    // Don't throw - we'll try to upload anyway (which will create the folder)
    return false;
  }
};

/**
 * Save thumbnail/preview directly to Supabase Storage
 * Thumbnails are small files, so Supabase free tier is sufficient
 */
const writeThumbnailToSupabase = async function writeThumbnailToSupabase(fileName, data) {
  if (!shouldUseSupabase()) {
    console.warn('⚠️ Supabase not configured, cannot save thumbnail');
    return await storage.setItem(fileName, data);
  }

  try {
    const pathParts = fileName.split('/');
    const bucketToUse = fileName.includes('SCIENCE/') || fileName.includes('ENGLISH/') || fileName.includes('MATH/') 
      ? BUCKET_LESSON_STORAGE 
      : BUCKET_DESIGNS;
    
    if (pathParts.length > 1) {
      const folderPath = pathParts.slice(0, -1).join('/');
      await ensureFolderExists(folderPath, bucketToUse);
    }

    const fileData = data instanceof Blob ? data : new Blob([data], { type: 'image/jpeg' });
    const fileSize = fileData.size;

    console.log(`📸 Uploading thumbnail to Supabase: bucket="${bucketToUse}", path="${fileName}", size=${getFileSizeString(fileSize)}`);

    const { data: uploadData, error } = await supabase.storage
      .from(bucketToUse)
      .upload(fileName, fileData, {
        contentType: 'image/jpeg',
        upsert: true, // Overwrite if exists
      });

    if (error) {
      console.error('Supabase thumbnail upload error:', error);
      throw error;
    }

    console.log(`✅ Thumbnail saved to Supabase: ${fileName}`);
    return uploadData;
  } catch (error) {
    console.error('Failed to upload thumbnail to Supabase, falling back to local storage:', error);
    await storage.setItem(fileName, data);
    throw error;
  }
};

/**
 * Save file to Supabase Storage or local storage
 * All files (JSON lessons, media, thumbnails) go to Supabase Storage
 * Thumbnails can use writeThumbnailToSupabase() for direct upload
 */
const writeFile = async function writeFile(fileName, data, onProgress = null) {
  // Check if this is a thumbnail/preview - send directly to Supabase
  if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.includes('preview')) {
    // Thumbnails go to Supabase Storage (small files, free tier is fine)
    try {
      return await writeThumbnailToSupabase(fileName, data);
    } catch (error) {
      console.error('Failed to upload thumbnail to Supabase:', error);
      throw error;
    }
  }

  // Upload all files to Supabase Storage
  if (shouldUseSupabase()) {
    try {
      // Extract folder path from filename (everything except the filename)
      const pathParts = fileName.split('/');
      const bucketToUse = fileName.includes('SCIENCE/') || fileName.includes('ENGLISH/') || fileName.includes('MATH/') 
        ? BUCKET_LESSON_STORAGE 
        : BUCKET_DESIGNS;
      
      if (pathParts.length > 1) {
        const folderPath = pathParts.slice(0, -1).join('/');
        // Check if folder exists before uploading
        await ensureFolderExists(folderPath, bucketToUse);
      }

      // Convert data to Blob if needed
      // Detect content type from file name or data
      let contentType = 'application/octet-stream';
      if (data instanceof Blob) {
        contentType = data.type || 'application/octet-stream';
      } else if (typeof data === 'string') {
        // Check if it's JSON by trying to parse it
        try {
          JSON.parse(data);
          contentType = 'application/json';
        } catch (e) {
          contentType = 'text/plain';
        }
      } else {
        // For other types, try to detect from file name
        if (fileName.endsWith('.json')) {
          contentType = 'application/json';
        } else if (fileName.endsWith('.txt')) {
          contentType = 'text/plain';
        }
      }
      
      const fileData = data instanceof Blob ? data : new Blob([data], { type: contentType });
      const fileSize = fileData.size;

      console.log(`📤 Uploading to Supabase (fallback): bucket="${bucketToUse}", path="${fileName}", size=${getFileSizeString(fileSize)}`);

      // Check if file is large and needs special handling
      if (needsChunkedUpload(fileSize)) {
        console.log(`⚠️ Large file detected (${getFileSizeString(fileSize)}), using chunked upload...`);
        try {
          const uploadData = await uploadFileInChunks(fileName, fileData, onProgress);
          console.log(`✅ Chunked upload successful:`, uploadData);
          return uploadData;
        } catch (error) {
          // If chunked upload fails, check if it's a size limit error
          if (error.message && (error.message.includes('VIDEO_TOO_LARGE') || error.message.includes('50MB'))) {
            // Re-throw with user-friendly message
            throw new Error(
              `File is too large: ${getFileSizeString(fileSize)}. ` +
              `Supabase free tier limits uploads to 50MB. ` +
              `Please compress the file or upgrade to Supabase Pro (supports up to 500GB). ` +
              `For videos, use HandBrake, FFmpeg, or an online video compressor.`
            );
          }
          throw error;
        }
      }

      // For smaller files, upload directly
      const { data: uploadData, error } = await supabase.storage
        .from(bucketToUse)
        .upload(fileName, fileData, {
          upsert: true,
          contentType: contentType
        });

      if (error) {
        // Check if it's a size limit error
        if (error.message && (error.message.includes('size') || error.message.includes('limit') || error.message.includes('50'))) {
          // File might be slightly over limit, try chunked upload
          if (fileSize > 45 * 1024 * 1024) { // If over 45MB, try chunked
            console.log(`⚠️ Direct upload failed, trying chunked upload...`);
            try {
              const uploadData = await uploadFileInChunks(fileName, fileData, onProgress);
              console.log(`✅ Chunked upload successful:`, uploadData);
              return uploadData;
            } catch (chunkError) {
              throw new Error(
                `File is too large: ${getFileSizeString(fileSize)}. ` +
                `Supabase free tier limits uploads to 50MB. ` +
                `Please compress the file or upgrade to Supabase Pro.`
              );
            }
          }
        }
        console.error('Supabase upload error:', error);
        throw error;
      }

      if (onProgress) {
        onProgress(100);
      }

      console.log(`✅ Upload successful:`, uploadData);
      return uploadData;
    } catch (error) {
      console.error('Failed to upload to Supabase, falling back to local storage:', error);
      // Only fall back to local storage if it's not a size limit error
      if (error.message && (error.message.includes('too large') || error.message.includes('50MB'))) {
        // Re-throw size limit errors - don't fall back to local storage
        throw error;
      }
      // Fall back to local storage for other errors
      await storage.setItem(fileName, data);
    }
  } else {
    await storage.setItem(fileName, data);
  }
};

/**
 * Read file from Supabase Storage or local storage
 */
const readFile = async function readFile(fileName) {
  // Read from Supabase Storage
  if (shouldUseSupabase()) {
    try {
      // Determine the correct bucket based on file path
      const bucketToUse = fileName.includes('SCIENCE/') || fileName.includes('ENGLISH/') || fileName.includes('MATH/') 
        ? BUCKET_LESSON_STORAGE 
        : BUCKET_DESIGNS;
      
      // Download from Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketToUse)
        .download(fileName);

      if (error) {
        console.error('Supabase download error:', error);
        // Fall back to local storage
        return await storage.getItem(fileName);
      }

      return data;
    } catch (error) {
      console.error('Failed to download from Supabase, falling back to local storage:', error);
      return await storage.getItem(fileName);
    }
  }
  return await storage.getItem(fileName);
};

/**
 * Delete file from Supabase Storage or local storage
 */
const deleteFile = async function deleteFile(fileName) {
  // Delete from Supabase Storage
  if (shouldUseSupabase()) {
    try {
      // Determine the correct bucket based on file path
      const bucketToUse = fileName.includes('SCIENCE/') || fileName.includes('ENGLISH/') || fileName.includes('MATH/') 
        ? BUCKET_LESSON_STORAGE 
        : BUCKET_DESIGNS;
      
      const { error } = await supabase.storage
        .from(bucketToUse)
        .remove([fileName]);

      if (error) {
        console.error('Supabase delete error:', error);
        // Fall back to local storage
        await storage.removeItem(fileName);
      }
    } catch (error) {
      console.error('Failed to delete from Supabase, falling back to local storage:', error);
      await storage.removeItem(fileName);
    }
  } else {
    return await storage.removeItem(fileName);
  }
};

/**
 * Read key-value pair from Supabase or local storage
 */
const readKv = async function readKv(key) {
  if (shouldUseSupabase()) {
    // For Supabase, we'll store KV pairs in the database
    // This requires setting up a 'designs_metadata' table
    try {
      const { data, error } = await supabase
        .from('designs_metadata')
        .select('value')
        .eq('key', key)
        .maybeSingle(); // Use maybeSingle to avoid errors when not found

      if (error) {
        // PGRST116 = not found (expected if key doesn't exist)
        // PGRST205 = table doesn't exist (table not created yet)
        if (error.code === 'PGRST116') {
          return null; // Key doesn't exist - expected
        } else if (error.code === 'PGRST205') {
          console.log('⚠️ designs_metadata table not found - will use file listing instead');
          return null; // Table doesn't exist - system will list files directly
        }
        console.warn('Supabase read KV error:', error);
        return await storage.getItem(key);
      }

      return data?.value;
    } catch (error) {
      console.warn('Failed to read from Supabase, falling back to local storage:', error);
      return await storage.getItem(key);
    }
  } else {
    return await storage.getItem(key);
  }
};

/**
 * Write key-value pair to Supabase or local storage
 */
const writeKv = async function writeKv(key, value) {
  if (shouldUseSupabase()) {
    try {
      const { error } = await supabase
        .from('designs_metadata')
        .upsert({ key, value }, { onConflict: 'key' });

      if (error) {
        // PGRST205 = table doesn't exist (table not created yet)
        if (error.code === 'PGRST205') {
          console.log('⚠️ designs_metadata table not found - metadata will not be saved.');
          console.log('💡 The system will work without it by listing files directly.');
          console.log('💡 To create the table, see SUPABASE_TABLE_SETUP.md');
          // Silently fail - system will work without metadata table
          return;
        }
        console.warn('Supabase write KV error:', error);
        return await storage.setItem(key, value);
      }
    } catch (error) {
      console.warn('Failed to write to Supabase, falling back to local storage:', error);
      return await storage.setItem(key, value);
    }
  } else {
    return await storage.setItem(key, value);
  }
};

/**
 * Back up local designs to Supabase
 */
export async function backupFromLocalToCloud() {
  const localDesigns = (await storage.getItem('designs-list')) || [];
  for (const design of localDesigns) {
    const storeJSON = await storage.getItem(`designs/${design.id}.json`);
    const preview = await storage.getItem(`designs/${design.id}.jpg`);
    await writeFile(`designs/${design.id}.json`, storeJSON);
    await writeFile(`designs/${design.id}.jpg`, preview);
  }
  const cloudDesigns = (await readKv('designs-list')) || [];
  cloudDesigns.push(...localDesigns);
  await writeKv('designs-list', cloudDesigns);
  await storage.removeItem('designs-list');
  for (const design of localDesigns) {
    await storage.removeItem(`designs/${design.id}.json`);
    await storage.removeItem(`designs/${design.id}.jpg`);
  }
  return cloudDesigns.length;
}

/**
 * List all designs
 */
export async function listDesigns() {
  return (await readKv('designs-list')) || [];
}

/**
 * Delete a design
 */
export async function deleteDesign({ id }) {
  const list = await listDesigns();
  const newList = list.filter((design) => design.id !== id);
  await writeKv('designs-list', newList);
  await deleteFile(`designs/${id}.json`);
  await deleteFile(`designs/${id}.jpg`);
}

/**
 * Load a design by ID
 */
export async function loadById({ id }) {
  let storeJSON = await readFile(`designs/${id}.json`);
  const list = await listDesigns();
  const design = list.find((design) => design.id === id);
  
  // if it is blob, convert to JSON
  if (storeJSON instanceof Blob) {
    storeJSON = JSON.parse(await storeJSON.text());
  } else if (typeof storeJSON === 'string') {
    storeJSON = JSON.parse(storeJSON);
  }

  return { storeJSON, name: design?.name };
}

/**
 * Save a design (main function)
 */
export async function saveDesign({ storeJSON, preview, name, id }) {
  console.log('saving to Supabase');
  
  // Use sanitized design name as ID if no ID provided
  if (!id) {
    if (name) {
      id = sanitizeFilename(name);
      console.log(`📝 Using sanitized design name as ID: "${id}" (from "${name}")`);
    } else {
      id = nanoid(10);
      console.log(`⚠️ No design name provided, using random ID: "${id}"`);
    }
  }

  const previewPath = `designs/${id}.jpg`;
  const storePath = `designs/${id}.json`;

  // Thumbnails go directly to Supabase Storage (small files, free tier bandwidth)
  await writeThumbnailToSupabase(previewPath, preview);
  console.log('✅ Preview/thumbnail saved to Supabase Storage');
  
  // Keep the JSON file intact as one piece (no media extraction)
  // This preserves the original Polotno design structure with all embedded base64 data
  const designJSON = JSON.stringify(storeJSON);
  const finalSize = new Blob([designJSON], { type: 'application/json' }).size;
  const finalSizeMB = (finalSize / 1024 / 1024).toFixed(2);
  
  console.log(`📊 Design JSON size: ${finalSizeMB}MB (self-contained with all embedded data)`);
  
  if (finalSize > 45 * 1024 * 1024) {
    console.log(`📊 Design JSON is large (${finalSizeMB}MB) - no worries, paid Supabase plan has no size limits!`);
  }
  
  await writeFile(storePath, designJSON);
  console.log(`✅ Design saved to Supabase: ${storePath} (${finalSizeMB}MB, self-contained)`);

  let list = await listDesigns();
  const existing = list.find((design) => design.id === id);
  if (existing) {
    existing.name = name;
  } else {
    list.push({ id, name });
  }

  await writeKv('designs-list', list);
  return { id, status: 'saved' };
}

/**
 * Get preview URL
 * Thumbnails are stored in Supabase Storage (small files, free tier)
 */
export const getPreview = async ({ id }) => {
  const previewPath = `designs/${id}.jpg`;
  
  // Thumbnails are stored in Supabase Storage
  if (shouldUseSupabase()) {
    try {
      const { data } = supabase.storage
        .from(BUCKET_DESIGNS)
        .getPublicUrl(previewPath);
      if (data && data.publicUrl) {
        return data.publicUrl;
      }
    } catch (error) {
      console.warn('Failed to get preview from Supabase:', error);
    }
  }
  
  // Fallback to local storage blob URL
  try {
    const preview = await readFile(previewPath);
    
    // If preview is already a URL string, return it
    if (typeof preview === 'string') {
      if (preview.startsWith('data:') || preview.startsWith('http://') || preview.startsWith('https://')) {
        return preview;
      }
      return null;
    }
    
    // If preview is a Blob, create object URL
    if (preview instanceof Blob) {
      return URL.createObjectURL(preview);
    }
    
    // If preview is null/undefined, return null
    if (!preview) {
      console.warn(`Preview not found: ${previewPath}`);
      return null;
    }
    
    console.warn(`Unexpected preview type: ${typeof preview}`);
    return null;
  } catch (error) {
    console.error('Failed to load preview from any source:', error);
    return null;
  }
};

/**
 * List all assets
 */
export const listAssets = async () => {
  const list = (await readKv('assets-list')) || [];
  for (const asset of list) {
    asset.src = await getAssetSrc({ id: asset.id });
    asset.preview = await getAssetPreviewSrc({ id: asset.id });
  }
  return list;
};

/**
 * Get asset source URL
 * Uses Supabase Storage or local blob URL
 */
export const getAssetSrc = async ({ id }) => {
  const assetPath = `uploads/${id}`;
  
  // Get from Supabase Storage
  if (shouldUseSupabase()) {
    try {
      const { data } = supabase.storage
        .from(BUCKET_ASSETS)
        .getPublicUrl(id);
      return data.publicUrl;
    } catch (error) {
      // Fall through to blob URL
    }
  }
  
  // Fallback to blob URL
  const file = await readFile(assetPath);
  return URL.createObjectURL(file);
};

/**
 * Get asset preview URL
 * Uses Supabase Storage or local blob URL
 */
export const getAssetPreviewSrc = async ({ id }) => {
  const previewPath = `uploads/${id}-preview`;
  
  // Get from Supabase Storage
  if (shouldUseSupabase()) {
    try {
      const { data } = supabase.storage
        .from(BUCKET_ASSETS)
        .getPublicUrl(`${id}-preview`);
      return data.publicUrl;
    } catch (error) {
      // Fall through to blob URL
    }
  }
  
  // Fallback to blob URL
  const file = await readFile(previewPath);
  return URL.createObjectURL(file);
};

/**
 * Upload an asset
 * @param {Object} params - Upload parameters
 * @param {Blob} params.file - The file to upload
 * @param {Blob} params.preview - Preview image/blob
 * @param {string} params.type - File type (image, video, etc.)
 * @param {Function} params.onProgress - Optional progress callback
 */
export const uploadAsset = async ({ file, preview, type, onProgress = null }) => {
  const list = await listAssets();
  const id = nanoid(10);
  
  try {
    // Check file size and warn user if large
    const fileSize = file.size;
    const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);
    
    if (fileSize > 50 * 1024 * 1024) {
      console.warn(`⚠️ Large file detected: ${fileSizeMB}MB - will be compressed automatically`);
    }
    
    // Upload main file with progress tracking
    // Note: Compression happens inside writeFile -> uploadFileInChunks
    let uploadProgress = 0;
    const updateProgress = (progress) => {
      uploadProgress = progress;
      if (onProgress) {
        // Preview upload is usually fast, so we allocate 90% to main file, 10% to preview
        onProgress(Math.floor(progress * 0.9));
      }
    };
    
    // Upload file (compression happens automatically if needed)
    await writeFile(`uploads/${id}`, file, updateProgress);
    
    // Note: If file was compressed and type changed (e.g., GIF to video),
    // we need to detect the actual uploaded file type
    // For now, we'll use the original type since the preview was generated from original
    // The compressed file will have the correct MIME type set during upload
    
    // Upload preview (usually small, so no progress needed)
    if (onProgress) {
      onProgress(95);
    }
    await writeFile(`uploads/${id}-preview`, preview);
    
    if (onProgress) {
      onProgress(100);
    }
    
    // Store asset with original type (compressed file type is handled by Supabase)
    list.push({ id, type });
    await writeKv('assets-list', list);

    const src = await getAssetSrc({ id });
    const previewSrc = await getAssetPreviewSrc({ id });
    return { id, src, preview: previewSrc };
  } catch (error) {
    // If upload fails due to size limit, provide helpful error
    if (error.message && (error.message.includes('too large') || error.message.includes('50MB'))) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
      
      // Create a user-friendly error message
      // Note: Compression is now automatic, so this error means compression failed or file is still too large
      const friendlyError = new Error(
        `⚠️ File upload failed\n\n` +
        `The file (${fileSizeMB}MB) was automatically compressed but is still too large for Supabase's 50MB limit.\n\n` +
        `The file has been compressed as much as possible while maintaining visibility.\n\n` +
        `Options:\n` +
        `1. Try uploading a smaller source file\n` +
        `2. Manually compress the file further before uploading\n` +
        `3. Upgrade to Supabase Pro (supports up to 500GB)\n` +
        `   - Visit: https://supabase.com/pricing\n\n` +
        `File: ${file.name || 'unknown'}`
      );
      friendlyError.name = 'FileTooLargeError';
      throw friendlyError;
    }
    throw error;
  }
};

/**
 * Delete an asset
 */
export const deleteAsset = async ({ id }) => {
  const list = await listAssets();
  const newList = list.filter((asset) => asset.id !== id);
  await writeKv('assets-list', newList);
};

// ============================================================================
// SUBJECT-AWARE FUNCTIONS FOR LESSON STORAGE
// ============================================================================

/**
 * Save a design to a specific subject folder (SCIENCE, ENGLISH, MATH)
 * @param {Object} params - Design parameters
 * @param {Object} params.storeJSON - Design data
 * @param {Blob} params.preview - Preview image
 * @param {string} params.name - Design name
 * @param {string} params.subject - Subject name (science, english, math)
 * @param {string} [params.quarter] - Optional quarter number
 * @param {string} [params.id] - Optional design ID
 */
/**
 * Sanitize a string to be safe for use as a filename
 * Removes special characters, spaces, and ensures it's URL-safe
 */
function sanitizeFilename(name) {
  if (!name || typeof name !== 'string') {
    return nanoid(10); // Fallback to random ID if name is invalid
  }
  
  // Convert to lowercase, replace spaces and special chars with hyphens
  let sanitized = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  
  // Ensure it's not empty and has reasonable length
  if (!sanitized || sanitized.length === 0) {
    return nanoid(10); // Fallback to random ID if sanitization results in empty string
  }
  
  // Limit length to 100 characters to avoid filesystem issues
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }
  
  return sanitized;
}

export async function saveDesignBySubject({ storeJSON, preview, name, subject, quarter, gradeLevel, id }) {
  console.log(`💾 Saving to Supabase - Subject: "${subject}", Quarter: "${quarter}", Name: "${name}"`);
  
  // Normalize subject to lowercase for consistent storage
  // This ensures "math", "Math", "MATH" all become "math"
  let normalizedSubjectForStorage = String(subject).toLowerCase().trim();
  if (normalizedSubjectForStorage.startsWith('subject_')) {
    normalizedSubjectForStorage = normalizedSubjectForStorage.replace('subject_', '');
  }
  
  const subjectFolder = getSubjectFolder(subject);
  console.log(`📁 Subject: "${subject}" → normalized: "${normalizedSubjectForStorage}" → Folder: "${subjectFolder}"`);
  
  if (!subjectFolder) {
    console.error(`❌ Error: Subject "${subject}" could not be mapped to a folder!`);
    throw new Error(`Invalid subject: ${subject}. Must be one of: science, english, math`);
  }
  
  // Get grade level - use provided gradeLevel parameter, or try to fetch from utility function
  let finalGradeLevel = gradeLevel;
  
  if (!finalGradeLevel) {
    // Fallback: try to get from utility function
    const { getUserGradeLevelWithFallback } = await import('./utils/getUserGradeLevel');
    finalGradeLevel = await getUserGradeLevelWithFallback();
  }
  
  // Normalize grade level format to match bucket structure (Grade5, Grade6, etc.)
  // Convert grade5 -> Grade5, grade6 -> Grade6 to match your Supabase bucket structure
  let normalizedGradeLevel = null;
  if (finalGradeLevel) {
    normalizedGradeLevel = String(finalGradeLevel);
    if (!normalizedGradeLevel.startsWith('Grade') && !normalizedGradeLevel.startsWith('grade')) {
      normalizedGradeLevel = `Grade${normalizedGradeLevel}`;
    } else if (normalizedGradeLevel.startsWith('grade')) {
      // Convert grade5 -> Grade5, grade6 -> Grade6
      normalizedGradeLevel = `Grade${normalizedGradeLevel.substring(5)}`;
    }
  }
  const quarterFolder = `Quarter${quarter}`;
  
  // Use sanitized name as ID if no ID provided, or if we want to use title-based naming
  if (!id) {
    // Use sanitized name as the filename/ID for better clarity
    let baseId = sanitizeFilename(name);
    
    // Check if a design with this name already exists in the same folder
    if (normalizedGradeLevel) {
      const existingPath = `${normalizedGradeLevel}/${subjectFolder}/${quarterFolder}/${baseId}.json`;
      
      // Check if file exists in Supabase Storage (only if we're not editing the same design)
      if (shouldUseSupabase()) {
        try {
          const { data: existingFiles, error } = await supabase.storage
            .from(BUCKET_LESSON_STORAGE)
            .list(`${normalizedGradeLevel}/${subjectFolder}/${quarterFolder}`, {
              search: baseId
            });
          
          if (!error && existingFiles && existingFiles.length > 0) {
            // Check if any file matches exactly (excluding the current design if editing)
            const exactMatch = existingFiles.find(f => f.name === `${baseId}.json`);
            if (exactMatch) {
              // Append timestamp to make it unique
              const timestamp = Date.now();
              baseId = `${baseId}-${timestamp}`;
              console.log(`⚠️ Design with name "${name}" already exists in this folder, using unique ID: "${baseId}"`);
            }
          }
        } catch (error) {
          console.warn('Could not check for duplicate names:', error);
          // Continue with base name anyway
        }
      }
    }
    
    id = baseId;
    console.log(`📝 Using sanitized design name as ID: "${id}" (from "${name}")`);
  }
  
  // Validate subject and quarter
  if (!subject) {
    console.error('❌ Error: No subject provided!');
    throw new Error('Subject is required');
  }
  
  if (!quarter) {
    console.error('❌ Error: No quarter provided!');
    throw new Error('Quarter is required');
  }
  
  // REQUIRE grade level - don't allow saving without it
  if (!normalizedGradeLevel) {
    const errorMsg = `❌ Grade level is required! Cannot save lesson without grade level.\n\n` +
      `Please select a grade level in the upload dialog.\n\n` +
      `This prevents Grade 5 lessons from appearing for Grade 6 teachers.`;
    console.error(errorMsg);
    alert(errorMsg);
    throw new Error('Grade level is required to save lessons. This prevents cross-grade contamination.');
  }
  
  // Build paths matching Supabase bucket structure: GradeLevel/Subject/Quarter/id.json
  // Example: Grade5/MATH/Quarter1/design.json or Grade6/SCIENCE/Quarter2/design.json
  // This structure ensures grade-level isolation (Grade 5 can't see Grade 6 lessons)
  let previewPath, storePath;
  
  // Always use grade-first structure: GradeLevel/Subject/Quarter/
  // Structure: Grade5/MATH/Quarter1/design.json
  previewPath = `${normalizedGradeLevel}/${subjectFolder}/${quarterFolder}/${id}.jpg`;
  storePath = `${normalizedGradeLevel}/${subjectFolder}/${quarterFolder}/${id}.json`;
  console.log(`✅ Using grade-first path structure: ${normalizedGradeLevel}/${subjectFolder}/${quarterFolder}/`);
  
  console.log(`📤 Upload paths: preview="${previewPath}", design="${storePath}"`);

  // Ensure folder structure exists before uploading
  const previewFolder = previewPath.split('/').slice(0, -1).join('/');
  const designFolder = storePath.split('/').slice(0, -1).join('/');
  
  console.log(`📁 Checking folder structure...`);
  if (previewFolder) {
    await ensureFolderExists(previewFolder, BUCKET_LESSON_STORAGE);
  }
  if (designFolder && designFolder !== previewFolder) {
    await ensureFolderExists(designFolder, BUCKET_LESSON_STORAGE);
  }

  // Thumbnails: Save to Supabase Storage
  await writeThumbnailToSupabase(previewPath, preview);
  console.log(`✅ Preview/thumbnail saved to Supabase Storage: ${previewPath}`);
  
  // Keep the JSON file intact as one piece (no media extraction)
  // This preserves the original Polotno design structure with all embedded base64 data
  const designJSON = JSON.stringify(storeJSON);
  const finalSize = new Blob([designJSON], { type: 'application/json' }).size;
  const finalSizeMB = (finalSize / 1024 / 1024).toFixed(2);
  
  console.log(`📊 Design JSON size: ${finalSizeMB}MB (self-contained with all embedded data)`);
  
  if (finalSize > 45 * 1024 * 1024) {
    console.log(`📊 Design JSON is large (${finalSizeMB}MB) - no worries, paid Supabase plan has no size limits!`);
  }
  
  // Save design JSON as one complete file (no media extraction)
  await writeFile(storePath, designJSON);
  console.log(`✅ Design saved to Supabase: ${storePath} (${finalSizeMB}MB, self-contained)`);

  // Update metadata list with proper name and grade level
  // Load existing metadata from Supabase
  let list = await listDesigns();
  
  const existing = list.find((design) => design.id === id);
  if (existing) {
    existing.name = name; // Update name in case it changed
    existing.subject = normalizedSubjectForStorage; // Use normalized subject for consistency
    existing.quarter = quarter;
    existing.gradeLevel = normalizedGradeLevel; // Store grade level in metadata
  } else {
    list.push({ 
      id, 
      name, // Store the actual title/name
      subject: normalizedSubjectForStorage, // Use normalized subject (e.g., "math" not "MATH")
      quarter,
      gradeLevel: normalizedGradeLevel // Store grade level for filtering
    });
  }
  
  console.log(`📝 Metadata entry: id="${id}", name="${name}", subject="${normalizedSubjectForStorage}", quarter="${quarter}", grade="${normalizedGradeLevel}"`);

  // Save simple design-ids.json file in the folder (much simpler than global metadata)
  // This file is used by the loader to quickly list designs for a specific folder
  try {
    // Create a simple list of design IDs for this specific folder
    const folderIdsPath = `${storePath.replace(`/${id}.json`, '')}/design-ids.json`;
    const folderDesigns = list.filter(d => 
      d.subject === normalizedSubjectForStorage && 
      d.quarter === quarter && 
      (d.gradeLevel || d.grade) === normalizedGradeLevel
    );
    const designIds = folderDesigns.map(d => ({
      id: d.id,
      name: d.name || d.id
    }));
    const folderIdsJSON = JSON.stringify(designIds, null, 2);
    await writeFile(folderIdsPath, folderIdsJSON);
    console.log(`✅ Design IDs saved to Supabase: ${folderIdsPath} (${designIds.length} designs)`);
  } catch (error) {
    console.error('❌ Failed to save design IDs to Supabase:', error);
  }

  // Also save global metadata for backward compatibility
  let metadataSaved = false;
  try {
    await writeKv('designs-list', list);
    console.log(`✅ Metadata saved to Supabase: ${list.length} designs`);
    metadataSaved = true;
  } catch (error) {
    console.error('❌ Failed to save metadata:', error);
  }
  
  if (!metadataSaved) {
    console.error('❌ CRITICAL: Metadata was NOT saved! Lessons will not appear on subject pages.');
    console.error('💡 Check Supabase configuration and permissions.');
  }
  
  console.log(`✅ Design saved successfully: id="${id}", name="${name}", subject="${normalizedSubjectForStorage}", quarter="${quarter}", grade="${normalizedGradeLevel}"`);
  return { id, status: 'saved', subject: normalizedSubjectForStorage, quarter, name };
}

/**
 * Load a design by ID and subject
 * @param {Object} params - Load parameters
 * @param {string} params.id - Design ID
 * @param {string} params.subject - Subject name (science, english, math)
 */
export async function loadByIdAndSubject({ id, subject }) {
  const subjectFolder = getSubjectFolder(subject);
  let storeJSON = await readFile(`${subjectFolder}/${id}.json`);
  
  // if it is blob, convert to JSON
  if (storeJSON instanceof Blob) {
    storeJSON = JSON.parse(await storeJSON.text());
  } else if (typeof storeJSON === 'string') {
    storeJSON = JSON.parse(storeJSON);
  }

  return { storeJSON, subject };
}

/**
 * Delete a design from a specific subject folder
 * @param {Object} params - Delete parameters
 * @param {string} params.id - Design ID
 * @param {string} params.subject - Subject name (science, english, math)
 */
export async function deleteDesignBySubject({ id, subject }) {
  const subjectFolder = getSubjectFolder(subject);
  const list = await listDesigns();
  const newList = list.filter((design) => design.id !== id);
  await writeKv('designs-list', newList);
  await deleteFile(`${subjectFolder}/${id}.json`);
  await deleteFile(`${subjectFolder}/${id}.jpg`);
}

/**
 * Get preview URL for a design in a specific subject folder
 * Thumbnails are stored in Supabase Storage - checks Supabase first
 * @param {Object} params - Preview parameters
 * @param {string} params.id - Design ID
 * @param {string} params.subject - Subject name (science, english, math)
 */
export const getPreviewBySubject = async ({ id, subject }) => {
  const subjectFolder = getSubjectFolder(subject);
  const previewPath = `${subjectFolder}/${id}.jpg`;
  
  // Thumbnails are stored in Supabase Storage
  if (shouldUseSupabase()) {
    try {
      const { data } = supabase.storage
        .from(BUCKET_LESSON_STORAGE)
        .getPublicUrl(previewPath);
      if (data && data.publicUrl) {
        return data.publicUrl;
      }
    } catch (error) {
      console.warn('Failed to get preview from Supabase:', error);
    }
  }
  
  // Fallback to local storage blob URL
  try {
    const preview = await readFile(previewPath);
    
    // If preview is already a URL string, return it
    if (typeof preview === 'string') {
      if (preview.startsWith('data:') || preview.startsWith('http://') || preview.startsWith('https://')) {
        return preview;
      }
      return null;
    }
    
    // If preview is a Blob, create object URL
    if (preview instanceof Blob) {
      return URL.createObjectURL(preview);
    }
    
    // If preview is null/undefined, return null
    if (!preview) {
      console.warn(`Preview not found: ${previewPath}`);
      return null;
    }
    
    console.warn(`Unexpected preview type: ${typeof preview}`);
    return null;
  } catch (error) {
    console.error('Failed to load preview from any source:', error);
    return null;
  }
};

/**
 * List all files in a specific subject folder
 * @param {string} subject - Subject name (science, english, math)
 */
export async function listDesignsBySubject(subject) {
  const subjectFolder = getSubjectFolder(subject);
  
  if (shouldUseSupabase()) {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_LESSON_STORAGE)
        .list(subjectFolder, {
          limit: 100,
          offset: 0,
        });

      if (error) {
        console.error('Error listing files:', error);
        return [];
      }

      // Filter out folders and return file names
      return data
        .filter(file => file.name !== null)
        .map(file => ({
          name: file.name,
          id: file.name.replace(/\.(json|jpg)$/, ''),
          type: file.name.endsWith('.json') ? 'json' : 'image',
        }));
    } catch (error) {
      console.error('Failed to list files from Supabase:', error);
      return [];
    }
  }
  
  return [];
}
