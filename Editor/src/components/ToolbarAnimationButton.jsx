import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

/**
 * Injects a "More Animations" button into Polotno's toolbar
 * next to the Position button
 */
export const ToolbarAnimationButton = observer(({ store }) => {
  const [buttonElement, setButtonElement] = useState(null);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 50; // Try for up to 5 seconds (50 * 100ms)

    const injectButton = () => {
      // Find the toolbar
      const toolbar = document.querySelector('.polotno-toolbar');
      if (!toolbar) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(injectButton, 100);
        }
        return;
      }

      // Check if button already exists
      if (toolbar.querySelector('[data-more-animations-button]')) {
        return;
      }

      // Find the Position button - it's usually in a button with text "Position" or aria-label containing "position"
      const allButtons = Array.from(toolbar.querySelectorAll('button, [role="button"]'));
      const positionButton = allButtons.find(btn => {
        const text = (btn.textContent || '').toLowerCase().trim();
        const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
        const title = (btn.getAttribute('title') || '').toLowerCase();
        return text === 'position' || ariaLabel.includes('position') || title.includes('position');
      });

      if (!positionButton) {
        // Retry after a short delay if Position button not found yet
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(injectButton, 100);
        }
        return;
      }

      // Find the parent container (usually a div or span that groups buttons)
      let container = positionButton.parentElement;
      
      // Look for a common parent that contains multiple buttons (toolbar group)
      while (container && container !== toolbar) {
        const siblingButtons = Array.from(container.querySelectorAll('button, [role="button"]'));
        if (siblingButtons.length > 1) {
          break;
        }
        container = container.parentElement;
      }

      // Create the More Animations button
      const moreAnimationsBtn = document.createElement('button');
      moreAnimationsBtn.setAttribute('data-more-animations-button', 'true');
      moreAnimationsBtn.setAttribute('type', 'button');
      moreAnimationsBtn.className = positionButton.className || 'bp5-button bp5-minimal';
      moreAnimationsBtn.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        margin: 0 4px;
        color: #137cbd;
        font-weight: 500;
        border: none;
        background: transparent;
        cursor: pointer;
        white-space: nowrap;
      `;
      
      // Add icon (sparkle/flash)
      const icon = document.createElement('span');
      icon.innerHTML = '✨';
      icon.style.cssText = 'font-size: 16px; line-height: 1;';
      
      // Add text
      const text = document.createElement('span');
      text.textContent = 'More Animations';
      text.className = 'bp5-button-text';
      
      moreAnimationsBtn.appendChild(icon);
      moreAnimationsBtn.appendChild(text);
      
      // Add click handler
      moreAnimationsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent('toggle-animation-panel'));
      });
      
      // Insert right after Position button in the same line
      const positionParent = positionButton.parentElement;
      if (positionParent) {
        // Insert directly after Position button
        if (positionButton.nextSibling) {
          positionParent.insertBefore(moreAnimationsBtn, positionButton.nextSibling);
        } else {
          positionParent.appendChild(moreAnimationsBtn);
        }
      } else {
        // Fallback: insert after Position button itself
        if (positionButton.nextSibling) {
          positionButton.parentElement?.insertBefore(moreAnimationsBtn, positionButton.nextSibling);
        } else {
          positionButton.parentElement?.appendChild(moreAnimationsBtn);
        }
      }
      
      setButtonElement(moreAnimationsBtn);
    };

    // Try to inject immediately
    injectButton();
    
    // Also listen for toolbar updates (when elements are selected/deselected)
    const observer = new MutationObserver(() => {
      const toolbar = document.querySelector('.polotno-toolbar');
      if (toolbar && !toolbar.querySelector('[data-more-animations-button]')) {
        retryCount = 0; // Reset retry count
        injectButton();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
      if (buttonElement) {
        buttonElement.remove();
      }
    };
  }, [buttonElement]);

  return null; // This component doesn't render anything directly
});

export default ToolbarAnimationButton;

