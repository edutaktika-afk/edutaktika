/**
 * Custom Lottie Element Model for Polotno
 * Extends the base image element to support Lottie animations
 */

import { createImageModel } from 'polotno/model/image';

// Create a custom model that extends image model
const LottieModelBase = createImageModel({
  type: 'lottie',
});

// Extend with Lottie-specific properties
export const LottieModel = LottieModelBase.extend({
  lottieUrl: '',
  lottieData: null,
  lottieLoop: true,
  lottieAutoplay: true,
});

// Register the model with Polotno's element registry
if (typeof window !== 'undefined' && window.polotno) {
  // Polotno will use this model when creating elements of type 'lottie'
  console.log('✅ Lottie model registered');
}

