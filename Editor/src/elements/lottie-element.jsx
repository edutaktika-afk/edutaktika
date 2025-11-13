/**
 * Custom Lottie Element for Polotno
 * Renders animated Lottie files using Konva Image that updates on each frame
 */

import React, { useEffect, useRef, useState } from 'react';
import { Image } from 'react-konva';
import { observer } from 'mobx-react-lite';

export const LottieElement = observer(({ element, store }) => {
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (!element.lottieUrl && !element.lottieData) {
      return;
    }

    // Create off-screen canvas for Lottie rendering
    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d');

    // Dynamically import lottie-web
    import('lottie-web').then((lottie) => {
      const animationData = element.lottieData || null;
      const animationPath = element.lottieUrl || null;

      if (!animationData && !animationPath) {
        console.warn('No Lottie data or URL provided');
        return;
      }

      const animConfig = {
        renderer: 'canvas',
        loop: element.lottieLoop !== false,
        autoplay: element.lottieAutoplay !== false,
        rendererSettings: {
          context: ctx,
          clearCanvas: true,
          progressiveLoad: true,
        },
      };

      if (animationData) {
        animConfig.animationData = animationData;
      } else if (animationPath) {
        animConfig.path = animationPath;
      }

      const anim = lottie.default.loadAnimation(animConfig);
      animRef.current = anim;

      // Set canvas size when animation config is ready
      anim.addEventListener('config_ready', () => {
        const { w, h } = anim.renderer.transformCanvas;
        canvas.width = w;
        canvas.height = h;
        
        // Update element dimensions if not set
        if (!element.width || !element.height) {
          element.set({ width: w, height: h });
        }
        
        // Create initial image from canvas
        const img = new window.Image();
        img.onload = () => {
          setImage(img);
          imageRef.current?.getLayer()?.batchDraw();
        };
        img.src = canvas.toDataURL();
      });

      // Update Konva image on each frame
      anim.addEventListener('enterFrame', () => {
        if (canvas && imageRef.current) {
          // Update the image source from canvas
          const img = new window.Image();
          img.onload = () => {
            setImage(img);
            imageRef.current?.getLayer()?.batchDraw();
          };
          img.src = canvas.toDataURL();
        }
      });

      anim.addEventListener('error', (e) => {
        console.error('Lottie animation error:', e);
      });

      // Cleanup on unmount
      return () => {
        if (animRef.current) {
          animRef.current.destroy();
        }
      };
    }).catch((error) => {
      console.error('Failed to load lottie-web:', error);
    });
  }, [element.lottieUrl, element.lottieData, element.lottieLoop, element.lottieAutoplay]);

  if (!image) {
    return null; // Don't render until image is ready
  }

  return (
    <Image
      ref={imageRef}
      image={image}
      x={0}
      y={0}
      width={element.width}
      height={element.height}
      listening={true}
    />
  );
});

