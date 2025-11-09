import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useSettings } from '../../App';
import { useTheme } from '../contexts/ThemeContext';
import { simplifiedApiScan } from '../services/simplifiedApiService';
import { saveScanRecord } from '../services/historyService';

export default function LinkScannerScreen() {
  const { settings } = useSettings();
  const { theme } = useTheme();
  const [url, setUrl] = useState('');
  const [out, setOut] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateUrl = (url) => {
    // Basic URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})[\/\w .-]*\/?$/i;
    if (!urlPattern.test(url)) {
      return 'Please enter a valid URL';
    }
    return null;
  };

  const onScan = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setOut({ safe: false, reason: 'Please enter a URL' });
      return;
    }

    // Validate URL format
    const validationError = validateUrl(trimmedUrl);
    if (validationError) {
      setOut({ safe: false, reason: validationError });
      return;
    }

    // Dismiss keyboard when scanning starts
    Keyboard.dismiss();
    
    setLoading(true);
    setOut(null);
    
    try {
      const result = await simplifiedApiScan(trimmedUrl, settings);
      setOut(result);
      
      // Save to history
      await saveScanRecord({
        type: 'Link Scan',
        item: trimmedUrl,
        date: Date.now(),
        result: result.safe ? 'Safe' : 'Unsafe',
        details: result.sources || result.reason
      });
    } catch (e) {
      const errorResult = { safe: false, reason: e?.message || 'Scan failed', error: true };
      setOut(errorResult);
      
      await saveScanRecord({
        type: 'Link Scan',
        item: trimmedUrl,
        date: Date.now(),
        result: 'Error',
        details: errorResult.reason
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>🔗 Link Scanner</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Test URLs for security threats</Text>
      
      <TextInput 
        value={url} 
        onChangeText={setUrl} 
        placeholder="https://example.com or paste any URL" 
        placeholderTextColor={theme.textSecondary} 
        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]} 
      />
      
      <TouchableOpacity 
        style={[styles.scanButton, { backgroundColor: theme.primary }]} 
        onPress={onScan}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.scanButtonText}>🔍 Scan Now</Text>
        )}
      </TouchableOpacity>

      {loading && (
        <View style={[styles.loadingCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ActivityIndicator color={theme.primary} size="large" />
          <Text style={[styles.loadingText, { color: theme.text }]}>Scanning with multiple engines...</Text>
        </View>
      )}

      {out && !loading && (
        <View style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: out.safe ? theme.success : theme.danger }]}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultIcon}>{out.safe ? '✅' : '⚠️'}</Text>
            <Text style={[styles.resultStatus, { color: out.safe ? theme.success : theme.danger }]}>
              {out.safe ? 'SAFE' : out.error ? 'ERROR' : 'THREAT DETECTED'}
            </Text>
          </View>
          
          <Text style={[styles.reason, { color: theme.text }]}>{out.reason}</Text>
          
          {out.sources && (
            <View style={[styles.sourcesCard, { backgroundColor: theme.background }]}>
              <Text style={[styles.sourcesLabel, { color: theme.textSecondary }]}>Scanned by:</Text>
              <Text style={[styles.sources, { color: theme.primary }]}>{out.sources}</Text>
            </View>
          )}
          
          {out.cached && (
            <Text style={[styles.cached, { color: theme.textSecondary }]}>⚡ Result from cache (scanned recently)</Text>
          )}

          {out.details && out.details.length > 0 && (
            <View style={styles.detailsSection}>
              <Text style={[styles.detailsTitle, { color: theme.text }]}>Detailed Results:</Text>
              {out.details.map((detail, index) => (
                <View key={index} style={[styles.detailCard, { backgroundColor: theme.background }]}>
                  <Text style={[styles.detailSource, { color: theme.primary }]}>{detail.source}</Text>
                  <Text style={[styles.detailReason, { color: detail.safe ? theme.success : theme.danger }]}>
                    {detail.safe ? '✓' : '✗'} {detail.reason}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  input: { borderWidth: 1, padding: 12, borderRadius: 8, fontSize: 15 },
  scanButton: { borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  scanButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  loadingCard: { marginTop: 20, padding: 20, borderWidth: 1, borderRadius: 12, alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  resultCard: { marginTop: 20, padding: 16, borderWidth: 2, borderRadius: 12 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  resultIcon: { fontSize: 32, marginRight: 12 },
  resultStatus: { fontSize: 20, fontWeight: 'bold' },
  reason: { fontSize: 15, marginBottom: 12, lineHeight: 22 },
  sourcesCard: { padding: 12, borderRadius: 8, marginBottom: 8 },
  sourcesLabel: { fontSize: 12, marginBottom: 4 },
  sources: { fontSize: 13, fontWeight: '600' },
  cached: { fontSize: 12, fontStyle: 'italic', marginTop: 8 },
  detailsSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#334155' },
  detailsTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  detailCard: { padding: 10, borderRadius: 6, marginBottom: 8 },
  detailSource: { fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
  detailReason: { fontSize: 13 }
});


