/**
 * Homepage Tutorial System for Teachers
 * Similar to the Editor tutorial, but for vanilla JavaScript/HTML
 */

// Helper function to get GIF path that works on both local and Netlify
function getGifPath(filename) {
  // Try to detect if we're in a subdirectory (Student/ or Teacher/)
  const pathname = window.location.pathname.toLowerCase();
  const isInSubdir = pathname.includes('/student/') || pathname.includes('/teacher/');
  
  // Use relative path that works from both root and subdirectories
  // On Netlify, files are in /Student/ or /Teacher/ subdirectories
  if (isInSubdir) {
    return '../images/GIF/' + filename;
  } else {
    // Fallback for root level (shouldn't happen but safe)
    return 'images/GIF/' + filename;
  }
}

const HOMEPAGE_TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Edutaktika! 🎓',
    content: 'This interactive tutorial will guide you through the main features of the Edutaktika platform. You\'ll learn how to manage lessons, students, assessments, and more!',
    position: 'center',
    showNext: true,
    showSkip: true
  },
  {
    id: 'lessons',
    title: 'Lesson Management 📚',
    content: 'Click on "Lesson" in the top navigation to access your subject-specific lesson page. Here you can create, view, and manage interactive lessons for your students using the powerful editor.',
    position: 'top',
    target: '#lessonNavBtn, nav ul li a[href*="subject"]',
    gif: getGifPath('Lessons.gif'),
    showNext: true,
    showSkip: true
  },
  {
    id: 'students',
    title: 'Student Management 👥',
    content: 'The "Student" link in the navigation takes you to your student list page. Here you can view all students in your section, manage their information, and track their progress.',
    position: 'top',
    target: 'nav ul li a[href*="studentlist"]',
    gif: getGifPath('Student list.gif'),
    showNext: true,
    showSkip: true
  },
  {
    id: 'assessments-create',
    title: 'Create Assessments 📝',
    content: 'Click on "Assessments" → "Create Assessment" to build interactive assessments with multiple question types, time limits, and automatic grading. Perfect for quizzes and exams!',
    position: 'top',
    target: 'nav ul li.dropdown:first-of-type a.dropbtn',
    gif: getGifPath('Assessment Creator.gif'),
    showNext: true,
    showSkip: true
  },
  {
    id: 'assessments-manage',
    title: 'Manage Assessments 📊',
    content: 'Use "Assessments" → "Manage Assessments" to view analytics, monitor student attempts, track performance, and manage your assessment library. Get insights into student learning!',
    position: 'top',
    target: 'nav ul li.dropdown:first-of-type a.dropbtn',
    gif: getGifPath('Assessment Management.gif'),
    showNext: true,
    showSkip: true
  },
  {
    id: 'leaderboards',
    title: 'Leaderboards 🏆',
    content: 'Check the "Leaderboard" dropdown to view student rankings by subject. See top performers in Math, English, and Science. Great for motivating students and recognizing achievements!',
    position: 'top',
    target: 'nav ul li.dropdown:last-of-type a.dropbtn',
    gif: getGifPath('leaderboards.gif'),
    showNext: true,
    showSkip: true
  },
  {
    id: 'profile',
    title: 'Profile & Logout 👤',
    content: 'Click on "Profile" to view your account information, edit your details, and access the logout function. Your profile shows your grade level, section, and other important details.',
    position: 'top',
    target: '#profileBtn',
    gif: getGifPath('profile view logout.gif'),
    showNext: true,
    showSkip: true
  },
  {
    id: 'complete',
    title: 'Tutorial Complete! 🎉',
    content: 'You\'re all set to use Edutaktika! Remember, you can always access this tutorial again by clicking the "Start Tutorial" button. Happy teaching!',
    position: 'center',
    showNext: false,
    showSkip: false,
    showFinish: true
  }
];

class HomepageTutorial {
  constructor() {
    this.currentStep = 0;
    this.isOpen = false;
    this.targetElement = null;
    this.targetRect = null;
    this.originalStyles = null;
    
    this.init();
  }

  init() {
    // Only show tutorial button on homepage
    const pathname = window.location.pathname.toLowerCase();
    const isHomepage = pathname.includes('homepage.html') || 
                       pathname.endsWith('/') ||
                       pathname.endsWith('/teacher/') ||
                       (pathname.includes('/teacher/') && !pathname.includes('.html') && pathname.split('/').pop() === '');
    
    if (isHomepage) {
      this.createTutorialButton();
    }
    
    // Add styles
    this.injectStyles();
  }

  createTutorialButton() {
    // Wait for navigation to be ready
    const tryAddButton = () => {
      const button = document.getElementById('homepage-tutorial-btn');
      if (button) return; // Already exists
      
      // Find the profile button in navigation
      const profileBtn = document.getElementById('profileBtn');
      if (!profileBtn) {
        // Retry if profile button not found yet
        setTimeout(tryAddButton, 100);
        return;
      }
      
      // Find the parent list item of profile button
      const profileListItem = profileBtn.closest('li');
      if (!profileListItem) {
        setTimeout(tryAddButton, 100);
        return;
      }
      
      // Create new list item for tutorial button
      const tutorialListItem = document.createElement('li');
      tutorialListItem.id = 'homepage-tutorial-li';
      
      const newButton = document.createElement('a');
      newButton.id = 'homepage-tutorial-btn';
      newButton.href = '#';
      newButton.innerHTML = '<i class="fas fa-question-circle"></i> Tutorial';
      newButton.className = 'homepage-tutorial-trigger';
      newButton.onclick = (e) => {
        e.preventDefault();
        this.startTutorial();
      };
      
      tutorialListItem.appendChild(newButton);
      
      // Insert after profile button's list item
      profileListItem.parentNode.insertBefore(tutorialListItem, profileListItem.nextSibling);
    };
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', tryAddButton);
    } else {
      setTimeout(tryAddButton, 100); // Small delay to ensure nav is rendered
    }
  }

  startTutorial() {
    this.currentStep = 0;
    this.isOpen = true;
    this.showStep();
  }

  showStep() {
    const step = HOMEPAGE_TUTORIAL_STEPS[this.currentStep];
    if (!step) return;

    // Clean up previous step
    this.cleanup();

    // Create overlay
    this.createOverlay(step);
    
    // Highlight target element if exists
    if (step.target) {
      setTimeout(() => this.highlightTarget(step.target), 100);
    }
  }

  highlightTarget(selector) {
    // Try multiple selectors
    const selectors = selector.split(',').map(s => s.trim());
    let element = null;
    
    for (const sel of selectors) {
      // Handle :contains() pseudo-selector (not supported by querySelector)
      if (sel.includes(':contains(')) {
        const textMatch = sel.match(/:contains\(["']?([^"']+)["']?\)/);
        if (textMatch) {
          const baseSelector = sel.split(':contains')[0];
          const searchText = textMatch[1].toLowerCase();
          const elements = document.querySelectorAll(baseSelector);
          for (const el of elements) {
            if (el.textContent.toLowerCase().includes(searchText)) {
              element = el;
              break;
            }
          }
        }
      } else {
        element = document.querySelector(sel);
      }
      if (element) break;
    }
    
    if (!element) {
      // Retry after a delay (max 5 retries)
      if (!this.retryCount) this.retryCount = 0;
      if (this.retryCount < 5) {
        this.retryCount++;
        setTimeout(() => this.highlightTarget(selector), 200);
      }
      return;
    }
    
    this.retryCount = 0;

    this.targetElement = element;
    const rect = element.getBoundingClientRect();
    this.targetRect = rect;

    // Scroll into view
    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

    // Store original styles
    setTimeout(() => {
      this.originalStyles = {
        transition: element.style.transition,
        zIndex: element.style.zIndex,
        boxShadow: element.style.boxShadow,
        borderRadius: element.style.borderRadius,
        animation: element.style.animation
      };

      // Add highlight
      element.style.transition = 'box-shadow 0.3s ease';
      const currentZIndex = window.getComputedStyle(element).zIndex;
      element.style.zIndex = currentZIndex === 'auto' ? '10000' : Math.max(parseInt(currentZIndex) || 0, 10000);
      element.style.boxShadow = '0 0 0 4px #137cbd, 0 0 30px rgba(19, 124, 189, 0.6), 0 0 60px rgba(19, 124, 189, 0.3)';
      element.style.borderRadius = '8px';
      element.style.animation = 'tutorialPulse 2s ease-in-out infinite';
      element.classList.add('tutorial-highlighted');
    }, 300);
  }

  cleanup() {
    if (this.targetElement) {
      if (this.originalStyles) {
        Object.keys(this.originalStyles).forEach(key => {
          if (this.originalStyles[key]) {
            this.targetElement.style[key] = this.originalStyles[key];
          } else {
            this.targetElement.style[key] = '';
          }
        });
      } else {
        this.targetElement.style.transition = '';
        this.targetElement.style.zIndex = '';
        this.targetElement.style.boxShadow = '';
        this.targetElement.style.borderRadius = '';
        this.targetElement.style.animation = '';
      }
      this.targetElement.classList.remove('tutorial-highlighted');
    }
    this.targetElement = null;
    this.targetRect = null;
    this.originalStyles = null;
  }

  createOverlay(step) {
    // Remove existing overlay
    const existing = document.getElementById('homepage-tutorial-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'homepage-tutorial-overlay';
    
    // Create spotlight effect
    if (this.targetRect) {
      const spotlight = document.createElement('div');
      spotlight.className = 'tutorial-spotlight';
      spotlight.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 999;
        pointer-events: none;
        background: radial-gradient(
          ellipse ${Math.max(this.targetRect.width + 100, 200)}px ${Math.max(this.targetRect.height + 100, 200)}px 
          at ${this.targetRect.left + this.targetRect.width / 2}px ${this.targetRect.top + this.targetRect.height / 2}px,
          transparent 0%,
          transparent 50%,
          rgba(0, 0, 0, 0.3) 70%,
          rgba(0, 0, 0, 0.4) 100%
        );
      `;
      overlay.appendChild(spotlight);
    }

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'tutorial-modal';
    modal.style.cssText = this.getModalStyle(step);
    
    const content = `
      <div class="tutorial-modal-content">
        <div class="tutorial-header">
          <h3>${step.title}</h3>
          <button class="tutorial-close" onclick="homepageTutorial.closeTutorial()">&times;</button>
        </div>
        <p class="tutorial-text">${step.content}</p>
        ${step.gif ? `
          <div class="tutorial-gif-container">
            <img src="${step.gif}" alt="Tutorial demonstration" onerror="this.parentElement.innerHTML='<div style=\\'padding:20px;text-align:center;color:#666;\\'>Tutorial GIF unavailable</div>'">
          </div>
        ` : ''}
        <div class="tutorial-footer">
          <span class="tutorial-step-count">Step ${this.currentStep + 1} of ${HOMEPAGE_TUTORIAL_STEPS.length}</span>
          <div class="tutorial-buttons">
            ${step.showSkip ? `<button class="tutorial-btn tutorial-btn-skip" onclick="homepageTutorial.skipTutorial()">Skip Tutorial</button>` : ''}
            ${step.showNext ? `<button class="tutorial-btn tutorial-btn-next" onclick="homepageTutorial.nextStep()">Next <i class="fas fa-arrow-right"></i></button>` : ''}
            ${step.showFinish ? `<button class="tutorial-btn tutorial-btn-finish" onclick="homepageTutorial.finishTutorial()">Finish <i class="fas fa-check"></i></button>` : ''}
          </div>
        </div>
      </div>
    `;
    
    modal.innerHTML = content;
    overlay.appendChild(modal);
    
    // Add arrow if target exists
    if (this.targetRect && step.target) {
      const arrow = this.createArrow(step);
      if (arrow) overlay.appendChild(arrow);
    }

    document.body.appendChild(overlay);
  }

  getModalStyle(step) {
    const baseMaxWidth = step.gif ? '900px' : '500px';
    const sideMaxWidth = step.gif ? '700px' : '400px';
    
    // Check if target is navigation (top)
    const isNavTarget = step.target && (
      step.target.includes('nav') || 
      step.target.includes('#lessonNavBtn') ||
      step.target.includes('#profileBtn')
    );

    if (this.targetRect) {
      const modalWidth = step.gif ? 900 : 500;
      const spaceLeft = this.targetRect.left;
      const spaceRight = window.innerWidth - this.targetRect.right;
      const spaceTop = this.targetRect.top;
      const spaceBottom = window.innerHeight - this.targetRect.bottom;

      // If target is at top (navigation), place modal below
      if (isNavTarget || this.targetRect.top < window.innerHeight / 3) {
        return `
          position: fixed;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1001;
          max-width: ${baseMaxWidth};
          max-height: 70vh;
          overflow-y: auto;
        `;
      }
      // If target is at bottom, place modal above
      else if (this.targetRect.bottom > window.innerHeight * 2 / 3) {
        return `
          position: fixed;
          top: 40px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1001;
          max-width: ${baseMaxWidth};
          max-height: 70vh;
          overflow-y: auto;
        `;
      }
    }

    // Default positioning based on step position
    switch (step.position) {
      case 'top':
        return `
          position: fixed;
          top: 40px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1001;
          max-width: ${baseMaxWidth};
          max-height: 70vh;
          overflow-y: auto;
        `;
      case 'bottom':
        return `
          position: fixed;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1001;
          max-width: ${baseMaxWidth};
          max-height: 70vh;
          overflow-y: auto;
        `;
      default: // center
        return `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1001;
          max-width: ${baseMaxWidth};
          max-height: 85vh;
          overflow-y: auto;
        `;
    }
  }

  createArrow(step) {
    if (!this.targetRect) return null;

    const arrow = document.createElement('div');
    arrow.className = 'tutorial-arrow';
    
    // Determine arrow direction based on modal position
    const targetCenterX = this.targetRect.left + this.targetRect.width / 2;
    const targetCenterY = this.targetRect.top + this.targetRect.height / 2;
    
    // If target is at top (navigation), arrow points up
    if (this.targetRect.top < window.innerHeight / 3) {
      arrow.style.cssText = `
        position: fixed;
        left: ${targetCenterX - 10}px;
        top: ${this.targetRect.bottom + 10}px;
        z-index: 1002;
        pointer-events: none;
        width: 0;
        height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-top: 20px solid #137cbd;
        filter: drop-shadow(0 2px 4px rgba(19, 124, 189, 0.5));
      `;
      return arrow;
    }
    
    return null;
  }

  nextStep() {
    if (this.currentStep < HOMEPAGE_TUTORIAL_STEPS.length - 1) {
      this.currentStep++;
      this.showStep();
    }
  }

  skipTutorial() {
    this.closeTutorial();
    localStorage.setItem('edutaktika-homepage-tutorial-completed', 'true');
    // Keep button visible - don't remove it
  }

  finishTutorial() {
    this.closeTutorial();
    localStorage.setItem('edutaktika-homepage-tutorial-completed', 'true');
    // Keep button visible - don't remove it
  }

  closeTutorial() {
    this.cleanup();
    this.isOpen = false;
    const overlay = document.getElementById('homepage-tutorial-overlay');
    if (overlay) overlay.remove();
  }

  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
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
      
      #homepage-tutorial-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.4);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .tutorial-modal {
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        overflow: hidden;
      }
      
      .tutorial-modal-content {
        padding: 24px;
      }
      
      .tutorial-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .tutorial-header h3 {
        margin: 0;
        color: #137cbd;
        font-size: 24px;
        font-weight: 600;
      }
      
      .tutorial-close {
        background: none;
        border: none;
        font-size: 28px;
        color: #666;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background 0.2s;
      }
      
      .tutorial-close:hover {
        background: #f0f0f0;
      }
      
      .tutorial-text {
        margin-bottom: 20px;
        line-height: 1.6;
        color: #333;
        font-size: 16px;
      }
      
      .tutorial-gif-container {
        margin-bottom: 20px;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        background: #f5f5f5;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 300px;
        max-height: 500px;
        position: relative;
        width: 100%;
      }
      
      .tutorial-gif-container img {
        max-width: 100%;
        max-height: 500px;
        width: auto;
        height: auto;
        display: block;
        object-fit: contain;
      }
      
      .tutorial-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 20px;
      }
      
      .tutorial-step-count {
        font-size: 12px;
        color: #666;
      }
      
      .tutorial-buttons {
        display: flex;
        gap: 10px;
      }
      
      .tutorial-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .tutorial-btn-skip {
        background: transparent;
        color: #666;
      }
      
      .tutorial-btn-skip:hover {
        background: #f0f0f0;
      }
      
      .tutorial-btn-next {
        background: #137cbd;
        color: white;
      }
      
      .tutorial-btn-next:hover {
        background: #0f5a8a;
      }
      
      .tutorial-btn-finish {
        background: #0f9960;
        color: white;
      }
      
      .tutorial-btn-finish:hover {
        background: #0d8050;
      }
      
      .homepage-tutorial-trigger {
        display: flex;
        align-items: center;
        height: 48px;
        line-height: 48px;
        padding: 0 18px;
        color: #2d3923;
        text-decoration: none;
        font-size: 1rem;
        background: none;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
        gap: 6px;
      }
      
      .homepage-tutorial-trigger:hover {
        color: #137cbd;
        background: rgba(19, 124, 189, 0.1);
        border-radius: 4px;
      }
      
      .homepage-tutorial-trigger i {
        font-size: 16px;
      }
      
      #homepage-tutorial-li {
        list-style: none;
        margin: 0 10px;
        position: relative;
        height: 100%;
        display: flex;
        align-items: center;
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize tutorial when DOM is ready
let homepageTutorial;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    homepageTutorial = new HomepageTutorial();
    window.homepageTutorial = homepageTutorial; // Make it globally accessible
  });
} else {
  homepageTutorial = new HomepageTutorial();
  window.homepageTutorial = homepageTutorial;
}

