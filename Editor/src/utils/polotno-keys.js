// Polotno API Key Manager
// Manages multiple Polotno API keys with fallback support

// Primary key (original)
export const PRIMARY_KEY = 'nFA5H9elEytDyPyvKL7T';

// Secondary key (new key to use in conjunction)
export const SECONDARY_KEY = 'KZiuYryOVcs9sz8q8A1l';

// Video key (for Pexels videos)
export const VIDEO_KEY = 'XWaPcWabeqo2TJSU2Ob5';

// Get the primary key for store creation
export const getStoreKey = () => PRIMARY_KEY;

// Get the primary key for API calls (can add fallback logic here)
export const getAPIKey = () => PRIMARY_KEY;

// Get secondary key (for use as backup or specific features)
export const getSecondaryKey = () => SECONDARY_KEY;

// Get video key
export const getVideoKey = () => VIDEO_KEY;

// Get all keys as an array (useful for fallback scenarios)
export const getAllKeys = () => [PRIMARY_KEY, SECONDARY_KEY, VIDEO_KEY];

// Key rotation or fallback function (can be enhanced later)
export const getKeyWithFallback = (attempt = 0) => {
  const keys = [PRIMARY_KEY, SECONDARY_KEY];
  return keys[attempt % keys.length] || PRIMARY_KEY;
};

