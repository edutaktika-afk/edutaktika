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
  const frameUpdateRef = useRef(null);

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
          // Use requestAnimationFrame to throttle updates for better performance
          if (frameUpdateRef.current) {
            cancelAnimationFrame(frameUpdateRef.current);
          }
          
          frameUpdateRef.current = requestAnimationFrame(() => {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              setImage(img);
              // Force Konva to redraw
              const layer = imageRef.current?.getLayer();
              if (layer) {
                layer.batchDraw();
              }
            };
            img.onerror = () => {
              console.warn('Failed to create image from canvas');
            };
            img.src = canvas.toDataURL();
          });
        }
      });

      anim.addEventListener('error', (e) => {
        console.error('Lottie animation error:', e);
      });

      // Cleanup on unmount
      return () => {
        if (frameUpdateRef.current) {
          cancelAnimationFrame(frameUpdateRef.current);
        }
        if (animRef.current) {
          animRef.current.destroy();
          animRef.current = null;
        }
      };
    }).catch((error) => {
      console.error('Failed to load lottie-web:', error);
    });
  }, [element.lottieUrl, element.lottieData, element.lottieLoop, element.lottieAutoplay]);

  if (!image) {
    // Show placeholder while loading
    return (
      <Image
        ref={imageRef}
        image={null}
        x={0}
        y={0}
        width={element.width || 200}
        height={element.height || 200}
        fill="#f0f0f0"
        listening={true}
      />
    );
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

