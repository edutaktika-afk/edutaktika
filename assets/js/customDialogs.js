/**
 * Custom Dialog System - Matches Loading Box Design
 * Replaces native confirm(), alert(), and prompt() with styled modals
 */

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Custom Confirm Dialog
function customConfirm(message, title = 'Confirm') {
    return new Promise((resolve) => {
        // Escape HTML to prevent injection and newline issues
        const safeTitle = escapeHtml(title);
        const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.id = 'custom-confirm-overlay';
        overlay.style.zIndex = '100000'; // Higher than lesson management modal (99999)
        
        // Create container
        const container = document.createElement('div');
        container.className = 'loading-container';
        container.style.maxWidth = '450px';
        container.style.padding = '40px 50px';
        
        // Create content
        container.innerHTML = `
            <div style="margin-bottom: 24px;">
                <i class="fas fa-question-circle" style="font-size: 48px; color: #2e8b57; margin-bottom: 16px;"></i>
                <div class="loading-text" style="font-size: 16px; margin-bottom: 12px;">${safeTitle}</div>
                <div class="loading-subtext" style="font-size: 14px; line-height: 1.5; color: #475569;">${safeMessage}</div>
            </div>
            <div style="display: flex; gap: 12px; justify-content: center; width: 100%;">
                <button id="custom-confirm-cancel" style="background: #e2e8f0; color: #475569; border: none; border-radius: 8px; padding: 10px 24px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                    Cancel
                </button>
                <button id="custom-confirm-ok" style="background: #2e8b57; color: white; border: none; border-radius: 8px; padding: 10px 24px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                    OK
                </button>
            </div>
        `;
        
        overlay.appendChild(container);
        document.body.appendChild(overlay);
        
        // Button handlers
        const okBtn = document.getElementById('custom-confirm-ok');
        const cancelBtn = document.getElementById('custom-confirm-cancel');
        
        okBtn.onmouseover = () => okBtn.style.background = '#3ac28d';
        okBtn.onmouseout = () => okBtn.style.background = '#2e8b57';
        cancelBtn.onmouseover = () => cancelBtn.style.background = '#cbd5e1';
        cancelBtn.onmouseout = () => cancelBtn.style.background = '#e2e8f0';
        
        okBtn.onclick = () => {
            document.body.removeChild(overlay);
            resolve(true);
        };
        
        cancelBtn.onclick = () => {
            document.body.removeChild(overlay);
            resolve(false);
        };
        
        // Close on overlay click (outside container)
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                resolve(false);
            }
        };
    });
}

// Custom Alert Dialog
function customAlert(message, title = 'Alert') {
    return new Promise((resolve) => {
        // Escape HTML to prevent injection and newline issues
        const safeTitle = escapeHtml(title);
        const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.id = 'custom-alert-overlay';
        overlay.style.zIndex = '100000'; // Higher than lesson management modal (99999)
        
        // Create container
        const container = document.createElement('div');
        container.className = 'loading-container';
        container.style.maxWidth = '450px';
        container.style.padding = '40px 50px';
        
        // Create content
        container.innerHTML = `
            <div style="margin-bottom: 24px;">
                <i class="fas fa-info-circle" style="font-size: 48px; color: #2e8b57; margin-bottom: 16px;"></i>
                <div class="loading-text" style="font-size: 16px; margin-bottom: 12px;">${safeTitle}</div>
                <div class="loading-subtext" style="font-size: 14px; line-height: 1.5; color: #475569;">${safeMessage}</div>
            </div>
            <div style="display: flex; justify-content: center; width: 100%;">
                <button id="custom-alert-ok" style="background: #2e8b57; color: white; border: none; border-radius: 8px; padding: 10px 24px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                    OK
                </button>
            </div>
        `;
        
        overlay.appendChild(container);
        document.body.appendChild(overlay);
        
        // Button handler
        const okBtn = document.getElementById('custom-alert-ok');
        
        okBtn.onmouseover = () => okBtn.style.background = '#3ac28d';
        okBtn.onmouseout = () => okBtn.style.background = '#2e8b57';
        
        okBtn.onclick = () => {
            document.body.removeChild(overlay);
            resolve();
        };
        
        // Close on overlay click (outside container)
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                resolve();
            }
        };
    });
}

// Custom Prompt Dialog
function customPrompt(message, defaultValue = '', title = 'Input') {
    return new Promise((resolve) => {
        // Escape HTML to prevent injection and newline issues
        const safeTitle = escapeHtml(title);
        const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
        const safeDefaultValue = escapeHtml(defaultValue);
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.id = 'custom-prompt-overlay';
        overlay.style.zIndex = '100000'; // Higher than lesson management modal (99999)
        
        // Create container
        const container = document.createElement('div');
        container.className = 'loading-container';
        container.style.maxWidth = '450px';
        container.style.padding = '40px 50px';
        
        // Create input field
        const inputId = 'custom-prompt-input-' + Date.now();
        
        // Create content
        container.innerHTML = `
            <div style="margin-bottom: 24px; width: 100%;">
                <i class="fas fa-keyboard" style="font-size: 48px; color: #2e8b57; margin-bottom: 16px;"></i>
                <div class="loading-text" style="font-size: 16px; margin-bottom: 12px;">${safeTitle}</div>
                <div class="loading-subtext" style="font-size: 14px; line-height: 1.5; color: #475569; margin-bottom: 16px;">${safeMessage}</div>
                <input type="text" id="${inputId}" value="${safeDefaultValue}" style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px; font-family: 'Manrope', sans-serif; transition: border 0.2s; box-sizing: border-box;" placeholder="Enter value...">
            </div>
            <div style="display: flex; gap: 12px; justify-content: center; width: 100%;">
                <button id="custom-prompt-cancel" style="background: #e2e8f0; color: #475569; border: none; border-radius: 8px; padding: 10px 24px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                    Cancel
                </button>
                <button id="custom-prompt-ok" style="background: #2e8b57; color: white; border: none; border-radius: 8px; padding: 10px 24px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                    OK
                </button>
            </div>
        `;
        
        overlay.appendChild(container);
        document.body.appendChild(overlay);
        
        // Focus input
        const input = document.getElementById(inputId);
        input.focus();
        input.select();
        
        // Input styling on focus
        input.onfocus = () => input.style.borderColor = '#2e8b57';
        input.onblur = () => input.style.borderColor = '#e2e8f0';
        
        // Enter key handler
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('custom-prompt-ok').click();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                document.getElementById('custom-prompt-cancel').click();
            }
        };
        
        // Button handlers
        const okBtn = document.getElementById('custom-prompt-ok');
        const cancelBtn = document.getElementById('custom-prompt-cancel');
        
        okBtn.onmouseover = () => okBtn.style.background = '#3ac28d';
        okBtn.onmouseout = () => okBtn.style.background = '#2e8b57';
        cancelBtn.onmouseover = () => cancelBtn.style.background = '#cbd5e1';
        cancelBtn.onmouseout = () => cancelBtn.style.background = '#e2e8f0';
        
        okBtn.onclick = () => {
            const value = input.value;
            document.body.removeChild(overlay);
            resolve(value);
        };
        
        cancelBtn.onclick = () => {
            document.body.removeChild(overlay);
            resolve(null);
        };
        
        // Close on overlay click (outside container)
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                resolve(null);
            }
        };
    });
}

// Export functions
window.customConfirm = customConfirm;
window.customAlert = customAlert;
window.customPrompt = customPrompt;

