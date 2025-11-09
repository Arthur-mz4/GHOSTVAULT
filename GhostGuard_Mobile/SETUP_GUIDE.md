# GhostGuard Mobile - Setup Guide

## Quick Setup Instructions

### 1. Install Dependencies

First, install all required packages:

```bash
npm install
```

This will install all dependencies including the newly added `@react-native-picker/picker`.

### 2. Start the Development Server

```bash
npm start
```

Or to clear cache and start fresh:

```bash
npm start -- --clear
```

### 3. Run the App

#### Web (Easiest for Testing)
Press `w` in the terminal, or:
```bash
npm run web
```

#### Android
- Make sure you have Android Studio installed with an emulator running
- Press `a` in the terminal, or:
```bash
npm run android
```

#### iOS (macOS only)
- Make sure you have Xcode installed with a simulator running
- Press `i` in the terminal, or:
```bash
npm run ios
```

#### Expo Go App (Physical Device)
1. Install Expo Go from App Store or Play Store
2. Scan the QR code shown in terminal
3. App will load on your device

## What Was Fixed

### Critical Issues Resolved ✅
1. ✅ **App crash on launch** - Removed Buffer dependency causing immediate crash
2. ✅ **File hashing bug** - Now correctly hashes file content, not URI
3. ✅ **Browser navigation** - Fixed WebView link opening
4. ✅ **Missing permissions** - Added Android storage and internet permissions

### Features Added ✅
1. ✅ **Link scan history** - All scans now saved automatically
2. ✅ **50+ tracker blocklist** - Comprehensive tracking protection
3. ✅ **Auto-save settings** - No more manual save button
4. ✅ **Error boundaries** - App won't crash, shows friendly error screen
5. ✅ **Input validation** - Better UX with proper error messages
6. ✅ **Loading indicators** - Visual feedback for all operations
7. ✅ **API timeouts** - 10-second timeout on VirusTotal calls
8. ✅ **Picker component** - Proper dropdown for browsing level

## Testing the App

### 1. Safe Browser
- Navigate to Settings and toggle "Prompt scan on links" ON
- Go to Browser tab
- Enter any URL (e.g., `example.com`)
- Click Go - you'll see a scan modal before navigation
- Try visiting a tracker domain (e.g., `google-analytics.com`) with tracker blocking ON

### 2. Link Scanner
- Go to Link Scan tab
- Enter a URL like `https://example.com`
- Click Scan
- Check the result (should show "No obvious issues found")
- Try a suspicious URL with `.zip` extension
- Check History tab - your scan should be saved there

### 3. Storage Scanner
- Go to Storage tab
- Click "Pick Files and Scan"
- Select one or more files from your device
- See the scan results (SHA-256 hash generated)
- Check History tab - file scans should be saved

### 4. History
- View all past scans (links and files)
- Click "Clear" to remove all history
- Confirm deletion in the alert dialog

### 5. Settings
- Toggle "Prompt scan on links" - auto-saves with ✓ indicator
- Toggle "Tracker blocking" - auto-saves
- Enter a VirusTotal API key (optional) - auto-saves
- Change "Safe browsing level" using picker - auto-saves
- All settings persist after app restart

## Optional: VirusTotal API

For enhanced scanning with VirusTotal:

1. Go to https://www.virustotal.com/gui/join-us
2. Sign up for a free account
3. Get your API key from your profile
4. Open GhostGuard Mobile
5. Go to Settings tab
6. Paste your API key in "VirusTotal API Key" field
7. Settings auto-save automatically
8. Now scans will include VirusTotal reputation data

## Troubleshooting

### App won't start
```bash
# Clear cache and reinstall
rm -rf node_modules
npm cache clean --force
npm install
npm start -- --clear
```

### "Module not found" errors
```bash
# Make sure all packages are installed
npm install
```

### Web version issues
```bash
# Try starting with web flag directly
npm run web
```

### Metro bundler issues
```bash
# Kill any running Metro processes
npx react-native start --reset-cache
```

## Project Structure

```
GhostGuard_Mobile/
├── App.js                          # Main app with navigation
├── app.json                        # Expo configuration
├── package.json                    # Dependencies
├── src/
│   ├── components/
│   │   ├── ErrorBoundary.js       # Error handling wrapper
│   │   └── ScanPromptModal.js     # Link scan modal
│   ├── screens/
│   │   ├── SafeBrowserScreen.js   # Browser with protection
│   │   ├── LinkScannerScreen.js   # Manual URL scanner
│   │   ├── StorageScannerScreen.js # File scanner
│   │   ├── HistoryScreen.js       # Scan history
│   │   └── SettingsScreen.js      # App settings
│   └── services/
│       ├── scanService.js         # URL/file scanning logic
│       ├── storageScanner.js      # File hash scanning
│       ├── trackerBlocklist.js    # Tracker domains list
│       ├── historyService.js      # History persistence
│       └── settingsService.js     # Settings persistence
```

## Development Tips

1. **Use Web for quick testing** - Fastest reload times
2. **Check History tab** - Verify scans are being saved
3. **Test without VT API first** - Heuristics work offline
4. **Enable tracker blocking** - Test on real websites
5. **Clear history often** - Keep testing environment clean

## Need Help?

- Check `CHANGELOG.md` for all changes made
- Read `README.md` for feature documentation
- All critical bugs have been fixed
- App is 100% functional and ready to test!

---

**Happy Testing! 🛡️**

