/**
 * Centralized Logging Utility
 * 
 * Provides consistent logging across the application
 * Disables debug logs in production for better performance
 */

const isDev = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isProduction = !isDev;

// Log levels
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// Current log level (can be adjusted)
let currentLogLevel = isDev ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;

/**
 * Set log level
 * @param {number} level - Log level (0=DEBUG, 1=INFO, 2=WARN, 3=ERROR)
 */
export function setLogLevel(level) {
  currentLogLevel = level;
}

/**
 * Logger object with different log levels
 */
export const logger = {
  /**
   * Debug logs - only in development
   */
  debug: (...args) => {
    if (isDev && currentLogLevel <= LOG_LEVELS.DEBUG) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Info logs - important information
   */
  info: (...args) => {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Warning logs - non-critical issues
   */
  warn: (...args) => {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
      console.warn('[WARN]', ...args);
    }
  },

  /**
   * Error logs - critical errors
   */
  error: (...args) => {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
      console.error('[ERROR]', ...args);
      // In production, could also send to error tracking service
    }
  },

  /**
   * Success logs - positive feedback
   */
  success: (...args) => {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      console.log('✅', ...args);
    }
  },

  /**
   * Group logs together
   */
  group: (label, fn) => {
    if (isDev) {
      console.group(label);
      fn();
      console.groupEnd();
    } else {
      fn();
    }
  }
};

export default logger;

