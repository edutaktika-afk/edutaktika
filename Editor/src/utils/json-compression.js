/**
 * JSON Compression Utility
 * 
 * Compresses/decompresses JSON strings using gzip compression
 * Reduces file size significantly for faster uploads/downloads
 */

/**
 * Compress JSON string using gzip
 * @param {string} jsonString - JSON string to compress
 * @returns {Promise<Blob>} Compressed blob
 */
export async function compressJSON(jsonString) {
  try {
    // Convert string to stream
    const stream = new Blob([jsonString], { type: 'application/json' }).stream();
    
    // Compress using CompressionStream (available in modern browsers)
    if ('CompressionStream' in window) {
      const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
      const compressedBlob = await new Response(compressedStream).blob();
      return compressedBlob;
    }
    
    // Fallback: use pako library if available, otherwise return original
    if (typeof window.pako !== 'undefined') {
      const uint8Array = new TextEncoder().encode(jsonString);
      const compressed = window.pako.gzip(uint8Array);
      return new Blob([compressed], { type: 'application/gzip' });
    }
    
    // No compression available, return original as blob
    console.warn('⚠️ Compression not available, uploading uncompressed JSON');
    return new Blob([jsonString], { type: 'application/json' });
  } catch (error) {
    console.error('❌ Compression error:', error);
    // Return original if compression fails
    return new Blob([jsonString], { type: 'application/json' });
  }
}

/**
 * Decompress gzip-compressed JSON
 * @param {Blob|Response} compressedBlob - Compressed blob to decompress
 * @returns {Promise<string>} Decompressed JSON string
 */
export async function decompressJSON(compressedBlob) {
  try {
    // Handle Response objects
    const blob = compressedBlob instanceof Response ? await compressedBlob.blob() : compressedBlob;
    
    // Decompress using DecompressionStream (available in modern browsers)
    if ('DecompressionStream' in window) {
      const decompressedStream = blob.stream().pipeThrough(new DecompressionStream('gzip'));
      const decompressedBlob = await new Response(decompressedStream).blob();
      return await decompressedBlob.text();
    }
    
    // Fallback: use pako library if available
    if (typeof window.pako !== 'undefined') {
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const decompressed = window.pako.ungzip(uint8Array, { to: 'string' });
      return decompressed;
    }
    
    // No decompression available, try to read as text
    console.warn('⚠️ Decompression not available, trying to read as text');
    return await blob.text();
  } catch (error) {
    console.error('❌ Decompression error:', error);
    // If decompression fails, try reading as plain text
    try {
      const blob = compressedBlob instanceof Response ? await compressedBlob.blob() : compressedBlob;
      return await blob.text();
    } catch (e) {
      throw new Error(`Failed to decompress JSON: ${error.message}`);
    }
  }
}

/**
 * Check if browser supports native compression
 * @returns {boolean} True if CompressionStream is available
 */
export function supportsCompression() {
  return 'CompressionStream' in window || typeof window.pako !== 'undefined';
}

/**
 * Get compression ratio estimate
 * @param {string} jsonString - JSON string to check
 * @returns {Promise<number>} Estimated compression ratio (0-1)
 */
export async function estimateCompressionRatio(jsonString) {
  if (!supportsCompression()) {
    return 1.0; // No compression
  }
  
  try {
    const compressed = await compressJSON(jsonString);
    const originalSize = new Blob([jsonString]).size;
    const compressedSize = compressed.size;
    return compressedSize / originalSize;
  } catch (error) {
    console.warn('⚠️ Could not estimate compression ratio:', error);
    return 1.0;
  }
}

