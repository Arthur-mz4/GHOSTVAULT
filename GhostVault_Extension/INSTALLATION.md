# GhostVault Extension Installation Guide

## Overview
GhostVault is a privacy-first browser extension that provides secure password management, breach detection, and privacy protection features. This guide will help you install and set up the extension.

## Prerequisites
- Google Chrome, Microsoft Edge, or any Chromium-based browser
- Developer mode enabled in your browser

## Installation Steps

### 1. Enable Developer Mode
1. Open your browser and navigate to the extensions page:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`

2. Toggle on "Developer mode" in the top-right corner

### 2. Load the Extension
1. Click "Load unpacked" button
2. Navigate to the GhostVault_Extension folder
3. Select the folder and click "Select Folder"

### 3. Verify Installation
1. You should see "GhostVault" appear in your extensions list
2. The extension icon should appear in your browser toolbar
3. Click the icon to open the popup interface

## Features Overview

### 🔐 Secure Password Management
- **AES-GCM Encryption**: All passwords are encrypted using industry-standard AES-GCM encryption
- **Master Password**: Your master password is never stored, only kept in memory during your session
- **Auto-fill**: Automatically fill saved credentials on login pages
- **Password Strength**: Built-in password strength checking

### 🛡️ Privacy Protection
- **Tracker Blocking**: Blocks common analytics and advertising services
- **Terms & Conditions Analysis**: Analyzes privacy policies for potential risks
- **Cookie Scanning**: Identifies tracking and security-related cookies
- **Phishing Detection**: Helps identify potentially malicious sites

### 🔍 Breach Detection
- **Email Breach Checking**: Check if your email has been compromised
- **Real-time Notifications**: Get notified of security issues
- **API Integration**: Uses HaveIBeenPwned API for breach data

### 🎯 User Experience
- **Modern UI**: Clean, dark-themed interface
- **Cross-device Sync**: Sync credentials across devices (optional)
- **Comprehensive Settings**: Fine-tune all features to your preferences

## Initial Setup

### 1. First Launch
When you first open the extension, you'll see the welcome page with:
- Feature overview
- Security information
- Quick setup guide

### 2. Configure Settings
1. Click the settings gear icon (⚙️) in the popup
2. Configure your preferences:
   - **Block Trackers**: Enable/disable privacy protection
   - **Show Tips**: Display security tips
   - **Auto-fill Logins**: Automatically fill saved credentials
   - **Breach Notifications**: Get notified of security issues
   - **Sync Credentials**: Sync across devices

### 3. Optional: Add API Key
For enhanced breach detection:
1. Get a free API key from [haveibeenpwned.com](https://haveibeenpwned.com/API/Key)
2. Add it in the settings page under "API Configuration"

## Usage Guide

### Saving Passwords
1. Navigate to a login page
2. Enter your credentials
3. Submit the form
4. GhostVault will prompt you to save the login
5. Choose "Save" to store securely or "Never for this site" to exclude

### Analyzing Terms & Conditions
1. When you encounter a T&C acceptance dialog
2. GhostVault will automatically analyze the text
3. Review the analysis results
4. Make an informed decision about accepting

### Checking for Breaches
1. Open the GhostVault popup
2. Go to the "Breach Checker" section
3. Enter an email address
4. Click "Check for Breaches"
5. Review the results

### Managing Saved Logins
1. Open the GhostVault popup
2. Use the "Logins" tab to view saved credentials
3. Edit, delete, or copy passwords as needed
4. Export your data if needed

## Security Features

### Encryption Details
- **Algorithm**: AES-GCM (Galois/Counter Mode)
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Salt**: 16-byte random salt for each encryption
- **IV**: 12-byte random initialization vector

### Data Storage
- **Local Storage**: All data stored locally using IndexedDB
- **No Cloud Storage**: Your data never leaves your device unless you choose to sync
- **Chrome Sync**: Optional cross-device synchronization

### Privacy Protection
- **No Tracking**: Extension doesn't track your browsing
- **No Analytics**: No usage data is collected
- **Open Source**: Code is available for review

## Troubleshooting

### Extension Not Loading
1. Check that Developer mode is enabled
2. Verify all files are present in the extension folder
3. Check browser console for error messages
4. Try reloading the extension

### Login Detection Not Working
1. Ensure the extension has permission to access all sites
2. Check that the login form uses standard HTML elements
3. Verify the extension is enabled for the current site

### T&C Analysis Not Triggering
1. Make sure you're on a page with T&C content
2. Look for accept/agree buttons in cookie or privacy dialogs
3. Check browser console for any error messages

### Database Issues
1. Clear browser data for the extension
2. Check IndexedDB permissions
3. Try reinstalling the extension

## File Structure
```
GhostVault_Extension/
├── manifest.json          # Extension configuration
├── popup.html            # Main popup interface
├── popup.js              # Popup functionality
├── popup.css             # Popup styling
├── background.js         # Background service worker
├── content.js            # Content script for page interaction
├── db.js                 # Database wrapper
├── settings.html         # Settings page
├── settings.js           # Settings functionality
├── settings.css          # Settings styling
├── welcome.html          # Onboarding page
├── welcome.js            # Onboarding logic
├── welcome.css           # Welcome page styling
├── rules.json            # Tracker blocking rules
├── tips.json             # Security tips
├── icons/                # Extension icons
├── test-extension.html   # Test page for verification
└── README.md             # This file
```

## Testing the Extension

### Test Page
Open `test-extension.html` in your browser to test:
- Login form detection
- T&C analysis
- Cookie consent handling
- Extension status

### Manual Testing
1. **Login Detection**: Fill out login forms on various websites
2. **T&C Analysis**: Visit sites with privacy policy dialogs
3. **Breach Checking**: Test with known breached emails
4. **Settings**: Verify all settings work correctly

## Support

### Common Issues
- **Extension not working**: Check browser permissions and console errors
- **Passwords not saving**: Verify form structure and extension permissions
- **Analysis not triggering**: Check for proper button text and context

### Getting Help
1. Check the browser console for error messages
2. Verify all files are present and properly configured
3. Test with the provided test page
4. Review the troubleshooting section above

## Security Notes

### Best Practices
- Use a strong master password
- Regularly check for breaches
- Keep the extension updated
- Review privacy policies before accepting

### Limitations
- Extension can only analyze visible text
- Some sites may use non-standard forms
- Breach data depends on external API availability

## Updates

### Manual Updates
1. Download the latest version
2. Replace the extension folder
3. Reload the extension in browser settings

### Version History
- **v1.0**: Initial release with core features
- Password management, privacy protection, breach detection

---

**Note**: This extension is designed for educational and personal use. Always review security practices and keep your systems updated.
