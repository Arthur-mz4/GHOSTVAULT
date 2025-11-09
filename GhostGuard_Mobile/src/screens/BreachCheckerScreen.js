import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Linking, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
// Note: we import MailComposer dynamically inside sendReport to avoid hard dependency issues

export default function BreachCheckerScreen() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const checkBreach = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Use BreachDirectory API from RapidAPI
      const response = await fetch(`https://breachdirectory.p.rapidapi.com/?func=auto&term=${encodeURIComponent(email)}`, {
        headers: {
          'x-rapidapi-host': 'breachdirectory.p.rapidapi.com',
          'x-rapidapi-key': '3adb132cdemshbca70db3a8f255fp179c15jsn58eb7da060f3'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success === false) {
        setResult({
          breached: false,
          message: '✅ Good news! This email has not been found in any known data breaches.',
          breaches: []
        });
        return;
      }

      if (data.result && data.result.length > 0) {
        // Process and deduplicate breach data
        const uniqueBreaches = new Map();
        
        data.result.forEach(breach => {
          const key = `${breach.name || 'Unknown'}-${breach.date || 'Unknown'}`;
          if (!uniqueBreaches.has(key)) {
            uniqueBreaches.set(key, {
              Name: breach.name || 'Unknown Source',
              BreachDate: breach.date || 'Date unknown',
              DataClasses: [],
              Lines: new Set(),
              Sources: new Set([breach.source].filter(Boolean))
            });
          }
          
          const entry = uniqueBreaches.get(key);
          if (breach.line) entry.Lines.add(breach.line);
          if (Array.isArray(breach.leaked)) {
            breach.leaked.forEach(item => {
              if (!entry.DataClasses.includes(item)) {
                entry.DataClasses.push(item);
              }
            });
          }
        });

        const processedBreaches = Array.from(uniqueBreaches.values())
          .map(breach => ({
            ...breach,
            Lines: Array.from(breach.Lines),
            Sources: Array.from(breach.Sources),
            PwnCount: breach.Lines.size
          }))
          .sort((a, b) => {
            // Sort by date desc, then by name
            const dateA = a.BreachDate === 'Date unknown' ? '0' : a.BreachDate;
            const dateB = b.BreachDate === 'Date unknown' ? '0' : b.BreachDate;
            return dateB.localeCompare(dateA) || a.Name.localeCompare(b.Name);
          });

        setResult({
          breached: true,
          message: `⚠️ Warning: Found ${processedBreaches.length} breach${processedBreaches.length > 1 ? 'es' : ''} containing your data!`,
          breaches: processedBreaches.map(breach => ({
            Name: breach.Name,
            BreachDate: breach.BreachDate,
            DataClasses: breach.DataClasses,
            PwnCount: breach.PwnCount,
            Sources: breach.Sources,
            // Don't include actual leaked data for privacy/security
            LeakTypes: breach.DataClasses.join(', ')
          }))
        });
      } else {
        setResult({
          breached: false,
          message: '✅ Good news! This email has not been found in any known data breaches.',
          breaches: []
        });
      }
    } catch (error) {
      console.error('Breach check error:', error);
      Alert.alert(
        'Service Error',
        'Could not check breach status. This could be due to rate limiting or network issues. Please try again in a few minutes.'
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const formatReport = (resultObj, targetEmail) => {
    const lines = [];
    lines.push('GhostGuard Breach Checker Report');
    lines.push('Generated: ' + new Date().toLocaleString());
    lines.push('Target: ' + (targetEmail || 'N/A'));
    lines.push('');
    lines.push(resultObj.message || 'No summary available');
    lines.push('');

    if (resultObj.breached && resultObj.breaches && resultObj.breaches.length > 0) {
      lines.push('Breaches:');
      resultObj.breaches.forEach((b, i) => {
        lines.push(`${i + 1}. ${b.Name} — Date: ${b.BreachDate || 'Unknown'}`);
        lines.push(`   Compromised: ${b.DataClasses?.join(', ') || 'Multiple data types'}`);
        if (b.PwnCount) lines.push(`   Affected accounts: ${b.PwnCount.toLocaleString()}`);
        lines.push('');
      });
    } else {
      lines.push('No breaches found for this email.');
      lines.push('');
    }

    lines.push('Recommended Actions:');
    lines.push('• Change your password immediately');
    lines.push('• Enable two-factor authentication (2FA)');
    lines.push('• Use unique passwords for each account');
    lines.push('• Monitor your accounts for suspicious activity');
    lines.push('• Consider using a password manager');
    lines.push('');
    lines.push('This report was generated by GhostGuard Mobile.');

    return lines.join('\n');
  };

  const sendReport = async () => {
    if (!result) {
      Alert.alert('No results', 'Please run a breach check first before sending a report.');
      return;
    }

    if (!email) {
      Alert.alert('No email', 'Please enter an email address to receive the report.');
      return;
    }

    const subject = `GhostGuard Breach Report for ${email}`;
    const body = formatReport(result, email);

    // Try to use Expo MailComposer if available (native compose). Dynamic import avoids hard failure if module missing.
    try {
      const MailComposer = await import('expo-mail-composer');
      if (MailComposer && MailComposer.isAvailableAsync) {
        const available = await MailComposer.isAvailableAsync();
        if (available) {
          await MailComposer.composeAsync({
            subject,
            recipients: [email], // Send to the email that was checked
            body
          });
          return;
        }
      }
    } catch (e) {
      // ignore and fallback to mailto
      console.log('MailComposer not available, falling back to mailto:', e);
    }

    // Fallback: open the user's mail client via mailto: (note length limits on some platforms)
    try {
      const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      // On iOS Simulator, mailto may not work; inform the user.
      const supported = await Linking.canOpenURL(mailto);
      if (!supported) {
        Alert.alert('Cannot open mail client', 'No mail client is configured on this device.');
        return;
      }
      await Linking.openURL(mailto);
    } catch (err) {
      console.log('Failed to open mail client:', err);
      Alert.alert('Error', 'Unable to open mail client to send report.');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>🔐 Breach Checker</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Check if your email has been compromised in data breaches
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.text }]}>Email Address</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
          placeholder="your.email@example.com"
          placeholderTextColor={theme.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.checkButton, { backgroundColor: theme.primary }]}
          onPress={checkBreach}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.checkButtonText}>🔍 Check for Breaches</Text>
          )}
        </TouchableOpacity>
      </View>

      {result && (
        <View style={[styles.resultCard, { 
          backgroundColor: result.breached ? '#fee2e2' : '#d1fae5',
          borderColor: result.breached ? '#ef4444' : '#22c55e'
        }]}>
          <Text style={[styles.resultMessage, { color: result.breached ? '#991b1b' : '#065f46' }]}>
            {result.message}
          </Text>

          {result.breached && result.breaches.length > 0 && (
            <>
              <Text style={[styles.breachesTitle, { color: '#991b1b' }]}>
                Breaches Found:
              </Text>
              {result.breaches.map((breach, index) => (
                <View key={index} style={styles.breachItem}>
                  <Text style={styles.breachName}>🚨 {breach.Name}</Text>
                  <Text style={styles.breachDate}>Date: {breach.BreachDate}</Text>
                  <Text style={styles.breachData}>
                    Compromised: {breach.DataClasses?.join(', ') || 'Multiple data types'}
                  </Text>
                  {breach.PwnCount && (
                    <Text style={styles.breachCount}>
                      Affected accounts: {breach.PwnCount.toLocaleString()}
                    </Text>
                  )}
                </View>
              ))}

              <View style={[styles.recommendationCard, { backgroundColor: '#fef3c7', borderColor: '#f59e0b' }]}>
                <Text style={[styles.recommendationTitle, { color: '#92400e' }]}>
                  🛡️ Recommended Actions:
                </Text>
                <Text style={[styles.recommendationText, { color: '#78350f' }]}>
                  • Change your password immediately{'\n'}
                  • Enable two-factor authentication (2FA){'\n'}
                  • Use unique passwords for each account{'\n'}
                  • Monitor your accounts for suspicious activity{'\n'}
                  • Consider using a password manager
                </Text>
              </View>
            </>
          )}

          {/* Send Report button */}
          {result && (
            <View style={{ marginTop: 12 }}>
              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: '#2563eb' }]}
                onPress={sendReport}
                disabled={loading}
              >
                <Text style={styles.sendButtonText}>✉️ Send Report</Text>
              </TouchableOpacity>
            </View>
          )}

          {!result.breached && (
            <View style={[styles.recommendationCard, { backgroundColor: '#dbeafe', borderColor: '#3b82f6' }]}>
              <Text style={[styles.recommendationTitle, { color: '#1e40af' }]}>
                💡 Stay Protected:
              </Text>
              <Text style={[styles.recommendationText, { color: '#1e3a8a' }]}>
                • Use strong, unique passwords{'\n'}
                • Enable two-factor authentication{'\n'}
                • Regularly check for breaches{'\n'}
                • Be cautious of phishing emails{'\n'}
                • Keep your software updated
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.infoTitle, { color: theme.text }]}>ℹ️ About Breach Checker</Text>
        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
          This tool checks your email against the HaveIBeenPwned database, which contains over 11 billion 
          compromised accounts from various data breaches. Your email is checked securely and is never stored.
        </Text>
      </View>
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
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 },
  checkButton: { borderRadius: 12, padding: 16, alignItems: 'center' },
  checkButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  resultCard: { borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 2 },
  resultMessage: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  breachesTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  breachItem: { backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 8, padding: 12, marginBottom: 12 },
  breachName: { fontSize: 16, fontWeight: 'bold', color: '#991b1b', marginBottom: 4 },
  breachDate: { fontSize: 13, color: '#7f1d1d', marginBottom: 4 },
  breachData: { fontSize: 13, color: '#7f1d1d', marginBottom: 4 },
  breachCount: { fontSize: 12, color: '#991b1b', fontStyle: 'italic' },
  recommendationCard: { borderRadius: 8, padding: 12, marginTop: 16, borderWidth: 1 },
  recommendationTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 8 },
  recommendationText: { fontSize: 13, lineHeight: 20 },
  infoCard: { borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1 },
  infoTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 8 },
  infoText: { fontSize: 13, lineHeight: 20 }
  ,sendButton: { borderRadius: 12, padding: 14, alignItems: 'center' },
  sendButtonText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' }
});
