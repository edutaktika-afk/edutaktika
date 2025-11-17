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
    showNext: true,
    showSkip: true
  },
  {
    id: 'canvas',
    title: 'Design Canvas ✨',
    content: 'This is your main workspace where you create and edit educational content. You can add elements, move them around, resize, and customize everything here.',
    position: 'center',
    target: '.polotno-workspace',
    showNext: true,
    showSkip: true
  },
  {
    id: 'text-tool',
    title: 'Adding Text 📝',
    content: 'Click on "Text" (the text alignment icon) in the sidebar to add text elements. You can customize fonts, colors, sizes, and use Google Fonts for beautiful typography in your educational materials.',
    position: 'left',
    target: '.polotno-side-panel-tab[data-tab="text"], [data-section="text"]',
    showNext: true,
    showSkip: true
  },
  {
    id: 'shapes',
    title: 'Shapes and Elements 🔷',
    content: 'Use the "Shapes" tool to add geometric shapes, lines, arrows, and other design elements to enhance your educational content and make it more engaging.',
    position: 'left',
    target: '.polotno-side-panel-tab[data-tab="shapes"]',
    showNext: true,
    showSkip: true
  },
  {
    id: 'icons',
    title: 'Material Icons 🎯',
    content: 'The "Material Icons" section provides access to thousands of educational icons, symbols, and graphics perfect for science, math, and other subjects.',
    position: 'left',
    target: '.polotno-side-panel-tab[data-tab="material-icons"]',
    showNext: true,
    showSkip: true
  },
  {
    id: 'backgrounds',
    title: 'Background Colors 🌈',
    content: 'Click on "Backgrounds" to change the background color of your design. Choose from educational-friendly color options that are easy on the eyes.',
    position: 'left',
    target: '.polotno-side-panel-tab[data-tab="backgrounds"]',
    showNext: true,
    showSkip: true
  },
  {
    id: 'layers',
    title: 'Layers Panel 📋',
    content: 'The "Layers" panel shows all elements on your current page. You can select, rename, reorder, and manage elements here for better organization.',
    position: 'left',
    target: '.polotno-side-panel-tab[data-tab="layers"]',
    showNext: true,
    showSkip: true
  },
  {
    id: 'pages',
    title: 'Page Management 📄',
    content: 'Use the page controls at the bottom to add, duplicate, delete, or reorder pages in your presentation. Perfect for creating multi-page lessons and assessments.',
    position: 'bottom',
    target: '.polotno-pages-timeline',
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
    id: 'save-download',
    title: 'Save and Present 💾',
    content: 'Use the top menu bar to save your work, download as PDF or image, and present your designs. Look for the "Download" and "Present" buttons in the top toolbar. The "Present" button opens a full-screen slideshow mode.',
    position: 'top',
    target: '.topbar, .bp5-navbar',
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
      // Find the target element with retry logic
      const findElement = () => {
        const element = document.querySelector(step.target);
        if (element) {
          setTargetElement(element);
          
          // Scroll element into view
          element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          
          // Get element position after a short delay to account for scrolling
          setTimeout(() => {
            const rect = element.getBoundingClientRect();
            setTargetRect(rect);
            
            // Add pulsing highlight effect
            element.style.transition = 'all 0.3s ease';
            element.style.position = 'relative';
            element.style.zIndex = '10000';
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
        // Clean up highlighting
        if (targetElement) {
          targetElement.style.transition = '';
          targetElement.style.position = '';
          targetElement.style.zIndex = '';
          targetElement.style.boxShadow = '';
          targetElement.style.borderRadius = '';
          targetElement.style.animation = '';
          targetElement.classList.remove('tutorial-highlighted');
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
    switch (step.position) {
      case 'left':
        return {
          position: 'fixed',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1001,
          maxWidth: '300px'
        };
      case 'right':
        return {
          position: 'fixed',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1001,
          maxWidth: '300px'
        };
      case 'top':
        return {
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1001,
          maxWidth: '400px'
        };
      case 'bottom':
        return {
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1001,
          maxWidth: '400px'
        };
      default: // center
        return {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1001,
          maxWidth: '400px'
        };
    }
  };

  // Calculate arrow position based on target element
  const getArrowStyle = () => {
    if (!targetRect) return null;
    
    const cardStyle = getPositionStyle();
    const cardRect = {
      left: cardStyle.left === '50%' ? window.innerWidth / 2 : parseFloat(cardStyle.left) || 0,
      top: cardStyle.top === '50%' ? window.innerHeight / 2 : parseFloat(cardStyle.top) || 0,
      width: 400,
      height: 200
    };
    
    // Determine arrow direction based on position
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;
    const cardCenterX = typeof cardStyle.left === 'string' && cardStyle.left.includes('%') 
      ? window.innerWidth / 2 
      : parseFloat(cardStyle.left) || 0;
    const cardCenterY = typeof cardStyle.top === 'string' && cardStyle.top.includes('%')
      ? window.innerHeight / 2
      : parseFloat(cardStyle.top) || 0;
    
    // Calculate arrow position
    let arrowStyle = {
      position: 'fixed',
      zIndex: 1002,
      pointerEvents: 'none'
    };
    
    // Determine which side to place arrow
    if (step.position === 'left' || step.position === 'right') {
      // Arrow pointing horizontally
      arrowStyle.left = `${targetRect.left - 20}px`;
      arrowStyle.top = `${targetCenterY - 10}px`;
      arrowStyle.width = '20px';
      arrowStyle.height = '20px';
      arrowStyle.borderLeft = step.position === 'left' ? '4px solid #137cbd' : 'none';
      arrowStyle.borderRight = step.position === 'right' ? '4px solid #137cbd' : 'none';
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
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Spotlight effect - darken everything except target */}
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
                ellipse ${targetRect.width + 40}px ${targetRect.height + 40}px at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px,
                transparent 0%,
                transparent 40%,
                rgba(0, 0, 0, 0.5) 100%
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
          <div style={{ padding: '20px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h3 style={{ margin: 0, color: '#137cbd' }}>
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
              marginBottom: '20px', 
              lineHeight: '1.5',
              color: '#333'
            }}>
              {step.content}
            </p>
            
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

