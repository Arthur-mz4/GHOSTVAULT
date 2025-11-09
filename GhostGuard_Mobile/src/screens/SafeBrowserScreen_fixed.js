import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSettings } from '../../App';
import { useTheme } from '../contexts/ThemeContext';
import { scanUrl } from '../services/scanService';
import { isTrackerDomain } from '../services/trackerBlocklist';
import ScanPromptModal from '../components/ScanPromptModal';

export default function SafeBrowserScreen() {
  const { settings } = useSettings();
  const { theme } = useTheme();
  const webviewRef = useRef(null);
  const [url, setUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ visible: false, pendingUrl: null, result: null });

  const normalizeUrl = (input) => {
    try {
      if (!input) return '';
      if (input.startsWith('about:')) return input;
      if (input.includes(' ') || !input.includes('.')) {
        return `https://www.google.com/search?q=${encodeURIComponent(input)}`;
      }
      let u = input;
      if (!u.startsWith('http://') && !u.startsWith('https://')) u = 'https://' + u;
      new URL(u);
      return u;
    } catch (e) {
      return `https://www.google.com/search?q=${encodeURIComponent(input)}`;
    }
  };

  // Synchronous handler required on Android native bridge
  const handleNavRequest = (req) => {
    try {
      const target = req?.url || '';
      if (!target) return false;
      if (target.startsWith('about:')) return true;
      if (isTrackerDomain(target) && settings.trackerBlocking) return false;

      if (settings.promptScanOnLinks) {
        setModal({ visible: true, pendingUrl: target, result: { scanning: true } });
        // Start async scan in background; do not await here
        scanUrl(target, settings)
          .then(result => setModal(m => ({ ...m, result })))
          .catch(err => setModal(m => ({ ...m, result: { safe: false, reason: 'Scan failed: ' + (err?.message || err) } })));
        return false; // block navigation until user action
      }

      return true;
    } catch (err) {
      console.warn('handleNavRequest error', err);
      return false;
    }
  };

  const onAccept = () => {
    if (modal.pendingUrl) {
      const final = normalizeUrl(modal.pendingUrl);
      setError(null);
      setCurrentUrl(final);
      setUrl(final);
    }
    setModal({ visible: false, pendingUrl: null, result: null });
  };

  const onReject = () => setModal({ visible: false, pendingUrl: null, result: null });

  const handleGo = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setError(null);
    setCurrentUrl(normalizeUrl(trimmed));
  };

  const handleError = (e) => {
    const native = e?.nativeEvent || e;
    console.warn('WebView error', native);
    setError(typeof native === 'object' ? native.description || JSON.stringify(native) : String(native));
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <View style={[styles.bar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}> 
        <TextInput
          value={url}
          onChangeText={setUrl}
          placeholder="Search or enter URL..."
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
          onSubmitEditing={handleGo}
          returnKeyType="go"
        />
        <TouchableOpacity style={[styles.goButton, { backgroundColor: theme.primary }]} onPress={handleGo}>
          <Text style={styles.goButtonText}>Go</Text>
        </TouchableOpacity>
      </View>

      {currentUrl ? (
        <View style={{ flex: 1 }}>
          <WebView
            ref={webviewRef}
            source={{ uri: currentUrl }}
            style={styles.webview}
            originWhitelist={['*']}
            useWebKit={true}
            startInLoadingState={true}
            mixedContentMode={'always'}
            onShouldStartLoadWithRequest={handleNavRequest}
            setSupportMultipleWindows={false}
            allowsBackForwardNavigationGestures={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            sharedCookiesEnabled={true}
            onLoadStart={() => { console.log('loadStart', currentUrl); setLoading(true); }}
            onLoadProgress={({ nativeEvent }) => { if (Platform.OS === 'ios' && nativeEvent.progress < 1) setLoading(true); }}
            onLoadEnd={() => { console.log('loadEnd', currentUrl); setLoading(false); }}
            onError={handleError}
            onNavigationStateChange={(navState) => { if (navState.url && navState.url !== 'about:blank') setUrl(navState.url); }}
            onHttpError={handleError}
            renderError={() => (
              <View style={[styles.errorContainer, { backgroundColor: theme.background }]}> 
                <Text style={[styles.errorText, { color: theme.danger }]}>Failed to load page</Text>
                <TouchableOpacity
                  style={[styles.retryButton, { backgroundColor: theme.primary }]}
                  onPress={() => webviewRef.current && webviewRef.current.reload && webviewRef.current.reload()}
                >
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          />

          {loading && (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}> 
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          )}
        </View>
      ) : (
        <View style={styles.startPage}>
          <Text style={styles.startIcon}>🛡️</Text>
          <Text style={[styles.startTitle, { color: theme.text }]}>Secure Browser</Text>
          <Text style={[styles.startText, { color: theme.textSecondary }]}>Search on Google or enter a website URL</Text>
          <Text style={[styles.startFeatures, { color: theme.primary }]}>✓ Google Search Integration{"\n"}✓ Real-time Threat Scanning{"\n"}✓ Tracker Blocking{"\n"}✓ Privacy Protection</Text>
        </View>
      )}

      <ScanPromptModal visible={modal.visible} url={modal.pendingUrl} result={modal.result} onAccept={onAccept} onReject={onReject} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bar: { flexDirection: 'row', padding: 8, gap: 8, borderBottomWidth: 1 },
  input: { flex: 1, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, height: 40 },
  goButton: { borderRadius: 8, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center', height: 40 },
  goButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  webview: { flex: 1 },
  loadingContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  retryButton: { padding: 12, borderRadius: 8, marginTop: 10 },
  retryText: { color: '#ffffff', fontWeight: 'bold' },
  startPage: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  startIcon: { fontSize: 80, marginBottom: 20 },
  startTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 12 },
  startText: { fontSize: 16, marginBottom: 30, textAlign: 'center' },
  startFeatures: { fontSize: 14, textAlign: 'center', lineHeight: 26 }
});
