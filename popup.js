// WhatsBlitz Popup Script
document.addEventListener('DOMContentLoaded', async () => {
  console.log('WhatsBlitz popup loaded');
  
  // Initialize popup
  await initializePopup();
  
  // Attach event listeners
  attachEventListeners();
  
  // Start status checking
  startStatusChecking();
});

// Initialize popup functionality
async function initializePopup() {
  try {
    // Check if we have access to tabs
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('Current tab:', tabs[0]?.url);
    
    // Update extension status
    updateExtensionStatus('success', 'Extension ready');
    
  } catch (error) {
    console.error('Popup initialization error:', error);
    updateExtensionStatus('error', 'Extension error');
  }
}

// Attach event listeners
function attachEventListeners() {
  // Open WhatsApp Web button
  document.getElementById('open-whatsapp-btn').addEventListener('click', openWhatsAppWeb);
  
  // Download sample file button
  document.getElementById('download-sample-btn').addEventListener('click', downloadSampleFile);
}

// Start checking WhatsApp status
function startStatusChecking() {
  checkWhatsAppStatus();
  
  // Check every 3 seconds
  setInterval(checkWhatsAppStatus, 3000);
}

// Check WhatsApp Web status
async function checkWhatsAppStatus() {
  try {
    // Find WhatsApp Web tab
    const tabs = await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' });
    
    if (tabs.length === 0) {
      updateWhatsAppStatus('error', 'WhatsApp Web not open');
      return;
    }
    
    const whatsappTab = tabs[0];
    
    // Check if tab is loaded
    if (whatsappTab.status !== 'complete') {
      updateWhatsAppStatus('loading', 'WhatsApp Web loading...');
      return;
    }
    
    // Execute script to check login status
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: whatsappTab.id },
        function: checkWhatsAppLoginStatus
      });
      
      const status = results[0].result;
      
      switch (status) {
        case 'logged_in':
          updateWhatsAppStatus('success', 'WhatsApp Web ready');
          break;
        case 'qr_code':
          updateWhatsAppStatus('warning', 'Please scan QR code to login');
          break;
        case 'loading':
          updateWhatsAppStatus('loading', 'WhatsApp Web loading...');
          break;
        default:
          updateWhatsAppStatus('error', 'WhatsApp Web status unknown');
      }
      
    } catch (scriptError) {
      console.error('Script execution error:', scriptError);
      updateWhatsAppStatus('warning', 'WhatsApp Web detected, checking status...');
    }
    
  } catch (error) {
    console.error('Status check error:', error);
    updateWhatsAppStatus('error', 'Error checking WhatsApp status');
  }
}

// Function to check WhatsApp login status (injected into WhatsApp Web)
function checkWhatsAppLoginStatus() {
  // Check for QR code
  const qrCode = document.querySelector('[data-testid="qr-code"]');
  if (qrCode) {
    return 'qr_code';
  }
  
  // Check for chat list (indicates logged in)
  const chatList = document.querySelector('[data-testid="chat-list"]');
  if (chatList) {
    return 'logged_in';
  }
  
  // Check for loading indicators
  const loadingIndicators = document.querySelectorAll('[data-testid="loading"]');
  if (loadingIndicators.length > 0) {
    return 'loading';
  }
  
  return 'unknown';
}

// Update WhatsApp status display
function updateWhatsAppStatus(type, message) {
  const statusItem = document.getElementById('whatsapp-status');
  const statusIcon = statusItem.querySelector('.status-icon');
  const statusText = statusItem.querySelector('.status-text');
  
  // Reset classes
  statusIcon.className = 'status-icon';
  
  // Set new status
  switch (type) {
    case 'success':
      statusIcon.classList.add('success');
      statusIcon.innerHTML = '✓';
      break;
    case 'error':
      statusIcon.classList.add('error');
      statusIcon.innerHTML = '✗';
      break;
    case 'warning':
      statusIcon.classList.add('warning');
      statusIcon.innerHTML = '⚠';
      break;
    case 'loading':
    default:
      statusIcon.classList.add('loading');
      statusIcon.innerHTML = '<div class="loading-spinner"></div>';
      break;
  }
  
  statusText.textContent = message;
}

// Update extension status display
function updateExtensionStatus(type, message) {
  const statusItem = document.getElementById('extension-status');
  const statusIcon = statusItem.querySelector('.status-icon');
  const statusText = statusItem.querySelector('.status-text');
  
  // Reset classes
  statusIcon.className = 'status-icon';
  
  // Set new status
  switch (type) {
    case 'success':
      statusIcon.classList.add('success');
      statusIcon.innerHTML = '✓';
      break;
    case 'error':
      statusIcon.classList.add('error');
      statusIcon.innerHTML = '✗';
      break;
    case 'warning':
      statusIcon.classList.add('warning');
      statusIcon.innerHTML = '⚠';
      break;
    default:
      statusIcon.classList.add('loading');
      statusIcon.innerHTML = '<div class="loading-spinner"></div>';
      break;
  }
  
  statusText.textContent = message;
}

// Open WhatsApp Web
async function openWhatsAppWeb() {
  try {
    // Check if WhatsApp Web is already open
    const tabs = await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' });
    
    if (tabs.length > 0) {
      // Focus existing tab
      await chrome.tabs.update(tabs[0].id, { active: true });
      await chrome.windows.update(tabs[0].windowId, { focused: true });
    } else {
      // Open new tab
      await chrome.tabs.create({ 
        url: 'https://web.whatsapp.com',
        active: true
      });
    }
    
    // Close popup
    window.close();
    
  } catch (error) {
    console.error('Error opening WhatsApp Web:', error);
    updateWhatsAppStatus('error', 'Failed to open WhatsApp Web');
  }
}

// Download sample Excel file
function downloadSampleFile() {
  // Create sample data
  const sampleData = [
    ['phone', 'name', 'message', 'product', 'company'],
    ['+1234567890', 'John Doe', 'Hi {{name}}, your {{product}} from {{company}} is ready for pickup!', 'Laptop', 'TechStore'],
    ['+9876543210', 'Jane Smith', 'Hello {{name}}, thank you for choosing {{company}} for your {{product}} purchase!', 'Smartphone', 'TechStore'],
    ['+1122334455', 'Bob Wilson', 'Dear {{name}}, your {{product}} warranty from {{company}} has been activated.', 'Tablet', 'TechStore'],
    ['+5566778899', 'Alice Brown', 'Hi {{name}}, your order for {{product}} is confirmed. {{company}} will deliver soon!', 'Headphones', 'TechStore'],
    ['+4433221100', 'Charlie Davis', 'Hello {{name}}, welcome to {{company}}! Your {{product}} is now available.', 'Smartwatch', 'TechStore']
  ];
  
  // Convert to CSV
  const csvContent = sampleData.map(row => 
    row.map(field => `"${field}"`).join(',')
  ).join('\n');
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'whatsblitz_sample_data.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Show feedback
  const button = document.getElementById('download-sample-btn');
  const originalText = button.innerHTML;
  button.innerHTML = '<span class="action-btn-icon">✓</span>Downloaded!';
  button.style.background = 'rgba(76, 175, 80, 0.3)';
  
  setTimeout(() => {
    button.innerHTML = originalText;
    button.style.background = '';
  }, 2000);
}

// Handle extension messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateStatus') {
    updateWhatsAppStatus(request.type, request.message);
  }
  
  sendResponse({ success: true });
});

// Handle popup close
window.addEventListener('beforeunload', () => {
  console.log('WhatsBlitz popup closing');
});
