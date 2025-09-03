import AsyncStorage from '@react-native-async-storage/async-storage';
const SETTINGS_KEY = 'ghostguard_settings';
export async function loadSettings() { try { const s = await AsyncStorage.getItem(SETTINGS_KEY); return s ? JSON.parse(s) : null; } catch { return null; } }
export async function saveSettings(s) { try { await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {} }


