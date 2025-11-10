/**
 * Custom Polotno Animations
 * Similar to Canva animations: Wiggle, Blur, Pan, Rise
 * All animations support customizable settings
 */

import { registerAnimation } from 'polotno/utils/animations';

// Helper function to ease animations
const easeInOut = (t) => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

const easeOut = (t) => {
  return t * (2 - t);
};

const easeIn = (t) => {
  return t * t;
};

/**
 * WIGGLE Animation
 * Makes element wiggle/shake with customizable intensity and frequency
 */
registerAnimation('wiggle', ({ dTime, element, animation }) => {
  const delta = dTime / animation.duration;
  
  // Get custom settings or use defaults
  const intensity = animation.data?.intensity || 5; // pixels
  const frequency = animation.data?.frequency || 10; // oscillations per second
  const direction = animation.data?.direction || 'horizontal'; // 'horizontal', 'vertical', 'both'
  
  // Calculate wiggle offset using sine wave
  const wiggleOffset = Math.sin(delta * Math.PI * 2 * frequency) * intensity;
  
  if (animation.type === 'enter') {
    // Wiggle in
    const progress = easeOut(delta);
    const baseX = element.x || 0;
    const baseY = element.y || 0;
    
    if (direction === 'horizontal' || direction === 'both') {
      return {
        x: baseX + (wiggleOffset * progress),
      };
    } else if (direction === 'vertical' || direction === 'both') {
      return {
        y: baseY + (wiggleOffset * progress),
      };
    } else {
      return {
        x: baseX + (wiggleOffset * progress),
        y: baseY + (wiggleOffset * progress),
      };
    }
  } else {
    // Wiggle out
    const progress = 1 - easeIn(delta);
    const baseX = element.x || 0;
    const baseY = element.y || 0;
    
    if (direction === 'horizontal' || direction === 'both') {
      return {
        x: baseX + (wiggleOffset * progress),
      };
    } else if (direction === 'vertical' || direction === 'both') {
      return {
        y: baseY + (wiggleOffset * progress),
      };
    } else {
      return {
        x: baseX + (wiggleOffset * progress),
        y: baseY + (wiggleOffset * progress),
      };
    }
  }
});

/**
 * BLUR Animation
 * Applies blur effect with customizable intensity
 */
registerAnimation('blur', ({ dTime, element, animation }) => {
  const delta = dTime / animation.duration;
  
  // Get custom settings or use defaults
  const maxBlur = animation.data?.intensity || 10; // pixels
  const blurType = animation.data?.type || 'gaussian'; // 'gaussian', 'motion'
  
  if (animation.type === 'enter') {
    // Blur in (start blurred, end clear)
    const progress = easeOut(delta);
    const blurAmount = maxBlur * (1 - progress);
    
    if (blurType === 'motion') {
      // Motion blur effect
      return {
        blur: blurAmount,
        // Add slight movement for motion blur effect
        x: (element.x || 0) + (blurAmount * 0.1 * (1 - progress)),
      };
    } else {
      // Gaussian blur
      return {
        blur: blurAmount,
      };
    }
  } else {
    // Blur out (start clear, end blurred)
    const progress = easeIn(delta);
    const blurAmount = maxBlur * progress;
    
    if (blurType === 'motion') {
      return {
        blur: blurAmount,
        x: (element.x || 0) + (blurAmount * 0.1 * progress),
      };
    } else {
      return {
        blur: blurAmount,
      };
    }
  }
});

/**
 * PAN Animation
 * Moves element across the canvas with customizable direction and distance
 */
registerAnimation('pan', ({ dTime, element, animation }) => {
  const delta = dTime / animation.duration;
  
  // Get custom settings or use defaults
  const distance = animation.data?.distance || 200; // pixels
  const direction = animation.data?.direction || 'right'; // 'left', 'right', 'up', 'down', 'diagonal'
  const angle = animation.data?.angle || 0; // degrees for custom direction
  
  // Calculate movement based on direction
  let deltaX = 0;
  let deltaY = 0;
  
  if (direction === 'right') {
    deltaX = distance;
  } else if (direction === 'left') {
    deltaX = -distance;
  } else if (direction === 'up') {
    deltaY = -distance;
  } else if (direction === 'down') {
    deltaY = distance;
  } else if (direction === 'diagonal') {
    const rad = (angle * Math.PI) / 180;
    deltaX = distance * Math.cos(rad);
    deltaY = distance * Math.sin(rad);
  } else if (direction === 'custom') {
    const rad = (angle * Math.PI) / 180;
    deltaX = distance * Math.cos(rad);
    deltaY = distance * Math.sin(rad);
  }
  
  if (animation.type === 'enter') {
    // Pan in (start from offset position, move to original)
    const progress = easeOut(delta);
    const baseX = element.x || 0;
    const baseY = element.y || 0;
    
    return {
      x: baseX - (deltaX * (1 - progress)),
      y: baseY - (deltaY * (1 - progress)),
    };
  } else {
    // Pan out (start from original, move to offset position)
    const progress = easeIn(delta);
    const baseX = element.x || 0;
    const baseY = element.y || 0;
    
    return {
      x: baseX + (deltaX * progress),
      y: baseY + (deltaY * progress),
    };
  }
});

/**
 * RISE Animation
 * Element rises up from below with customizable height and bounce
 */
registerAnimation('rise', ({ dTime, element, animation }) => {
  const delta = dTime / animation.duration;
  
  // Get custom settings or use defaults
  const height = animation.data?.height || 100; // pixels to rise
  const bounce = animation.data?.bounce || false; // add bounce effect
  const fade = animation.data?.fade !== false; // fade in/out (default true)
  
  if (animation.type === 'enter') {
    // Rise in (start below, rise up)
    let progress;
    
    if (bounce) {
      // Bounce effect using easeOutBounce approximation
      progress = delta < 0.7 
        ? easeOut(delta / 0.7) 
        : 1 - Math.pow((delta - 0.7) / 0.3, 2);
    } else {
      progress = easeOut(delta);
    }
    
    const baseY = element.y || 0;
    const baseOpacity = element.opacity || 1;
    
    const result = {
      y: baseY - (height * (1 - progress)),
    };
    
    if (fade) {
      result.opacity = baseOpacity * progress;
    }
    
    return result;
  } else {
    // Rise out (start at position, rise up and fade)
    const progress = easeIn(delta);
    const baseY = element.y || 0;
    const baseOpacity = element.opacity || 1;
    
    const result = {
      y: baseY - (height * progress),
    };
    
    if (fade) {
      result.opacity = baseOpacity * (1 - progress);
    }
    
    return result;
  }
});

/**
 * FADE Animation (Enhanced version with customizable settings)
 */
registerAnimation('fade', ({ dTime, element, animation }) => {
  const delta = dTime / animation.duration;
  
  // Get custom settings
  const startOpacity = animation.data?.startOpacity !== undefined ? animation.data.startOpacity : 0;
  const endOpacity = animation.data?.endOpacity !== undefined ? animation.data.endOpacity : (element.opacity || 1);
  
  if (animation.type === 'enter') {
    const progress = easeOut(delta);
    return {
      opacity: startOpacity + (endOpacity - startOpacity) * progress,
    };
  } else {
    const progress = easeIn(delta);
    return {
      opacity: endOpacity - (endOpacity - startOpacity) * progress,
    };
  }
});

/**
 * ZOOM Animation (Bonus - similar to Canva)
 * Scales element with customizable scale factor
 */
registerAnimation('zoom', ({ dTime, element, animation }) => {
  const delta = dTime / animation.duration;
  
  // Get custom settings
  const scaleFrom = animation.data?.scaleFrom || 0;
  const scaleTo = animation.data?.scaleTo || 1;
  const fade = animation.data?.fade !== false;
  
  if (animation.type === 'enter') {
    const progress = easeOut(delta);
    const scale = scaleFrom + (scaleTo - scaleFrom) * progress;
    const baseOpacity = element.opacity || 1;
    
    const result = {
      scaleX: scale,
      scaleY: scale,
    };
    
    if (fade) {
      result.opacity = baseOpacity * progress;
    }
    
    return result;
  } else {
    const progress = easeIn(delta);
    const scale = scaleTo - (scaleTo - scaleFrom) * progress;
    const baseOpacity = element.opacity || 1;
    
    const result = {
      scaleX: scale,
      scaleY: scale,
    };
    
    if (fade) {
      result.opacity = baseOpacity * (1 - progress);
    }
    
    return result;
  }
});

/**
 * SPIN Animation (Bonus)
 * Rotates element with customizable rotation amount
 */
registerAnimation('spin', ({ dTime, element, animation }) => {
  const delta = dTime / animation.duration;
  
  // Get custom settings
  const rotation = animation.data?.rotation || 360; // degrees
  const direction = animation.data?.direction || 'clockwise'; // 'clockwise', 'counterclockwise'
  
  const rotationAmount = direction === 'counterclockwise' ? -rotation : rotation;
  
  if (animation.type === 'enter') {
    const progress = easeOut(delta);
    return {
      rotation: rotationAmount * (1 - progress),
    };
  } else {
    const progress = easeIn(delta);
    return {
      rotation: rotationAmount * progress,
    };
  }
});

// Export animation metadata for UI
export const ANIMATION_METADATA = {
  wiggle: {
    name: 'Wiggle',
    description: 'Shake or wiggle the element',
    settings: [
      { key: 'intensity', label: 'Intensity', type: 'number', min: 1, max: 50, default: 5, unit: 'px' },
      { key: 'frequency', label: 'Frequency', type: 'number', min: 1, max: 20, default: 10, unit: 'Hz' },
      { key: 'direction', label: 'Direction', type: 'select', options: ['horizontal', 'vertical', 'both'], default: 'horizontal' },
    ],
  },
  blur: {
    name: 'Blur',
    description: 'Apply blur effect to the element',
    settings: [
      { key: 'intensity', label: 'Blur Amount', type: 'number', min: 0, max: 50, default: 10, unit: 'px' },
      { key: 'type', label: 'Blur Type', type: 'select', options: ['gaussian', 'motion'], default: 'gaussian' },
    ],
  },
  pan: {
    name: 'Pan',
    description: 'Move element across the canvas',
    settings: [
      { key: 'distance', label: 'Distance', type: 'number', min: 0, max: 1000, default: 200, unit: 'px' },
      { key: 'direction', label: 'Direction', type: 'select', options: ['left', 'right', 'up', 'down', 'diagonal', 'custom'], default: 'right' },
      { key: 'angle', label: 'Angle (for diagonal/custom)', type: 'number', min: 0, max: 360, default: 0, unit: '°' },
    ],
  },
  rise: {
    name: 'Rise',
    description: 'Element rises from below',
    settings: [
      { key: 'height', label: 'Rise Height', type: 'number', min: 0, max: 500, default: 100, unit: 'px' },
      { key: 'bounce', label: 'Bounce Effect', type: 'boolean', default: false },
      { key: 'fade', label: 'Fade In/Out', type: 'boolean', default: true },
    ],
  },
  fade: {
    name: 'Fade',
    description: 'Fade in or out',
    settings: [
      { key: 'startOpacity', label: 'Start Opacity', type: 'number', min: 0, max: 1, default: 0, step: 0.1 },
      { key: 'endOpacity', label: 'End Opacity', type: 'number', min: 0, max: 1, default: 1, step: 0.1 },
    ],
  },
  zoom: {
    name: 'Zoom',
    description: 'Scale element in or out',
    settings: [
      { key: 'scaleFrom', label: 'Scale From', type: 'number', min: 0, max: 2, default: 0, step: 0.1 },
      { key: 'scaleTo', label: 'Scale To', type: 'number', min: 0, max: 2, default: 1, step: 0.1 },
      { key: 'fade', label: 'Fade In/Out', type: 'boolean', default: true },
    ],
  },
  spin: {
    name: 'Spin',
    description: 'Rotate the element',
    settings: [
      { key: 'rotation', label: 'Rotation Amount', type: 'number', min: 0, max: 720, default: 360, unit: '°' },
      { key: 'direction', label: 'Direction', type: 'select', options: ['clockwise', 'counterclockwise'], default: 'clockwise' },
    ],
  },
};

console.log('✅ Custom Polotno animations registered:', Object.keys(ANIMATION_METADATA).join(', '));

