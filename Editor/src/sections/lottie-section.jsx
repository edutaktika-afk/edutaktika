import React, { useRef, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { Button, InputGroup, FileInput, Alert, Intent } from '@blueprintjs/core';
import FaLottie from '@meronex/icons/fa/FaPlayCircle';

// Function to start Lottie animation on an element
async function startLottieAnimation(element) {
  if (!element.lottieUrl && !element.lottieData) return;
  
  try {
    const lottie = await import('lottie-web');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const animConfig = {
      renderer: 'canvas',
      loop: element.lottieLoop !== false,
      autoplay: element.lottieAutoplay !== false,
      rendererSettings: {
        context: ctx,
        clearCanvas: true,
      },
    };
    
    if (element.lottieData) {
      animConfig.animationData = element.lottieData;
    } else if (element.lottieUrl) {
      animConfig.path = element.lottieUrl;
    }
    
    const anim = lottie.default.loadAnimation(animConfig);
    
    anim.addEventListener('config_ready', () => {
      const { w, h } = anim.renderer.transformCanvas;
      canvas.width = w;
      canvas.height = h;
    });
    
    // Update element image on each frame
    anim.addEventListener('enterFrame', () => {
      if (element && canvas) {
        const dataURL = canvas.toDataURL();
        element.set({ src: dataURL });
      }
    });
    
    // Store animation reference on element
    element._lottieAnimation = anim;
    
    // Cleanup when element is removed
    const originalRemove = element.remove;
    element.remove = function() {
      if (this._lottieAnimation) {
        this._lottieAnimation.destroy();
      }
      return originalRemove.call(this);
    };
  } catch (error) {
    console.error('Failed to start Lottie animation:', error);
  }
}

// Lottie animation component that renders to canvas
const LottieCanvas = ({ src, onReady, loop = true, autoplay = true }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  React.useEffect(() => {
    if (!canvasRef.current || !src) return;

    // Dynamically import lottie-web
    import('lottie-web').then((lottie) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const anim = lottie.default.loadAnimation({
        path: src, // URL to Lottie JSON file
        renderer: 'canvas',
        loop,
        autoplay,
        rendererSettings: {
          context: ctx,
          clearCanvas: true,
          progressiveLoad: true,
        },
      });

      animRef.current = anim;

      // Set canvas size when animation config is ready
      anim.addEventListener('config_ready', () => {
        const { w, h } = anim.renderer.transformCanvas;
        canvas.width = w;
        canvas.height = h;
        if (onReady) onReady(canvas);
      });

      // Redraw on each frame
      anim.addEventListener('enterFrame', () => {
        if (onReady) onReady(canvas);
      });

      anim.addEventListener('error', (e) => {
        console.error('Lottie animation error:', e);
      });

      return () => {
        if (animRef.current) {
          animRef.current.destroy();
        }
      };
    }).catch((error) => {
      console.error('Failed to load lottie-web:', error);
    });
  }, [src, loop, autoplay, onReady]);

  return <canvas ref={canvasRef} style={{ display: 'none' }} />;
};

// Convert canvas to image data URL
const canvasToDataURL = (canvas) => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    }, 'image/png');
  });
};

// define the new custom section
export const LottieSection = {
  name: 'lottie',
  Tab: (props) => (
    <SectionTab name="Lottie Animation" {...props}>
      <FaLottie />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: observer(({ store }) => {
    const [lottieUrl, setLottieUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const canvasRef = useRef(null);

    const handleCanvasReady = (canvas) => {
      canvasRef.current = canvas;
    };

    const addLottieElement = async () => {
      if (!lottieUrl.trim()) {
        setError('Please enter a Lottie JSON URL');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Create a temporary canvas to render the Lottie animation
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 400; // Default width
        tempCanvas.height = 400; // Default height

        // Dynamically import lottie-web
        const lottie = await import('lottie-web');
        
        const anim = lottie.default.loadAnimation({
          path: lottieUrl.trim(),
          renderer: 'canvas',
          loop: true,
          autoplay: true,
          rendererSettings: {
            context: tempCanvas.getContext('2d'),
            clearCanvas: true,
            progressiveLoad: true,
          },
        });

        // Wait for animation to load
        await new Promise((resolve, reject) => {
          anim.addEventListener('config_ready', () => {
            const { w, h } = anim.renderer.transformCanvas;
            tempCanvas.width = w;
            tempCanvas.height = h;
            resolve();
          });
          anim.addEventListener('error', reject);
        });

        // Wait a bit for first frame to render
        await new Promise(resolve => setTimeout(resolve, 500));

        // Get animation dimensions
        const { w, h } = anim.renderer.transformCanvas;

        // For now, use image type but store Lottie data
        // We'll render it as animated Lottie using a wrapper
        const element = store.activePage.addElement({
          type: 'image', // Use image type so Polotno can render it
          name: 'lottie',
          x: store.width / 2 - w / 2,
          y: store.height / 2 - h / 2,
          width: w,
          height: h,
          // Store initial frame as image
          src: tempCanvas.toDataURL(),
          // Store Lottie data for animation
          lottieUrl: lottieUrl.trim(),
          lottieLoop: true,
          lottieAutoplay: true,
        });
        
        // Start animation after element is created
        if (element && element.lottieUrl) {
          startLottieAnimation(element);
        }

        if (element) {
          store.selectElements([element.id]);
        }

        // Clean up
        anim.destroy();
        setIsLoading(false);
        setLottieUrl(''); // Clear input
      } catch (err) {
        console.error('Error loading Lottie animation:', err);
        setError(`Failed to load Lottie animation: ${err.message}`);
        setIsLoading(false);
      }
    };

    const handleFileUpload = async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.name.endsWith('.json')) {
        setError('Please upload a JSON file');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Read file as text
        const text = await file.text();
        const json = JSON.parse(text);

        // Validate it's a Lottie JSON
        if (!json.v || !json.fr) {
          setError('Invalid Lottie JSON file');
          setIsLoading(false);
          return;
        }

        // For file uploads, we can use the JSON data directly
        // Create object URL for the file
        const objectUrl = URL.createObjectURL(file);
        
        // Add the animation using the object URL
        setIsLoading(true);
        setError(null);

        try {
          // Dynamically import lottie-web
          const lottie = await import('lottie-web');
          
          // Create a temporary canvas to get dimensions
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = 400;
          tempCanvas.height = 400;

          const anim = lottie.default.loadAnimation({
            path: objectUrl,
            renderer: 'canvas',
            loop: true,
            autoplay: true,
            rendererSettings: {
              context: tempCanvas.getContext('2d'),
              clearCanvas: true,
              progressiveLoad: true,
            },
          });

          // Wait for animation to load
          await new Promise((resolve, reject) => {
            anim.addEventListener('config_ready', () => {
              const { w, h } = anim.renderer.transformCanvas;
              tempCanvas.width = w;
              tempCanvas.height = h;
              resolve();
            });
            anim.addEventListener('error', reject);
          });

          // Wait a bit for first frame
          await new Promise(resolve => setTimeout(resolve, 500));

          const { w, h } = anim.renderer.transformCanvas;

          // Add as image element with Lottie data
          const element = store.activePage.addElement({
            type: 'image', // Use image type so Polotno can render it
            name: 'lottie',
            x: store.width / 2 - w / 2,
            y: store.height / 2 - h / 2,
            width: w,
            height: h,
            src: tempCanvas.toDataURL(), // Initial frame
            lottieUrl: objectUrl, // Use object URL for file uploads
            lottieData: json, // Also store the JSON data
            lottieLoop: true,
            lottieAutoplay: true,
          });
          
          // Start animation after element is created
          if (element) {
            startLottieAnimation(element);
          }

          if (element) {
            store.selectElements([element.id]);
          }

          // Clean up animation instance (element will create its own)
          anim.destroy();
          setIsLoading(false);
          
          // Don't revoke object URL immediately - element needs it
          // It will be cleaned up when element is removed
        } catch (err) {
          console.error('Error loading Lottie animation:', err);
          setError(`Failed to load Lottie animation: ${err.message}`);
          setIsLoading(false);
          URL.revokeObjectURL(objectUrl);
        }
      } catch (err) {
        console.error('Error reading Lottie file:', err);
        setError(`Failed to read file: ${err.message}`);
        setIsLoading(false);
      }
    };

    return (
      <div style={{ padding: '10px' }}>
        <h3 style={{ marginBottom: '10px', marginTop: '5px' }}>Lottie Animation</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          Add animated Lottie files to your design. Upload a JSON file or paste a URL.
        </p>

        {error && (
          <Alert
            intent={Intent.DANGER}
            onClose={() => setError(null)}
            style={{ marginBottom: '15px' }}
          >
            {error}
          </Alert>
        )}

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            Upload Lottie JSON File
          </label>
          <FileInput
            text="Choose file..."
            buttonText="Browse"
            inputProps={{
              accept: '.json',
              onChange: handleFileUpload,
            }}
            disabled={isLoading}
          />
        </div>

        <div style={{ marginBottom: '15px', textAlign: 'center', color: '#888' }}>
          OR
        </div>

        <InputGroup
          placeholder="Paste Lottie JSON URL here"
          value={lottieUrl}
          onChange={(e) => setLottieUrl(e.target.value)}
          style={{ width: '100%', marginBottom: '15px' }}
          disabled={isLoading}
        />

        <Button
          onClick={addLottieElement}
          fill
          intent="primary"
          loading={isLoading}
          disabled={!lottieUrl.trim() || isLoading}
        >
          Add Lottie Animation
        </Button>

        <div style={{ marginTop: '15px', fontSize: '12px', color: '#888' }}>
          <strong>Tip:</strong> You can find free Lottie animations at{' '}
          <a href="https://lottiefiles.com" target="_blank" rel="noopener noreferrer">
            LottieFiles.com
          </a>
        </div>
      </div>
    );
  }),
};

