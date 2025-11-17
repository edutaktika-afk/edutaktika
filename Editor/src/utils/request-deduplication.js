/**
 * Request Deduplication Utility
 * 
 * Prevents duplicate requests from being sent when a user clicks rapidly
 * on save/upload buttons. Returns the same promise for concurrent requests
 * with the same key.
 */

const pendingRequests = new Map();

/**
 * Deduplicate a request by key
 * @param {string} key - Unique key for this request (e.g., design ID or save operation)
 * @param {Function} requestFn - Function that returns a Promise
 * @returns {Promise} The promise for the request (reused if already pending)
 */
export function deduplicateRequest(key, requestFn) {
  // If a request with this key is already pending, return the existing promise
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }
  
  // Create a new promise for this request
  const promise = requestFn()
    .then((result) => {
      // Remove from pending requests on success
      pendingRequests.delete(key);
      return result;
    })
    .catch((error) => {
      // Remove from pending requests on error
      pendingRequests.delete(key);
      throw error;
    });
  
  // Store the promise
  pendingRequests.set(key, promise);
  
  return promise;
}

/**
 * Clear a specific pending request (useful for cancellation)
 * @param {string} key - Key of the request to clear
 */
export function clearPendingRequest(key) {
  pendingRequests.delete(key);
}

/**
 * Clear all pending requests (useful for cleanup)
 */
export function clearAllPendingRequests() {
  pendingRequests.clear();
}

/**
 * Get the number of pending requests
 * @returns {number} Number of pending requests
 */
export function getPendingRequestCount() {
  return pendingRequests.size;
}

