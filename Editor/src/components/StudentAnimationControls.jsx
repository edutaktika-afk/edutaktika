import React, { useEffect, useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';

/**
 * Animation Play/Pause Controls for Students in View-Only Mode
 * Shows play/pause buttons so students can control lesson animations
 */
export const StudentAnimationControls = observer(({ store }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const animationStartTimeRef = useRef(0); // Track when animation started
  const pausedTimeRef = useRef(0); // Track the elapsed time when paused
  const isPausedRef = useRef(false); // Track if we're in a paused state

  // Sync with store's playing state
  useEffect(() => {
    const checkPlaying = () => {
      const wasPlaying = isPlaying;
      const nowPlaying = store.isPlaying || false;
      
      // If animation just started, record the start time
      if (nowPlaying && !wasPlaying && !isPausedRef.current) {
        animationStartTimeRef.current = Date.now();
        pausedTimeRef.current = 0;
      }
      
      // If animation stopped (not by our pause), reset
      if (!nowPlaying && wasPlaying && !isPausedRef.current) {
        animationStartTimeRef.current = 0;
        pausedTimeRef.current = 0;
      }
      
      setIsPlaying(nowPlaying);
    };
    
    // Check initially
    checkPlaying();
    
    // Poll for changes (Polotno doesn't expose isPlaying as observable in all cases)
    const interval = setInterval(checkPlaying, 100);
    
    return () => clearInterval(interval);
  }, [store, isPlaying]);

  // Auto-play animations when page loads or changes
  useEffect(() => {
    if (!store) return;
    
    const activePage = store.activePage;
    if (!activePage) return;
    
    // Reset animation tracking when page changes
    animationStartTimeRef.current = 0;
    pausedTimeRef.current = 0;
    isPausedRef.current = false;
    
    // Wait a bit for the page to render
    const timer = setTimeout(() => {
      if (activePage && activePage.children) {
        const animatedElements = [];
        activePage.children.forEach(child => {
          if (child.animations && child.animations.length > 0) {
            const enabledAnims = child.animations.filter(a => a.enabled !== false);
            if (enabledAnims.length > 0) {
              animatedElements.push(child.id);
            }
          }
        });
        
        // Auto-play if there are animations and not already playing
        if (animatedElements.length > 0 && !store.isPlaying) {
          const startTime = activePage.startTime || 0;
          store.play({
            animatedElementsIds: animatedElements,
            currentTime: startTime
          });
          animationStartTimeRef.current = Date.now();
          pausedTimeRef.current = 0;
          setIsPlaying(true);
        }
      }
    }, 500); // Wait 0.5 seconds for page to render
    
    return () => clearTimeout(timer);
  }, [store, store?.activePage?.id]); // Re-run when page changes

  const handlePlay = () => {
    if (!store) return;
    
    const activePage = store.activePage;
    if (activePage && activePage.children) {
      const animatedElements = [];
      activePage.children.forEach(child => {
        if (child.animations && child.animations.length > 0) {
          const enabledAnims = child.animations.filter(a => a.enabled !== false);
          if (enabledAnims.length > 0) {
            animatedElements.push(child.id);
          }
        }
      });
      
      // Calculate the resume time based on how much time has elapsed
      const baseStartTime = activePage.startTime || 0;
      let resumeTime = baseStartTime;
      
      // If we were paused, resume from where we left off
      if (isPausedRef.current && pausedTimeRef.current > 0) {
        // Calculate elapsed time in milliseconds, convert to seconds
        const elapsedSeconds = pausedTimeRef.current / 1000;
        resumeTime = baseStartTime + elapsedSeconds;
      }
      
      if (animatedElements.length > 0) {
        store.play({
          animatedElementsIds: animatedElements,
          currentTime: resumeTime
        });
        // Update start time reference to account for the resume offset
        animationStartTimeRef.current = Date.now() - (pausedTimeRef.current);
        isPausedRef.current = false;
        setIsPlaying(true);
      } else {
        // No animations on this page, but still allow play for transitions
        store.play({
          animatedElementsIds: [],
          currentTime: resumeTime
        });
        animationStartTimeRef.current = Date.now() - (pausedTimeRef.current);
        isPausedRef.current = false;
        setIsPlaying(true);
      }
    }
  };

  const handlePause = () => {
    if (!store) return;
    
    if (store.isPlaying) {
      // Calculate how much time has elapsed since animation started
      if (animationStartTimeRef.current > 0) {
        const elapsed = Date.now() - animationStartTimeRef.current;
        pausedTimeRef.current = pausedTimeRef.current + elapsed;
      }
      
      store.stop();
      isPausedRef.current = true;
      setIsPlaying(false);
    }
  };

  const handleToggle = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  // Only show in view-only mode
  if (!document.body.classList.contains('view-only-mode')) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px', // Above the pages timeline
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '10px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: '1px solid #e0e0e0'
      }}
    >
      <button
        onClick={handleToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          backgroundColor: isPlaying ? '#dc3545' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
          transition: 'background-color 0.2s',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isPlaying ? '#c82333' : '#218838';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isPlaying ? '#dc3545' : '#28a745';
        }}
        title={isPlaying ? 'Pause animations' : 'Play animations'}
      >
        {isPlaying ? (
          <>
            <span>⏸</span>
            <span>Pause</span>
          </>
        ) : (
          <>
            <span>▶</span>
            <span>Play</span>
          </>
        )}
      </button>
    </div>
  );
});

export default StudentAnimationControls;

