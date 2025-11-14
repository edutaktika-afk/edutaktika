/**
 * Application Constants
 * 
 * Centralized constants to avoid magic numbers and improve maintainability
 */

/**
 * Timing constants (in milliseconds)
 */
export const TIMING = {
  // Loading overlay removal delay (allows window to open)
  OVERLAY_REMOVAL_DELAY: 500,
  
  // Debounce delays
  DEBOUNCE_SAVE: 1000,        // Auto-save debounce
  DEBOUNCE_SEARCH: 300,       // Search input debounce
  DEBOUNCE_RESIZE: 250,       // Window resize debounce
  DEBOUNCE_AUTOSAVE: 2000,    // Canvas auto-save debounce
  
  // Retry configuration
  RETRY_INITIAL_DELAY: 1000,  // Initial retry delay
  RETRY_MAX_DELAY: 5000,      // Maximum retry delay
  RETRY_MULTIPLIER: 2,        // Exponential backoff multiplier
  
  // Cache TTL
  CACHE_TTL: 24 * 60 * 60 * 1000, // 24 hours
  
  // Connection check interval
  CONNECTION_CHECK_INTERVAL: 5000, // 5 seconds
};

/**
 * Size limits (in bytes)
 */
export const LIMITS = {
  // File size limits
  FILE_LIST_MAX: 100,              // Max files to list at once
  SESSION_STORAGE_WARN: 5 * 1024 * 1024,  // 5MB - warn if exceeding
  SESSION_STORAGE_MAX: 10 * 1024 * 1024,  // 10MB - typical browser limit
  CACHE_SIZE_MB: 100,              // IndexedDB cache size limit
  
  // Upload limits
  CHUNK_SIZE: 45 * 1024 * 1024,    // 45MB chunk size
  LARGE_FILE_THRESHOLD: 50 * 1024 * 1024, // 50MB threshold
  
  // Retry limits
  RETRY_MAX_ATTEMPTS: 3,           // Maximum retry attempts
};

/**
 * Grade levels
 */
export const GRADES = {
  MIN: 1,
  MAX: 12,
  VALID: Array.from({ length: 12 }, (_, i) => i + 1)
};

/**
 * Quarters
 */
export const QUARTERS = {
  MIN: 1,
  MAX: 4,
  VALID: [1, 2, 3, 4]
};

/**
 * Subjects
 */
export const SUBJECTS = {
  MATH: 'MATH',
  ENGLISH: 'ENGLISH',
  SCIENCE: 'SCIENCE',
  VALID: ['MATH', 'ENGLISH', 'SCIENCE', 'math', 'english', 'science', 'subject_math', 'subject_english', 'subject_science']
};

/**
 * Error messages
 */
export const ERRORS = {
  GRADE_REQUIRED: 'Grade level is required to save lessons. This prevents cross-grade contamination.',
  QUARTER_REQUIRED: 'Quarter is required to save lessons.',
  SUBJECT_REQUIRED: 'Subject is required to save lessons.',
  DESIGN_NAME_REQUIRED: 'Design name is required.',
  FILE_TOO_LARGE: 'File is too large. Please compress the file or upgrade your plan.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UPLOAD_FAILED: 'Upload failed. Please try again.',
  DOWNLOAD_FAILED: 'Download failed. Please try again.',
};

/**
 * Success messages
 */
export const MESSAGES = {
  SAVE_SUCCESS: 'Design saved successfully!',
  UPLOAD_SUCCESS: 'Upload completed successfully!',
  DOWNLOAD_SUCCESS: 'Download completed successfully!',
  DELETE_SUCCESS: 'Design deleted successfully!',
};

