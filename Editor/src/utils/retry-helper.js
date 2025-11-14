/**
 * Retry Helper Utility
 * 
 * Provides retry logic with exponential backoff for failed operations
 */

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry (must return a Promise)
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.initialDelay - Initial delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 10000)
 * @param {number} options.multiplier - Exponential backoff multiplier (default: 2)
 * @param {Function} options.shouldRetry - Function to determine if error should be retried (default: retry all)
 * @param {Function} options.onRetry - Callback called on each retry attempt
 * @returns {Promise} Result of the function
 */
export async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    multiplier = 2,
    shouldRetry = () => true,
    onRetry = null
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry this error
      if (!shouldRetry(error, attempt)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(error, attempt + 1, delay);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));

      // Calculate next delay (exponential backoff with max cap)
      delay = Math.min(delay * multiplier, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Check if an error is retryable
 * @param {Error} error - Error to check
 * @returns {boolean} True if error should be retried
 */
export function isRetryableError(error) {
  // Network errors
  if (!navigator.onLine) {
    return true; // Retry when connection is back
  }

  // HTTP errors that are retryable
  if (error.statusCode || error.status) {
    const status = error.statusCode || error.status;
    // Retry on: 429 (rate limit), 500-599 (server errors), 408 (timeout)
    return status === 429 || status === 408 || (status >= 500 && status < 600);
  }

  // Network-related error messages
  if (error.message) {
    const msg = error.message.toLowerCase();
    return msg.includes('network') || 
           msg.includes('timeout') || 
           msg.includes('fetch') ||
           msg.includes('connection') ||
           msg.includes('failed to fetch');
  }

  // Default: retry on unknown errors
  return true;
}

/**
 * Retry function specifically for Supabase operations
 */
export async function retrySupabaseOperation(fn, context = 'operation') {
  return retryWithBackoff(fn, {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 5000,
    multiplier: 2,
    shouldRetry: (error, attempt) => {
      // Don't retry on certain Supabase errors
      if (error.message?.includes('not found') || 
          error.message?.includes('permission denied') ||
          error.message?.includes('already exists')) {
        return false;
      }
      return isRetryableError(error);
    },
    onRetry: (error, attempt, delay) => {
      console.warn(`⚠️ Retrying ${context} (attempt ${attempt}/${3}):`, error.message);
      console.log(`⏳ Waiting ${delay}ms before retry...`);
    }
  });
}

