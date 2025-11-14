// Polotno API Key Manager
// Manages multiple Polotno API keys with fallback support
// Supports environment variables for production deployment

// Primary key - use the active key as default
const PRIMARY_KEY = 'KZiuYryOVcs9sz8q8A1l';

// Secondary key (backup/old key)
export const SECONDARY_KEY = 'nFA5H9elEytDyPyvKL7T';

// Video key (for Pexels videos)
export const VIDEO_KEY = 'XWaPcWabeqo2TJSU2Ob5';

// Get the Polotno API key from environment variable or fallback to hardcoded key
// Environment variable: VITE_POLOTNO_API_KEY (set in Netlify)
// Note: The key should NOT include the pipe character "|" - that's added by Polotno SDK internally
const getPolotnoKey = () => {
  // Check for environment variable first (for Netlify production)
  const envKey = import.meta.env.VITE_POLOTNO_API_KEY;
  
  if (envKey) {
    // Remove any leading pipe character if present (user might have included it)
    const cleanKey = envKey.trim().replace(/^\|/, '');
    console.log('🔑 Using Polotno API key from environment variable');
    return cleanKey;
  }
  
  // Fallback to hardcoded primary key
  console.log('🔑 Using Polotno API key from code (fallback)');
  return PRIMARY_KEY;
};

// Get the primary key for store creation
// This is the key that Polotno SDK uses to identify your license
export const getStoreKey = () => {
  return getPolotnoKey();
};

// Get the primary key for API calls (can add fallback logic here)
export const getAPIKey = () => {
  return getPolotnoKey();
};

// Get secondary key (for use as backup or specific features)
export const getSecondaryKey = () => SECONDARY_KEY;

// Get video key
export const getVideoKey = () => VIDEO_KEY;

// Get all keys as an array (useful for fallback scenarios)
export const getAllKeys = () => [getPolotnoKey(), SECONDARY_KEY, VIDEO_KEY];

// Key rotation or fallback function (can be enhanced later)
export const getKeyWithFallback = (attempt = 0) => {
  const keys = [getPolotnoKey(), SECONDARY_KEY];
  return keys[attempt % keys.length] || getPolotnoKey();
};

// Debug function to verify key is being used (safe - only shows first/last chars)
export const getKeyDebugInfo = () => {
  const key = getPolotnoKey();
  const source = import.meta.env.VITE_POLOTNO_API_KEY ? 'environment variable' : 'hardcoded fallback';
  return {
    source,
    keyLength: key.length,
    keyPreview: key.length > 4 ? `${key.substring(0, 2)}...${key.substring(key.length - 2)}` : '****',
    hasEnvVar: !!import.meta.env.VITE_POLOTNO_API_KEY
  };
};

