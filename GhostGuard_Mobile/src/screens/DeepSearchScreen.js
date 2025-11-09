import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import * as DocumentPicker from 'expo-document-picker';

export default function DeepSearchScreen() {
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyzeContent = async (content) => {
    setLoading(true);
    setResult(null);

    // Extract potential IP addresses
    const ipPattern = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
    const ips = content.match(ipPattern) || [];

    // Generate realistic analysis results
    const uniqueIps = [...new Set(ips)];
    const primaryIp = uniqueIps[0] || null;

    // Helper: lookup IP using a public HTTPS geolocation API (ipapi.co)
    const lookupIp = async (ip) => {
      try {
        const res = await fetch(`https://ipapi.co/${ip}/json/`);
        if (!res.ok) return null;
        const json = await res.json();
        // ipapi.co returns fields like city, country_name, org
        if (json && !json.error) {
          return {
            country: json.country_name || 'Unknown',
            city: json.city || 'Unknown',
            region: json.region || json.region_code || 'Unknown',
            isp: json.org || json.org_name || json.network || 'Unknown'
          };
        }
      } catch (e) {
        // Network or parsing error — fall through to null
      }
      return null;
    };
      
    // Analyze content for suspicious patterns
      const contentLower = content.toLowerCase();
      const suspiciousPatterns = [];
      
      if (contentLower.includes('urgent') || contentLower.includes('act now') || contentLower.includes('limited time')) {
        suspiciousPatterns.push('⚠️ Urgency tactics detected');
      }
      if (contentLower.includes('click here') || contentLower.includes('verify') || contentLower.includes('confirm')) {
        suspiciousPatterns.push('⚠️ Phishing indicators found');
      }
      if (contentLower.includes('password') || contentLower.includes('account') || contentLower.includes('suspended')) {
        suspiciousPatterns.push('⚠️ Account compromise attempt');
      }
      if (contentLower.includes('prize') || contentLower.includes('winner') || contentLower.includes('congratulations')) {
        suspiciousPatterns.push('⚠️ Prize scam indicators');
      }
      if (contentLower.includes('bitcoin') || contentLower.includes('crypto') || contentLower.includes('investment')) {
        suspiciousPatterns.push('⚠️ Financial scam patterns');
      }

    // Extract URLs
      const urlPattern = /(https?:\/\/[^\s]+)/g;
      const urls = content.match(urlPattern) || [];
      
      // Extract email addresses
      const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = content.match(emailPattern) || [];

    // Generate metadata
      const metadata = {
        timestamp: new Date().toISOString(),
        contentLength: content.length,
        wordCount: content.split(/\s+/).length,
        hasLinks: urls.length > 0,
        hasEmails: emails.length > 0,
        hasIPs: uniqueIps.length > 0
      };
    // If we have an IP, try to get a real location/ISP. If not, try resolving hostnames from URLs/emails.
    let location = { country: 'Unknown', city: 'Unknown', region: 'Unknown', isp: 'Unknown' };
    let resolvedIp = primaryIp || null;

    // Helper: resolve hostname to an IPv4 using DNS-over-HTTPS (Google DNS)
    const resolveHostnameToIp = async (hostname) => {
      try {
        const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`);
        if (!res.ok) return null;
        const json = await res.json();
        if (json && Array.isArray(json.Answer) && json.Answer.length > 0) {
          // Answer entries have a 'data' field containing the IP
          for (const ans of json.Answer) {
            if (ans && ans.data && /^\d{1,3}(?:\.\d{1,3}){3}$/.test(ans.data)) {
              return ans.data;
            }
          }
        }
      } catch (e) {
        // ignore DNS resolution errors
      }
      return null;
    };

    // Try to resolve IP from URLs if no explicit IP was present
    if (!resolvedIp && urls.length > 0) {
      try {
        const firstUrl = urls[0];
        const parsed = new URL(firstUrl);
        const host = parsed.hostname;
        const ipFromHost = await resolveHostnameToIp(host);
        if (ipFromHost) resolvedIp = ipFromHost;
      } catch (e) {
        // ignore parse errors
      }
    }

    // If still no IP, try extracting domain from an email address and resolving it
    if (!resolvedIp && emails.length > 0) {
      try {
        const firstEmail = emails[0];
        const parts = firstEmail.split('@');
        if (parts.length === 2) {
          const domain = parts[1];
          const ipFromDomain = await resolveHostnameToIp(domain);
          if (ipFromDomain) resolvedIp = ipFromDomain;
        }
      } catch (e) {
        // ignore
      }
    }

    if (resolvedIp) {
      const geo = await lookupIp(resolvedIp);
      if (geo) {
        location = geo;
      }
    }

    setResult({
      ipAddress: resolvedIp || primaryIp || 'N/A',
      location,
      suspiciousPatterns,
      urls: urls.slice(0, 5),
      emails: emails.slice(0, 5),
      metadata,
      riskScore: Math.min(100, suspiciousPatterns.length * 20 + (urls.length > 3 ? 20 : 0)),
      threatLevel: suspiciousPatterns.length > 2 ? 'high' : suspiciousPatterns.length > 0 ? 'medium' : 'low'
    });

    setLoading(false);
  };

  const generateRandomIP = () => {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  };

  const handleAnalyze = () => {
    if (!input.trim()) {
      Alert.alert('Error', 'Please enter text, message, or URL to analyze');
      return;
    }
    analyzeContent(input);
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (!result.canceled && result.assets && result.assets[0]) {
        Alert.alert('File Selected', `Analyzing: ${result.assets[0].name}`);
        analyzeContent(`File: ${result.assets[0].name}\nSize: ${result.assets[0].size} bytes\nType: ${result.assets[0].mimeType || 'unknown'}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const getThreatColor = (level) => {
    switch (level) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      default: return '#22c55e';
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>🔍 DeepSearch</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Trace scammers and hackers from messages, texts, or files
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.text }]}>Paste Message or Text</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
          placeholder="Paste suspicious message, email, or text here..."
          placeholderTextColor={theme.textSecondary}
          value={input}
          onChangeText={setInput}
          multiline
          numberOfLines={8}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary, flex: 1, marginRight: 8 }]}
            onPress={handleAnalyze}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>🔍 Analyze</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.secondary, flex: 1 }]}
            onPress={handlePickFile}
            disabled={loading}
          >
            <Text style={styles.buttonText}>📁 Pick File</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && (
        <View style={[styles.loadingCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Analyzing content...</Text>
          <Text style={[styles.loadingSubtext, { color: theme.textSecondary }]}>
            • Extracting metadata{'\n'}
            • Tracing IP addresses{'\n'}
            • Detecting patterns{'\n'}
            • Geolocating source
          </Text>
        </View>
      )}

      {result && (
        <>
          <View style={[styles.threatCard, { 
            backgroundColor: theme.surface,
            borderColor: getThreatColor(result.threatLevel),
            borderWidth: 2
          }]}>
            <View style={styles.threatHeader}>
              <Text style={[styles.threatTitle, { color: theme.text }]}>Threat Assessment</Text>
              <View style={[styles.threatBadge, { backgroundColor: getThreatColor(result.threatLevel) }]}>
                <Text style={styles.threatBadgeText}>
                  {result.threatLevel.toUpperCase()} RISK
                </Text>
              </View>
            </View>
            <Text style={[styles.riskScore, { color: getThreatColor(result.threatLevel) }]}>
              Risk Score: {result.riskScore}/100
            </Text>
          </View>

          <View style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.resultTitle, { color: theme.text }]}>📍 Source Location</Text>
            <View style={styles.locationInfo}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>IP Address:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{result.ipAddress}</Text>
            </View>
            <View style={styles.locationInfo}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Country:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{result.location.country}</Text>
            </View>
            <View style={styles.locationInfo}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>City:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{result.location.city}</Text>
            </View>
            <View style={styles.locationInfo}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>ISP:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{result.location.isp}</Text>
            </View>
          </View>

          {result.suspiciousPatterns.length > 0 && (
            <View style={[styles.resultCard, { backgroundColor: '#fee2e2', borderColor: '#ef4444' }]}>
              <Text style={[styles.resultTitle, { color: '#991b1b' }]}>⚠️ Suspicious Patterns</Text>
              {result.suspiciousPatterns.map((pattern, index) => (
                <Text key={index} style={[styles.patternText, { color: '#7f1d1d' }]}>• {pattern}</Text>
              ))}
            </View>
          )}

          {result.urls.length > 0 && (
            <View style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.resultTitle, { color: theme.text }]}>🔗 Extracted URLs</Text>
              {result.urls.map((url, index) => (
                <Text key={index} style={[styles.urlText, { color: theme.primary }]} numberOfLines={1}>
                  {url}
                </Text>
              ))}
            </View>
          )}

          {result.emails.length > 0 && (
            <View style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.resultTitle, { color: theme.text }]}>📧 Extracted Emails</Text>
              {result.emails.map((email, index) => (
                <Text key={index} style={[styles.emailText, { color: theme.text }]}>{email}</Text>
              ))}
            </View>
          )}

          <View style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.resultTitle, { color: theme.text }]}>📊 Metadata</Text>
            <Text style={[styles.metadataText, { color: theme.textSecondary }]}>
              Content Length: {result.metadata.contentLength} characters{'\n'}
              Word Count: {result.metadata.wordCount}{'\n'}
              Contains Links: {result.metadata.hasLinks ? 'Yes' : 'No'}{'\n'}
              Contains Emails: {result.metadata.hasEmails ? 'Yes' : 'No'}{'\n'}
              Contains IPs: {result.metadata.hasIPs ? 'Yes' : 'No'}{'\n'}
              Analyzed: {new Date(result.metadata.timestamp).toLocaleString()}
            </Text>
          </View>

          <View style={[styles.warningCard, { backgroundColor: '#fef3c7', borderColor: '#f59e0b' }]}>
            <Text style={[styles.warningTitle, { color: '#92400e' }]}>⚠️ Important Notice</Text>
            <Text style={[styles.warningText, { color: '#78350f' }]}>
              This analysis is for educational purposes. IP geolocation is approximate. 
              Always report suspicious activity to proper authorities. Do not engage with scammers.
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  card: { borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  textArea: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 14, height: 150, textAlignVertical: 'top', marginBottom: 16 },
  buttonRow: { flexDirection: 'row' },
  button: { borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  loadingCard: { borderRadius: 12, padding: 24, marginBottom: 16, borderWidth: 1, alignItems: 'center' },
  loadingText: { fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 12 },
  loadingSubtext: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  threatCard: { borderRadius: 12, padding: 16, marginBottom: 16 },
  threatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  threatTitle: { fontSize: 18, fontWeight: 'bold' },
  threatBadge: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  threatBadgeText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  riskScore: { fontSize: 16, fontWeight: 'bold' },
  resultCard: { borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1 },
  resultTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  locationInfo: { flexDirection: 'row', marginBottom: 8 },
  infoLabel: { fontSize: 14, width: 100 },
  infoValue: { fontSize: 14, fontWeight: '600', flex: 1 },
  patternText: { fontSize: 14, marginBottom: 6, lineHeight: 20 },
  urlText: { fontSize: 12, marginBottom: 6 },
  emailText: { fontSize: 14, marginBottom: 6 },
  metadataText: { fontSize: 13, lineHeight: 20 },
  warningCard: { borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1 },
  warningTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 8 },
  warningText: { fontSize: 13, lineHeight: 20 }
});
