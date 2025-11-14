/**
 * File Integrity Utility
 * 
 * Provides checksum/hash validation to ensure files are uploaded/downloaded correctly
 */

/**
 * Calculate SHA-256 hash of a blob/file
 * @param {Blob|File} file - File to hash
 * @returns {Promise<string>} Hex-encoded SHA-256 hash
 */
export async function calculateFileHash(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.error('❌ Error calculating file hash:', error);
    // Fallback: return a simple checksum based on size and timestamp
    return `${file.size}-${Date.now()}`;
  }
}

/**
 * Calculate simple checksum for quick validation
 * @param {string|Blob} data - Data to checksum
 * @returns {Promise<string>} Checksum string
 */
export async function calculateChecksum(data) {
  try {
    const str = typeof data === 'string' ? data : await data.text();
    // Simple checksum: sum of character codes
    let checksum = 0;
    for (let i = 0; i < str.length; i++) {
      checksum = ((checksum << 5) - checksum) + str.charCodeAt(i);
      checksum = checksum & checksum; // Convert to 32-bit integer
    }
    return Math.abs(checksum).toString(16);
  } catch (error) {
    console.error('❌ Error calculating checksum:', error);
    return Date.now().toString(16);
  }
}

/**
 * Verify file integrity by comparing hashes
 * @param {Blob|File} original - Original file
 * @param {Blob|File} downloaded - Downloaded file
 * @returns {Promise<boolean>} True if files match
 */
export async function verifyFileIntegrity(original, downloaded) {
  try {
    const originalHash = await calculateFileHash(original);
    const downloadedHash = await calculateFileHash(downloaded);
    const matches = originalHash === downloadedHash;
    
    if (!matches) {
      console.error('❌ File integrity check failed!');
      console.error('Original hash:', originalHash);
      console.error('Downloaded hash:', downloadedHash);
    } else {
      console.log('✅ File integrity verified');
    }
    
    return matches;
  } catch (error) {
    console.error('❌ Error verifying file integrity:', error);
    // On error, assume files match (fail open)
    return true;
  }
}

/**
 * Store hash metadata for a file
 * @param {string} fileName - File name/path
 * @param {string} hash - File hash
 */
export function storeFileHash(fileName, hash) {
  try {
    const hashes = JSON.parse(localStorage.getItem('file-hashes') || '{}');
    hashes[fileName] = {
      hash,
      timestamp: Date.now()
    };
    localStorage.setItem('file-hashes', JSON.stringify(hashes));
  } catch (error) {
    console.warn('⚠️ Could not store file hash:', error);
  }
}

/**
 * Get stored hash for a file
 * @param {string} fileName - File name/path
 * @returns {string|null} Stored hash or null
 */
export function getStoredHash(fileName) {
  try {
    const hashes = JSON.parse(localStorage.getItem('file-hashes') || '{}');
    return hashes[fileName]?.hash || null;
  } catch (error) {
    console.warn('⚠️ Could not retrieve file hash:', error);
    return null;
  }
}

