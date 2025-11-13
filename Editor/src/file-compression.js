/**
 * Client-Side File Compression Utility
 * 
 * Automatically compresses images and videos to fit within file size limits
 * while maintaining acceptable quality for display purposes.
 */

// Compression settings
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const IMAGE_MAX_WIDTH = 1920; // Max width for images
const IMAGE_MAX_HEIGHT = 1080; // Max height for images
const IMAGE_QUALITY = 0.85; // JPEG/WebP quality (0.85 = 85%)
const VIDEO_MAX_WIDTH = 1280; // Max width for videos
const VIDEO_MAX_HEIGHT = 720; // Max height for videos
const VIDEO_BITRATE = 1000000; // 1 Mbps for videos
const VIDEO_FPS = 30; // Frames per second

/**
 * Compress an image file (JPEG, PNG, WebP, etc.)
 * @param {File|Blob} file - Image file to compress
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Maximum width (default: IMAGE_MAX_WIDTH)
 * @param {number} options.maxHeight - Maximum height (default: IMAGE_MAX_HEIGHT)
 * @param {number} options.quality - JPEG/WebP quality 0-1 (default: IMAGE_QUALITY)
 * @param {number} options.maxSize - Maximum file size in bytes (default: MAX_FILE_SIZE)
 * @returns {Promise<Blob>} Compressed image blob
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = IMAGE_MAX_WIDTH,
    maxHeight = IMAGE_MAX_HEIGHT,
    quality = IMAGE_QUALITY,
    maxSize = MAX_FILE_SIZE,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Calculate new dimensions
          let width = img.width;
          let height = img.height;

          // Scale down if needed
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }

          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          // Draw image
          ctx.drawImage(img, 0, 0, width, height);

          // Determine output format
          const isGif = file.type === 'image/gif';
          const isPng = file.type === 'image/png';
          const outputType = isPng ? 'image/png' : 'image/jpeg';
          const outputQuality = isPng ? undefined : quality;

          // Convert to blob with quality adjustment
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              // If still too large, reduce quality further
              if (blob.size > maxSize && outputQuality > 0.5) {
                // Recursively compress with lower quality
                const newQuality = Math.max(0.5, outputQuality - 0.1);
                compressImage(file, { ...options, quality: newQuality })
                  .then(resolve)
                  .catch(reject);
                return;
              }

              console.log(
                `✅ Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(blob.size / 1024 / 1024).toFixed(2)}MB`
              );
              resolve(blob);
            },
            outputType,
            outputQuality
          );
        } catch (error) {
          reject(new Error(`Image compression failed: ${error.message}`));
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compress a GIF file (converts to video for better compression, or reduces quality)
 * @param {File|Blob} file - GIF file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<Blob>} Compressed file (may be MP4 if conversion is better)
 */
export async function compressGIF(file, options = {}) {
  const { maxSize = MAX_FILE_SIZE } = options;

  // For GIFs, we have two options:
  // 1. Try to compress as image (reduces quality but keeps animation)
  // 2. Convert to MP4 (much better compression but loses animation)

  // First, try compressing as image
  try {
    const compressed = await compressImage(file, {
      ...options,
      maxWidth: 1280,
      maxHeight: 720,
      quality: 0.8,
    });

    // If compression is good enough, return it
    if (compressed.size <= maxSize) {
      return compressed;
    }

    // If still too large, try converting to video (MP4/WebM) for much better compression
    console.log('⚠️ GIF still too large after image compression, converting to video for better compression...');
    const videoBlob = await convertGIFToVideo(file, options);
    // Mark as video type so it can be played as video in the editor
    return new Blob([videoBlob], { type: videoBlob.type || 'video/webm' });
  } catch (error) {
    console.warn('GIF compression failed, trying video conversion:', error);
    try {
      // Fallback to video conversion
      const videoBlob = await convertGIFToVideo(file, options);
      return new Blob([videoBlob], { type: videoBlob.type || 'video/webm' });
    } catch (videoError) {
      // If video conversion also fails, return compressed image (even if still large)
      console.error('Both GIF compression and video conversion failed:', videoError);
      throw new Error('Failed to compress GIF. Please try a smaller GIF file or convert it to video manually.');
    }
  }
}

/**
 * Convert GIF to MP4 video for better compression
 * @param {File|Blob} file - GIF file to convert
 * @param {Object} options - Conversion options
 * @returns {Promise<Blob>} MP4 video blob
 */
async function convertGIFToVideo(file, options = {}) {
  const {
    maxWidth = VIDEO_MAX_WIDTH,
    maxHeight = VIDEO_MAX_HEIGHT,
    bitrate = VIDEO_BITRATE,
    fps = VIDEO_FPS,
  } = options;

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.preload = 'metadata';
    video.muted = true; // Muted for autoplay
    video.playsInline = true;

    let mediaRecorder;
    const chunks = [];

    video.onloadedmetadata = () => {
      try {
        // Calculate dimensions
        let width = video.videoWidth;
        let height = video.videoHeight;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        // Create canvas for video processing
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Get canvas stream
        const stream = canvas.captureStream(fps);

        // Set up MediaRecorder
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
          ? 'video/webm;codecs=vp8'
          : 'video/webm';

        const recorderOptions = {
          mimeType,
          videoBitsPerSecond: bitrate,
        };

        mediaRecorder = new MediaRecorder(stream, recorderOptions);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          URL.revokeObjectURL(url);
          stream.getTracks().forEach((track) => track.stop());
          video.pause();
          video.src = '';

          console.log(
            `✅ GIF converted to video: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(blob.size / 1024 / 1024).toFixed(2)}MB`
          );
          resolve(blob);
        };

        mediaRecorder.onerror = (error) => {
          URL.revokeObjectURL(url);
          stream.getTracks().forEach((track) => track.stop());
          video.pause();
          video.src = '';
          reject(new Error(`Video conversion failed: ${error}`));
        };

        // Draw video frames to canvas
        const drawFrame = () => {
          if (video.ended || video.paused) {
            return;
          }
          ctx.drawImage(video, 0, 0, width, height);
          requestAnimationFrame(drawFrame);
        };

        // Start recording when video plays
        video.onplaying = () => {
          drawFrame();
          mediaRecorder.start();
        };

        // Stop when video ends
        video.onended = () => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        };

        // Timeout safety
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            video.pause();
          }
        }, 60000); // 1 minute max

        // Start playback
        video.play().catch((error) => {
          reject(new Error(`Failed to play video: ${error.message}`));
        });
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(new Error(`GIF conversion failed: ${error.message}`));
      }
    };

    video.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load GIF for conversion'));
    };

    video.load();
  });
}

/**
 * Compress a video file
 * @param {File|Blob} file - Video file to compress
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Maximum width (default: VIDEO_MAX_WIDTH)
 * @param {number} options.maxHeight - Maximum height (default: VIDEO_MAX_HEIGHT)
 * @param {number} options.bitrate - Video bitrate in bps (default: VIDEO_BITRATE)
 * @param {number} options.fps - Frames per second (default: VIDEO_FPS)
 * @param {number} options.maxSize - Maximum file size in bytes (default: MAX_FILE_SIZE)
 * @returns {Promise<Blob>} Compressed video blob
 */
export async function compressVideo(file, options = {}) {
  const {
    maxWidth = VIDEO_MAX_WIDTH,
    maxHeight = VIDEO_MAX_HEIGHT,
    bitrate = VIDEO_BITRATE,
    fps = VIDEO_FPS,
    maxSize = MAX_FILE_SIZE,
  } = options;

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    let mediaRecorder;
    const chunks = [];
    let currentBitrate = bitrate;

    video.onloadedmetadata = () => {
      try {
        // Calculate dimensions
        let width = video.videoWidth;
        let height = video.videoHeight;
        const originalWidth = width;
        const originalHeight = height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Get canvas stream
        const stream = canvas.captureStream(fps);

        // Determine best codec
        const getMimeType = () => {
          if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
            return 'video/webm;codecs=vp9';
          }
          if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
            return 'video/webm;codecs=vp8';
          }
          if (MediaRecorder.isTypeSupported('video/mp4')) {
            return 'video/mp4';
          }
          return 'video/webm';
        };

        const mimeType = getMimeType();

        const startRecording = (bitrateToUse) => {
          try {
            mediaRecorder = new MediaRecorder(stream, {
              mimeType,
              videoBitsPerSecond: bitrateToUse,
            });

            mediaRecorder.ondataavailable = (event) => {
              if (event.data && event.data.size > 0) {
                chunks.push(event.data);
              }
            };

            mediaRecorder.onstop = () => {
              const blob = new Blob(chunks, { type: mimeType });
              URL.revokeObjectURL(url);
              stream.getTracks().forEach((track) => track.stop());
              video.pause();
              video.src = '';

              // If still too large, try with lower bitrate
              if (blob.size > maxSize && bitrateToUse > 500000) {
                console.log(
                  `⚠️ Video still too large (${(blob.size / 1024 / 1024).toFixed(2)}MB), reducing bitrate...`
                );
                chunks.length = 0;
                const newBitrate = Math.floor(bitrateToUse * 0.7);
                startRecording(newBitrate);
                return;
              }

              console.log(
                `✅ Video compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(blob.size / 1024 / 1024).toFixed(2)}MB`
              );
              resolve(blob);
            };

            mediaRecorder.onerror = (error) => {
              URL.revokeObjectURL(url);
              stream.getTracks().forEach((track) => track.stop());
              video.pause();
              video.src = '';
              reject(new Error(`Video compression failed: ${error}`));
            };

            // Draw frames
            const drawFrame = () => {
              if (video.ended || video.paused) {
                return;
              }
              ctx.drawImage(video, 0, 0, width, height);
              requestAnimationFrame(drawFrame);
            };

            video.onplaying = () => {
              drawFrame();
              mediaRecorder.start();
            };

            video.onended = () => {
              if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
              }
            };

            // Timeout safety (5 minutes max)
            setTimeout(() => {
              if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
                video.pause();
              }
            }, 300000);

            // Start playback
            video.currentTime = 0;
            video.play().catch((error) => {
              reject(new Error(`Failed to play video: ${error.message}`));
            });
          } catch (error) {
            reject(new Error(`Failed to create MediaRecorder: ${error.message}`));
          }
        };

        startRecording(currentBitrate);
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(new Error(`Video compression setup failed: ${error.message}`));
      }
    };

    video.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video for compression'));
    };

    video.load();
  });
}

/**
 * Automatically compress a file based on its type
 * @param {File|Blob} file - File to compress
 * @param {Object} options - Compression options
 * @returns {Promise<Blob>} Compressed file blob
 */
export async function compressFile(file, options = {}) {
  // Get file type and name - check options for file name if file doesn't have one
  let fileType = file.type || '';
  let fileName = file.name || options.fileName || '';
  
  // First check: If file name indicates JSON, skip compression immediately
  if (fileName.match(/\.(json|txt)$/i)) {
    console.log('⚠️ JSON/Text file detected by name - skipping compression (cannot compress text files)');
    return file; // Return as-is, no compression possible
  }
  
  // Second check: If file type is JSON/text, skip compression
  if (fileType === 'application/json' || 
      fileType.startsWith('text/') || 
      fileType === 'application/javascript') {
    console.log('⚠️ JSON/Text file detected by type - skipping compression (cannot compress text files)');
    return file; // Return as-is, no compression possible
  }
  
  // If file is small enough, return as-is
  if (file.size <= MAX_FILE_SIZE) {
    return file;
  }

  console.log(`🔄 Compressing file: ${fileName || 'unknown'} (type: ${fileType || 'unknown'}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);

  try {

    // Handle different file types
    if (fileType.startsWith('image/')) {
      if (fileType === 'image/gif') {
        return await compressGIF(file, options);
      } else {
        return await compressImage(file, options);
      }
    } else if (fileType.startsWith('video/')) {
      return await compressVideo(file, options);
    } else if (fileType.startsWith('audio/')) {
      // Audio files - try to compress as video or skip
      console.log('⚠️ Audio files cannot be compressed - skipping compression');
      return file;
    } else {
      // Unknown file type, try to detect by extension
      if (fileName.match(/\.(jpg|jpeg|png|gif|webp|bmp|ico)$/i)) {
        // Try as image
        console.log('🔍 Unknown type but image extension detected, trying image compression...');
        return await compressImage(file, options);
      } else if (fileName.match(/\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv)$/i)) {
        // Try as video
        console.log('🔍 Unknown type but video extension detected, trying video compression...');
        // Set video type for compression
        const videoFile = new Blob([file], { type: 'video/mp4' });
        return await compressVideo(videoFile, options);
      } else if (!fileType && !fileName) {
        // No type or name - might be a blob without metadata
        // Try to detect by checking if it's a valid image
        console.log('🔍 No file type or name, attempting to detect file type...');
        try {
          // Try to read as image first
          const img = new Image();
          const url = URL.createObjectURL(file);
          await new Promise((resolve, reject) => {
            img.onload = () => {
              URL.revokeObjectURL(url);
              resolve();
            };
            img.onerror = () => {
              URL.revokeObjectURL(url);
              reject(new Error('Not an image'));
            };
            img.src = url;
          });
          // If we get here, it's an image
          console.log('✅ Detected as image, compressing...');
          return await compressImage(file, options);
        } catch (e) {
          // Not an image, might be video
          try {
            const video = document.createElement('video');
            const url = URL.createObjectURL(file);
            await new Promise((resolve, reject) => {
              video.onloadedmetadata = () => {
                URL.revokeObjectURL(url);
                resolve();
              };
              video.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Not a video'));
              };
              video.src = url;
              video.load();
            });
            // If we get here, it's a video
            console.log('✅ Detected as video, compressing...');
            const videoFile = new Blob([file], { type: 'video/mp4' });
            return await compressVideo(videoFile, options);
          } catch (e2) {
            // Could not detect file type - return original file
            console.warn('⚠️ Could not detect file type - returning original file (may be too large for upload)');
            // Make sure to revoke URL if it exists
            try {
              if (url) URL.revokeObjectURL(url);
            } catch (e) {}
            return file; // Don't throw, just return original
          }
        }
      }
      
      // Can't compress unknown types - return original file instead of throwing
      console.warn(`⚠️ Unsupported file type for compression: ${fileType || 'unknown'} for file: ${fileName || 'unknown'}`);
      console.warn('⚠️ Returning original file - upload may fail if file is too large');
      return file; // Return original instead of throwing
    }
  } catch (error) {
    console.error('❌ Compression error:', error);
    // If compression fails for any reason, return original file instead of throwing
    // The upload will fail with a size error, which is better than crashing
    console.warn('⚠️ Compression failed, returning original file - upload may fail if file is too large');
    return file;
  }
}

/**
 * Check if a file needs compression
 * @param {File|Blob} file - File to check
 * @returns {boolean} True if file needs compression
 */
export function needsCompression(file) {
  return file.size > MAX_FILE_SIZE;
}

/**
 * Get compression settings for a file type
 * @param {string} fileType - MIME type of the file
 * @returns {Object} Compression settings
 */
export function getCompressionSettings(fileType) {
  if (fileType.startsWith('image/')) {
    if (fileType === 'image/gif') {
      return {
        maxWidth: 1280,
        maxHeight: 720,
        quality: 0.8,
      };
    }
    return {
      maxWidth: IMAGE_MAX_WIDTH,
      maxHeight: IMAGE_MAX_HEIGHT,
      quality: IMAGE_QUALITY,
    };
  } else if (fileType.startsWith('video/')) {
    return {
      maxWidth: VIDEO_MAX_WIDTH,
      maxHeight: VIDEO_MAX_HEIGHT,
      bitrate: VIDEO_BITRATE,
      fps: VIDEO_FPS,
    };
  }
  return {};
}

