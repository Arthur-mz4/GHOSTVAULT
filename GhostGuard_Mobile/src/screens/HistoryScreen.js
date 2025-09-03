import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert } from 'react-native';
import { getScanRecords, clearScanRecords } from '../services/historyService';

export default function HistoryScreen() {
  const [items, setItems] = useState([]);
  const load = async () => setItems(await getScanRecords());
  useEffect(() => { load(); }, []);
  const onClear = async () => {
    Alert.alert('Clear History', 'Delete all scan history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await clearScanRecords(); load(); } }
    ]);
  };
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.title}>Scan History</Text>
        <Button title="Clear" onPress={onClear} />
      </View>
      <FlatList
        style={{ marginTop: 12 }}
        data={items.slice().reverse()}
        keyExtractor={(item, idx) => `${item.date}-${idx}`}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.row}><Text style={styles.label}>Type:</Text> {item.type}</Text>
            <Text style={styles.row}><Text style={styles.label}>Item:</Text> {item.item}</Text>
            <Text style={styles.row}><Text style={styles.label}>Result:</Text> {item.result}</Text>
            <Text style={styles.row}><Text style={styles.label}>Date:</Text> {new Date(item.date).toLocaleString()}</Text>
            {item.details ? <Text style={[styles.row, { color: '#94a3b8' }]}>{item.details}</Text> : null}
          </View>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0b1220' },
  title: { color: '#e6eef3', fontSize: 18, fontWeight: '600' },
  card: { padding: 12, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 8, marginBottom: 8 },
  row: { color: '#e6eef3', marginBottom: 4 },
  label: { color: '#94a3b8' }
});


