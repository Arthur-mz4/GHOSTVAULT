import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Switch, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from '../../App';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { setBiometricEnabled, checkBiometricAvailability } from '../services/authService';

export default function SettingsScreen({ navigation }) {
  const { settings, updateSettings } = useSettings();
  const { user, isSubscribed, logout, subscribe, biometricAvailable } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [local, setLocal] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  
  useEffect(() => setLocal(settings), [settings]);
  useEffect(() => {
    checkBiometricStatus();
  }, []);
  
  const checkBiometricStatus = async () => {
    if (user?.biometricEnabled) {
      setBiometricEnabledState(true);
    }
  };

  const handleSaveSettings = async () => {
    await updateSettings(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: async () => await logout() }
      ]
    );
  };

  const handleSubscribe = async () => {
    if (isSubscribed) {
      Alert.alert('Already Subscribed', 'You have an active premium subscription');
      return;
    }
    
    Alert.alert(
      'Upgrade to Premium',
      'Get full protection with all features',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Subscribe', 
          onPress: async () => {
            const result = await subscribe('monthly');
            if (result.success) {
              Alert.alert('Success', 'You are now subscribed to Premium!');
            }
          }
        }
      ]
    );
  };

  const handleBiometricToggle = async (value) => {
    const result = await setBiometricEnabled(value);
    if (result) {
      setBiometricEnabledState(value);
      // Save global preference for auto-prompt on login
      await AsyncStorage.setItem('ghostguard_biometric_enabled', value ? 'true' : 'false');
      Alert.alert('Success', value ? 'Biometric authentication enabled. You will be prompted on next login.' : 'Biometric authentication disabled');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      {/* Account Section */}
      <LinearGradient 
        colors={isSubscribed ? [theme.success, '#16a34a'] : ['#64748b', '#475569']} 
        style={styles.accountCard}
      >
        <Text style={styles.accountName}>{user?.name || 'User'}</Text>
        <Text style={styles.accountEmail}>{user?.email || ''}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{isSubscribed ? '👑 PREMIUM' : '🆓 BASIC'}</Text>
        </View>
      </LinearGradient>

      {/* Profile Management */}
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]} 
        onPress={() => navigation.navigate('Profile Management')}
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardIcon}>👤</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Manage Profile</Text>
            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>Update name, email, and password</Text>
          </View>
          <Text style={[styles.arrow, { color: theme.textSecondary }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* Subscription */}
      {!isSubscribed && (
        <TouchableOpacity 
          style={[styles.upgradeCard, { borderColor: theme.primary }]} 
          onPress={handleSubscribe}
        >
          <Text style={[styles.upgradeTitle, { color: theme.primary }]}>🚀 Upgrade to Premium</Text>
          <Text style={[styles.upgradeText, { color: theme.textSecondary }]}>Unlock all features and full protection</Text>
        </TouchableOpacity>
      )}

      {/* Appearance */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
      
      <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: theme.text }]}>Dark Mode</Text>
          <Text style={[styles.hint, { color: theme.textSecondary }]}>Switch between light and dark theme</Text>
        </View>
        <Switch value={isDark} onValueChange={toggleTheme} />
      </View>

      {/* API Settings */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>API Settings</Text>

      <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: theme.text }]}>RapidAPI Key</Text>
          <Text style={[styles.hint, { color: theme.textSecondary }]}>For enhanced phishing detection</Text>
        </View>
        <TextInput
          style={[styles.apiInput, { backgroundColor: theme.background, color: theme.text }]}
          value={local.rapidApiKey || ''}
          onChangeText={v => setLocal({ ...local, rapidApiKey: v })}
          placeholder="Enter API key"
          placeholderTextColor={theme.textSecondary}
          secureTextEntry
        />
      </View>

      {/* Security Settings */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Security Settings</Text>

      <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.text }]}>Prompt scan on links</Text>
        <Switch value={!!local.promptScanOnLinks} onValueChange={v => setLocal({ ...local, promptScanOnLinks: v })} />
      </View>

      <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.text }]}>Tracker blocking</Text>
        <Switch value={!!local.trackerBlocking} onValueChange={v => setLocal({ ...local, trackerBlocking: v })} />
      </View>

      {biometricAvailable && (
        <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: theme.text }]}>Biometric Login</Text>
            <Text style={[styles.hint, { color: theme.textSecondary }]}>Use fingerprint or Face ID</Text>
          </View>
          <Switch value={biometricEnabled} onValueChange={handleBiometricToggle} />
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Protection Features</Text>
      
      <View 
        style={[styles.infoCard, { backgroundColor: theme.success + '20', borderColor: theme.success }]}
      >
        <Text style={[styles.infoText, { color: theme.text }]}>
          ✅ Offline heuristics (instant detection){'\n'}
          ✅ PhishTank database (no setup needed){'\n'}
          ✅ Advanced pattern matching{'\n'}
          ✅ Real-time tracker blocking{'\n'}
          🛡️ All protection features work automatically!
        </Text>
      </View>

      <View style={[styles.rowCol, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.text }]}>Safe browsing level</Text>
        <View style={[styles.pickerContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Picker
            selectedValue={local.safeBrowsingLevel || 'standard'}
            onValueChange={(value) => setLocal({ ...local, safeBrowsingLevel: value })}
            style={[styles.picker, { color: theme.text }]}
            dropdownIconColor={theme.textSecondary}
          >
            <Picker.Item label="Off" value="off" />
            <Picker.Item label="Standard" value="standard" />
            <Picker.Item label="Strict" value="strict" />
          </Picker>
        </View>
        <Text style={[styles.hint, { color: theme.textSecondary }]}>Strict blocks more potential threats</Text>
      </View>

      <TouchableOpacity 
        style={[styles.saveButton, { backgroundColor: theme.primary }]} 
        onPress={handleSaveSettings}
      >
        <Text style={styles.saveButtonText}>💾 Save Settings</Text>
      </TouchableOpacity>

      {saved && (
        <View style={[styles.savedBanner, { backgroundColor: theme.success }]}>
          <Text style={styles.savedText}>✓ Settings Saved</Text>
        </View>
      )}

      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.danger }]} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={[styles.version, { color: theme.textSecondary }]}>GhostGuard v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  apiInput: {
    width: 120,
    padding: 8,
    borderRadius: 6,
    fontSize: 12,
    textAlign: 'center',
    borderWidth: 1,
  },
  accountCard: { borderRadius: 16, padding: 20, marginBottom: 20, marginTop: 10 },
  accountName: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  accountEmail: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 12 },
  badge: { backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, alignSelf: 'flex-start' },
  badgeText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  card: { borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1 },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: { fontSize: 32 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSubtitle: { fontSize: 13, marginTop: 2 },
  arrow: { fontSize: 24 },
  upgradeCard: { borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 2 },
  upgradeTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  upgradeText: { fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 8, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12 },
  rowCol: { borderWidth: 1, borderRadius: 8, padding: 12, gap: 8, marginBottom: 12 },
  label: { fontWeight: '600' },
  input: { borderWidth: 1, padding: 10, borderRadius: 8 },
  hint: { fontSize: 12, marginTop: 4 },
  pickerContainer: { borderWidth: 1, borderRadius: 8 },
  picker: { backgroundColor: 'transparent' },
  saveButton: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20, marginBottom: 12 },
  saveButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  savedBanner: { borderRadius: 8, padding: 12, marginBottom: 16, alignItems: 'center' },
  savedText: { color: '#ffffff', fontWeight: '600' },
  infoCard: { borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1 },
  infoText: { fontSize: 13, lineHeight: 20 },
  logoutButton: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8, marginBottom: 20 },
  logoutText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  version: { fontSize: 12, textAlign: 'center', marginBottom: 20 }
});
