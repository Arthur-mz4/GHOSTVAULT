import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

export default function AboutScreen() {
  const { theme } = useTheme();

  const features = [
    { icon: '🌐', title: 'Safe Browser', description: 'Browse the web securely with built-in tracker blocking and threat detection' },
    { icon: '🔗', title: 'Link Scanner', description: 'Scan URLs before clicking to detect phishing and malicious websites' },
    { icon: '📁', title: 'Storage Scanner', description: 'Scan files on your device for malware, viruses, and suspicious content' },
    { icon: '📋', title: 'Scan History', description: 'Track all your scans with detailed reports and threat analysis' },
    { icon: '🔐', title: 'Login Manager', description: 'Securely store and manage your website credentials' },
    { icon: '🛡️', title: 'Breach Checker', description: 'Check if your email has been compromised in data breaches' },
    { icon: '📜', title: 'Terms Analyzer', description: 'Analyze Terms of Service and Privacy Policies for hidden risks' },
    { icon: '🔍', title: 'DeepSearch', description: 'Trace scammers and hackers from messages, texts, or files' },
    { icon: '🎮', title: 'Security Quiz', description: 'Learn cybersecurity through interactive quizzes and earn badges' },
    { icon: '👆', title: 'Biometric Auth', description: 'Quick and secure login with fingerprint or Face ID' },
    { icon: '🌙', title: 'Dark Mode', description: 'Easy on the eyes with beautiful dark theme support' },
    { icon: '👤', title: 'Profile Isolation', description: 'Each user has their own separate data and settings' }
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.logo}>👻</Text>
        <Text style={styles.appName}>GhostVault</Text>
        <Text style={styles.appSubtitle}>GhostGuard Mobile Security</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </LinearGradient>

      {/* Mission */}
      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>🎯 Our Mission</Text>
        <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
          GhostVault's GhostGuard is dedicated to protecting mobile users from online threats. 
          We provide comprehensive security tools that are easy to use, powerful, and accessible 
          to everyone. Our mission is to make the internet a safer place, one device at a time.
        </Text>
      </View>

      {/* What We Do */}
      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>🛡️ What We Do</Text>
        <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
          GhostGuard provides real-time protection against:
        </Text>
        <View style={styles.bulletList}>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>• Phishing attacks and malicious websites</Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>• Malware, viruses, and trojans</Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>• Data breaches and compromised accounts</Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>• Tracking and privacy violations</Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>• Scammers and online fraud</Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>• Suspicious terms and conditions</Text>
        </View>
      </View>

      {/* Features */}
      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>✨ Features</Text>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Text style={styles.featureIcon}>{feature.icon}</Text>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: theme.text }]}>{feature.title}</Text>
              <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                {feature.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Why Choose Us */}
      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>💡 Why Choose GhostGuard?</Text>
        <View style={styles.whyItem}>
          <Text style={styles.whyIcon}>🚀</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.whyTitle, { color: theme.text }]}>Fast & Efficient</Text>
            <Text style={[styles.whyText, { color: theme.textSecondary }]}>
              Lightning-fast scans with minimal battery impact
            </Text>
          </View>
        </View>
        <View style={styles.whyItem}>
          <Text style={styles.whyIcon}>🔒</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.whyTitle, { color: theme.text }]}>Privacy First</Text>
            <Text style={[styles.whyText, { color: theme.textSecondary }]}>
              Your data stays on your device. We never collect or sell your information
            </Text>
          </View>
        </View>
        <View style={styles.whyItem}>
          <Text style={styles.whyIcon}>🎓</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.whyTitle, { color: theme.text }]}>Educational</Text>
            <Text style={[styles.whyText, { color: theme.textSecondary }]}>
              Learn about cybersecurity through interactive quizzes and tips
            </Text>
          </View>
        </View>
        <View style={styles.whyItem}>
          <Text style={styles.whyIcon}>💪</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.whyTitle, { color: theme.text }]}>Comprehensive</Text>
            <Text style={[styles.whyText, { color: theme.textSecondary }]}>
              All-in-one security suite with 12+ powerful features
            </Text>
          </View>
        </View>
      </View>

      {/* Technology */}
      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>⚙️ Technology</Text>
        <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
          GhostGuard uses advanced security technologies including:
        </Text>
        <View style={styles.bulletList}>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>• Real-time threat detection algorithms</Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>• HaveIBeenPwned API for breach checking</Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>• PhishTank database integration</Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>• Offline heuristic analysis</Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>• Pattern matching and AI detection</Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>• Secure encrypted storage</Text>
        </View>
      </View>

      {/* Team */}
      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>👥 About GhostVault</Text>
        <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
          GhostVault is a cybersecurity company focused on developing innovative security solutions 
          for mobile devices. Our team of security experts and developers work tirelessly to stay 
          ahead of emerging threats and provide the best protection for our users.
        </Text>
        <Text style={[styles.sectionText, { color: theme.textSecondary, marginTop: 12 }]}>
          We believe that everyone deserves access to powerful security tools, which is why we've 
          made GhostGuard accessible, user-friendly, and packed with features that rival enterprise 
          security solutions.
        </Text>
      </View>

      {/* Contact */}
      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>📧 Contact Us</Text>
        <TouchableOpacity 
          style={styles.contactItem}
          onPress={() => Linking.openURL('mailto:ghostvault45@gmail.com')}
        >
          <Text style={styles.contactIcon}>✉️</Text>
          <Text style={[styles.contactText, { color: theme.primary }]}>ghostvault45@gmail.com</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.contactItem}
          onPress={() => Linking.openURL('https://ghostvault.com')}
        >
          <Text style={styles.contactIcon}>🌐</Text>
          <Text style={[styles.contactText, { color: theme.primary }]}>www.ghostvault.com</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          © 2025 GhostVault. All rights reserved.
        </Text>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          Made with ❤️ for a safer internet
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 40, alignItems: 'center' },
  logo: { fontSize: 80, marginBottom: 16 },
  appName: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  appSubtitle: { fontSize: 16, color: '#ffffff', opacity: 0.9, marginBottom: 8 },
  version: { fontSize: 14, color: '#ffffff', opacity: 0.7 },
  section: { margin: 16, padding: 20, borderRadius: 16, borderWidth: 1 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  sectionText: { fontSize: 15, lineHeight: 22 },
  bulletList: { marginTop: 12 },
  bulletPoint: { fontSize: 14, lineHeight: 24, marginLeft: 8 },
  featureItem: { flexDirection: 'row', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  featureIcon: { fontSize: 32, marginRight: 16 },
  featureContent: { flex: 1 },
  featureTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  featureDescription: { fontSize: 13, lineHeight: 18 },
  whyItem: { flexDirection: 'row', marginBottom: 16 },
  whyIcon: { fontSize: 32, marginRight: 12 },
  whyTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  whyText: { fontSize: 13, lineHeight: 18 },
  contactItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  contactIcon: { fontSize: 24, marginRight: 12 },
  contactText: { fontSize: 15, textDecorationLine: 'underline' },
  footer: { padding: 32, alignItems: 'center' },
  footerText: { fontSize: 13, textAlign: 'center', marginBottom: 4 }
});
