/**
 * Media Extractor Utility
 * 
 * This module extracts embedded base64 media files from design JSON,
 * uploads them to Supabase Storage, and replaces the base64 URLs with
 * Supabase Storage URLs. This dramatically reduces the JSON file size.
 */

import { nanoid } from 'nanoid';
import { supabase, shouldUseSupabase, BUCKET_ASSETS, BUCKET_LESSON_STORAGE } from './supabase';
import { uploadFileInChunks } from './chunked-upload';

/**
 * Check if a string is a base64 data URL
 * @param {string} str - String to check
 * @returns {boolean} True if string is a base64 data URL
 */
function isBase64DataURL(str) {
  if (typeof str !== 'string') return false;
  return /^data:(image|video|audio)\/[^;]+;base64,/.test(str);
}

/**
 * Convert base64 data URL to Blob
 * @param {string} dataURL - Base64 data URL
 * @returns {Blob} Blob object
 */
function dataURLToBlob(dataURL) {
  const [header, base64] = dataURL.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Extract MIME type and extension from base64 data URL
 * @param {string} dataURL - Base64 data URL
 * @returns {Object} Object with mimeType and extension
 */
function getMediaInfo(dataURL) {
  const [header] = dataURL.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  
  // Map MIME types to extensions
  const extensionMap = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/ogg': 'ogg',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
  };
  
  const extension = extensionMap[mimeType] || 'bin';
  return { mimeType, extension };
}

/**
 * Upload a base64 media file to Supabase Storage
 * @param {string} dataURL - Base64 data URL
 * @param {string} designId - Design ID for organizing files
 * @param {Object} options - Optional parameters for organizing files
 * @param {string} options.subjectFolder - Subject folder (e.g., "SCIENCE", "ENGLISH", "MATH")
 * @param {string} options.gradeLevel - Grade level (e.g., "grade5", "grade6")
 * @param {string} options.quarterFolder - Quarter folder (e.g., "quarter1", "quarter2")
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<string>} Storage URL (Supabase)
 */
async function uploadMediaToStorage(dataURL, designId, options = {}, onProgress = null) {
  const blob = dataURLToBlob(dataURL);
  const { mimeType, extension } = getMediaInfo(dataURL);
  const mediaId = nanoid(10);
  
  // Organize media files by subject/grade/quarter structure
  let fileName;
  if (options.subjectFolder && options.gradeLevel && options.quarterFolder) {
    // Use subject/grade/quarter structure: {SUBJECT}/{gradeLevel}/{quarter}/{id}/media/{mediaId}.{ext}
    fileName = `${options.subjectFolder}/${options.gradeLevel}/${options.quarterFolder}/${designId}/media/${mediaId}.${extension}`;
  } else {
    // Fallback to old structure for backward compatibility
    fileName = `uploads/${designId}/media/${mediaId}.${extension}`;
  }
  
  const fileSizeMB = (blob.size / 1024 / 1024).toFixed(2);
  console.log(`📤 Uploading embedded media: ${fileName} (${fileSizeMB}MB, type: ${mimeType})`);
  
  // Upload to Supabase Storage
  if (shouldUseSupabase()) {
    try {
      // Determine the correct bucket based on file path
      const bucketToUse = fileName.includes('SCIENCE/') || fileName.includes('ENGLISH/') || fileName.includes('MATH/') 
        ? BUCKET_LESSON_STORAGE 
        : BUCKET_ASSETS;
      
      // Upload to Supabase Storage using chunked upload for large files
      // Note: uploadFileInChunks automatically determines bucket from file path
      await uploadFileInChunks(fileName, blob, onProgress);
      
      // Get public URL
      const { data } = supabase.storage
        .from(bucketToUse)
        .getPublicUrl(fileName);
      
      console.log(`✅ Media uploaded to Supabase: ${data.publicUrl} (${fileSizeMB}MB)`);
      return data.publicUrl;
    } catch (error) {
      console.error(`❌ Failed to upload media: ${error.message}`);
      throw error;
    }
  }
  
  throw new Error('Supabase is not configured');
}

/**
 * Recursively find and extract all base64 data URLs from an object
 * @param {Object} obj - Object to search
 * @param {string} designId - Design ID for organizing files
 * @param {Function} onProgress - Optional progress callback
 * @param {Object} replacements - Map of original URLs to new URLs
 * @param {Object} options - Optional parameters for organizing files
 * @param {string} options.subjectFolder - Subject folder (e.g., "SCIENCE", "ENGLISH", "MATH")
 * @param {string} options.gradeLevel - Grade level (e.g., "grade5", "grade6")
 * @param {string} options.quarterFolder - Quarter folder (e.g., "quarter1", "quarter2")
 * @returns {Promise<Object>} Updated object with replaced URLs
 */
async function extractAndReplaceMedia(obj, designId, onProgress = null, replacements = {}, options = {}) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    const results = await Promise.all(
      obj.map(item => extractAndReplaceMedia(item, designId, onProgress, replacements, options))
    );
    return results;
  }

  // Handle objects
  if (typeof obj === 'object') {
    const result = {};
    const keys = Object.keys(obj);
    let uploadedCount = 0;
    
    for (const key of keys) {
      const value = obj[key];
      
      // Check if this property might contain a base64 data URL
      // Common media properties: src, clipSrc, maskSrc, backgroundSrc, etc.
      const isMediaProperty = (key === 'src' || key === 'clipSrc' || key === 'maskSrc' || 
                               key === 'backgroundSrc' || key.endsWith('Src') || key.endsWith('src')) &&
                              typeof value === 'string' && isBase64DataURL(value);
      
      if (isMediaProperty) {
        // Check if we've already processed this URL (avoid duplicate uploads)
        if (replacements[value]) {
          result[key] = replacements[value];
          console.log(`♻️ Reusing already uploaded media for ${key}`);
          continue;
        }
        
        try {
          // Upload media and get URL
          if (onProgress) {
            onProgress(`Uploading embedded media ${uploadedCount + 1}...`);
          }
          
          const newUrl = await uploadMediaToStorage(value, designId, options, onProgress);
          replacements[value] = newUrl;
          result[key] = newUrl;
          uploadedCount++;
          
          console.log(`✅ Replaced base64 URL in ${key} with storage URL (${uploadedCount} total uploaded)`);
        } catch (error) {
          console.error(`❌ Failed to upload media for ${key}, keeping original: ${error.message}`);
          // Keep original URL if upload fails - better than breaking the design
          result[key] = value;
        }
      } else {
        // Recursively process nested objects and arrays
        result[key] = await extractAndReplaceMedia(value, designId, onProgress, replacements, options);
      }
    }
    
    return result;
  }

  // Return primitive values as-is
  return obj;
}

/**
 * Extract embedded media from design JSON and upload to Supabase Storage
 * @param {Object} storeJSON - Design JSON object
 * @param {string} designId - Design ID for organizing files
 * @param {Function} onProgress - Optional progress callback
 * @param {Object} options - Optional parameters for organizing files
 * @param {string} options.subjectFolder - Subject folder (e.g., "SCIENCE", "ENGLISH", "MATH")
 * @param {string} options.gradeLevel - Grade level (e.g., "grade5", "grade6")
 * @param {string} options.quarterFolder - Quarter folder (e.g., "quarter1", "quarter2")
 * @returns {Promise<Object>} Updated design JSON with storage URLs
 */
export async function extractEmbeddedMedia(storeJSON, designId, onProgress = null, options = {}) {
  if (!shouldUseSupabase()) {
    console.warn('⚠️ Supabase not configured, skipping media extraction');
    return storeJSON;
  }

  console.log('🔍 Scanning design JSON for embedded media files...');
  
  try {
    const replacements = {};
    const updatedJSON = await extractAndReplaceMedia(storeJSON, designId, onProgress, replacements, options);
    
    const extractedCount = Object.keys(replacements).length;
    if (extractedCount > 0) {
      console.log(`✅ Extracted and uploaded ${extractedCount} embedded media file(s)`);
    } else {
      console.log('ℹ️ No embedded media files found in design');
    }
    
    return updatedJSON;
  } catch (error) {
    console.error('❌ Error extracting embedded media:', error);
    // Return original JSON if extraction fails
    return storeJSON;
  }
}

/**
 * Get the size reduction after extracting media
 * @param {Object} originalJSON - Original design JSON
 * @param {Object} extractedJSON - JSON after extracting media
 * @returns {Object} Size information
 */
export function getSizeReduction(originalJSON, extractedJSON) {
  const originalSize = new Blob([JSON.stringify(originalJSON)]).size;
  const extractedSize = new Blob([JSON.stringify(extractedJSON)]).size;
  const reduction = originalSize - extractedSize;
  const reductionPercent = ((reduction / originalSize) * 100).toFixed(1);
  
  return {
    originalSize,
    extractedSize,
    reduction,
    reductionPercent,
    originalSizeMB: (originalSize / 1024 / 1024).toFixed(2),
    extractedSizeMB: (extractedSize / 1024 / 1024).toFixed(2),
    reductionMB: (reduction / 1024 / 1024).toFixed(2),
  };
}

