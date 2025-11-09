# GhostGuard Mobile

A comprehensive mobile privacy and security toolkit built with React Native and Expo. GhostGuard helps protect you from malicious links, files, and tracking while browsing on mobile devices.

## Features

### 🌐 Safe Browser
- Built-in secure WebView browser with real-time protection
- Automatic link scanning with interactive modal prompts
- Comprehensive tracker blocking (50+ known tracking domains)
- Blocks analytics, ad networks, fingerprinting services, and social media trackers
- Customizable scan prompts (can be toggled on/off)

### 🔍 Link Scanner
- Manual URL analysis tool
- **Offline heuristic detection** for:
  - Direct IP addresses
  - Link shorteners (bit.ly, goo.gl, tinyurl, etc.)
  - Suspicious TLDs (.zip, .mov, .top, .xyz)
  - Phishing keywords and patterns
- **Optional VirusTotal integration** for cloud-based threat intelligence
- Scan results automatically saved to history
- Color-coded safety indicators

### 📁 Storage Scanner
- Pick and scan files from device storage
- SHA-256 hash generation for file integrity
- VirusTotal hash lookup for reputation checking
- Batch scanning support (multiple files at once)
- Automatic history recording

### 📋 Scan History
- Complete log of all link and file scans
- Displays scan type, item, result, timestamp, and details
- Clear history function with confirmation
- Most recent scans shown first

### ⚙️ Settings
- **Prompt scan on links** - Toggle automatic scanning
- **Tracker blocking** - Enable/disable tracker protection
- **VirusTotal API Key** - Optional for enhanced scanning
- **Safe browsing level** - Choose from Off, Standard, or Strict
- Auto-save with visual feedback
- All settings persisted locally

## Quick Start

```bash
# Install Expo CLI globally (if not already installed)
npm install -g expo-cli

# Navigate to project directory
cd GhostGuard_Mobile

# Install dependencies
npm install

# Start the development server
npm start
```

### Running the App
- **Web**: Press `w` in terminal
- **Android**: Press `a` (requires Android emulator or device)
- **iOS**: Press `i` (requires iOS simulator or device - macOS only)
- **Expo Go**: Scan the QR code with the Expo Go app

## VirusTotal Integration (Optional)

1. Get a free API key from [VirusTotal](https://www.virustotal.com/gui/join-us)
2. Open the app and navigate to Settings
3. Paste your API key in the "VirusTotal API Key" field
4. Settings auto-save automatically

**Without an API key:** The app uses offline heuristic analysis only.

## Technology Stack

- **Framework**: React Native with Expo SDK 53
- **Navigation**: React Navigation (Bottom Tabs)
- **Storage**: AsyncStorage for settings & history persistence
- **Security**: 
  - VirusTotal API v3 integration
  - Custom heuristic analysis
  - SHA-256 file hashing
- **UI**: Custom dark theme with blue accents

## Privacy & Security Notes

- All scanning happens on-device (offline heuristics)
- VirusTotal API is only used when you provide an API key
- No data is collected or transmitted without your knowledge
- Scan history is stored locally on your device only
- Mobile OS security restricts full device scanning (Storage Scanner works on user-selected files only)

## Error Handling

- Error boundaries prevent app crashes
- Graceful fallbacks for API failures
- Request timeouts (10 seconds) for network calls
- Detailed error messages in development mode

## Contributing

This is a privacy-focused security tool. Contributions are welcome, especially for:
- Expanding the tracker blocklist
- Improving heuristic detection algorithms
- Adding new security features
- UI/UX enhancements

## License

MIT License - feel free to use, modify, and distribute as needed.
