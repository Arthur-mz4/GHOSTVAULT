import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { getScanRecords } from '../services/historyService';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const { user, isSubscribed } = useAuth();
  const [threatLevel, setThreatLevel] = useState('low');
  const [stats, setStats] = useState({ scans: 0, threats: 0, safe: 0 });

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  // Reload stats every time screen comes into focus (real-time updates)
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    const records = await getScanRecords();
    const threats = records.filter(r => r.result === 'Unsafe' || r.result.includes('Suspicious')).length;
    const safe = records.filter(r => r.result === 'Safe').length;
    
    setStats({
      scans: records.length,
      threats,
      blocked: safe, // Blocked = Safe items (threats that were blocked/prevented)
    });
    
    if (threats > 10) setThreatLevel('high');
    else if (threats > 3) setThreatLevel('medium');
    else setThreatLevel('low');
  };

  const getThreatColor = () => {
    switch (threatLevel) {
      case 'high': return ['#ef4444', '#dc2626'];
      case 'medium': return ['#f59e0b', '#d97706'];
      default: return ['#22c55e', '#16a34a'];
    }
  };

  const getThreatText = () => {
    switch (threatLevel) {
      case 'high': return 'High Risk';
      case 'medium': return 'Medium Risk';
      default: return 'Protected';
    }
  };

  const quickActions = [
    { id: '1', title: 'Scan Link', icon: '🔗', screen: 'Link Scanner', color: '#3b82f6' },
    { id: '2', title: 'Scan Storage', icon: '📁', screen: 'Storage Scanner', color: '#8b5cf6' },
    { id: '3', title: 'Safe Browser', icon: '🌐', screen: 'Browser', color: '#06b6d4' },
    { id: '4', title: 'History', icon: '📋', screen: 'Scan History', color: '#f59e0b' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name || 'User'}!</Text>
          <Text style={styles.subtitle}>Your device is {isSubscribed ? 'fully' : 'partially'} protected</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Threat Status Card */}
      <LinearGradient colors={getThreatColor()} style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusIcon}>{threatLevel === 'low' ? '🛡️' : '⚠️'}</Text>
          <Text style={styles.statusText}>{getThreatText()}</Text>
        </View>
        <Text style={styles.statusDescription}>
          {threatLevel === 'low' 
            ? 'No immediate threats detected. Continue safe browsing.'
            : 'Threats detected. Run a full scan to secure your device.'}
        </Text>
        {!isSubscribed && (
          <TouchableOpacity 
            style={styles.upgradeButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.upgradeText}>Upgrade for Full Protection</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.scans}</Text>
          <Text style={styles.statLabel}>Total Scans</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#ef4444' }]}>{stats.threats}</Text>
          <Text style={styles.statLabel}>Threats Found</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#22c55e' }]}>{stats.blocked}</Text>
          <Text style={styles.statLabel}>Blocked</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionCard, !isSubscribed && action.id !== '1' && styles.actionCardLocked]}
            onPress={() => {
              if (!isSubscribed && action.id !== '1') {
                navigation.navigate('Settings');
              } else {
                navigation.navigate(action.screen);
              }
            }}
          >
            <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
              <Text style={styles.actionEmoji}>{action.icon}</Text>
            </View>
            <Text style={styles.actionTitle}>{action.title}</Text>
            {!isSubscribed && action.id !== '1' && (
              <Text style={styles.lockIcon}>🔒</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Security Quiz */}
      <Text style={styles.sectionTitle}>🎮 Security Quiz</Text>
      <TouchableOpacity 
        style={styles.quizCard}
        onPress={() => navigation.navigate('Security Quiz')}
      >
        <View style={styles.quizHeader}>
          <Text style={styles.quizIcon}>🧠</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.quizTitle}>Test Your Security Knowledge!</Text>
            <Text style={styles.quizSubtitle}>Learn while you play - improve your online safety</Text>
          </View>
        </View>
        <View style={styles.quizStats}>
          <View style={styles.quizStat}>
            <Text style={styles.quizStatNumber}>10</Text>
            <Text style={styles.quizStatLabel}>Questions</Text>
          </View>
          <View style={styles.quizStat}>
            <Text style={styles.quizStatNumber}>5</Text>
            <Text style={styles.quizStatLabel}>Minutes</Text>
          </View>
          <View style={styles.quizStat}>
            <Text style={styles.quizStatNumber}>🏆</Text>
            <Text style={styles.quizStatLabel}>Earn Badge</Text>
          </View>
        </View>
        <View style={styles.playButton}>
          <Text style={styles.playButtonText}>▶️ Start Quiz</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1220',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e6eef3',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  settingsIcon: {
    fontSize: 28,
  },
  statusCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statusDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  upgradeText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#60a5fa',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e6eef3',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 30,
  },
  actionCard: {
    width: (width - 56) / 2,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionCardLocked: {
    opacity: 0.6,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionEmoji: {
    fontSize: 28,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e6eef3',
    textAlign: 'center',
  },
  lockIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    fontSize: 16,
  },
  tipsCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  quizCard: {
    marginHorizontal: 20,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#334155',
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  quizIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e6eef3',
    marginBottom: 4,
  },
  quizSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
  },
  quizStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#334155',
  },
  quizStat: {
    alignItems: 'center',
  },
  quizStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#60a5fa',
    marginBottom: 4,
  },
  quizStatLabel: {
    fontSize: 11,
    color: '#94a3b8',
  },
  playButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  playButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
