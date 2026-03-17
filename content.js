// Content script for Study Sidebar Notes

let sidebarIframe = null;
let floatingButton = null;
let isSidebarOpen = false;

// Create floating toggle button
function createFloatingButton() {
  if (floatingButton) return;
  
  floatingButton = document.createElement('div');
  floatingButton.id = 'study-sidebar-floating-button';
  floatingButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;
  
  floatingButton.addEventListener('click', () => {
    toggleSidebar();
  });
  
  // Add styles for floating button
  const style = document.createElement('style');
  style.textContent = `
    #study-sidebar-floating-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      z-index: 999998;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      border: none;
    }
    
    #study-sidebar-floating-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
    }
    
    #study-sidebar-floating-button svg {
      width: 24px;
      height: 24px;
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(floatingButton);
}

// Create sidebar iframe
function createSidebar() {
  if (sidebarIframe) return;
  
  sidebarIframe = document.createElement('iframe');
  sidebarIframe.id = 'study-sidebar-iframe';
  sidebarIframe.src = chrome.runtime.getURL('sidebar.html');
  sidebarIframe.style.cssText = `
    position: fixed;
    top: 0;
    right: -400px;
    width: 350px;
    height: 100vh;
    border: none;
    z-index: 999999;
    box-shadow: -5px 0 30px rgba(0, 0, 0, 0.3);
    transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: transparent;
    pointer-events: none;
  `;
  
  document.body.appendChild(sidebarIframe);
  
  // When iframe loads, enable pointer events
  sidebarIframe.onload = () => {
    sidebarIframe.style.pointerEvents = 'auto';
  };
}

// Toggle sidebar
function toggleSidebar(show = null) {
  if (!sidebarIframe) {
    createSidebar();
  }
  
  // Small delay to ensure iframe is created
  setTimeout(() => {
    if (show === null) {
      isSidebarOpen = !isSidebarOpen;
    } else {
      isSidebarOpen = show;
    }
    
    if (sidebarIframe) {
      sidebarIframe.style.right = isSidebarOpen ? '0' : '-400px';
      
      // Send current URL to sidebar when opened
      if (isSidebarOpen) {
        setTimeout(() => {
          sidebarIframe.contentWindow.postMessage({
            action: 'urlChanged',
            url: window.location.href,
            domain: window.location.hostname
          }, '*');
        }, 100);
      }
    }
    
    // Update floating button visibility
    if (floatingButton) {
      floatingButton.style.opacity = isSidebarOpen ? '0' : '1';
      floatingButton.style.pointerEvents = isSidebarOpen ? 'none' : 'auto';
    }
  }, 50);
}

// Listen for messages from background and iframe
window.addEventListener('message', (event) => {
  // Only accept messages from our extension
  if (event.data.action === 'closeSidebar') {
    toggleSidebar(false);
  }
  
  if (event.data.action === 'minimizeSidebar') {
    toggleSidebar(false);
  }
  
  if (event.data.action === 'getCurrentUrl') {
    event.source.postMessage({
      action: 'currentUrl',
      url: window.location.href,
      domain: window.location.hostname
    }, '*');
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleSidebar') {
    toggleSidebar(message.show);
  }
  
  if (message.action === 'getState') {
    sendResponse({ isOpen: isSidebarOpen });
  }
});

// Handle URL changes (SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    if (sidebarIframe && isSidebarOpen) {
      sidebarIframe.contentWindow.postMessage({
        action: 'urlChanged',
        url: url,
        domain: location.hostname
      }, '*');
    }
  }
}).observe(document, { subtree: true, childList: true });

// Initialize
function init() {
  createFloatingButton();
  createSidebar();
  
  // Check initial state
  chrome.runtime.sendMessage({ action: 'getSidebarState' }, (response) => {
    if (response && response.isOpen) {
      toggleSidebar(true);
    }
  });
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}