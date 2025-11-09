import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getScanRecords, clearScanRecords } from '../services/historyService';

export default function HistoryScreen() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  
  const load = async () => setItems(await getScanRecords());
  useEffect(() => { load(); }, []);
  
  const onClear = async () => {
    Alert.alert('Clear History', 'Delete all scan history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await clearScanRecords(); load(); } }
    ]);
  };

  const getFilteredItems = () => {
    if (filter === 'all') return items;
    if (filter === 'threats') return items.filter(i => i.result.includes('Unsafe') || i.result.includes('Suspicious'));
    if (filter === 'safe') return items.filter(i => i.result.includes('Safe'));
    return items;
  };

  const getResultColor = (result) => {
    if (result.includes('Unsafe') || result.includes('Suspicious')) return '#ef4444';
    if (result.includes('Safe')) return '#22c55e';
    return '#94a3b8';
  };

  const getResultIcon = (result) => {
    if (result.includes('Unsafe')) return '⛔';
    if (result.includes('Suspicious')) return '⚠️';
    if (result.includes('Safe')) return '✅';
    return '🔍';
  };

  const stats = {
    total: items.length,
    threats: items.filter(i => i.result.includes('Unsafe') || i.result.includes('Suspicious')).length,
    safe: items.filter(i => i.result.includes('Safe')).length,
  };

  return (
    <View style={styles.container}>
      {/* Stats Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
        <View style={[styles.statCard, { borderColor: '#60a5fa' }]}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Scans</Text>
        </View>
        <View style={[styles.statCard, { borderColor: '#ef4444' }]}>
          <Text style={[styles.statNumber, { color: '#ef4444' }]}>{stats.threats}</Text>
          <Text style={styles.statLabel}>Threats</Text>
        </View>
        <View style={[styles.statCard, { borderColor: '#22c55e' }]}>
          <Text style={[styles.statNumber, { color: '#22c55e' }]}>{stats.safe}</Text>
          <Text style={styles.statLabel}>Safe</Text>
        </View>
      </ScrollView>

      {/* Filter Buttons */}
      <View style={styles.filters}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]} 
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'threats' && styles.filterButtonActive]} 
          onPress={() => setFilter('threats')}
        >
          <Text style={[styles.filterText, filter === 'threats' && styles.filterTextActive]}>Threats</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'safe' && styles.filterButtonActive]} 
          onPress={() => setFilter('safe')}
        >
          <Text style={[styles.filterText, filter === 'safe' && styles.filterTextActive]}>Safe</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={onClear}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* History List */}
      {getFilteredItems().length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No scan history yet</Text>
          <Text style={styles.emptySubtext}>Your scans will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={getFilteredItems().slice().reverse()}
          keyExtractor={(item, idx) => `${item.date}-${idx}`}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIcon}>
                  <Text style={styles.iconText}>{getResultIcon(item.result)}</Text>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.typeRow}>
                    <Text style={styles.type}>{item.type}</Text>
                    <Text style={[styles.result, { color: getResultColor(item.result) }]}>{item.result}</Text>
                  </View>
                  <Text style={styles.item} numberOfLines={2}>{item.item}</Text>
                  <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text>
                  {item.details ? <Text style={styles.details}>{item.details}</Text> : null}
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220' },
  statsScroll: { paddingHorizontal: 16, paddingVertical: 16, maxHeight: 100 },
  statCard: { backgroundColor: '#0f172a', borderRadius: 12, padding: 16, marginRight: 12, borderWidth: 2, minWidth: 110, alignItems: 'center' },
  statNumber: { fontSize: 32, fontWeight: 'bold', color: '#60a5fa', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#94a3b8', textAlign: 'center' },
  filters: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 8 },
  filterButton: { flex: 1, backgroundColor: '#0f172a', borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  filterButtonActive: { backgroundColor: '#60a5fa', borderColor: '#60a5fa' },
  filterText: { color: '#94a3b8', fontWeight: '600', fontSize: 14 },
  filterTextActive: { color: '#ffffff' },
  clearButton: { backgroundColor: '#ef4444', borderRadius: 8, padding: 10, paddingHorizontal: 16, justifyContent: 'center' },
  clearText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
  card: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#0f172a', borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  cardHeader: { flexDirection: 'row', padding: 12 },
  cardIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconText: { fontSize: 20 },
  cardContent: { flex: 1 },
  typeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  type: { fontSize: 12, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' },
  result: { fontSize: 12, fontWeight: 'bold' },
  item: { fontSize: 15, color: '#e6eef3', marginBottom: 6, fontWeight: '500' },
  date: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  details: { fontSize: 12, color: '#94a3b8', marginTop: 4, fontStyle: 'italic' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 20, fontWeight: 'bold', color: '#e6eef3', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#94a3b8' }
});


