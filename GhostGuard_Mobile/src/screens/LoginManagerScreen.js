import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, ScrollView, Modal } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getLoginCredentials, saveLoginCredential, deleteLoginCredential, updateLoginCredential } from '../services/loginManagerService';

export default function LoginManagerScreen() {
  const { theme } = useTheme();
  const [credentials, setCredentials] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    website: '',
    username: '',
    password: '',
    notes: ''
  });

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    const creds = await getLoginCredentials();
    setCredentials(creds);
  };

  const handleSave = async () => {
    if (!formData.website || !formData.username) {
      Alert.alert('Error', 'Website and username are required');
      return;
    }

    if (editingId) {
      // Update existing
      await updateLoginCredential(editingId, formData);
      Alert.alert('Success', 'Login credential updated');
    } else {
      // Add new
      await saveLoginCredential(formData);
      Alert.alert('Success', 'Login credential saved');
    }

    setShowAddModal(false);
    setEditingId(null);
    setFormData({ website: '', username: '', password: '', notes: '' });
    loadCredentials();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      website: item.website,
      username: item.username,
      password: item.password,
      notes: item.notes || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Credential',
      'Are you sure you want to delete this login?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteLoginCredential(id);
            loadCredentials();
          }
        }
      ]
    );
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ website: '', username: '', password: '', notes: '' });
    setShowAddModal(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>🔐 Login Manager</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Store and manage your login credentials securely
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={handleAddNew}
      >
        <Text style={styles.addButtonText}>➕ Add New Login</Text>
      </TouchableOpacity>

      {credentials.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={[styles.emptyText, { color: theme.text }]}>No saved logins yet</Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Tap "Add New Login" to store your credentials
          </Text>
        </View>
      ) : (
        <FlatList
          data={credentials}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.website, { color: theme.text }]}>{item.website}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
                    <Text style={styles.actionIcon}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
                    <Text style={styles.actionIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={[styles.username, { color: theme.textSecondary }]}>👤 {item.username}</Text>
              <Text style={[styles.password, { color: theme.textSecondary }]}>🔑 {'•'.repeat(8)}</Text>
              {item.notes ? (
                <Text style={[styles.notes, { color: theme.textSecondary }]}>📝 {item.notes}</Text>
              ) : null}
            </View>
          )}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingId ? 'Edit Login' : 'Add New Login'}
            </Text>

            <ScrollView style={styles.form}>
              <Text style={[styles.label, { color: theme.text }]}>Website/App Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="e.g., Facebook, Gmail"
                placeholderTextColor={theme.textSecondary}
                value={formData.website}
                onChangeText={(text) => setFormData({ ...formData, website: text })}
              />

              <Text style={[styles.label, { color: theme.text }]}>Username/Email *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="Your username or email"
                placeholderTextColor={theme.textSecondary}
                value={formData.username}
                onChangeText={(text) => setFormData({ ...formData, username: text })}
                autoCapitalize="none"
              />

              <Text style={[styles.label, { color: theme.text }]}>Password</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="Your password"
                placeholderTextColor={theme.textSecondary}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry
              />

              <Text style={[styles.label, { color: theme.text }]}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="Additional notes"
                placeholderTextColor={theme.textSecondary}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                multiline
                numberOfLines={3}
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: theme.border }]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: theme.primary }]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  addButton: { borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 },
  addButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptySubtext: { fontSize: 14, textAlign: 'center' },
  card: { borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  website: { fontSize: 18, fontWeight: 'bold', flex: 1 },
  actions: { flexDirection: 'row', gap: 8 },
  actionButton: { padding: 4 },
  actionIcon: { fontSize: 20 },
  username: { fontSize: 14, marginBottom: 4 },
  password: { fontSize: 14, marginBottom: 4 },
  notes: { fontSize: 12, marginTop: 8, fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 16, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  form: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
  textArea: { height: 80, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalButton: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelButton: { borderWidth: 1 },
  cancelButtonText: { fontSize: 16, fontWeight: '600' },
  saveButton: {},
  saveButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});
