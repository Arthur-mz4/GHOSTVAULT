import React from 'react';
import { Modal, View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';

export default function ScanPromptModal({ visible, url, result, onAccept, onReject }) {
  const color = !result ? '#94a3b8' : result.safe ? '#22c55e' : '#f59e0b';
  const label = !result ? 'Scanning...' : result.safe ? 'Safe to open' : 'Potential Risk';
  
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {!result && <ActivityIndicator size="large" color="#60a5fa" style={styles.spinner} />}
          <Text style={[styles.title, { color }]}>{label}</Text>
          <Text style={styles.url} numberOfLines={2}>{url}</Text>
          <Text style={styles.desc}>{result?.reason || 'Checking reputation and patterns...'}</Text>
          {result?.details && (
            <Text style={styles.details} numberOfLines={3}>{result.details}</Text>
          )}
          <View style={styles.row}>
            <Button title="Open" onPress={onAccept} disabled={!result} />
            <Button title="Cancel" color="#ef4444" onPress={onReject} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { width: '88%', backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 8, padding: 16 },
  spinner: { marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '700' },
  url: { color: '#e6eef3', marginTop: 8 },
  desc: { color: '#94a3b8', marginTop: 6 },
  details: { color: '#64748b', marginTop: 4, fontSize: 11, fontFamily: 'monospace' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }
});


