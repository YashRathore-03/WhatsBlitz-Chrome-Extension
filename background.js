// WhatsBlitz Background Service Worker
console.log('WhatsBlitz background script loaded');

// Extension installation handler
chrome.runtime.onInstalled.addListener((details) => {
  console.log('WhatsBlitz extension installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    // First time installation
    console.log('WhatsBlitz installed for the first time');
    
    // Set default settings
    chrome.storage.local.set({
      whatsblitz_settings: {
        delay_min: 5,
        delay_max: 15,
        auto_start: false,
        notifications: true,
        history_limit: 500
      },
      whatsblitz_stats: {
        total_sent: 0,
        total_failed: 0,
        sessions: 0,
        last_used: null
      }
    });
    
    // Open welcome page
    chrome.tabs.create({
      url: 'https://web.whatsapp.com'
    });
  }
});

// Extension startup handler
chrome.runtime.onStartup.addListener(() => {
  console.log('WhatsBlitz extension started');
});

// Tab update handler - inject content script when WhatsApp Web loads
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Check if it's WhatsApp Web and page is complete
  if (changeInfo.status === 'complete' && 
      tab.url && 
      tab.url.includes('web.whatsapp.com')) {
    
    console.log('WhatsApp Web loaded, ensuring content script is injected');
    
    try {
      // Check if content script is already injected
      const results = await chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: () => window.whatsBlitzInjected || false
      });
      
      if (!results[0].result) {
        // Inject content script
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['libs/xlsx.full.min.js', 'content.js']
        });
        
        // Inject CSS
        await chrome.scripting.insertCSS({
          target: { tabId: tabId },
          files: ['popup.css']
        });
        
        console.log('Content script injected into WhatsApp Web');
      }
      
    } catch (error) {
      console.error('Error injecting content script:', error);
    }
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  console.log('Extension icon clicked');
  
  if (tab.url && tab.url.includes('web.whatsapp.com')) {
    // Already on WhatsApp Web, just show popup
    console.log('Already on WhatsApp Web');
  } else {
    // Open WhatsApp Web
    chrome.tabs.create({ 
      url: 'https://web.whatsapp.com',
      active: true
    });
  }
});

// Message handler for communication between content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  switch (request.action) {
    case 'log':
      console.log('WhatsBlitz Log:', request.data);
      sendResponse({ success: true });
      break;
      
    case 'updateStats':
      updateStats(request.data);
      sendResponse({ success: true });
      break;
      
    case 'getSettings':
      getSettings().then(settings => {
        sendResponse({ success: true, data: settings });
      });
      return true; // Will respond asynchronously
      
    case 'saveSettings':
      saveSettings(request.data).then(() => {
        sendResponse({ success: true });
      });
      return true; // Will respond asynchronously
      
    case 'notification':
      showNotification(request.title, request.message, request.type);
      sendResponse({ success: true });
      break;
      
    default:
      console.log('Unknown message action:', request.action);
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Update extension statistics
async function updateStats(data) {
  try {
    const result = await chrome.storage.local.get(['whatsblitz_stats']);
    const stats = result.whatsblitz_stats || {
      total_sent: 0,
      total_failed: 0,
      sessions: 0,
      last_used: null
    };
    
    // Update stats
    if (data.sent) stats.total_sent += data.sent;
    if (data.failed) stats.total_failed += data.failed;
    if (data.session_start) stats.sessions += 1;
    stats.last_used = new Date().toISOString();
    
    // Save updated stats
    await chrome.storage.local.set({ whatsblitz_stats: stats });
    console.log('Stats updated:', stats);
    
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

// Get extension settings
async function getSettings() {
  try {
    const result = await chrome.storage.local.get(['whatsblitz_settings']);
    return result.whatsblitz_settings || {
      delay_min: 5,
      delay_max: 15,
      auto_start: false,
      notifications: true,
      history_limit: 500
    };
  } catch (error) {
    console.error('Error getting settings:', error);
    return {};
  }
}

// Save extension settings
async function saveSettings(settings) {
  try {
    await chrome.storage.local.set({ whatsblitz_settings: settings });
    console.log('Settings saved:', settings);
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// Show notification
function showNotification(title, message, type = 'basic') {
  if (chrome.notifications) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: title,
      message: message
    });
  }
}

// Handle notification clicks
if (chrome.notifications) {
  chrome.notifications.onClicked.addListener((notificationId) => {
    console.log('Notification clicked:', notificationId);
    
    // Focus WhatsApp Web tab
    chrome.tabs.query({ url: 'https://web.whatsapp.com/*' }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.update(tabs[0].id, { active: true });
        chrome.windows.update(tabs[0].windowId, { focused: true });
      }
    });
  });
}

// Cleanup on extension suspend
chrome.runtime.onSuspend.addListener(() => {
  console.log('WhatsBlitz extension suspending');
});

// Handle external connections (for future API integrations)
chrome.runtime.onConnectExternal.addListener((port) => {
  console.log('External connection established:', port);
  
  port.onMessage.addListener((msg) => {
    console.log('External message received:', msg);
    
    // Handle external API requests here
    switch (msg.action) {
      case 'ping':
        port.postMessage({ success: true, message: 'WhatsBlitz is running' });
        break;
      default:
        port.postMessage({ success: false, error: 'Unknown action' });
    }
  });
});

// Periodic cleanup of old data
setInterval(async () => {
  try {
    // Clean up old history entries
    const result = await chrome.storage.local.get(['whatsblitz_history']);
    const history = result.whatsblitz_history || [];
    
    if (history.length > 1000) {
      // Keep only last 500 entries
      const cleanedHistory = history.slice(0, 500);
      await chrome.storage.local.set({ whatsblitz_history: cleanedHistory });
      console.log('Cleaned up old history entries');
    }
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}, 24 * 60 * 60 * 1000); // Run daily

// Error handling for unhandled promise rejections
self.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection in background script:', event.reason);
});

// Global error handler
self.addEventListener('error', (event) => {
  console.error('Global error in background script:', event.error);
});

console.log('WhatsBlitz background script initialization complete');
