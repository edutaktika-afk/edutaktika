/**
 * Chunked Upload Utility for Large Files
 * 
 * This module handles uploading large files (>50MB) to Supabase Storage
 * by splitting them into smaller chunks and uploading them sequentially.
 * 
 * Note: Supabase free tier has a 50MB limit per upload. This utility
 * allows uploading larger files by chunking them.
 */

import { supabase, shouldUseSupabase, BUCKET_ASSETS, BUCKET_LESSON_STORAGE } from './supabase';
import { compressFile, needsCompression } from './file-compression';

// Chunk size: 45MB (leaving some buffer under the 50MB limit)
const CHUNK_SIZE = 45 * 1024 * 1024; // 45MB in bytes
const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024; // 50MB

/**
 * Determine which bucket to use based on file path
 */
function getBucketForPath(fileName) {
  if (fileName.includes('SCIENCE/') || fileName.includes('ENGLISH/') || fileName.includes('MATH/')) {
    return BUCKET_LESSON_STORAGE;
  }
  if (fileName.startsWith('uploads/')) {
    return BUCKET_ASSETS;
  }
  return BUCKET_LESSON_STORAGE; // default
}

/**
 * Upload a file, handling large files gracefully
 * Note: Supabase free tier has a 50MB limit. For larger files, we attempt
 * direct upload (in case user is on Pro plan), and provide clear errors if it fails.
 * 
 * @param {string} fileName - Full path to the file
 * @param {Blob} fileBlob - The file to upload
 * @param {Function} onProgress - Optional progress callback (progress: number) => void
 * @returns {Promise<Object>} Upload result
 */
export async function uploadFileInChunks(fileName, fileBlob, onProgress = null) {
  if (!shouldUseSupabase()) {
    throw new Error('Supabase is not configured');
  }

  let fileToUpload = fileBlob;
  const originalSize = fileBlob.size;
  const fileSizeMB = (originalSize / 1024 / 1024).toFixed(2);
  const bucket = getBucketForPath(fileName);
  
  // Extract file name from path for better error messages
  const actualFileName = fileName.split('/').pop() || fileName;
  
  // Check if this is a JSON/text file (design files) - needed early for error messages
  const fileType = fileBlob.type || '';
  const isJSONFile = fileType === 'application/json' || 
                     fileType.startsWith('text/') ||
                     actualFileName.match(/\.(json|txt)$/i);

  console.log(`📤 Attempting upload: ${fileName} (${fileSizeMB}MB)${isJSONFile ? ' [JSON/Design file]' : ''}`);

  // If file is too large, compress it automatically (skip JSON files)
  if (needsCompression(fileBlob) && !isJSONFile) {
    console.log(`🔄 File is too large (${fileSizeMB}MB), compressing automatically...`);
    try {
      if (onProgress) {
        onProgress(10); // Compression started
      }
      
      // Pass file name to compression function for better detection
      fileToUpload = await compressFile(fileBlob, { fileName: actualFileName });
      const compressedSizeMB = (fileToUpload.size / 1024 / 1024).toFixed(2);
      
      // Check if compression actually helped
      if (fileToUpload.size >= fileBlob.size) {
        console.warn(`⚠️ Compression did not reduce file size (${fileSizeMB}MB → ${compressedSizeMB}MB), using original`);
        fileToUpload = fileBlob;
      } else {
        console.log(`✅ Compression complete: ${fileSizeMB}MB → ${compressedSizeMB}MB`);
      }
      
      if (onProgress) {
        onProgress(30); // Compression complete
      }
    } catch (error) {
      console.error('❌ Compression failed:', error);
      // If compression fails, continue with original file
      // Upload will fail with size error, which is better than crashing
      fileToUpload = fileBlob;
    }
  } else if (needsCompression(fileBlob) && isJSONFile) {
    // JSON files can't be compressed - they're already text
    console.warn(`⚠️ JSON/Text file is too large (${fileSizeMB}MB). JSON files cannot be compressed.`);
    console.warn(`💡 This usually means the design contains large embedded media files (videos/images as base64).`);
    console.warn(`💡 Consider removing or replacing large media files before saving.`);
    // Continue with original - will fail upload but user gets helpful error
    fileToUpload = fileBlob;
  }

  const fileSize = fileToUpload.size;

  // If file is small enough after compression, upload directly
  if (fileSize <= LARGE_FILE_THRESHOLD) {
    console.log(`✅ File is under 50MB (${(fileSize / 1024 / 1024).toFixed(2)}MB), uploading directly...`);
    
    if (onProgress) {
      onProgress(40); // Upload starting
    }
    
    // Ensure file has correct content type
    let uploadContentType = fileToUpload.type || fileBlob.type || 'application/octet-stream';
    // If still no type, try to detect from file name
    if (uploadContentType === 'application/octet-stream' && actualFileName.match(/\.json$/i)) {
      uploadContentType = 'application/json';
    }
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileToUpload, {
        upsert: true,
        contentType: uploadContentType
      });

    if (error) {
      throw error;
    }

    if (onProgress) {
      onProgress(100);
    }

    return data;
  }

  // File is still too large after compression
  // Try direct upload (User might be on Pro plan which supports up to 500GB)
  const currentSizeMB = (fileSize / 1024 / 1024).toFixed(2);
  console.log(`⚠️ File is still large (${currentSizeMB}MB) after compression, attempting direct upload...`);
  console.log(`💡 Note: If you're on Supabase free tier, this may fail. Pro tier supports up to 500GB.`);
  
  try {
    // Simulate progress for large uploads
    if (onProgress) {
      // Simulate progress (we can't get real progress from Supabase JS client)
      let progress = 40;
      const progressInterval = setInterval(() => {
        progress = Math.min(progress + 2, 95);
        onProgress(progress);
      }, 500);
      
      try {
        // Ensure file has correct content type
        let uploadContentType = fileToUpload.type || fileBlob.type || 'application/octet-stream';
        // If still no type, try to detect from file name
        if (uploadContentType === 'application/octet-stream' && actualFileName.match(/\.json$/i)) {
          uploadContentType = 'application/json';
        }
        
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, fileToUpload, {
            upsert: true,
            contentType: uploadContentType,
            cacheControl: '3600'
          });
        
        clearInterval(progressInterval);
        
        if (error) {
          throw error;
        }

        if (onProgress) {
          onProgress(100);
        }

        console.log(`✅ Large file uploaded successfully! (User may be on Pro plan)`);
        return data;
      } catch (uploadError) {
        clearInterval(progressInterval);
        throw uploadError;
      }
    } else {
      // No progress tracking
      // Ensure file has correct content type
      let uploadContentType = fileToUpload.type || fileBlob.type || 'application/octet-stream';
      // If still no type, try to detect from file name
      if (uploadContentType === 'application/octet-stream' && actualFileName.match(/\.json$/i)) {
        uploadContentType = 'application/json';
      }
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, fileToUpload, {
          upsert: true,
          contentType: uploadContentType,
          cacheControl: '3600'
        });

      if (error) {
        throw error;
      }

      console.log(`✅ Large file uploaded successfully! (User may be on Pro plan)`);
      return data;
    }
  } catch (error) {
    console.error('❌ Upload failed:', error);
    
    // Check if it's a size limit error
    const isSizeError = error.message && (
      error.message.includes('size') || 
      error.message.includes('limit') || 
      error.message.includes('50') ||
      error.message.includes('Payload too large') ||
      error.statusCode === 413
    );
    
    if (isSizeError) {
      // File is still too large even after compression
      let errorMessage = '';
      
      if (isJSONFile) {
        // Special error message for JSON files (designs with embedded media)
        errorMessage = `Design file is too large (${currentSizeMB}MB). ` +
          `This usually happens when your design contains large embedded media files (videos/images stored as base64).\n\n` +
          `Solutions:\n` +
          `1. Remove large video/image files from your design\n` +
          `2. Replace large files with smaller ones\n` +
          `3. Use external URLs instead of embedding files directly\n` +
          `4. Split your design into smaller parts\n` +
          `5. Upgrade to Supabase Pro (supports up to 500GB)\n\n` +
          `Note: JSON/text files cannot be compressed automatically. ` +
          `To reduce file size, remove or replace large embedded media files.`;
      } else {
        // Regular error for other file types
        errorMessage = `File is too large (${currentSizeMB}MB) even after automatic compression. ` +
          `The file has been compressed as much as possible while maintaining visibility. ` +
          `Please try a smaller source file or upgrade to Supabase Pro (supports up to 500GB).`;
      }
      
      throw new Error(errorMessage);
    }
    
    // Re-throw other errors
    throw error;
  }
}

// Removed uploadLargeFileWithResumable - functionality moved to uploadFileInChunks

// Removed compressVideo - browser-based video compression is unreliable
// Users should compress videos manually using HandBrake, FFmpeg, or online tools

/**
 * Check if a file needs chunked upload
 */
export function needsChunkedUpload(fileSize) {
  return fileSize > LARGE_FILE_THRESHOLD;
}

/**
 * Get file size in human-readable format
 */
export function getFileSizeString(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

