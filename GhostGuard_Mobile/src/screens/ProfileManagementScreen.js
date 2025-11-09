import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileManagementScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfile = () => {
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    Alert.alert('Success', 'Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Profile Information</Text>
      
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Full Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={theme.textSecondary}
        />

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.primary }]} 
          onPress={handleUpdateProfile}
        >
          <Text style={styles.buttonText}>Update Profile</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Change Password</Text>
      
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Current Password</Text>
        <TextInput
          value={currentPassword}
          onChangeText={setCurrentPassword}
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          secureTextEntry
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>New Password</Text>
        <TextInput
          value={newPassword}
          onChangeText={setNewPassword}
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          secureTextEntry
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Confirm New Password</Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          secureTextEntry
          placeholderTextColor={theme.textSecondary}
        />

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.warning }]} 
          onPress={handleChangePassword}
        >
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    fontSize: 16,
  },
  button: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


