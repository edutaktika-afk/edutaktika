/**
 * License Banner Handler
 * Handles hiding and customizing the Polotno license banner
 */

// Import config dynamically to avoid circular dependency
let config = null;

class LicenseBannerHandler {
  constructor() {
    this.bannerSelectors = [
      '[class*="license"]',
      '[class*="banner"]',
      '[class*="watermark"]',
      '[class*="polotno"]',
      '.bp5-toast',
      '.bp5-overlay',
      '[data-testid*="license"]',
      '[data-testid*="banner"]'
    ];
    
    this.observer = null;
    this.isHidden = false;
    this.customOverlay = null;
    
    this.init();
  }
  
  init() {
    // Get config dynamically
    this.getConfig();
    
    // Hide banner immediately if in presentation or view-only mode
    if (config && config.license.hideInPresentation && config.isPresentation) {
      this.hideBanner();
    }
    
    if (config && config.license.hideInViewOnly && config.isViewOnly) {
      this.hideBanner();
    }
    
    // Start observing for banner elements
    this.startObserving();
    
    // Create custom overlay if needed
    if (config && config.license.customOverlay) {
      this.createCustomOverlay();
    }
  }
  
  getConfig() {
    if (!config) {
      // Try to get config from window or import it
      if (window.edutaktikaConfig) {
        config = window.edutaktikaConfig;
      } else {
        // Fallback configuration
        config = {
          isPresentation: new URLSearchParams(window.location.search).get('present') === 'true',
          isViewOnly: new URLSearchParams(window.location.search).get('view') === 'true',
          license: {
            hideInPresentation: true,
            hideInViewOnly: true,
            customOverlay: true
          }
        };
      }
    }
    return config;
  }
  
  startObserving() {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.checkAndHideBanner(node);
          }
        });
      });
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Also check existing elements
    this.checkExistingBanners();
  }
  
  checkExistingBanners() {
    this.bannerSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (this.isLicenseBanner(element)) {
          this.hideElement(element);
        }
      });
    });
  }
  
  checkAndHideBanner(element) {
    // Check if the element itself is a banner
    if (this.isLicenseBanner(element)) {
      this.hideElement(element);
      return;
    }
    
    // Check children
    this.bannerSelectors.forEach(selector => {
      const banners = element.querySelectorAll(selector);
      banners.forEach(banner => {
        if (this.isLicenseBanner(banner)) {
          this.hideElement(banner);
        }
      });
    });
  }
  
  isLicenseBanner(element) {
    if (!element || !element.textContent) return false;
    
    const text = element.textContent.toLowerCase();
    const className = element.className.toLowerCase();
    const id = element.id.toLowerCase();
    
    // Check for license-related text
    const licenseKeywords = [
      'license',
      'free version',
      'upgrade',
      'premium',
      'pro',
      'subscription',
      'plan',
      'limitation',
      'watermark',
      'polotno',
      'trial',
      'demo'
    ];
    
    const hasLicenseText = licenseKeywords.some(keyword => 
      text.includes(keyword) || className.includes(keyword) || id.includes(keyword)
    );
    
    // Check for banner-like positioning
    const computedStyle = window.getComputedStyle(element);
    const isPositioned = computedStyle.position === 'fixed' || computedStyle.position === 'absolute';
    const isTopPositioned = computedStyle.top === '0px' || computedStyle.top === '0';
    
    return hasLicenseText && isPositioned && isTopPositioned;
  }
  
  hideElement(element) {
    if (!element || this.isHidden) return;
    
    // Add custom styling to hide the banner
    element.style.display = 'none !important';
    element.style.visibility = 'hidden !important';
    element.style.opacity = '0 !important';
    element.style.height = '0 !important';
    element.style.overflow = 'hidden !important';
    
    // Add a class for additional CSS targeting
    element.classList.add('license-banner-hidden');
    
    console.log('🚫 License banner hidden:', element);
  }
  
  hideBanner() {
    this.isHidden = true;
    
    // Hide all potential banner elements
    this.bannerSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (this.isLicenseBanner(element)) {
          this.hideElement(element);
        }
      });
    });
    
    // Add CSS to prevent new banners from showing
    this.addHideCSS();
  }
  
  addHideCSS() {
    const style = document.createElement('style');
    style.id = 'license-banner-hider';
    style.textContent = `
      /* Hide license banners */
      .license-banner-hidden,
      [class*="license"],
      [class*="banner"],
      [class*="watermark"],
      .bp5-toast[class*="license"],
      .bp5-overlay[class*="license"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
        pointer-events: none !important;
      }
      
      /* Hide in presentation mode */
      .env-presentation [class*="license"],
      .env-presentation [class*="banner"],
      .env-presentation [class*="watermark"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
        pointer-events: none !important;
      }
      
      /* Hide in view-only mode */
      .env-view-only [class*="license"],
      .env-view-only [class*="banner"],
      .env-view-only [class*="watermark"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
        pointer-events: none !important;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  createCustomOverlay() {
    // Create a custom overlay that can cover any license banners
    this.customOverlay = document.createElement('div');
    this.customOverlay.id = 'license-banner-overlay';
    this.customOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      pointer-events: none;
      z-index: 999999;
      display: none;
    `;
    
    document.body.appendChild(this.customOverlay);
  }
  
  showOverlay() {
    this.getConfig();
    if (this.customOverlay && config && config.isPresentation) {
      this.customOverlay.style.display = 'block';
    }
  }
  
  hideOverlay() {
    if (this.customOverlay) {
      this.customOverlay.style.display = 'none';
    }
  }
  
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    const style = document.getElementById('license-banner-hider');
    if (style) {
      style.remove();
    }
    
    if (this.customOverlay) {
      this.customOverlay.remove();
    }
  }
}

// Create global instance
const licenseHandler = new LicenseBannerHandler();

// Export for use in other modules
export default licenseHandler;

// Auto-hide on presentation mode - will be handled in init()
