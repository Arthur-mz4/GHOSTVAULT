import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
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
      // DocumentPicker.getDocumentAsync historically returns different shapes depending on
      // the SDK/version and whether single or multiple selection is used. Normalize the
      // return value so `scanPickedFiles` always receives an array of asset objects.
      const res = await DocumentPicker.getDocumentAsync({ multiple: true, copyToCacheDirectory: true });
      if (res.canceled) { setLoading(false); return; }

      let assets = [];
      if (Array.isArray(res.assets) && res.assets.length > 0) assets = res.assets;
      else if (res.uri) assets = [{ uri: res.uri, name: res.name, size: res.size, mimeType: res.mimeType }];

      const scans = await scanPickedFiles(assets, settings);
      setResults(scans);
      // Save each scan with proper Safe/Unsafe labels for history filtering
      for (const s of scans) {
        await saveScanRecord({ 
          type: 'File Scan', 
          item: s.name, 
          date: Date.now(), 
          result: s.safe ? 'Safe' : 'Unsafe', 
          details: s.reason || '' 
        });
      }
    } catch (e) {
      setResults([{ name: 'Error', safe: false, reason: e?.message || 'Scan failed' }]);
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan Files in Storage</Text>
      <TouchableOpacity style={styles.pickButton} onPress={pickAndScan}>
        <Text style={styles.pickButtonText}>📁 Pick Files and Scan</Text>
      </TouchableOpacity>
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
  pickButton: { backgroundColor: '#60a5fa', borderRadius: 8, padding: 14, alignItems: 'center' },
  pickButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  card: { padding: 12, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 8, marginBottom: 8 },
  name: { color: '#e6eef3', marginBottom: 6, fontWeight: '600' },
  reason: { color: '#94a3b8', marginTop: 6 }
});


