/**
 * Grade Level Normalizer Utility
 * 
 * Normalizes grade level formats to match Supabase bucket structure
<<<<<<< HEAD
<<<<<<< HEAD
 * Handles various input formats: "5", "grade5", "Grade5", "grade=5", "5th", etc.
=======
 * Handles various input formats: "5", "grade5", "Grade5", "5th", etc.
>>>>>>> main
=======
 * Handles various input formats: "5", "grade5", "Grade5", "5th", etc.
>>>>>>> 70e495d041eb638c071ee1f10edfa15b1439b5fc
 */

/**
 * Normalize grade level to match bucket structure (Grade5, Grade6, etc.)
<<<<<<< HEAD
<<<<<<< HEAD
 * This is used for Supabase storage paths
=======
>>>>>>> main
=======
>>>>>>> 70e495d041eb638c071ee1f10edfa15b1439b5fc
 * @param {string|number} grade - Grade level in various formats
 * @returns {string|null} Normalized grade (Grade5, Grade6, etc.) or null if invalid
 */
export function normalizeGrade(grade) {
  if (!grade) return null;
  
  let normalized = String(grade);
  
<<<<<<< HEAD
<<<<<<< HEAD
  // Handle Firebase format: "grade=5" or "grade=6"
  if (normalized.includes('=')) {
    const parts = normalized.split('=');
    if (parts.length === 2 && parts[0].toLowerCase().trim() === 'grade') {
      normalized = parts[1].trim();
    }
  }
  
=======
>>>>>>> main
=======
>>>>>>> 70e495d041eb638c071ee1f10edfa15b1439b5fc
  // Remove common suffixes like "th", "st", "nd", "rd"
  normalized = normalized.replace(/(\d+)(th|st|nd|rd)/i, '$1');
  
  // Remove "grade" prefix if present (case-insensitive)
  if (/^grade/i.test(normalized)) {
    normalized = normalized.replace(/^grade/i, '');
  }
  
  // Extract just the number if there's text before it
  const numberMatch = normalized.match(/(\d+)/);
  if (numberMatch) {
    normalized = numberMatch[1];
  }
  
  // Validate it's a number
  const gradeNum = parseInt(normalized, 10);
  if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
    console.warn(`⚠️ Invalid grade level: "${grade}"`);
    return null;
  }
  
<<<<<<< HEAD
<<<<<<< HEAD
  // Format as "Grade5", "Grade6", etc. (for Supabase storage)
=======
  // Format as "Grade5", "Grade6", etc.
>>>>>>> main
=======
  // Format as "Grade5", "Grade6", etc.
>>>>>>> 70e495d041eb638c071ee1f10edfa15b1439b5fc
  return `Grade${gradeNum}`;
}

/**
<<<<<<< HEAD
<<<<<<< HEAD
 * Normalize grade level to Firebase format (grade=5, grade=6, etc.)
 * This is the format used in Firebase database node names
 * @param {string|number} grade - Grade level in various formats
 * @returns {string|null} Normalized grade (grade=5, grade=6, etc.) or null if invalid
 */
export function normalizeGradeForFirebase(grade) {
  if (!grade) return null;
  
  let normalized = String(grade);
  
  // Handle Firebase format: "grade=5" or "grade=6" (already in correct format)
  if (normalized.includes('=')) {
    const parts = normalized.split('=');
    if (parts.length === 2 && parts[0].toLowerCase().trim() === 'grade') {
      const gradeNum = parseInt(parts[1].trim(), 10);
      if (!isNaN(gradeNum) && gradeNum >= 1 && gradeNum <= 12) {
        return `grade=${gradeNum}`;
      }
    }
  }
  
  // Remove common suffixes like "th", "st", "nd", "rd"
  normalized = normalized.replace(/(\d+)(th|st|nd|rd)/i, '$1');
  
  // Remove "grade" prefix if present (case-insensitive)
  if (/^grade/i.test(normalized)) {
    normalized = normalized.replace(/^grade/i, '');
  }
  
  // Extract just the number if there's text before it
  const numberMatch = normalized.match(/(\d+)/);
  if (numberMatch) {
    normalized = numberMatch[1];
  }
  
  // Validate it's a number
  const gradeNum = parseInt(normalized, 10);
  if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
    console.warn(`⚠️ Invalid grade level: "${grade}"`);
    return null;
  }
  
  // Format as "grade=5", "grade=6", etc. (for Firebase)
  return `grade=${gradeNum}`;
}

/**
=======
>>>>>>> main
=======
>>>>>>> 70e495d041eb638c071ee1f10edfa15b1439b5fc
 * Check if grade level is valid
 * @param {string|number} grade - Grade level to validate
 * @returns {boolean} True if valid
 */
export function isValidGrade(grade) {
  return normalizeGrade(grade) !== null;
}

/**
 * Get quarter folder name from quarter number
 * @param {string|number} quarter - Quarter number (1-4)
 * @returns {string} Quarter folder name (Quarter1, Quarter2, etc.)
 */
export function normalizeQuarter(quarter) {
  const q = parseInt(String(quarter), 10);
  if (isNaN(q) || q < 1 || q > 4) {
    console.warn(`⚠️ Invalid quarter: "${quarter}", defaulting to Quarter1`);
    return 'Quarter1';
  }
  return `Quarter${q}`;
}

