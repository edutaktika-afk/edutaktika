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
    content: 'Click on "Templates" to access pre-made educational designs. Choose from Science Lessons, Math Lessons, English Essays, Book Reports, and Assessment templates - all multi-page!',
    position: 'left',
    target: '.polotno-side-panel-tab[data-tab="templates"]',
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
    content: 'Click on "Text" in the sidebar to add text elements. You can customize fonts, colors, sizes, and use Google Fonts for beautiful typography in your educational materials.',
    position: 'left',
    target: '.polotno-side-panel-tab[data-tab="text"]',
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
    content: 'Select any element and use the "Animate" panel to add engaging animations like slide, fade, bounce, and many more effects to make your content dynamic!',
    position: 'right',
    target: '.polotno-toolbar',
    showNext: true,
    showSkip: true
  },
  {
    id: 'save-download',
    title: 'Save and Present 💾',
    content: 'Use the top menu to save your work, download as PDF or image, and present your designs. The "Present" button opens a full-screen slideshow mode.',
    position: 'top',
    target: '.topbar',
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
  
  useEffect(() => {
    if (isOpen && step?.target) {
      // Highlight the target element
      const targetElement = document.querySelector(step.target);
      if (targetElement) {
        targetElement.style.position = 'relative';
        targetElement.style.zIndex = '1000';
        targetElement.style.boxShadow = '0 0 0 4px #137cbd, 0 0 20px rgba(19, 124, 189, 0.3)';
        targetElement.style.borderRadius = '4px';
      }
      
      return () => {
        // Clean up highlighting
        if (targetElement) {
          targetElement.style.position = '';
          targetElement.style.zIndex = '';
          targetElement.style.boxShadow = '';
          targetElement.style.borderRadius = '';
        }
      };
    }
  }, [isOpen, step?.target]);

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

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Card style={getPositionStyle()} elevation={3}>
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

