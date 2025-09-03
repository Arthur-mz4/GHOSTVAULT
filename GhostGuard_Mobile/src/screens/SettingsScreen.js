import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TextInput, StyleSheet } from 'react-native';
import { useSettings } from '../../App';

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();
  const [local, setLocal] = useState(settings);
  useEffect(() => setLocal(settings), [settings]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Prompt scan on links</Text>
        <Switch value={!!local.promptScanOnLinks} onValueChange={v => setLocal({ ...local, promptScanOnLinks: v })} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Tracker blocking</Text>
        <Switch value={!!local.trackerBlocking} onValueChange={v => setLocal({ ...local, trackerBlocking: v })} />
      </View>

      <View style={styles.rowCol}>
        <Text style={styles.label}>VirusTotal API Key (optional)</Text>
        <TextInput
          value={local.vtApiKey}
          onChangeText={v => setLocal({ ...local, vtApiKey: v })}
          placeholder="Paste your VT API key"
          placeholderTextColor="#94a3b8"
          style={styles.input}
        />
        <Text style={styles.hint}>If empty: offline heuristics only.</Text>
      </View>

      <View style={styles.rowCol}>
        <Text style={styles.label}>Safe browsing level</Text>
        <TextInput
          value={local.safeBrowsingLevel}
          onChangeText={v => setLocal({ ...local, safeBrowsingLevel: v })}
          style={styles.input}
        />
        <Text style={styles.hint}>Values: strict | standard | off</Text>
      </View>

      <Text style={styles.save} onPress={() => updateSettings(local)}>Save</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0b1220', gap: 16 },
  title: { color: '#e6eef3', fontSize: 18, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0f172a', borderColor: '#334155', borderWidth: 1, borderRadius: 8, padding: 12 },
  rowCol: { backgroundColor: '#0f172a', borderColor: '#334155', borderWidth: 1, borderRadius: 8, padding: 12, gap: 8 },
  label: { color: '#e6eef3', fontWeight: '600' },
  input: { backgroundColor: '#0b1220', color: '#e6eef3', borderColor: '#334155', borderWidth: 1, padding: 10, borderRadius: 8 },
  hint: { color: '#94a3b8', fontSize: 12 },
  save: { color: '#60a5fa', fontWeight: '700', textAlign: 'right' }
});


