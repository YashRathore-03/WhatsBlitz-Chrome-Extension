// WhatsBlitz Content Script - WhatsApp Web Automation Engine
class WhatsBlitzEngine {
  constructor() {
    this.isRunning = false;
    this.currentIndex = 0;
    this.contacts = [];
    this.messageHistory = [];
    this.sidebar = null;
    this.progressData = { sent: 0, failed: 0, total: 0 };
    
    // DOM selectors for WhatsApp Web
    this.selectors = {
      searchButton: '[data-testid="chat-list-search"]',
      searchInput: 'div[contenteditable="true"][data-tab="3"]',
      messageInput: 'div[contenteditable="true"][data-tab="10"]',
      sendButton: '[data-testid="send"]',
      chatList: '[data-testid="chat-list"]',
      qrCode: '[data-testid="qr-code"]',
      newChatButton: '[data-testid="new-chat-button"]',
      contactCell: '[data-testid="cell-frame-container"]'
    };
    
    this.init();
  }

  // Initialize the extension
  init() {
    this.waitForWhatsAppLoad().then(() => {
      this.createFloatingSidebar();
      this.loadMessageHistory();
      console.log('🚀 WhatsBlitz initialized successfully');
    });
  }

  // Wait for WhatsApp Web to fully load
  waitForWhatsAppLoad() {
    return new Promise((resolve) => {
      const checkLoad = () => {
        if (document.querySelector(this.selectors.chatList) || 
            document.querySelector(this.selectors.qrCode)) {
          resolve();
        } else {
          setTimeout(checkLoad, 1000);
        }
      };
      checkLoad();
    });
  }

  // Create floating sidebar UI
  createFloatingSidebar() {
    if (this.sidebar) return;

    this.sidebar = document.createElement('div');
    this.sidebar.id = 'whatsblitz-sidebar';
    this.sidebar.innerHTML = `
      <div class="wb-header">
        <div class="wb-logo">🚀</div>
        <div class="wb-title">
          <h3>WhatsBlitz</h3>
          <span class="wb-subtitle">Bulk Messenger</span>
        </div>
        <button id="wb-minimize" class="wb-minimize-btn">−</button>
      </div>
      
      <div class="wb-content">
        <!-- Status Check Section -->
        <div class="wb-status-check">
          <div id="wb-whatsapp-status" class="wb-status-indicator">
            <span class="wb-status-dot"></span>
            <span class="wb-status-text">Checking WhatsApp...</span>
          </div>
        </div>

        <!-- File Upload Section -->
        <div class="wb-upload-section">
          <div class="wb-section-title">📁 Upload Contacts</div>
          <div class="wb-drop-zone" id="wb-drop-zone">
            <input type="file" id="wb-file-input" accept=".csv,.xlsx,.xls" hidden>
            <div class="wb-drop-icon">📄</div>
            <div class="wb-drop-text">
              Drop Excel/CSV file here<br>
              or <span class="wb-browse-link">browse files</span>
            </div>
            <div class="wb-file-info">
              Supports: .xlsx, .xls, .csv<br>
              Required columns: phone, name, message
            </div>
          </div>
        </div>
        
        <!-- Contacts Preview Section -->
        <div class="wb-preview-section" id="wb-preview-section" style="display:none;">
          <div class="wb-section-title">👥 Contacts Preview</div>
          <div class="wb-contacts-stats" id="wb-contacts-stats"></div>
          <div class="wb-contacts-preview" id="wb-contacts-preview"></div>
          <button class="wb-btn wb-btn-secondary" id="wb-view-all-btn">View All Contacts</button>
        </div>
        
        <!-- Controls Section -->
        <div class="wb-controls-section" id="wb-controls-section" style="display:none;">
          <div class="wb-section-title">🎯 Messaging Controls</div>
          <div class="wb-settings">
            <label class="wb-setting-item">
              <span>Delay between messages:</span>
              <select id="wb-delay-setting">
                <option value="fast">Fast (3-8s)</option>
                <option value="normal" selected>Normal (5-15s)</option>
                <option value="slow">Slow (10-25s)</option>
                <option value="custom">Custom</option>
              </select>
            </label>
            <div id="wb-custom-delay" style="display:none;">
              <label>
                Min delay (seconds): <input type="number" id="wb-min-delay" value="5" min="1" max="60">
              </label>
              <label>
                Max delay (seconds): <input type="number" id="wb-max-delay" value="15" min="1" max="60">
              </label>
            </div>
          </div>
          
          <div class="wb-controls">
            <button id="wb-start-btn" class="wb-btn wb-btn-primary">
              <span class="wb-btn-icon">▶️</span>
              Start Sending
            </button>
            <button id="wb-stop-btn" class="wb-btn wb-btn-danger" style="display:none;">
              <span class="wb-btn-icon">⏹️</span>
              Stop Sending
            </button>
            <button id="wb-pause-btn" class="wb-btn wb-btn-warning" style="display:none;">
              <span class="wb-btn-icon">⏸️</span>
              Pause
            </button>
          </div>
        </div>
        
        <!-- Progress Section -->
        <div class="wb-progress-section" id="wb-progress-section" style="display:none;">
          <div class="wb-section-title">📊 Progress Tracking</div>
          <div class="wb-progress-stats" id="wb-progress-stats"></div>
          <div class="wb-progress-bar-container">
            <div class="wb-progress-bar">
              <div class="wb-progress-fill" id="wb-progress-fill"></div>
            </div>
            <div class="wb-progress-text" id="wb-progress-text">0% completed</div>
          </div>
          <div class="wb-current-contact" id="wb-current-contact"></div>
        </div>
        
        <!-- Status Messages -->
        <div class="wb-status-messages" id="wb-status-messages"></div>
        
        <!-- History Section -->
        <div class="wb-history-section">
          <div class="wb-section-title">📋 Message History</div>
          <div class="wb-history-controls">
            <button id="wb-history-btn" class="wb-btn wb-btn-secondary">View History</button>
            <button id="wb-export-btn" class="wb-btn wb-btn-secondary">Export Log</button>
            <button id="wb-clear-history-btn" class="wb-btn wb-btn-secondary">Clear History</button>
          </div>
          <div class="wb-history-list" id="wb-history-list" style="display:none;"></div>
        </div>
      </div>
    `;

    document.body.appendChild(this.sidebar);
    this.attachEventListeners();
    this.checkWhatsAppStatus();
  }

  // Attach all event listeners
  attachEventListeners() {
    // File upload handlers
    const fileInput = document.getElementById('wb-file-input');
    const dropZone = document.getElementById('wb-drop-zone');
    const browseLink = dropZone.querySelector('.wb-browse-link');

    browseLink.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => this.handleFileUpload(e.target.files[0]));

    // Drag and drop handlers
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('wb-drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('wb-drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('wb-drag-over');
      this.handleFileUpload(e.dataTransfer.files[0]);
    });

    // Control buttons
    document.getElementById('wb-start-btn').addEventListener('click', () => this.startBulkMessaging());
    document.getElementById('wb-stop-btn').addEventListener('click', () => this.stopBulkMessaging());
    document.getElementById('wb-pause-btn').addEventListener('click', () => this.pauseBulkMessaging());
    document.getElementById('wb-minimize').addEventListener('click', () => this.toggleSidebar());

    // History buttons
    document.getElementById('wb-history-btn').addEventListener('click', () => this.toggleHistory());
    document.getElementById('wb-export-btn').addEventListener('click', () => this.exportHistory());
    document.getElementById('wb-clear-history-btn').addEventListener('click', () => this.clearHistory());

    // Settings
    document.getElementById('wb-delay-setting').addEventListener('change', (e) => {
      const customDelay = document.getElementById('wb-custom-delay');
      customDelay.style.display = e.target.value === 'custom' ? 'block' : 'none';
    });

    document.getElementById('wb-view-all-btn').addEventListener('click', () => this.showAllContacts());
  }

  // Check WhatsApp Web status
  checkWhatsAppStatus() {
    const statusIndicator = document.getElementById('wb-whatsapp-status');
    const statusDot = statusIndicator.querySelector('.wb-status-dot');
    const statusText = statusIndicator.querySelector('.wb-status-text');

    const updateStatus = () => {
      const isLoggedIn = this.isWhatsAppReady();
      const qrCode = document.querySelector(this.selectors.qrCode);

      if (qrCode) {
        statusDot.className = 'wb-status-dot wb-status-warning';
        statusText.textContent = 'Please scan QR code to login';
      } else if (isLoggedIn) {
        statusDot.className = 'wb-status-dot wb-status-success';
        statusText.textContent = 'WhatsApp Web ready';
      } else {
        statusDot.className = 'wb-status-dot wb-status-error';
        statusText.textContent = 'WhatsApp Web not ready';
      }
    };

    updateStatus();
    setInterval(updateStatus, 3000); // Check every 3 seconds
  }

  // Handle file upload and parsing
  async handleFileUpload(file) {
    if (!file) return;

    this.showStatus('📁 Parsing file...', 'info');

    try {
      const data = await this.parseFile(file);
      this.contacts = data;
      this.displayContactsPreview();
      this.showStatus(`✅ Successfully loaded ${data.length} contacts`, 'success');
      
      document.getElementById('wb-controls-section').style.display = 'block';
    } catch (error) {
      this.showStatus(`❌ Error parsing file: ${error.message}`, 'error');
      console.error('File parsing error:', error);
    }
  }

  // Parse Excel/CSV file using SheetJS
  parseFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          let data;
          
          if (file.name.toLowerCase().endsWith('.csv')) {
            // Parse CSV manually
            const text = e.target.result;
            const lines = text.split('\n').filter(line => line.trim());
            if (lines.length < 2) {
              throw new Error('CSV file must have at least a header row and one data row');
            }
            
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            data = lines.slice(1).map(line => {
              const values = this.parseCSVLine(line);
              const contact = {};
              headers.forEach((header, index) => {
                contact[header.toLowerCase()] = values[index] || '';
              });
              return contact;
            });
          } else {
            // Parse Excel using SheetJS
            const workbook = XLSX.read(e.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            data = XLSX.utils.sheet_to_json(worksheet);
          }

          // Validate and normalize data
          const validContacts = this.validateAndNormalizeContacts(data);
          
          if (validContacts.length === 0) {
            reject(new Error('No valid contacts found. Please ensure your file has phone, name, and message columns.'));
          } else {
            resolve(validContacts);
          }
        } catch (error) {
          reject(new Error('Failed to parse file: ' + error.message));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));

      if (file.name.toLowerCase().endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    });
  }

  // Parse CSV line handling quoted values
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  // Validate and normalize contact data
  validateAndNormalizeContacts(data) {
    return data.filter(contact => {
      // Find phone field (various possible names)
      const phoneField = this.findField(contact, ['phone', 'number', 'phonenumber', 'mobile', 'whatsapp']);
      const nameField = this.findField(contact, ['name', 'firstname', 'fullname', 'contact']);
      const messageField = this.findField(contact, ['message', 'text', 'content', 'msg']);
      
      if (!phoneField || !nameField || !messageField) return false;
      
      // Normalize contact object
      contact.phone = this.normalizePhoneNumber(phoneField);
      contact.name = nameField.toString().trim();
      contact.message = messageField.toString().trim();
      
      return contact.phone && contact.name && contact.message;
    });
  }

  // Find field by multiple possible names
  findField(obj, possibleNames) {
    for (const name of possibleNames) {
      const value = obj[name] || obj[name.toLowerCase()] || obj[name.toUpperCase()];
      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }
    return null;
  }

  // Normalize phone number
  normalizePhoneNumber(phone) {
    const cleaned = phone.toString().replace(/\D/g, '');
    if (cleaned.length < 10) return null;
    return cleaned;
  }

  // Display contacts preview
  displayContactsPreview() {
    const previewSection = document.getElementById('wb-preview-section');
    const statsDiv = document.getElementById('wb-contacts-stats');
    const previewDiv = document.getElementById('wb-contacts-preview');
    
    // Show statistics
    statsDiv.innerHTML = `
      <div class="wb-stats-grid">
        <div class="wb-stat-item">
          <div class="wb-stat-number">${this.contacts.length}</div>
          <div class="wb-stat-label">Total Contacts</div>
        </div>
        <div class="wb-stat-item">
          <div class="wb-stat-number">${new Set(this.contacts.map(c => c.phone)).size}</div>
          <div class="wb-stat-label">Unique Numbers</div>
        </div>
      </div>
    `;
    
    // Show preview of first 3 contacts
    const previewHTML = this.contacts.slice(0, 3).map((contact, index) => `
      <div class="wb-contact-preview-item">
        <div class="wb-contact-header">
          <strong>${contact.name}</strong>
          <span class="wb-contact-phone">${contact.phone}</span>
        </div>
        <div class="wb-contact-message">
          "${this.processTemplate(contact.message, contact).substring(0, 80)}${contact.message.length > 80 ? '...' : ''}"
        </div>
      </div>
    `).join('');
    
    previewDiv.innerHTML = previewHTML;
    
    if (this.contacts.length > 3) {
      previewDiv.innerHTML += `
        <div class="wb-more-contacts">
          ... and ${this.contacts.length - 3} more contacts
        </div>
      `;
    }
    
    previewSection.style.display = 'block';
  }

  // Process template placeholders
  processTemplate(template, contact) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = contact[key.toLowerCase()];
      return value !== undefined ? value : match;
    });
  }

  // Check if WhatsApp Web is ready
  isWhatsAppReady() {
    const chatList = document.querySelector(this.selectors.chatList);
    const qrCode = document.querySelector(this.selectors.qrCode);
    return chatList && !qrCode;
  }

  // Start bulk messaging
  async startBulkMessaging() {
    if (this.isRunning) return;
    
    if (!this.isWhatsAppReady()) {
      this.showStatus('❌ WhatsApp Web is not ready. Please ensure you are logged in.', 'error');
      return;
    }

    if (this.contacts.length === 0) {
      this.showStatus('❌ No contacts loaded. Please upload a file first.', 'error');
      return;
    }

    this.isRunning = true;
    this.progressData = { sent: 0, failed: 0, total: this.contacts.length };
    
    // Update UI
    document.getElementById('wb-start-btn').style.display = 'none';
    document.getElementById('wb-stop-btn').style.display = 'inline-block';
    document.getElementById('wb-pause-btn').style.display = 'inline-block';
    document.getElementById('wb-progress-section').style.display = 'block';
    
    this.showStatus('🚀 Starting bulk messaging...', 'info');
    
    try {
      await this.processBulkMessages();
    } catch (error) {
      console.error('Bulk messaging error:', error);
      this.showStatus(`❌ Error during bulk messaging: ${error.message}`, 'error');
    }
  }

  // Process all messages with delays
  async processBulkMessages() {
    for (let i = this.currentIndex; i < this.contacts.length && this.isRunning; i++) {
      this.currentIndex = i;
      const contact = this.contacts[i];
      
      try {
        this.updateProgress();
        this.updateCurrentContact(contact);
        
        const processedMessage = this.processTemplate(contact.message, contact);
        await this.sendMessage(contact.phone, processedMessage, contact.name);
        
        // Log successful send
        this.logMessage(contact, processedMessage, 'success');
        this.progressData.sent++;
        
        this.showStatus(`✅ Message sent to ${contact.name}`, 'success');
        
        // Apply delay before next message
        if (i < this.contacts.length - 1) {
          const delay = this.getDelayTime();
          await this.sleep(delay);
        }
        
      } catch (error) {
        console.error('Error sending message:', error);
        this.logMessage(contact, contact.message, 'failed', error.message);
        this.progressData.failed++;
        this.showStatus(`❌ Failed to send to ${contact.name}: ${error.message}`, 'error');
        
        // Continue with next contact after short delay
        await this.sleep(2000);
      }
    }
    
    if (this.isRunning) {
      this.completeBulkMessaging();
    }
  }

  // Get delay time based on settings
  getDelayTime() {
    const setting = document.getElementById('wb-delay-setting').value;
    
    switch (setting) {
      case 'fast':
        return Math.random() * 5000 + 3000; // 3-8 seconds
      case 'slow':
        return Math.random() * 15000 + 10000; // 10-25 seconds
      case 'custom':
        const min = parseInt(document.getElementById('wb-min-delay').value) * 1000;
        const max = parseInt(document.getElementById('wb-max-delay').value) * 1000;
        return Math.random() * (max - min) + min;
      default: // normal
        return Math.random() * 10000 + 5000; // 5-15 seconds
    }
  }

  // Send individual message
  async sendMessage(phoneNumber, message, contactName) {
    // Step 1: Open search
    await this.openSearch();
    
    // Step 2: Search for contact
    await this.searchContact(phoneNumber);
    
    // Step 3: Open chat
    await this.openChat(phoneNumber, contactName);
    
    // Step 4: Send message
    await this.sendMessageToChat(message);
  }

  // Open search functionality
  async openSearch() {
    const searchBtn = document.querySelector(this.selectors.searchButton) || 
                     document.querySelector('[title="Search or start new chat"]') ||
                     document.querySelector('[aria-label*="Search"]');
    
    if (!searchBtn) {
      throw new Error('Could not find search button');
    }
    
    searchBtn.click();
    await this.sleep(1000);
  }

  // Search for contact
  async searchContact(phoneNumber) {
    const searchInput = document.querySelector(this.selectors.searchInput) ||
                       document.querySelector('div[contenteditable="true"][data-tab="3"]') ||
                       document.querySelector('[data-testid="chat-list-search"] input');
    
    if (!searchInput) {
      throw new Error('Could not find search input');
    }
    
    // Clear and enter phone number
    searchInput.focus();
    await this.sleep(500);
    
    // Clear existing content
    searchInput.innerHTML = '';
    searchInput.textContent = '';
    
    // Type phone number
    this.simulateTyping(searchInput, phoneNumber);
    await this.sleep(2000);
    
    // Press Enter to search
    this.pressEnter(searchInput);
    await this.sleep(2000);
  }

  // Open chat with contact
  async openChat(phoneNumber, contactName) {
    // Look for existing chat or new contact option
    let chatElement = document.querySelector(`[title*="${phoneNumber}"]`) ||
                     document.querySelector(`[title*="${contactName}"]`) ||
                     document.querySelector(this.selectors.contactCell);
    
    if (!chatElement) {
      // Look for "Message" or "Chat" button for new contact
      const messageBtn = Array.from(document.querySelectorAll('span')).find(el => 
        el.textContent.includes('Message') || 
        el.textContent.includes('Chat') ||
        el.textContent.includes('Send message')
      );
      
      if (messageBtn && messageBtn.closest('[role="button"]')) {
        messageBtn.closest('[role="button"]').click();
        await this.sleep(1500);
      } else {
        throw new Error(`Contact ${phoneNumber} not found on WhatsApp`);
      }
    } else {
      chatElement.click();
      await this.sleep(1500);
    }
  }

  // Send message to open chat
  async sendMessageToChat(message) {
    const messageInput = document.querySelector(this.selectors.messageInput) ||
                        document.querySelector('[data-testid="conversation-compose-box-input"]') ||
                        document.querySelector('div[contenteditable="true"][data-tab="10"]');
    
    if (!messageInput) {
      throw new Error('Could not find message input field');
    }
    
    // Type message
    messageInput.focus();
    await this.sleep(500);
    this.simulateTyping(messageInput, message);
    await this.sleep(1000);
    
    // Send message
    const sendBtn = document.querySelector(this.selectors.sendButton) ||
                   document.querySelector('[aria-label*="Send"]') ||
                   document.querySelector('button[data-testid="send"]');
    
    if (!sendBtn) {
      throw new Error('Could not find send button');
    }
    
    sendBtn.click();
    await this.sleep(1500);
  }

  // Simulate natural typing
  simulateTyping(element, text) {
    element.focus();
    
    // Clear existing content
    element.innerHTML = '';
    element.textContent = text;
    
    // Trigger events to simulate typing
    const inputEvent = new Event('input', { bubbles: true });
    element.dispatchEvent(inputEvent);
    
    const changeEvent = new Event('change', { bubbles: true });
    element.dispatchEvent(changeEvent);
  }

  // Press Enter key
  pressEnter(element) {
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      bubbles: true
    });
    element.dispatchEvent(enterEvent);
  }

  // Update progress display
  updateProgress() {
    const current = this.currentIndex + 1;
    const total = this.contacts.length;
    const percentage = Math.round((current / total) * 100);
    
    const progressFill = document.getElementById('wb-progress-fill');
    const progressText = document.getElementById('wb-progress-text');
    const progressStats = document.getElementById('wb-progress-stats');
    
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}% completed (${current}/${total})`;
    
    progressStats.innerHTML = `
      <div class="wb-progress-stats-grid">
        <div class="wb-stat-item">
          <div class="wb-stat-number">${this.progressData.sent}</div>
          <div class="wb-stat-label">Sent</div>
        </div>
        <div class="wb-stat-item">
          <div class="wb-stat-number">${this.progressData.failed}</div>
          <div class="wb-stat-label">Failed</div>
        </div>
        <div class="wb-stat-item">
          <div class="wb-stat-number">${total - current}</div>
          <div class="wb-stat-label">Remaining</div>
        </div>
      </div>
    `;
  }

  // Update current contact display
  updateCurrentContact(contact) {
    const currentContactDiv = document.getElementById('wb-current-contact');
    currentContactDiv.innerHTML = `
      <div class="wb-current-contact-info">
        <div class="wb-current-label">Currently sending to:</div>
        <div class="wb-current-name">${contact.name}</div>
        <div class="wb-current-phone">${contact.phone}</div>
      </div>
    `;
  }

  // Complete bulk messaging
  completeBulkMessaging() {
    this.isRunning = false;
    this.currentIndex = 0;
    
    // Update UI
    document.getElementById('wb-start-btn').style.display = 'inline-block';
    document.getElementById('wb-stop-btn').style.display = 'none';
    document.getElementById('wb-pause-btn').style.display = 'none';
    
    const { sent, failed, total } = this.progressData;
    this.showStatus(`🎉 Bulk messaging completed! Sent: ${sent}, Failed: ${failed}, Total: ${total}`, 'success');
    this.saveMessageHistory();
  }

  // Stop bulk messaging
  stopBulkMessaging() {
    this.isRunning = false;
    
    // Update UI
    document.getElementById('wb-start-btn').style.display = 'inline-block';
    document.getElementById('wb-stop-btn').style.display = 'none';
    document.getElementById('wb-pause-btn').style.display = 'none';
    
    this.showStatus('⏹️ Bulk messaging stopped by user', 'warning');
    this.saveMessageHistory();
  }

  // Pause bulk messaging
  pauseBulkMessaging() {
    this.isRunning = false;
    
    // Update UI
    document.getElementById('wb-start-btn').style.display = 'inline-block';
    document.getElementById('wb-stop-btn').style.display = 'none';
    document.getElementById('wb-pause-btn').style.display = 'none';
    
    this.showStatus('⏸️ Bulk messaging paused. Click Start to resume.', 'warning');
  }

  // Log message to history
  logMessage(contact, message, status, error = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      name: contact.name,
      phone: contact.phone,
      message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      status: status,
      error: error
    };
    
    this.messageHistory.unshift(logEntry);
    
    // Keep only last 500 entries
    if (this.messageHistory.length > 500) {
      this.messageHistory = this.messageHistory.slice(0, 500);
    }
  }

  // Save message history to localStorage
  saveMessageHistory() {
    try {
      localStorage.setItem('whatsblitz_history', JSON.stringify(this.messageHistory));
      localStorage.setItem('whatsblitz_last_save', new Date().toISOString());
    } catch (error) {
      console.error('Failed to save message history:', error);
    }
  }

  // Load message history from localStorage
  loadMessageHistory() {
    try {
      const saved = localStorage.getItem('whatsblitz_history');
      if (saved) {
        this.messageHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load message history:', error);
      this.messageHistory = [];
    }
  }

  // Toggle history display
  toggleHistory() {
    const historyList = document.getElementById('wb-history-list');
    
    if (historyList.style.display === 'none') {
      this.displayHistory();
      historyList.style.display = 'block';
      document.getElementById('wb-history-btn').textContent = 'Hide History';
    } else {
      historyList.style.display = 'none';
      document.getElementById('wb-history-btn').textContent = 'View History';
    }
  }

  // Display message history
  displayHistory() {
    const historyList = document.getElementById('wb-history-list');
    
    if (this.messageHistory.length === 0) {
      historyList.innerHTML = '<div class="wb-no-history">No message history found</div>';
      return;
    }
    
    const historyHTML = this.messageHistory.slice(0, 50).map(entry => `
      <div class="wb-history-item ${entry.status}">
        <div class="wb-history-header">
          <div class="wb-history-contact">
            <strong>${entry.name}</strong>
            <span class="wb-history-phone">${entry.phone}</span>
          </div>
          <span class="wb-history-timestamp">${new Date(entry.timestamp).toLocaleString()}</span>
        </div>
        <div class="wb-history-message">"${entry.message}"</div>
        <div class="wb-history-status ${entry.status}">
          ${entry.status === 'success' ? '✅ Sent successfully' : `❌ Failed: ${entry.error || 'Unknown error'}`}
        </div>
      </div>
    `).join('');
    
    historyList.innerHTML = historyHTML;
    
    if (this.messageHistory.length > 50) {
      historyList.innerHTML += `<div class="wb-history-more">... and ${this.messageHistory.length - 50} more entries</div>`;
    }
  }

  // Export history as CSV
  exportHistory() {
    if (this.messageHistory.length === 0) {
      this.showStatus('❌ No history to export', 'error');
      return;
    }

    const csvContent = [
      ['Timestamp', 'Name', 'Phone', 'Message', 'Status', 'Error'],
      ...this.messageHistory.map(entry => [
        entry.timestamp,
        entry.name,
        entry.phone,
        entry.message,
        entry.status,
        entry.error || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsblitz_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    this.showStatus('✅ History exported successfully', 'success');
  }

  // Clear message history
  clearHistory() {
    if (confirm('Are you sure you want to clear all message history? This action cannot be undone.')) {
      this.messageHistory = [];
      this.saveMessageHistory();
      this.displayHistory();
      this.showStatus('✅ Message history cleared', 'success');
    }
  }

  // Show all contacts in modal
  showAllContacts() {
    const modal = document.createElement('div');
    modal.className = 'wb-modal';
    modal.innerHTML = `
      <div class="wb-modal-content">
        <div class="wb-modal-header">
          <h3>All Contacts (${this.contacts.length})</h3>
          <button class="wb-modal-close">&times;</button>
        </div>
        <div class="wb-modal-body">
          <div class="wb-contacts-table">
            <div class="wb-table-header">
              <div>Name</div>
              <div>Phone</div>
              <div>Message Preview</div>
            </div>
            ${this.contacts.map(contact => `
              <div class="wb-table-row">
                <div class="wb-table-cell">${contact.name}</div>
                <div class="wb-table-cell">${contact.phone}</div>
                <div class="wb-table-cell">${this.processTemplate(contact.message, contact).substring(0, 50)}...</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal handlers
    modal.querySelector('.wb-modal-close').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  // Show status message
  showStatus(message, type = 'info') {
    const statusContainer = document.getElementById('wb-status-messages');
    const statusDiv = document.createElement('div');
    statusDiv.className = `wb-status-message wb-status-${type}`;
    statusDiv.textContent = message;
    
    statusContainer.appendChild(statusDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (statusDiv.parentNode) {
        statusDiv.parentNode.removeChild(statusDiv);
      }
    }, 5000);
    
    // Keep only last 3 messages
    while (statusContainer.children.length > 3) {
      statusContainer.removeChild(statusContainer.firstChild);
    }
  }

  // Toggle sidebar
  toggleSidebar() {
    const content = this.sidebar.querySelector('.wb-content');
    const minimizeBtn = document.getElementById('wb-minimize');
    
    if (content.style.display === 'none') {
      content.style.display = 'block';
      minimizeBtn.textContent = '−';
      this.sidebar.style.width = '380px';
    } else {
      content.style.display = 'none';
      minimizeBtn.textContent = '+';
      this.sidebar.style.width = '60px';
    }
  }

  // Sleep utility
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize WhatsBlitz when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new WhatsBlitzEngine();
  });
} else {
  new WhatsBlitzEngine();
}

// Handle page navigation
let whatsBlitzInstance = null;
const observer = new MutationObserver(() => {
  if (window.location.href.includes('web.whatsapp.com') && !whatsBlitzInstance) {
    whatsBlitzInstance = new WhatsBlitzEngine();
  }
});

observer.observe(document.body, { childList: true, subtree: true });
