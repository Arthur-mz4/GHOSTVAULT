# GhostGuard Mobile (React Native + Expo)

Mobile privacy toolkit with:
- Safe Browser (link scan prompts, basic tracker blocking)
- Link Scanner (heuristics + optional VirusTotal)
- Storage Scanner (file picker + hashing + VirusTotal hash check)
- History and Settings (AsyncStorage)

## Quick Start

`ash
npm install -g expo-cli
cd GhostGuard_Mobile
npm install
npm start
`

Open on Web (press w), Android (a), iOS (i), or scan QR with Expo Go.

## VirusTotal (optional)
- Get an API key and paste it in Settings
- Without a key, offline heuristics only

## Notes
- Mobile OS restricts full device-wide scanning; Storage Scanner works on picked files.
- Safe Browser blocks known tracker domains and prompts scans before opening links.

