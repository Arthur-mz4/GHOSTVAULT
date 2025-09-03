import AsyncStorage from '@react-native-async-storage/async-storage';
const KEY = 'ghostguard_history';

export async function saveScanRecord(rec) { try { const exist = await AsyncStorage.getItem(KEY); const arr = exist ? JSON.parse(exist) : []; arr.push(rec); await AsyncStorage.setItem(KEY, JSON.stringify(arr)); } catch {} }
export async function getScanRecords() { try { const exist = await AsyncStorage.getItem(KEY); return exist ? JSON.parse(exist) : []; } catch { return []; } }
export async function clearScanRecords() { try { await AsyncStorage.removeItem(KEY); } catch {} }


