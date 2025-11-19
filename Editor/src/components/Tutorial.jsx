import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Dialog, Card, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Edutaktika Editor! 🎓',
    content: 'This interactive tutorial will guide you through creating amazing educational content. You\'ll learn how to use templates, add text, create presentations, and more!',
    position: 'center',
    showNext: true,
    showSkip: true
  },
  {
    id: 'sidebar',
    title: 'Sidebar Navigation 📚',
    content: 'The left sidebar contains all your educational tools. You can access Templates, Text, Shapes, Backgrounds, Material Icons, and more from here.',
    position: 'left',
    target: '.polotno-side-tabs-container',
    showNext: true,
    showSkip: true
  },
  {
    id: 'templates',
    title: 'Educational Templates 🎨',
    content: 'Click on "Templates" (the book icon) in the sidebar to access pre-made educational designs. Choose from Science Lessons, Math Lessons, English Essays, Book Reports, and Assessment templates - all multi-page!',
    position: 'left',
    target: '.polotno-side-panel-tab[data-tab="templates"], [data-section="templates"]',
    gif: './tutorialgifs/using online templates.gif',
    showNext: true,
    showSkip: true
  },
  {
    id: 'canvas',
    title: 'Design Canvas ✨',
    content: 'This is your main workspace where you create and edit educational content. You can add elements, move them around, resize, and customize everything here.',
    position: 'center',
    target: '.polotno-workspace',
    gif: './tutorialgifs/Resize.gif',
    showNext: true,
    showSkip: true
  },
  {
    id: 'text-tool',
    title: 'Adding Text 📝',
    content: 'Click on "Text" (the text alignment icon) in the sidebar to add text elements. You can customize fonts, colors, sizes, and use Google Fonts for beautiful typography in your educational materials.',
    position: 'left',
    target: '.polotno-side-panel-tab[data-tab="text"], [data-section="text"]',
    gif: './tutorialgifs/text and text editor.gif',
    showNext: true,
    showSkip: true
  },
  {
    id: 'shapes',
    title: 'Shapes and Elements 🔷',
    content: 'Use the "Shapes" tool to add geometric shapes, lines, arrows, and other design elements to enhance your educational content and make it more engaging.',
    position: 'left',
    target: '.polotno-side-panel-tab[data-tab="shapes"]',
    gif: './tutorialgifs/shapes.gif',
    showNext: true,
    showSkip: true
  },
  {
    id: 'layers',
    title: 'Layers Panel 📋',
    content: 'The "Layers" panel shows all elements on your current page. You can select, rename, reorder, and manage elements here for better organization.',
    position: 'left',
    target: '.polotno-side-panel-tab[data-tab="layers"]',
    gif: './tutorialgifs/layers.gif',
    showNext: true,
    showSkip: true
  },
  {
    id: 'pages',
    title: 'Page Management 📄',
    content: 'Use the page controls at the bottom to add, duplicate, delete, or reorder pages in your presentation. Perfect for creating multi-page lessons and assessments.',
    position: 'bottom',
    target: '.polotno-pages-timeline',
    gif: './tutorialgifs/page controls.gif',
    showNext: true,
    showSkip: true
  },
  {
    id: 'animations',
    title: 'Animations & Effects 🎪',
    content: 'Select any element on the canvas, then click the "Animate" button in the top toolbar to add engaging animations like slide, fade, bounce, and many more effects to make your content dynamic!',
    position: 'right',
    target: '.polotno-toolbar, .bp5-navbar',
    showNext: true,
    showSkip: true
  },
  {
    id: 'upload-media',
    title: 'Upload Media 📤',
    content: 'Click on "My Designs" in the sidebar to upload your own images, photos, and media files. You can drag and drop files or click to browse. Supported formats include JPG, PNG, GIF, and more!',
    position: 'left',
    target: '.polotno-side-panel-tab[data-tab="my-designs"], [data-section="my-designs"]',
    gif: './tutorialgifs/upload media.gif',
    showNext: true,
    showSkip: true
  },
  {
    id: 'save-download',
    title: 'Save and Open Files 💾',
    content: 'Use the top menu bar to save your work, download as PDF or image, and present your designs. You can also open previously saved JSON files to continue working on your designs. Look for the "Download" and "Present" buttons in the top toolbar.',
    position: 'top',
    target: '.topbar, .bp5-navbar',
    gif: './tutorialgifs/opening jsons.gif',
    showNext: true,
    showSkip: true
  },
  {
    id: 'complete',
    title: 'Tutorial Complete! 🎉',
    content: 'You\'re all set to create amazing educational content! Remember, you can always access this tutorial again from the "Tutorial" button in the top menu. Happy teaching!',
    position: 'center',
    showNext: false,
    showSkip: false,
    showFinish: true
  }
];

const TutorialOverlay = observer(({ isOpen, onClose, currentStep, onNext, onSkip, onFinish }) => {
  const step = TUTORIAL_STEPS[currentStep];
  const [targetElement, setTargetElement] = useState(null);
  const [targetRect, setTargetRect] = useState(null);
  
  useEffect(() => {
    if (isOpen && step?.target) {
      let currentElement = null; // Store element in closure for cleanup
      
      // Find the target element with retry logic
      const findElement = () => {
        const element = document.querySelector(step.target);
        if (element) {
          currentElement = element;
          setTargetElement(element);
          
          // Scroll element into view
          element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          
          // Get element position after a short delay to account for scrolling
          setTimeout(() => {
            const rect = element.getBoundingClientRect();
            setTargetRect(rect);
            
            // Store original styles to restore later
            const originalStyles = {
              transition: element.style.transition,
              position: element.style.position,
              zIndex: element.style.zIndex,
              boxShadow: element.style.boxShadow,
              borderRadius: element.style.borderRadius,
              animation: element.style.animation
            };
            element.dataset.originalStyles = JSON.stringify(originalStyles);
            
            // Add pulsing highlight effect without changing layout
            element.style.transition = 'box-shadow 0.3s ease';
            // Don't change position to avoid layout shifts - use outline instead
            const currentZIndex = window.getComputedStyle(element).zIndex;
            element.style.zIndex = currentZIndex === 'auto' ? '10000' : Math.max(parseInt(currentZIndex) || 0, 10000);
            element.style.boxShadow = '0 0 0 4px #137cbd, 0 0 30px rgba(19, 124, 189, 0.6), 0 0 60px rgba(19, 124, 189, 0.3)';
            element.style.borderRadius = '8px';
            element.style.animation = 'tutorialPulse 2s ease-in-out infinite';
            
            // Add a class for additional styling
            element.classList.add('tutorial-highlighted');
          }, 300);
        } else {
          // Retry after a short delay if element not found
          setTimeout(findElement, 100);
        }
      };
      
      findElement();
      
      return () => {
        // Clean up highlighting using the captured element
        if (currentElement) {
          // Restore original styles if stored
          if (currentElement.dataset.originalStyles) {
            try {
              const originalStyles = JSON.parse(currentElement.dataset.originalStyles);
              Object.keys(originalStyles).forEach(key => {
                if (originalStyles[key]) {
                  currentElement.style[key] = originalStyles[key];
                } else {
                  currentElement.style[key] = '';
                }
              });
              delete currentElement.dataset.originalStyles;
            } catch (e) {
              // Fallback to clearing styles
              currentElement.style.transition = '';
              currentElement.style.zIndex = '';
              currentElement.style.boxShadow = '';
              currentElement.style.borderRadius = '';
              currentElement.style.animation = '';
            }
          } else {
            // Fallback: clear styles
            currentElement.style.transition = '';
            currentElement.style.zIndex = '';
            currentElement.style.boxShadow = '';
            currentElement.style.borderRadius = '';
            currentElement.style.animation = '';
          }
          currentElement.classList.remove('tutorial-highlighted');
        }
        // Also try to clean up from DOM query as fallback
        const stateElement = document.querySelector(step.target);
        if (stateElement && stateElement.classList.contains('tutorial-highlighted')) {
          if (stateElement.dataset.originalStyles) {
            try {
              const originalStyles = JSON.parse(stateElement.dataset.originalStyles);
              Object.keys(originalStyles).forEach(key => {
                if (originalStyles[key]) {
                  stateElement.style[key] = originalStyles[key];
                } else {
                  stateElement.style[key] = '';
                }
              });
              delete stateElement.dataset.originalStyles;
            } catch (e) {
              stateElement.style.transition = '';
              stateElement.style.zIndex = '';
              stateElement.style.boxShadow = '';
              stateElement.style.borderRadius = '';
              stateElement.style.animation = '';
            }
          } else {
            stateElement.style.transition = '';
            stateElement.style.zIndex = '';
            stateElement.style.boxShadow = '';
            stateElement.style.borderRadius = '';
            stateElement.style.animation = '';
          }
          stateElement.classList.remove('tutorial-highlighted');
        }
        setTargetElement(null);
        setTargetRect(null);
      };
    } else {
      setTargetElement(null);
      setTargetRect(null);
    }
  }, [isOpen, step?.target, currentStep]);

  if (!isOpen || !step) return null;

  const getPositionStyle = () => {
    // Much larger sizes for GIFs to make them more visible
    const baseMaxWidth = step.gif ? '900px' : '500px';
    const sideMaxWidth = step.gif ? '700px' : '400px';
    
    // Check if target is the sidebar - always position modal away from sidebar
    const isSidebarTarget = step.target && (
      step.target.includes('side-tabs') || 
      step.target.includes('side-panel') ||
      step.target.includes('sidebar') ||
      step.id === 'sidebar' ||
      step.id === 'templates' ||
      step.id === 'text-tool' ||
      step.id === 'shapes' ||
      step.id === 'layers' ||
      step.id === 'upload-media'
    );
    
    // Smart positioning: avoid blocking the target element
    let positionStyle = {};
    
    if (targetRect) {
      // Calculate modal dimensions (approximate)
      const modalWidth = step.gif ? 900 : 500;
      const modalHeight = step.gif ? 600 : 300;
      
      // Determine best position to avoid blocking target
      const spaceLeft = targetRect.left;
      const spaceRight = window.innerWidth - targetRect.right;
      const spaceTop = targetRect.top;
      const spaceBottom = window.innerHeight - targetRect.bottom;
      
      // If target is sidebar or on left side, ALWAYS place modal on right
      if (isSidebarTarget || targetRect.left < window.innerWidth / 3) {
        // Place modal on right side, ensuring it doesn't overlap with sidebar
        const sidebarWidth = targetRect.right || 300; // Estimate sidebar width
        const rightMargin = Math.max(40, window.innerWidth - sidebarWidth - modalWidth - 20);
        
        positionStyle = {
          position: 'fixed',
          right: `${rightMargin}px`,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1001,
          maxWidth: sideMaxWidth,
          maxHeight: '85vh',
          overflowY: 'auto'
        };
      }
      // Check if target is on right side (but not sidebar)
      else if (targetRect.right > window.innerWidth * 2 / 3 && !isSidebarTarget) {
        // Place modal on left side, but make sure it doesn't overlap with sidebar
        const sidebarWidth = 300; // Estimate sidebar width
        const leftMargin = Math.max(sidebarWidth + 20, 40);
        
        positionStyle = {
          position: 'fixed',
          left: `${leftMargin}px`,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1001,
          maxWidth: sideMaxWidth,
          maxHeight: '85vh',
          overflowY: 'auto'
        };
      }
      // Check if target is at top
      else if (targetRect.top < window.innerHeight / 3) {
        // Place modal at bottom
        positionStyle = {
          position: 'fixed',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1001,
          maxWidth: baseMaxWidth,
          maxHeight: '70vh',
          overflowY: 'auto'
        };
      }
      // Check if target is at bottom
      else if (targetRect.bottom > window.innerHeight * 2 / 3) {
        // Place modal at top
        positionStyle = {
          position: 'fixed',
          top: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1001,
          maxWidth: baseMaxWidth,
          maxHeight: '70vh',
          overflowY: 'auto'
        };
      }
      // Default: use step position but adjust to avoid blocking
      else {
        switch (step.position) {
          case 'left':
            // If step position is 'left' but target is sidebar, move to right
            if (isSidebarTarget) {
              positionStyle = {
                position: 'fixed',
                right: '40px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1001,
                maxWidth: sideMaxWidth,
                maxHeight: '85vh',
                overflowY: 'auto'
              };
            } else {
              positionStyle = {
                position: 'fixed',
                left: '40px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1001,
                maxWidth: sideMaxWidth,
                maxHeight: '85vh',
                overflowY: 'auto'
              };
            }
            break;
          case 'right':
            positionStyle = {
              position: 'fixed',
              right: '40px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1001,
              maxWidth: sideMaxWidth,
              maxHeight: '85vh',
              overflowY: 'auto'
            };
            break;
          case 'top':
            positionStyle = {
              position: 'fixed',
              top: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1001,
              maxWidth: baseMaxWidth,
              maxHeight: '70vh',
              overflowY: 'auto'
            };
            break;
          case 'bottom':
            positionStyle = {
              position: 'fixed',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1001,
              maxWidth: baseMaxWidth,
              maxHeight: '70vh',
              overflowY: 'auto'
            };
            break;
          default: // center
            positionStyle = {
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1001,
              maxWidth: baseMaxWidth,
              maxHeight: '85vh',
              overflowY: 'auto'
            };
        }
      }
    } else {
      // No target element, use default positioning but avoid sidebar
      switch (step.position) {
        case 'left':
          // If step is about sidebar, position on right instead
          if (isSidebarTarget) {
            positionStyle = {
              position: 'fixed',
              right: '40px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1001,
              maxWidth: sideMaxWidth,
              maxHeight: '85vh',
              overflowY: 'auto'
            };
          } else {
            positionStyle = {
              position: 'fixed',
              left: '40px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1001,
              maxWidth: sideMaxWidth,
              maxHeight: '85vh',
              overflowY: 'auto'
            };
          }
          break;
        case 'right':
          positionStyle = {
            position: 'fixed',
            right: '40px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1001,
            maxWidth: sideMaxWidth,
            maxHeight: '85vh',
            overflowY: 'auto'
          };
          break;
        case 'top':
          positionStyle = {
            position: 'fixed',
            top: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1001,
            maxWidth: baseMaxWidth,
            maxHeight: '70vh',
            overflowY: 'auto'
          };
          break;
        case 'bottom':
          positionStyle = {
            position: 'fixed',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1001,
            maxWidth: baseMaxWidth,
            maxHeight: '70vh',
            overflowY: 'auto'
          };
          break;
        default: // center
          positionStyle = {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1001,
            maxWidth: baseMaxWidth,
            maxHeight: '85vh',
            overflowY: 'auto'
          };
      }
    }
    
    return positionStyle;
  };

  // Calculate arrow position based on target element
  const getArrowStyle = () => {
    if (!targetRect) return null;
    
    const cardStyle = getPositionStyle();
    
    // Determine arrow direction based on actual modal position, not step position
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;
    
    // Determine modal position
    let modalLeft = 0;
    let modalRight = 0;
    if (cardStyle.left && typeof cardStyle.left === 'string') {
      if (cardStyle.left.includes('%')) {
        modalLeft = window.innerWidth / 2;
      } else {
        modalLeft = parseFloat(cardStyle.left) || 0;
      }
    }
    if (cardStyle.right && typeof cardStyle.right === 'string') {
      modalRight = parseFloat(cardStyle.right) || 0;
      modalLeft = window.innerWidth - modalRight;
    }
    
    // Calculate arrow position
    let arrowStyle = {
      position: 'fixed',
      zIndex: 1002,
      pointerEvents: 'none'
    };
    
    // Determine modal position more accurately
    let modalOnRight = false;
    let modalOnLeft = false;
    
    if (cardStyle.right !== undefined) {
      modalOnRight = true;
      modalLeft = window.innerWidth - (parseFloat(cardStyle.right) || 0);
    } else if (cardStyle.left) {
      if (typeof cardStyle.left === 'string' && cardStyle.left.includes('%')) {
        modalLeft = window.innerWidth / 2;
      } else {
        modalLeft = parseFloat(cardStyle.left) || 0;
      }
      modalOnRight = modalLeft > window.innerWidth / 2;
      modalOnLeft = modalLeft < window.innerWidth / 2;
    }
    
    // Determine arrow direction based on modal position relative to target
    // If target is on left and modal is on right, arrow points from right to left
    const targetOnLeft = targetRect.left < window.innerWidth / 2;
    const targetOnRight = targetRect.right > window.innerWidth / 2;
    
    // Determine which side to place arrow
    if ((modalOnRight && targetOnLeft) || (step.position === 'left' && modalOnRight)) {
      // Modal is on right, target is on left (like sidebar), arrow points left from modal to target
      arrowStyle.left = `${targetRect.right + 10}px`;
      arrowStyle.top = `${targetCenterY - 10}px`;
      arrowStyle.width = '20px';
      arrowStyle.height = '20px';
      arrowStyle.borderLeft = '4px solid #137cbd';
      arrowStyle.borderRight = 'none';
      arrowStyle.borderTop = '10px solid transparent';
      arrowStyle.borderBottom = '10px solid transparent';
    } else if ((modalOnLeft && targetOnRight) || step.position === 'right') {
      // Modal is on left, target is on right, arrow points right from modal to target
      arrowStyle.left = `${targetRect.left - 30}px`;
      arrowStyle.top = `${targetCenterY - 10}px`;
      arrowStyle.width = '20px';
      arrowStyle.height = '20px';
      arrowStyle.borderRight = '4px solid #137cbd';
      arrowStyle.borderLeft = 'none';
      arrowStyle.borderTop = '10px solid transparent';
      arrowStyle.borderBottom = '10px solid transparent';
    } else if (step.position === 'top') {
      // Arrow pointing down
      arrowStyle.left = `${targetCenterX - 10}px`;
      arrowStyle.top = `${targetRect.bottom + 10}px`;
      arrowStyle.width = '20px';
      arrowStyle.height = '20px';
      arrowStyle.borderTop = '4px solid #137cbd';
      arrowStyle.borderLeft = '10px solid transparent';
      arrowStyle.borderRight = '10px solid transparent';
    } else if (step.position === 'bottom') {
      // Arrow pointing up
      arrowStyle.left = `${targetCenterX - 10}px`;
      arrowStyle.top = `${targetRect.top - 30}px`;
      arrowStyle.width = '20px';
      arrowStyle.height = '20px';
      arrowStyle.borderBottom = '4px solid #137cbd';
      arrowStyle.borderLeft = '10px solid transparent';
      arrowStyle.borderRight = '10px solid transparent';
    } else {
      // Center - no arrow needed or point to center
      return null;
    }
    
    return arrowStyle;
  };

  const arrowStyle = getArrowStyle();

  return (
    <>
      {/* Add CSS animation for pulsing effect */}
      <style>{`
        @keyframes tutorialPulse {
          0%, 100% {
            box-shadow: 0 0 0 4px #137cbd, 0 0 30px rgba(19, 124, 189, 0.6), 0 0 60px rgba(19, 124, 189, 0.3);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 6px #137cbd, 0 0 40px rgba(19, 124, 189, 0.8), 0 0 80px rgba(19, 124, 189, 0.5);
            transform: scale(1.02);
          }
        }
        .tutorial-highlighted {
          animation: tutorialPulse 2s ease-in-out infinite !important;
        }
      `}</style>
      
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Spotlight effect - lighter darkening with more pronounced highlight */}
        {targetRect && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
            pointerEvents: 'none',
            background: `
              radial-gradient(
                ellipse ${Math.max(targetRect.width + 100, 200)}px ${Math.max(targetRect.height + 100, 200)}px at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px,
                transparent 0%,
                transparent 50%,
                rgba(0, 0, 0, 0.3) 70%,
                rgba(0, 0, 0, 0.4) 100%
              )
            `
          }} />
        )}
        
        {/* Arrow pointing to target */}
        {arrowStyle && (
          <div style={{
            ...arrowStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '0',
              height: '0',
              borderLeft: arrowStyle.borderLeft || 'none',
              borderRight: arrowStyle.borderRight || 'none',
              borderTop: arrowStyle.borderTop || 'none',
              borderBottom: arrowStyle.borderBottom || 'none',
              filter: 'drop-shadow(0 2px 4px rgba(19, 124, 189, 0.5))'
            }} />
          </div>
        )}
        
        <Card style={getPositionStyle()} elevation={4}>
          <div style={{ padding: '24px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h3 style={{ margin: 0, color: '#137cbd', fontSize: step.gif ? '24px' : '20px', fontWeight: '600' }}>
                {step.title}
              </h3>
              <Button
                minimal
                icon={IconNames.CROSS}
                onClick={onClose}
                style={{ marginLeft: '10px' }}
              />
            </div>
            
            <p style={{ 
              marginBottom: step.gif ? '20px' : '20px', 
              lineHeight: '1.6',
              color: '#333',
              fontSize: step.gif ? '16px' : '14px'
            }}>
              {step.content}
            </p>
            
            {/* Display GIF if available - much larger display */}
            {step.gif && (
              <div style={{
                marginBottom: '20px',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                backgroundColor: '#f5f5f5',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '300px',
                maxHeight: '500px',
                position: 'relative',
                width: '100%'
              }}>
                <img 
                  src={`${import.meta.env.BASE_URL || './'}${step.gif.replace(/^\.\//, '')}`}
                  alt={`Tutorial demonstration for ${step.title}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '500px',
                    width: 'auto',
                    height: 'auto',
                    display: 'block',
                    objectFit: 'contain'
                  }}
                  loading="lazy"
                  onError={(e) => {
                    // Show error message if image fails to load
                    const container = e.target.parentElement;
                    if (container) {
                      container.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">Tutorial GIF unavailable</div>';
                    }
                  }}
                />
              </div>
            )}
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Step {currentStep + 1} of {TUTORIAL_STEPS.length}
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                {step.showSkip && (
                  <Button
                    text="Skip Tutorial"
                    minimal
                    onClick={onSkip}
                  />
                )}
                
                {step.showNext && (
                  <Button
                    text="Next"
                    intent="primary"
                    onClick={onNext}
                    rightIcon={IconNames.ARROW_RIGHT}
                  />
                )}
                
                {step.showFinish && (
                  <Button
                    text="Finish"
                    intent="success"
                    onClick={onFinish}
                    rightIcon={IconNames.TICK}
                  />
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
});

export const Tutorial = observer(({ store }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const startTutorial = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  const nextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const skipTutorial = () => {
    setIsOpen(false);
    // Mark tutorial as completed
    localStorage.setItem('edutaktika-tutorial-completed', 'true');
  };

  const finishTutorial = () => {
    setIsOpen(false);
    // Mark tutorial as completed
    localStorage.setItem('edutaktika-tutorial-completed', 'true');
  };

  const closeTutorial = () => {
    setIsOpen(false);
  };

  // Check if tutorial was already completed
  const isTutorialCompleted = localStorage.getItem('edutaktika-tutorial-completed') === 'true';

  return (
    <>
      <TutorialOverlay
        isOpen={isOpen}
        onClose={closeTutorial}
        currentStep={currentStep}
        onNext={nextStep}
        onSkip={skipTutorial}
        onFinish={finishTutorial}
      />
      
      {/* Tutorial trigger button - only show if not completed */}
      {!isTutorialCompleted && (
        <Button
          icon={IconNames.HELP}
          text="Start Tutorial"
          intent="primary"
          data-tutorial-trigger
          style={{
            position: 'fixed',
            top: '60px',
            right: '20px',
            zIndex: 999,
            boxShadow: '0 4px 12px rgba(19, 124, 189, 0.3)',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '14px',
            padding: '12px 20px'
          }}
          onClick={startTutorial}
        />
      )}
      
      {/* Hidden trigger for help button */}
      <Button
        data-tutorial-trigger
        style={{ display: 'none' }}
        onClick={startTutorial}
      />
    </>
  );
});

export default Tutorial;

