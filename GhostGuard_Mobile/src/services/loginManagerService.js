import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const BASE_KEY = 'ghostguard_login_manager';

// Get current user ID
const getCurrentUserId = async () => {
  try {
    const userData = await SecureStore.getItemAsync('ghostguard_user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id || 'default';
    }
  } catch (error) {
    console.error('Error getting user ID:', error);
  }
  return 'default';
};

// Get user-specific key
const getUserKey = async () => {
  const userId = await getCurrentUserId();
  return `${BASE_KEY}_${userId}`;
};

// Save login credential
export const saveLoginCredential = async (credential) => {
  try {
    const key = await getUserKey();
    const existing = await AsyncStorage.getItem(key);
    const credentials = existing ? JSON.parse(existing) : [];
    
    // Add new credential with unique ID
    const newCredential = {
      id: `cred_${Date.now()}`,
      ...credential,
      createdAt: Date.now()
    };
    
    credentials.push(newCredential);
    await AsyncStorage.setItem(key, JSON.stringify(credentials));
    return { success: true, credential: newCredential };
  } catch (error) {
    console.error('Error saving credential:', error);
    return { success: false, error: error.message };
  }
};

// Get all saved credentials
export const getLoginCredentials = async () => {
  try {
    const key = await getUserKey();
    const existing = await AsyncStorage.getItem(key);
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.error('Error getting credentials:', error);
    return [];
  }
};

// Update credential
export const updateLoginCredential = async (id, updates) => {
  try {
    const key = await getUserKey();
    const existing = await AsyncStorage.getItem(key);
    const credentials = existing ? JSON.parse(existing) : [];
    
    const index = credentials.findIndex(c => c.id === id);
    if (index !== -1) {
      credentials[index] = { ...credentials[index], ...updates, updatedAt: Date.now() };
      await AsyncStorage.setItem(key, JSON.stringify(credentials));
      return { success: true };
    }
    
    return { success: false, error: 'Credential not found' };
  } catch (error) {
    console.error('Error updating credential:', error);
    return { success: false, error: error.message };
  }
};

// Delete credential
export const deleteLoginCredential = async (id) => {
  try {
    const key = await getUserKey();
    const existing = await AsyncStorage.getItem(key);
    const credentials = existing ? JSON.parse(existing) : [];
    
    const filtered = credentials.filter(c => c.id !== id);
    await AsyncStorage.setItem(key, JSON.stringify(filtered));
    return { success: true };
  } catch (error) {
    console.error('Error deleting credential:', error);
    return { success: false, error: error.message };
  }
};

// Clear all credentials
export const clearAllCredentials = async () => {
  try {
    const key = await getUserKey();
    await AsyncStorage.removeItem(key);
    return { success: true };
  } catch (error) {
    console.error('Error clearing credentials:', error);
    return { success: false, error: error.message };
  }
};
