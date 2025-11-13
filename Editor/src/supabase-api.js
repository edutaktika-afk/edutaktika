import { nanoid } from 'nanoid';
import { storage } from './storage';
import { supabase, BUCKET_DESIGNS, BUCKET_ASSETS, shouldUseSupabase, BUCKET_LESSON_STORAGE, getSubjectFolder } from './supabase';
import { uploadFileInChunks, needsChunkedUpload, getFileSizeString } from './chunked-upload';
import { extractEmbeddedMedia, getSizeReduction } from './media-extractor';
import { shouldUseR2, writeFileToR2, readFileFromR2, deleteFileFromR2, getR2FileUrl } from './r2-api';

/**
 * Hybrid Storage API Implementation
 * 
 * This file provides the same interface as api.js but uses:
 * - Cloudflare R2 for large files (JSON lesson files, media) - NO egress fees, no size limits
 * - Supabase Storage for thumbnails/previews (small files) - free tier is sufficient
 * - Supabase Database for metadata (design lists, references) - fast queries
 * 
 * Architecture:
 * - Large JSON lesson files → R2 Storage (no egress fees, unlimited size)
 * - Images/media files → R2 Storage (no egress fees)
 * - Thumbnails/previews → Supabase Storage (small files, free tier bandwidth)
 * - Metadata (design lists, references) → Supabase Database (fast queries)
 * 
 * Setup Required:
 * 1. Cloudflare R2 (for file storage):
 *    - Create R2 bucket at https://dash.cloudflare.com
 *    - Generate API tokens
 *    - Add environment variables: VITE_R2_ACCOUNT_ID, VITE_R2_ACCESS_KEY_ID, VITE_R2_SECRET_ACCESS_KEY, VITE_R2_BUCKET_NAME
 * 
 * 2. Supabase (for metadata):
 *    - Create a Supabase project at https://supabase.com
 *    - Create 'designs_metadata' table for key-value storage
 *    - Add environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
 * 
 * See R2_SETUP.md for detailed setup instructions.
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
 * Save thumbnail/preview directly to Supabase Storage (bypasses R2)
 * Thumbnails are small files, so Supabase free tier is sufficient
 * This reduces load on R2 for frequently accessed small files
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
 * Save file to R2 Storage (or Supabase Storage if R2 not configured) or local storage
 * R2 is used for large files (JSON lessons, media) - no egress fees, no size limits
 * Thumbnails should use writeThumbnailToSupabase() instead
 */
const writeFile = async function writeFile(fileName, data, onProgress = null) {
  // Check if this is a thumbnail/preview - send directly to Supabase
  if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.includes('preview')) {
    // Thumbnails go to Supabase Storage (small files, free tier is fine)
    try {
      return await writeThumbnailToSupabase(fileName, data);
    } catch (error) {
      console.error('Failed to upload thumbnail to Supabase, trying R2 fallback:', error);
      // Fall through to R2 fallback
    }
  }

  // Try R2 first (primary storage for large files: JSON lessons, media)
  if (shouldUseR2()) {
    try {
      return await writeFileToR2(fileName, data, onProgress);
    } catch (error) {
      console.error('Failed to upload to R2, trying Supabase fallback:', error);
      // Fall through to Supabase fallback
    }
  }

  // Fallback to Supabase Storage (for backward compatibility)
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
 * Read file from R2 Storage (or Supabase Storage if R2 not configured) or local storage
 * R2 is now the primary storage for files
 */
const readFile = async function readFile(fileName) {
  // Try R2 first (primary storage for files)
  if (shouldUseR2()) {
    try {
      return await readFileFromR2(fileName);
    } catch (error) {
      console.error('Failed to read from R2, trying Supabase fallback:', error);
      // Fall through to Supabase fallback
    }
  }

  // Fallback to Supabase Storage (for backward compatibility)
  if (shouldUseSupabase()) {
    try {
      // Download from Supabase Storage
      const { data, error } = await supabase.storage
        .from(BUCKET_DESIGNS)
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
 * Delete file from R2 Storage (or Supabase Storage if R2 not configured) or local storage
 * R2 is now the primary storage for files
 */
const deleteFile = async function deleteFile(fileName) {
  // Try R2 first (primary storage for files)
  if (shouldUseR2()) {
    try {
      await deleteFileFromR2(fileName);
      return;
    } catch (error) {
      console.error('Failed to delete from R2, trying Supabase fallback:', error);
      // Fall through to Supabase fallback
    }
  }

  // Fallback to Supabase Storage (for backward compatibility)
  if (shouldUseSupabase()) {
    try {
      const { error } = await supabase.storage
        .from(BUCKET_DESIGNS)
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
  if (!id) {
    id = nanoid(10);
  }

  const previewPath = `designs/${id}.jpg`;
  const storePath = `designs/${id}.json`;

  // Thumbnails go directly to Supabase Storage (small files, free tier bandwidth)
  await writeThumbnailToSupabase(previewPath, preview);
  console.log('✅ Preview/thumbnail saved to Supabase Storage');
  
  // Check original design JSON size
  const originalJSON = JSON.stringify(storeJSON);
  const originalSize = new Blob([originalJSON], { type: 'application/json' }).size;
  const originalSizeMB = (originalSize / 1024 / 1024).toFixed(2);
  
  console.log(`📊 Original design JSON size: ${originalSizeMB}MB`);
  
  // Extract embedded media files and replace with Supabase URLs
  let processedJSON = storeJSON;
  
  if (originalSize > 10 * 1024 * 1024) { // Only extract if over 10MB
    console.log('🔍 Design JSON is large, extracting embedded media files...');
    try {
      // Extract and upload embedded media
      processedJSON = await extractEmbeddedMedia(storeJSON, id, (progress) => {
        console.log(`   ${progress}`);
      });
      
      // Calculate size reduction
      const sizeInfo = getSizeReduction(storeJSON, processedJSON);
      
      console.log(`✅ Media extraction complete:`);
      console.log(`   Original: ${sizeInfo.originalSizeMB}MB`);
      console.log(`   After extraction: ${sizeInfo.extractedSizeMB}MB`);
      console.log(`   Reduction: ${sizeInfo.reductionMB}MB (${sizeInfo.reductionPercent}%)`);
    } catch (error) {
      console.error('❌ Error extracting embedded media:', error);
      console.warn('⚠️ Continuing with original JSON (may be too large for upload)');
    }
  }
  
  // Convert processed JSON to string
  const designJSON = JSON.stringify(processedJSON);
  const finalSize = new Blob([designJSON], { type: 'application/json' }).size;
  const finalSizeMB = (finalSize / 1024 / 1024).toFixed(2);
  
  if (finalSize > 50 * 1024 * 1024) {
    console.warn(`⚠️ Design JSON is still too large (${finalSizeMB}MB) even after extracting media.`);
    console.warn(`💡 This may happen if the design contains very large files that couldn't be extracted.`);
  }
  
  await writeFile(storePath, designJSON);
  console.log(`✅ Design saved to Supabase: ${storePath} (${finalSizeMB}MB)`);

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
 * Checks Supabase first, then R2 fallback, then local storage
 */
export const getPreview = async ({ id }) => {
  const previewPath = `designs/${id}.jpg`;
  
  // Thumbnails are stored in Supabase Storage - try Supabase first
  if (shouldUseSupabase()) {
    try {
      const { data } = supabase.storage
        .from(BUCKET_DESIGNS)
        .getPublicUrl(previewPath);
      if (data && data.publicUrl) {
        return data.publicUrl;
      }
    } catch (error) {
      console.warn('Failed to get preview from Supabase, trying R2:', error);
    }
  }
  
  // Fallback to R2 (for backward compatibility with old thumbnails)
  if (shouldUseR2()) {
    const r2Url = getR2FileUrl(previewPath);
    if (r2Url) {
      return r2Url;
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
 * Uses R2 if configured, otherwise Supabase, otherwise local blob URL
 */
export const getAssetSrc = async ({ id }) => {
  const assetPath = `uploads/${id}`;
  
  // Try R2 first
  if (shouldUseR2()) {
    const r2Url = getR2FileUrl(assetPath);
    if (r2Url) {
      return r2Url;
    }
  }
  
  // Fallback to Supabase
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
 * Uses R2 if configured, otherwise Supabase, otherwise local blob URL
 */
export const getAssetPreviewSrc = async ({ id }) => {
  const previewPath = `uploads/${id}-preview`;
  
  // Try R2 first
  if (shouldUseR2()) {
    const r2Url = getR2FileUrl(previewPath);
    if (r2Url) {
      return r2Url;
    }
  }
  
  // Fallback to Supabase
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
export async function saveDesignBySubject({ storeJSON, preview, name, subject, quarter, id }) {
  console.log(`💾 Saving to Supabase - Subject: "${subject}", Quarter: "${quarter}"`);
  if (!id) {
    id = nanoid(10);
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

  const subjectFolder = getSubjectFolder(subject);
  console.log(`📁 Subject: "${subject}" → Folder: "${subjectFolder}"`);
  
  if (!subjectFolder) {
    console.error(`❌ Error: Subject "${subject}" could not be mapped to a folder!`);
    throw new Error(`Invalid subject: ${subject}. Must be one of: science, english, math`);
  }
  
  // Try to get teacher's grade level from Firebase or sessionStorage
  let gradeLevel = null;
  
  // First try sessionStorage (from when Editor was opened from subject page)
  try {
    const storedGrade = sessionStorage.getItem('supabase-design-grade');
    if (storedGrade) {
      gradeLevel = storedGrade;
      console.log(`📚 Found grade level from sessionStorage: ${gradeLevel}`);
    }
  } catch (error) {
    console.warn('Could not read grade from sessionStorage:', error);
  }
  
  // If not in sessionStorage, try Firebase
  if (!gradeLevel) {
    try {
      // Dynamically import Firebase if available
      if (typeof window !== 'undefined' && window.firebase) {
        const user = window.firebase.auth().currentUser;
        if (user) {
          const teacherSnap = await window.firebase.database().ref('teachers/' + user.uid).once('value');
          const teacher = teacherSnap.val();
          if (teacher && teacher.gradelevel) {
            const grade = teacher.gradelevel.toString();
            gradeLevel = grade.startsWith('grade') ? grade : `grade${grade}`;
            console.log(`📚 Found teacher grade level from Firebase: ${teacher.gradelevel} → normalized: ${gradeLevel}`);
            
            // Store it in sessionStorage for future use
            try {
              sessionStorage.setItem('supabase-design-grade', gradeLevel);
            } catch (error) {
              console.warn('Could not store grade in sessionStorage:', error);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Could not fetch grade level from Firebase:', error);
    }
  }
  
  // Build paths with grade if available: subject/gradeX/quarterX/id.json
  const quarterFolder = `quarter${quarter}`;
  let previewPath, storePath;
  
  // Always try to use grade-based structure for better organization
  // If gradeLevel is not found, try to get it from URL params or default to a generic location
  if (!gradeLevel) {
    // Try to get from URL parameters
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlGrade = urlParams.get('grade');
      if (urlGrade) {
        gradeLevel = urlGrade.startsWith('grade') ? urlGrade : `grade${urlGrade}`;
        console.log(`📚 Found grade level from URL params: ${gradeLevel}`);
      }
    } catch (error) {
      console.warn('Could not read grade from URL:', error);
    }
  }
  
  // REQUIRE grade level - don't allow saving without it
  if (!gradeLevel) {
    const errorMsg = `❌ Grade level is required! Cannot save lesson without grade level.\n\n` +
      `Please ensure:\n` +
      `1. Your grade level is set in your teacher profile in Firebase\n` +
      `2. You opened the editor from the subject page (not directly)\n` +
      `3. The grade level is passed in the URL or sessionStorage\n\n` +
      `This prevents Grade 5 lessons from appearing for Grade 6 teachers.`;
    console.error(errorMsg);
    alert(errorMsg);
    throw new Error('Grade level is required to save lessons. This prevents cross-grade contamination.');
  }
  
  // Always use grade-based structure
  previewPath = `${subjectFolder}/${gradeLevel}/${quarterFolder}/${id}.jpg`;
  storePath = `${subjectFolder}/${gradeLevel}/${quarterFolder}/${id}.json`;
  console.log(`✅ Using grade-based path structure: ${gradeLevel}/${quarterFolder}/`);
  
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

  // Thumbnails go directly to Supabase Storage (small files, free tier bandwidth)
  await writeThumbnailToSupabase(previewPath, preview);
  console.log(`✅ Preview/thumbnail saved to Supabase Storage: ${previewPath}`);
  
  // Check original design JSON size
  const originalJSON = JSON.stringify(storeJSON);
  const originalSize = new Blob([originalJSON], { type: 'application/json' }).size;
  const originalSizeMB = (originalSize / 1024 / 1024).toFixed(2);
  
  console.log(`📊 Original design JSON size: ${originalSizeMB}MB`);
  
  // Extract embedded media files and replace with Supabase URLs
  let processedJSON = storeJSON;
  let extractedSizeMB = originalSizeMB;
  
  if (originalSize > 10 * 1024 * 1024) { // Only extract if over 10MB
    console.log('🔍 Design JSON is large, extracting embedded media files...');
    try {
      // Extract and upload embedded media with subject/grade structure
      const mediaOptions = {
        subjectFolder: subjectFolder,
        gradeLevel: gradeLevel || null,
        quarterFolder: quarterFolder
      };
      processedJSON = await extractEmbeddedMedia(storeJSON, id, (progress) => {
        console.log(`   ${progress}`);
      }, mediaOptions);
      
      // Calculate size reduction
      const sizeInfo = getSizeReduction(storeJSON, processedJSON);
      extractedSizeMB = sizeInfo.extractedSizeMB;
      
      console.log(`✅ Media extraction complete:`);
      console.log(`   Original: ${sizeInfo.originalSizeMB}MB`);
      console.log(`   After extraction: ${sizeInfo.extractedSizeMB}MB`);
      console.log(`   Reduction: ${sizeInfo.reductionMB}MB (${sizeInfo.reductionPercent}%)`);
    } catch (error) {
      console.error('❌ Error extracting embedded media:', error);
      console.warn('⚠️ Continuing with original JSON (may be too large for upload)');
    }
  }
  
  // Convert processed JSON to string
  const designJSON = JSON.stringify(processedJSON);
  const finalSize = new Blob([designJSON], { type: 'application/json' }).size;
  const finalSizeMB = (finalSize / 1024 / 1024).toFixed(2);
  
  if (finalSize > 50 * 1024 * 1024) {
    console.warn(`⚠️ Design JSON is still too large (${finalSizeMB}MB) even after extracting media.`);
    console.warn(`💡 This may happen if the design contains very large files that couldn't be extracted.`);
    console.warn(`💡 Consider removing or replacing large files manually.`);
  }
  
  // Save design JSON - it will be detected as JSON by file extension (.json)
  await writeFile(storePath, designJSON);
  console.log(`✅ Design saved to Supabase: ${storePath} (${finalSizeMB}MB)`);

  let list = await listDesigns();
  const existing = list.find((design) => design.id === id);
  if (existing) {
    existing.name = name;
    existing.subject = subject;
    existing.quarter = quarter;
  } else {
    list.push({ id, name, subject, quarter });
  }

  await writeKv('designs-list', list);
  return { id, status: 'saved', subject, quarter };
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
  
  // Thumbnails are stored in Supabase Storage - try Supabase first
  if (shouldUseSupabase()) {
    try {
      const { data } = supabase.storage
        .from(BUCKET_LESSON_STORAGE)
        .getPublicUrl(previewPath);
      if (data && data.publicUrl) {
        return data.publicUrl;
      }
    } catch (error) {
      console.warn('Failed to get preview from Supabase, trying R2:', error);
    }
  }
  
  // Fallback to R2 (for backward compatibility with old thumbnails)
  if (shouldUseR2()) {
    const r2Url = getR2FileUrl(previewPath);
    if (r2Url) {
      return r2Url;
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
