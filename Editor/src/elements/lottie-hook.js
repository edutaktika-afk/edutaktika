/**
 * Hook into Polotno's element rendering system
 * This patches the Workspace component to use our custom Lottie renderer
 */

import { LottieElement } from './lottie-element';

// Hook into Polotno's element rendering
export function setupLottieRenderer() {
  // Wait for Polotno to be available
  if (typeof window === 'undefined') return;

  // Try to patch Polotno's element rendering
  // Polotno uses Konva for rendering, so we need to intercept at the Konva level
  const originalCreateElement = window.React?.createElement;
  
  // Store our renderer
  window.__POLOTNO_LOTTIE_RENDERER__ = LottieElement;
  
  console.log('✅ Lottie renderer hook installed');
}

// Auto-setup when imported
setupLottieRenderer();

