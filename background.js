// Background service worker for Study Sidebar Notes

// Track sidebar state per tab
const sidebarState = new Map();

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Check if we can inject into this tab
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
      console.log('Cannot inject sidebar into this page');
      return;
    }

    // Toggle sidebar for this tab
    const tabId = tab.id;
    const currentState = sidebarState.get(tabId) || false;
    const newState = !currentState;
    
    // Send message to content script
    chrome.tabs.sendMessage(tabId, {
      action: 'toggleSidebar',
      show: newState
    }).catch(() => {
      // Content script might not be ready, inject it
      injectContentScript(tabId);
    });
    
    sidebarState.set(tabId, newState);
  } catch (error) {
    console.error('Error toggling sidebar:', error);
  }
});

// Clean up when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  sidebarState.delete(tabId);
});

// Handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === '_execute_action') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.action.onClicked.dispatch(tabs[0]);
      }
    });
  }
});

// Inject content script if needed
async function injectContentScript(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });
    
    // Send the toggle message after injection
    setTimeout(() => {
      chrome.tabs.sendMessage(tabId, {
        action: 'toggleSidebar',
        show: true
      });
    }, 100);
  } catch (error) {
    console.error('Failed to inject content script:', error);
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'sidebarClosed') {
    const tabId = sender.tab?.id;
    if (tabId) {
      sidebarState.set(tabId, false);
    }
  }
  
  if (message.action === 'getSidebarState') {
    const tabId = sender.tab?.id;
    sendResponse({ isOpen: sidebarState.get(tabId) || false });
  }
  
  return true;
});