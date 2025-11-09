import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

export default function CustomDrawer({ visible, onClose, currentRoute }) {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const menuItems = [
    { name: 'Home', icon: '🏠', route: 'Home' },
    { name: 'My Profile', icon: '👤', route: 'Profile Management' },
    { name: 'Browser', icon: '🌐', route: 'Browser' },
    { name: 'Link Scanner', icon: '🔗', route: 'Link Scanner' },
    { name: 'Storage Scanner', icon: '📁', route: 'Storage Scanner' },
    { name: 'Scan History', icon: '📋', route: 'Scan History' },
    { name: 'Login Manager', icon: '🔐', route: 'Login Manager' },
    { name: 'Breach Checker', icon: '🛡️', route: 'Breach Checker' },
    { name: 'Terms Analyzer', icon: '📜', route: 'Terms Analyzer' },
    { name: 'DeepSearch', icon: '🔍', route: 'DeepSearch' },
    { name: 'About', icon: 'ℹ️', route: 'About' },
    { name: 'Settings', icon: '⚙️', route: 'Settings' },
  ];

  const handleNavigate = (route) => {
    navigation.navigate(route);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <View style={[styles.drawer, { backgroundColor: theme.surface, width: DRAWER_WIDTH }]}>
          <View style={[styles.header, { backgroundColor: theme.primary }]}>
            <Text style={styles.headerText}>👻 GhostVault</Text>
            <Text style={styles.headerSubtext}>GhostGuard Mobile Security</Text>
          </View>
          
          <ScrollView style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  currentRoute === item.route && { backgroundColor: theme.primaryLight }
                ]}
                onPress={() => handleNavigate(item.route)}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={[
                  styles.menuText,
                  { color: currentRoute === item.route ? theme.primary : theme.text }
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Version 1.0.0
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtext: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 20,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});


