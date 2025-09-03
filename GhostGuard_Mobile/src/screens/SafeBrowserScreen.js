import React, { useRef, useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSettings } from '../../App';
import { scanUrl } from '../services/scanService';
import { isTrackerDomain } from '../services/trackerBlocklist';
import ScanPromptModal from '../components/ScanPromptModal';

export default function SafeBrowserScreen() {
  const { settings } = useSettings();
  const webviewRef = useRef(null);
  const [url, setUrl] = useState('https://duckduckgo.com');
  const [modal, setModal] = useState({ visible: false, pendingUrl: null, result: null });

  const handleNavRequest = async (req) => {
    const target = req.url;
    if (isTrackerDomain(target) && settings.trackerBlocking) return false;
    if (settings.promptScanOnLinks) {
      setModal({ visible: true, pendingUrl: target, result: null });
      try { const result = await scanUrl(target, settings); setModal(m => ({ ...m, result })); } catch { setModal(m => ({ ...m, result: { safe: false, reason: 'Scan failed' } })); }
      return false;
    }
    return true;
  };

  const onAccept = () => {
    if (modal.pendingUrl && webviewRef.current?.loadUrl) webviewRef.current.loadUrl(modal.pendingUrl);
    setModal({ visible: false, pendingUrl: null, result: null });
  };
  const onReject = () => setModal({ visible: false, pendingUrl: null, result: null });

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <TextInput value={url} onChangeText={setUrl} placeholder="Enter URL" placeholderTextColor="#94a3b8" style={styles.input} />
        <Button title="Go" onPress={() => setUrl(u => (u.startsWith('http') ? u : `https://${u}`))} />
      </View>
      <WebView ref={webviewRef} source={{ uri: url }} style={{ flex: 1 }} onShouldStartLoadWithRequest={handleNavRequest} setSupportMultipleWindows={false} />
      <ScanPromptModal visible={modal.visible} url={modal.pendingUrl} result={modal.result} onAccept={onAccept} onReject={onReject} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220' },
  bar: { flexDirection: 'row', padding: 8, gap: 8, backgroundColor: '#0f172a', borderBottomWidth: 1, borderBottomColor: '#334155' },
  input: { flex: 1, backgroundColor: '#0b1220', color: '#e6eef3', paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155', height: 40 }
});


