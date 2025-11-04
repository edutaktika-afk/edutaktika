// Polotno API Key Verification Utility
// Use this to verify your key is being loaded correctly in production
// Call this from browser console: window.verifyPolotnoKey()

import { getStoreKey, getKeyDebugInfo } from './polotno-keys';

export const verifyPolotnoKey = () => {
  const envVar = import.meta.env.VITE_POLOTNO_API_KEY;
  const hasEnvVar = !!envVar;
  const envVarLength = envVar ? envVar.length : 0;
  
  // Get the key that's actually being used
  const actualKey = getStoreKey();
  const actualKeyLength = actualKey ? actualKey.length : 0;
  
  // Check if key has pipe character (should not)
  const hasPipe = actualKey && actualKey.startsWith('|');
  
  // Get debug info
  const debugInfo = getKeyDebugInfo();
  
  const report = {
    // Environment variable status
    hasEnvironmentVariable: hasEnvVar,
    envVarLength: envVarLength,
    envVarPreview: envVar ? `${envVar.substring(0, 2)}...${envVar.substring(envVarLength - 2)}` : 'N/A',
    
    // Actual key being used
    actualKeyLength: actualKeyLength,
    actualKeyPreview: actualKey ? `${actualKey.substring(0, 2)}...${actualKey.substring(actualKeyLength - 2)}` : 'N/A',
    
    // Validation
    usingEnvVar: hasEnvVar,
    hasPipeCharacter: hasPipe,
    keyLengthValid: actualKeyLength === 20, // Polotno keys are typically 20 chars
    
    // Status
    status: hasEnvVar ? '✅ Using environment variable' : '⚠️ Using fallback key',
    recommendation: hasEnvVar 
      ? 'Key is configured correctly via environment variable'
      : 'Set VITE_POLOTNO_API_KEY in Netlify Dashboard and redeploy'
  };
  
  console.log('🔑 Polotno API Key Verification Report:');
  console.table(report);
  console.log('📊 Debug Info:', debugInfo);
  
  if (hasPipe) {
    console.warn('⚠️ Warning: Key contains pipe character "|" - this should be removed. Polotno SDK adds it automatically.');
  }
  
  if (!hasEnvVar) {
    console.warn('⚠️ Warning: Environment variable not found. Using fallback key. Set VITE_POLOTNO_API_KEY in Netlify Dashboard.');
  }
  
  return report;
};

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.verifyPolotnoKey = verifyPolotnoKey;
}

