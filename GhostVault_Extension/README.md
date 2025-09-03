# GhostVault Browser Extension

A privacy-first browser extension that provides secure password management, breach detection, and privacy protection features.

## Features

### 🔐 **Secure Password Management**
- AES-GCM encryption with PBKDF2 key derivation
- Master password protection for all stored credentials
- Automatic login detection and secure storage
- Password strength checking against breached databases

### 🛡️ **Privacy Protection**
- Tracker blocking for common analytics and advertising services
- Terms & Conditions analysis for privacy risks
- Cookie scanning and risk assessment
- Phishing site detection

### 🔍 **Breach Detection**
- Email breach checking via HaveIBeenPwned API
- Password strength validation against Pwned Passwords
- Real-time security notifications

### 🎯 **User Experience**
- Modern, accessible UI with dark mode support
- Automatic form filling for saved credentials
- Comprehensive settings management
- Onboarding flow for new users

## Installation

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/ghostvault-extension.git
   cd ghostvault-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npx rollup -c
   ```

4. **Load in browser**
   - Open Chrome/Edge and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the project directory

### Production Build

```bash
npx rollup -c
```

### Testing

```bash
# Run integration tests
node test-integration.js
```

## Configuration

### API Keys

To enable real breach detection, add your API keys:

1. **HaveIBeenPwned API**: Get a free API key from [haveibeenpwned.com](https://haveibeenpwned.com/API/Key)
2. Add the API key in GhostVault settings:
   - Open the extension popup
   - Click the settings gear icon (⚙️)
   - Enter your HIBP API key in the designated field
   - The key will be securely stored in Chrome's sync storage

### Settings

The extension includes several configurable settings:

- **Tracker Blocking**: Enable/disable privacy protection
- **Auto-fill**: Automatically fill saved credentials
- **Breach Notifications**: Get notified of security issues
- **Dark Mode**: Switch to dark theme
- **Sync**: Sync credentials across devices

## Security Features

### Encryption
- Uses Web Crypto API for AES-GCM encryption
- PBKDF2 key derivation with 100,000 iterations
- Salt and IV generation for each encryption
- Master password never stored, only in memory

### Privacy Protection
- Blocks common trackers and analytics services
- Analyzes Terms & Conditions for privacy risks
- Scans cookies for tracking and security issues
- Phishing site detection

### Data Storage
- IndexedDB for local storage
- Chrome sync storage for cross-device sync
- Encrypted storage for sensitive data
- No data sent to external servers (except breach checking)

## Development

### Project Structure

```
GhostVault_Extension/
├── manifest.json          # Extension manifest
├── popup.html            # Main popup interface
├── popup.js              # Popup functionality
├── background.src.js      # Background script source
├── background.js          # Compiled background script
├── content.js            # Content script for page interaction
├── db.js                 # IndexedDB wrapper
├── settings.html         # Settings page
├── settings.js           # Settings functionality
├── welcome.html          # Onboarding page
├── welcome.js            # Onboarding logic
├── rules.json            # Tracker blocking rules
├── tips.json             # Security tips
├── icons/                # Extension icons
├── package.json          # Dependencies and scripts
└── rollup.config.js      # Build configuration
```

### Build Process

The extension uses Rollup for bundling:

```bash
# Development build
npm run build

# Watch mode
npm run dev
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Security Considerations

- **Master Password**: Never stored, only kept in memory during session using secure modal dialogs
- **API Keys**: Securely stored in Chrome's sync storage, never logged or exposed
- **Data Encryption**: All sensitive data is encrypted using AES-GCM with PBKDF2 key derivation
- **Privacy**: No user data is sent to external servers except for breach checking (with user consent)
- **Input Validation**: All user inputs are validated to prevent malicious data
- **Error Handling**: Comprehensive error handling prevents data loss and security issues

## License

This project is licensed under the ISC License.

## Support

For help and support:
- Check the [documentation](https://github.com/your-repo/ghostvault-extension#help)
- Open an [issue](https://github.com/your-repo/ghostvault-extension/issues)
- Contact the development team

## Roadmap

- [ ] Enhanced tracker blocking rules
- [ ] Password generator
- [ ] Two-factor authentication support
- [ ] Browser sync improvements
- [ ] Mobile companion app
- [ ] Advanced privacy analytics 