import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useSettings } from '../../App';
import { scanUrl } from '../services/scanService';

export default function LinkScannerScreen() {
  const { settings } = useSettings();
  const [url, setUrl] = useState('');
  const [out, setOut] = useState(null);

  const onScan = async () => {
    setOut({ loading: true });
    try { const result = await scanUrl(url.trim(), settings); setOut(result); }
    catch (e) { setOut({ safe: false, reason: e?.message || 'Scan failed' }); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan a Link</Text>
      <TextInput value={url} onChangeText={setUrl} placeholder="https://example.com" placeholderTextColor="#94a3b8" style={styles.input} />
      <Button title="Scan" onPress={onScan} />
      {out && (
        <View style={styles.card}>
          <Text style={{ color: out.safe ? '#22c55e' : '#f59e0b', fontWeight: '600' }}>{out.safe ? 'Safe' : 'Potential Risk'}</Text>
          {out.reason ? <Text style={styles.reason}>{out.reason}</Text> : null}
          {out.details ? <Text style={styles.details}>{out.details}</Text> : null}
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0b1220', gap: 12 },
  title: { color: '#e6eef3', fontSize: 18, fontWeight: '600' },
  input: { backgroundColor: '#0f172a', color: '#e6eef3', borderColor: '#334155', borderWidth: 1, padding: 10, borderRadius: 8 },
  card: { marginTop: 12, padding: 12, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 8 },
  reason: { color: '#e6eef3', marginTop: 4 },
  details: { color: '#94a3b8', marginTop: 4 }
});


