import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const BASE_KEY = 'ghostguard_history';

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

export async function saveScanRecord(rec) {
  try {
    const key = await getUserKey();
    const exist = await AsyncStorage.getItem(key);
    const arr = exist ? JSON.parse(exist) : [];
    arr.push(rec);
    await AsyncStorage.setItem(key, JSON.stringify(arr));
  } catch (error) {
    console.error('Error saving scan record:', error);
  }
}

export async function getScanRecords() {
  try {
    const key = await getUserKey();
    const exist = await AsyncStorage.getItem(key);
    return exist ? JSON.parse(exist) : [];
  } catch (error) {
    console.error('Error getting scan records:', error);
    return [];
  }
}

export async function clearScanRecords() {
  try {
    const key = await getUserKey();
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing scan records:', error);
  }
}


