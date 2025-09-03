import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { scanPickedFiles } from '../services/storageScanner';
import { saveScanRecord } from '../services/historyService';
import { useSettings } from '../../App';

export default function StorageScannerScreen() {
  const { settings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const pickAndScan = async () => {
    setLoading(true);
    try {
      const res = await DocumentPicker.getDocumentAsync({ multiple: true, copyToCacheDirectory: true });
      if (res.canceled) { setLoading(false); return; }
      const scans = await scanPickedFiles(res.assets || [], settings);
      setResults(scans);
      for (const s of scans) await saveScanRecord({ type: 'file', item: s.name, date: Date.now(), result: s.safe ? 'safe' : 'risk', details: s.reason || '' });
    } catch (e) {
      setResults([{ name: 'Error', safe: false, reason: e?.message || 'Scan failed' }]);
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan Files in Storage</Text>
      <Button title="Pick Files and Scan" onPress={pickAndScan} />
      {loading ? <ActivityIndicator color="#60a5fa" style={{ marginTop: 16 }} /> : null}
      <FlatList
        style={{ marginTop: 12 }}
        data={results}
        keyExtractor={(item, idx) => `${item.name}-${idx}`}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={{ color: item.safe ? '#22c55e' : '#f59e0b', fontWeight: '600' }}>{item.safe ? 'Safe' : 'Potential Risk'}</Text>
            {item.reason ? <Text style={styles.reason}>{item.reason}</Text> : null}
          </View>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0b1220', gap: 12 },
  title: { color: '#e6eef3', fontSize: 18, fontWeight: '600' },
  card: { padding: 12, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 8, marginBottom: 8 },
  name: { color: '#e6eef3', marginBottom: 6, fontWeight: '600' },
  reason: { color: '#94a3b8', marginTop: 6 }
});


