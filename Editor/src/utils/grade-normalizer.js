/**
 * Grade Level Normalizer Utility
 * 
 * Normalizes grade level formats to match Supabase bucket structure
 * Handles various input formats: "5", "grade5", "Grade5", "5th", etc.
 */

/**
 * Normalize grade level to match bucket structure (Grade5, Grade6, etc.)
 * @param {string|number} grade - Grade level in various formats
 * @returns {string|null} Normalized grade (Grade5, Grade6, etc.) or null if invalid
 */
export function normalizeGrade(grade) {
  if (!grade) return null;
  
  let normalized = String(grade);
  
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
  
  // Format as "Grade5", "Grade6", etc.
  return `Grade${gradeNum}`;
}

/**
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

