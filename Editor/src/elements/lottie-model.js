/**
 * Custom Lottie Element Model for Polotno
 * Extends the base image element to support Lottie animations
 */

import { createImageModel } from 'polotno/model/image';

export const LottieModel = createImageModel({
  type: 'lottie',
  lottieUrl: '',
  lottieData: null,
  lottieLoop: true,
  lottieAutoplay: true,
});

