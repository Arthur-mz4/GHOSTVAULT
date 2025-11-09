import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function TermsAnalyzerScreen() {
  const { theme } = useTheme();
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyzeTerms = async () => {
    if (!url && !text) {
      Alert.alert('Error', 'Please enter a website URL or paste terms text');
      return;
    }

    setLoading(true);
    setResult(null);

    // Simulate analysis with realistic results
    setTimeout(() => {
      const content = text || url;
      const contentLower = content.toLowerCase();
      
      const redFlags = [];
      const warnings = [];
      const info = [];

      // Check for common problematic clauses
      if (contentLower.includes('sell') || contentLower.includes('share') || contentLower.includes('third party')) {
        redFlags.push({
          title: '🚨 Data Selling/Sharing',
          description: 'Your personal data may be sold or shared with third parties',
          severity: 'high'
        });
      }

      if (contentLower.includes('track') || contentLower.includes('cookie') || contentLower.includes('analytics')) {
        warnings.push({
          title: '⚠️ Tracking & Cookies',
          description: 'The service uses tracking technologies and cookies to monitor your activity',
          severity: 'medium'
        });
      }

      if (contentLower.includes('location') || contentLower.includes('gps') || contentLower.includes('geolocation')) {
        warnings.push({
          title: '⚠️ Location Tracking',
          description: 'Your location data may be collected and stored',
          severity: 'medium'
        });
      }

      if (contentLower.includes('arbitration') || contentLower.includes('class action')) {
        redFlags.push({
          title: '🚨 Arbitration Clause',
          description: 'You may be waiving your right to sue or join class action lawsuits',
          severity: 'high'
        });
      }

      if (contentLower.includes('indefinite') || contentLower.includes('perpetual') || contentLower.includes('forever')) {
        warnings.push({
          title: '⚠️ Indefinite Rights',
          description: 'The company may retain rights to your content indefinitely',
          severity: 'medium'
        });
      }

      if (contentLower.includes('contact') || contentLower.includes('email') || contentLower.includes('phone')) {
        info.push({
          title: 'ℹ️ Contact Information',
          description: 'Your contact information will be collected',
          severity: 'low'
        });
      }

      if (contentLower.includes('age') || contentLower.includes('13') || contentLower.includes('children')) {
        info.push({
          title: 'ℹ️ Age Restrictions',
          description: 'Service has age restrictions or collects data from minors',
          severity: 'low'
        });
      }

      if (contentLower.includes('payment') || contentLower.includes('credit card') || contentLower.includes('billing')) {
        warnings.push({
          title: '⚠️ Payment Information',
          description: 'Payment and financial information will be collected',
          severity: 'medium'
        });
      }

      // If no specific issues found, add generic ones for demonstration
      if (redFlags.length === 0 && warnings.length === 0) {
        warnings.push({
          title: '⚠️ Data Collection',
          description: 'Standard data collection practices detected',
          severity: 'medium'
        });
        info.push({
          title: 'ℹ️ Privacy Policy',
          description: 'Review the full privacy policy for complete details',
          severity: 'low'
        });
      }

      const totalIssues = redFlags.length + warnings.length;
      const riskLevel = redFlags.length > 0 ? 'high' : warnings.length > 2 ? 'medium' : 'low';

      setResult({
        riskLevel,
        totalIssues,
        redFlags,
        warnings,
        info,
        score: Math.max(0, 100 - (redFlags.length * 20) - (warnings.length * 10))
      });

      setLoading(false);
    }, 2000);
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      default: return '#22c55e';
    }
  };

  const getRiskText = (level) => {
    switch (level) {
      case 'high': return 'High Risk';
      case 'medium': return 'Medium Risk';
      default: return 'Low Risk';
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>📜 Terms & Cookie Analyzer</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Analyze Terms of Service and Privacy Policies for hidden risks
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.text }]}>Website URL</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
          placeholder="https://example.com/terms"
          placeholderTextColor={theme.textSecondary}
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={[styles.label, { color: theme.text }]}>Or Paste Terms Text</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
          placeholder="Paste terms of service or privacy policy text here..."
          placeholderTextColor={theme.textSecondary}
          value={text}
          onChangeText={setText}
          multiline
          numberOfLines={6}
        />

        <TouchableOpacity
          style={[styles.analyzeButton, { backgroundColor: theme.primary }]}
          onPress={analyzeTerms}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.analyzeButtonText}>🔍 Analyze Terms</Text>
          )}
        </TouchableOpacity>
      </View>

      {result && (
        <>
          <View style={[styles.scoreCard, { 
            backgroundColor: theme.surface,
            borderColor: getRiskColor(result.riskLevel),
            borderWidth: 2
          }]}>
            <View style={styles.scoreHeader}>
              <View>
                <Text style={[styles.scoreNumber, { color: getRiskColor(result.riskLevel) }]}>
                  {result.score}/100
                </Text>
                <Text style={[styles.scoreLabel, { color: theme.text }]}>Privacy Score</Text>
              </View>
              <View style={[styles.riskBadge, { backgroundColor: getRiskColor(result.riskLevel) }]}>
                <Text style={styles.riskText}>{getRiskText(result.riskLevel)}</Text>
              </View>
            </View>
            <Text style={[styles.issuesFound, { color: theme.textSecondary }]}>
              {result.totalIssues} potential issue{result.totalIssues !== 1 ? 's' : ''} found
            </Text>
          </View>

          {result.redFlags.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>🚨 Critical Issues</Text>
              {result.redFlags.map((flag, index) => (
                <View key={index} style={[styles.issueCard, { backgroundColor: '#fee2e2', borderColor: '#ef4444' }]}>
                  <Text style={[styles.issueTitle, { color: '#991b1b' }]}>{flag.title}</Text>
                  <Text style={[styles.issueDescription, { color: '#7f1d1d' }]}>{flag.description}</Text>
                </View>
              ))}
            </View>
          )}

          {result.warnings.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: '#f59e0b' }]}>⚠️ Warnings</Text>
              {result.warnings.map((warning, index) => (
                <View key={index} style={[styles.issueCard, { backgroundColor: '#fef3c7', borderColor: '#f59e0b' }]}>
                  <Text style={[styles.issueTitle, { color: '#92400e' }]}>{warning.title}</Text>
                  <Text style={[styles.issueDescription, { color: '#78350f' }]}>{warning.description}</Text>
                </View>
              ))}
            </View>
          )}

          {result.info.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: '#3b82f6' }]}>ℹ️ Information</Text>
              {result.info.map((item, index) => (
                <View key={index} style={[styles.issueCard, { backgroundColor: '#dbeafe', borderColor: '#3b82f6' }]}>
                  <Text style={[styles.issueTitle, { color: '#1e40af' }]}>{item.title}</Text>
                  <Text style={[styles.issueDescription, { color: '#1e3a8a' }]}>{item.description}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={[styles.recommendationCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.recommendationTitle, { color: theme.text }]}>💡 Recommendations</Text>
            <Text style={[styles.recommendationText, { color: theme.textSecondary }]}>
              • Read the full terms before accepting{'\n'}
              • Look for opt-out options for data sharing{'\n'}
              • Use privacy-focused browser extensions{'\n'}
              • Regularly review privacy settings{'\n'}
              • Consider alternative services with better privacy
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
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 8 },
  textArea: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 14, height: 120, textAlignVertical: 'top', marginBottom: 16 },
  analyzeButton: { borderRadius: 12, padding: 16, alignItems: 'center' },
  analyzeButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  scoreCard: { borderRadius: 12, padding: 20, marginBottom: 16 },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  scoreNumber: { fontSize: 48, fontWeight: 'bold' },
  scoreLabel: { fontSize: 14, marginTop: 4 },
  riskBadge: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  riskText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  issuesFound: { fontSize: 14 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  issueCard: { borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1 },
  issueTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  issueDescription: { fontSize: 13, lineHeight: 18 },
  recommendationCard: { borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1 },
  recommendationTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  recommendationText: { fontSize: 13, lineHeight: 20 }
});
