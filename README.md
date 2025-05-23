# WhatsBlitz - Chrome Extension for WhatsApp Bulk Messaging

🚀 **WhatsBlitz** is a powerful Chrome extension that enables automated bulk messaging on WhatsApp Web with Excel integration, personalized message templates, and human-like behavior simulation.

## 📋 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Excel File Format](#excel-file-format)
- [Template Placeholders](#template-placeholders)
- [User Interface](#user-interface)
- [Settings & Configuration](#settings--configuration)
- [Troubleshooting](#troubleshooting)
- [Known Issues](#known-issues)
- [Technical Details](#technical-details)
- [Support](#support)
- [License](#license)

## ✨ Features

### Core Features
- ✅ **Excel/CSV Upload** - Support for .xlsx, .xls, and .csv files
- ✅ **WhatsApp Web Automation** - Direct integration with WhatsApp Web
- ✅ **Bulk Messaging** - Send to multiple contacts automatically
- ✅ **Template Placeholders** - Use {{name}}, {{product}}, etc. in messages
- ✅ **Random Delays** - 5-15 second delays to mimic human behavior
- ✅ **Progress Tracking** - Real-time progress bar and statistics

### Advanced Features
- ✅ **Message History** - Local storage of sent messages with timestamps
- ✅ **Error Handling** - Graceful handling of failed sends and edge cases
- ✅ **Floating Sidebar** - Clean, modern UI integrated into WhatsApp Web
- ✅ **Drag & Drop** - Easy file upload with drag and drop support
- ✅ **Export Logs** - Download message history as CSV
- ✅ **Contact Preview** - Review contacts before sending

## 🚀 Installation

### Method 1: Load Unpacked (Development)

1. **Download** the WhatsBlitz extension files
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top right corner)
4. **Click "Load unpacked"** and select the WhatsBlitz folder
5. **Pin the extension** to your toolbar for easy access

### Method 2: From ZIP File

1. **Download** the WhatsBlitz.zip file
2. **Extract** the contents to a folder
3. **Follow Method 1** steps with the extracted folder

## 🎯 Quick Start

### Step 1: Prepare Your Excel File

Create an Excel (.xlsx) or CSV file with the following structure:

| phone | name | message | product | company |
|-------|------|---------|---------|---------|
| +1234567890 | John Doe | Hi {{name}}, your {{product}} from {{company}} is ready! | Laptop | TechStore |
| +9876543210 | Jane Smith | Hello {{name}}, thank you for choosing {{company}}! | Phone | TechStore |

### Step 2: Open WhatsApp Web

1. **Open** https://web.whatsapp.com in Chrome
2. **Scan QR code** to log in to your WhatsApp account
3. **Wait** for WhatsApp Web to fully load

### Step 3: Use WhatsBlitz

1. **Look for the WhatsBlitz sidebar** on the right side of WhatsApp Web
2. **Upload your Excel/CSV file** using drag & drop or browse button
3. **Review the contact preview** to ensure data is correct
4. **Configure delay settings** if needed (optional)
5. **Click "Start Sending"** to begin bulk messaging
6. **Monitor progress** in real-time

## 📊 Excel File Format

### Required Columns

| Column | Description | Example |
|--------|-------------|---------|
| **phone** | Phone number (with or without country code) | +1234567890 or 1234567890 |
| **name** | Contact name for personalization | John Doe |
| **message** | Message text with optional placeholders | Hi {{name}}, your order is ready! |

### Optional Columns

You can add unlimited custom columns for use in message placeholders:

| Column | Description | Example |
|--------|-------------|---------|
| **product** | Product name | Laptop, Phone, etc. |
| **company** | Company name | TechStore |
| **order** | Order number | #12345 |
| **date** | Date information | 2025-05-24 |

### Sample Excel Content

phone	    name	    message	product	company	order
+1234567890	John Doe	Hi {{name}}, {{product}} order {{order}} ready!	Laptop	TechStore	#12345
+9876543210	Jane Smith	Hello {{name}}, welcome to {{company}}!	Phone	TechStore	#12346


## 🎨 Template Placeholders

WhatsBlitz supports dynamic message personalization using placeholders:

### Basic Usage

Hi {{name}}, your order is ready for pickup!


### Advanced Usage

Dear {{name}},

Your {{product}} order {{order}} from {{company}} is confirmed!
Delivery date: {{date}}

Thank you for choosing {{company}}!


### Supported Placeholders

- `{{name}}` - Contact name
- `{{phone}}` - Phone number
- `{{product}}` - Product name
- `{{company}}` - Company name
- `{{order}}` - Order number
- `{{date}}` - Date information
- **Any custom column** from your Excel file

## 🖥️ User Interface

### Floating Sidebar Features

- **📁 File Upload Area** - Drag & drop or browse for Excel/CSV files
- **👥 Contact Preview** - Review parsed contacts before sending
- **⚙️ Settings Panel** - Configure delay times and preferences
- **🎯 Control Buttons** - Start, Stop, and Pause messaging
- **📊 Progress Tracking** - Real-time progress bar and statistics
- **📋 Message History** - View and export sent message logs

### Status Indicators

- 🟢 **Green** - WhatsApp Web ready, messages sent successfully
- 🟡 **Yellow** - Warnings, paused state, or waiting for user action
- 🔴 **Red** - Errors, failed sends, or WhatsApp Web not ready
- 🔵 **Blue** - Information messages and processing status

## ⚙️ Settings & Configuration

### Delay Settings

| Setting | Min Delay | Max Delay | Use Case |
|---------|-----------|-----------|----------|
| **Fast** | 3 seconds | 8 seconds | Small batches, testing |
| **Normal** | 5 seconds | 15 seconds | Regular use (recommended) |
| **Slow** | 10 seconds | 25 seconds | Large batches, extra safety |
| **Custom** | User defined | User defined | Specific requirements |

### Recommended Settings

- **Small batches (< 50 contacts)**: Normal or Fast
- **Medium batches (50-200 contacts)**: Normal
- **Large batches (> 200 contacts)**: Slow or Custom

## 🔧 Troubleshooting

### Common Issues & Solutions

#### ❌ "WhatsApp Web is not ready"

**Causes:**
- Not logged in to WhatsApp Web
- WhatsApp Web still loading
- Internet connection issues

**Solutions:**
1. Refresh WhatsApp Web page
2. Scan QR code to log in
3. Wait for complete page load
4. Check internet connection

#### ❌ "Contact not found"

**Causes:**
- Invalid phone number format
- Contact not on WhatsApp
- Typos in phone numbers

**Solutions:**
1. Verify phone number format (+1234567890)
2. Include country codes for international numbers
3. Check for typos in Excel file
4. Test with known WhatsApp contacts

#### ❌ "Could not find search button"

**Causes:**
- WhatsApp Web interface changes
- Browser compatibility issues
- Extension conflicts

**Solutions:**
1. Refresh WhatsApp Web page
2. Update Chrome browser
3. Disable other WhatsApp extensions
4. Clear browser cache

#### ❌ "File parsing error"

**Causes:**
- Incorrect file format
- Missing required columns
- Corrupted Excel file

**Solutions:**
1. Use provided sample file as template
2. Ensure phone, name, message columns exist
3. Save Excel file in .xlsx format
4. Check for special characters in data

### Performance Issues

#### Slow Message Sending

**Solutions:**
1. Reduce delay times (use Fast setting)
2. Close unnecessary browser tabs
3. Ensure stable internet connection
4. Process smaller batches

#### High Memory Usage

**Solutions:**
1. Process contacts in smaller batches
2. Clear message history regularly
3. Restart Chrome browser
4. Close other applications

## ⚠️ Known Issues

### WhatsApp Web Limitations

- **Rate Limiting**: WhatsApp may temporarily restrict accounts sending too many messages
- **Interface Changes**: WhatsApp Web updates may temporarily break functionality
- **Contact Verification**: Some phone numbers may not be found on WhatsApp
- **Browser Tab**: Keep WhatsApp Web tab active during sending

### Extension Limitations

- **Single Tab**: Works only with one WhatsApp Web tab at a time
- **File Size**: Large Excel files (>1000 contacts) may cause performance issues
- **Browser Support**: Optimized for Chrome, may not work in other browsers

### Workarounds

1. **For Rate Limiting**: Use slower delay settings, send in smaller batches
2. **For Interface Changes**: Wait for extension updates, report issues
3. **For Large Files**: Split into multiple smaller files
4. **For Performance**: Close unnecessary tabs, restart browser

## 🔒 Privacy & Security

### Data Protection

- 🔒 **No Data Collection** - All processing happens locally in your browser
- 🔒 **No External Servers** - Messages sent directly through WhatsApp Web
- 🔒 **Local Storage Only** - Message history stored on your device
- 🔒 **No Account Access** - Extension doesn't access WhatsApp credentials

### Permissions Used

| Permission | Purpose | Scope |
|------------|---------|-------|
| `scripting` | Inject automation scripts | WhatsApp Web only |
| `tabs` | Detect WhatsApp Web tabs | Active tab only |
| `storage` | Save message history | Local device only |
| `activeTab` | Interact with current tab | User-initiated only |

## 🛠️ Technical Details

### Architecture

WhatsBlitz Extension
├── manifest.json (Extension configuration)
├── content.js (WhatsApp Web automation)
├── background.js (Service worker)
├── popup.html/js/css (Extension popup)
├── libs/xlsx.full.min.js (Excel parsing)
└── icons/ (Extension icons)


### Technologies Used

- **Manifest V3** - Latest Chrome extension standard
- **Content Scripts** - DOM manipulation and automation
- **Service Worker** - Background processing
- **SheetJS** - Excel file parsing
- **Local Storage** - Data persistence

### Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| **Chrome** | ✅ Full | Recommended, fully tested |
| **Edge** | ⚠️ Partial | May work, not officially supported |
| **Firefox** | ❌ No | Different extension system |
| **Safari** | ❌ No | Different extension system |

## 📞 Support

### Getting Help

- 📧 **Email**: info@alfaleus.com
- 🌐 **Website**: https://alfaleus.in
- 📱 **Phone**: Contact via website
- 🐛 **Bug Reports**: Include error messages and steps to reproduce

### Before Contacting Support

1. Check this README for solutions
2. Try the troubleshooting steps
3. Test with the provided sample file
4. Note any error messages

### Information to Include

- Chrome version
- Extension version
- Error messages (if any)
- Steps to reproduce the issue
- Sample data (anonymized)


## 🏆 Changelog

### v1.0.0 (Initial Release)

#### ✅ Core Features
- Excel/CSV file upload and parsing
- WhatsApp Web automation engine
- Template placeholder support
- Bulk messaging with random delays
- Progress tracking and status updates

#### ✅ Advanced Features
- Message history logging
- Error handling and recovery
- Floating sidebar UI
- Drag & drop file upload
- Export functionality

#### ✅ Quality Assurance
- Comprehensive error handling
- Performance optimization
- Security best practices
- Cross-browser compatibility testing

---

**⚠️ Disclaimer**: This extension is for educational and legitimate business use only. Please comply with WhatsApp's Terms of Service and avoid spamming. Use responsibly and respect recipients' privacy.

**🏢 Developed by**: [Alfaleus Tech](https://alfaleus.in/) - Full Stack Development & Web Automation Specialists

**📅 Last Updated**: May 23, 2025


