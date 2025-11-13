/**
 * Cloudflare R2 API Implementation
 * 
 * This file provides file storage operations using Cloudflare R2.
 * Supabase is still used for metadata (thumbnails, references, design lists).
 * 
 * R2 is used for:
 * - JSON design files
 * - Images and media files
 * - All actual file storage
 * 
 * Supabase is used for:
 * - Design metadata (thumbnails, references)
 * - Design lists
 * - Key-value storage
 */

import { 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand, 
  ListObjectsV2Command,
  HeadObjectCommand
} from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL, shouldUseR2, getR2PublicUrl, getSubjectFolder } from './r2';
import { storage } from './storage';
import { getFileSizeString } from './chunked-upload';

/**
 * Upload a file to R2 Storage
 * @param {string} fileName - Full path to the file (e.g., "SCIENCE/grade5/quarter1/design.json")
 * @param {Blob|string|Buffer} data - File data to upload
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<Object>} Upload result
 */
export async function writeFileToR2(fileName, data, onProgress = null) {
  if (!shouldUseR2()) {
    console.warn('⚠️ R2 not configured, falling back to local storage');
    await storage.setItem(fileName, data);
    return;
  }

  try {
    // Convert data to Blob if needed
    let blob;
    let contentType = 'application/octet-stream';
    
    if (data instanceof Blob) {
      blob = data;
      contentType = data.type || contentType;
    } else if (typeof data === 'string') {
      // Check if it's JSON
      try {
        JSON.parse(data);
        contentType = 'application/json';
      } catch (e) {
        contentType = 'text/plain';
      }
      blob = new Blob([data], { type: contentType });
    } else {
      // Buffer or other types
      blob = new Blob([data], { type: contentType });
    }

    // Detect content type from file name if not set
    if (contentType === 'application/octet-stream') {
      if (fileName.endsWith('.json')) {
        contentType = 'application/json';
      } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
        contentType = 'image/jpeg';
      } else if (fileName.endsWith('.png')) {
        contentType = 'image/png';
      } else if (fileName.endsWith('.gif')) {
        contentType = 'image/gif';
      } else if (fileName.endsWith('.webp')) {
        contentType = 'image/webp';
      } else if (fileName.endsWith('.mp4')) {
        contentType = 'video/mp4';
      } else if (fileName.endsWith('.txt')) {
        contentType = 'text/plain';
      }
    }

    const fileSize = blob.size;
    console.log(`📤 Uploading to R2: path="${fileName}", size=${getFileSizeString(fileSize)}`);

    // Convert Blob to ArrayBuffer for upload
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileName,
      Body: uint8Array,
      ContentType: contentType,
    });

    // Simulate progress (R2 doesn't provide upload progress in browser)
    if (onProgress) {
      onProgress(50);
    }

    await r2Client.send(command);

    if (onProgress) {
      onProgress(100);
    }

    console.log(`✅ Upload successful to R2: ${fileName}`);
    
    return {
      key: fileName,
      size: fileSize,
      contentType
    };
  } catch (error) {
    console.error('❌ Failed to upload to R2, falling back to local storage:', error);
    // Fall back to local storage
    await storage.setItem(fileName, data);
    throw error;
  }
}

/**
 * Read a file from R2 Storage
 * @param {string} fileName - Full path to the file
 * @returns {Promise<Blob|string>} File data
 */
export async function readFileFromR2(fileName) {
  if (!shouldUseR2()) {
    console.warn('⚠️ R2 not configured, reading from local storage');
    return await storage.getItem(fileName);
  }

  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileName,
    });

    const response = await r2Client.send(command);
    
    // Convert stream to blob
    const arrayBuffer = await response.Body.transformToByteArray();
    const blob = new Blob([arrayBuffer], { 
      type: response.ContentType || 'application/octet-stream' 
    });

    console.log(`✅ Downloaded from R2: ${fileName}`);
    return blob;
  } catch (error) {
    console.error('❌ Failed to download from R2, falling back to local storage:', error);
    return await storage.getItem(fileName);
  }
}

/**
 * Delete a file from R2 Storage
 * @param {string} fileName - Full path to the file
 * @returns {Promise<void>}
 */
export async function deleteFileFromR2(fileName) {
  if (!shouldUseR2()) {
    console.warn('⚠️ R2 not configured, deleting from local storage');
    await storage.removeItem(fileName);
    return;
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileName,
    });

    await r2Client.send(command);
    console.log(`✅ Deleted from R2: ${fileName}`);
  } catch (error) {
    console.error('❌ Failed to delete from R2, falling back to local storage:', error);
    await storage.removeItem(fileName);
  }
}

/**
 * Check if a file exists in R2
 * @param {string} fileName - Full path to the file
 * @returns {Promise<boolean>}
 */
export async function fileExistsInR2(fileName) {
  if (!shouldUseR2()) {
    return false;
  }

  try {
    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileName,
    });

    await r2Client.send(command);
    return true;
  } catch (error) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}

/**
 * List files in R2 with optional prefix
 * @param {string} prefix - Path prefix to filter files (e.g., "SCIENCE/grade5/")
 * @param {number} maxKeys - Maximum number of files to return
 * @returns {Promise<Array>} Array of file objects
 */
export async function listFilesInR2(prefix = '', maxKeys = 1000) {
  if (!shouldUseR2()) {
    return [];
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: maxKeys,
    });

    const response = await r2Client.send(command);
    
    if (!response.Contents) {
      return [];
    }

    return response.Contents.map(item => ({
      key: item.Key,
      size: item.Size,
      lastModified: item.LastModified,
      etag: item.ETag,
    }));
  } catch (error) {
    console.error('❌ Failed to list files from R2:', error);
    return [];
  }
}

/**
 * Get public URL for an R2 file
 * @param {string} fileName - Full path to the file
 * @returns {string|null} Public URL or null if not available
 */
export function getR2FileUrl(fileName) {
  if (!shouldUseR2()) {
    return null;
  }

  return getR2PublicUrl(fileName);
}

// Re-export shouldUseR2 from r2.js for convenience
// This allows other files to import everything R2-related from r2-api.js
export { shouldUseR2 } from './r2';

