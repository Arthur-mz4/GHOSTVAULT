import React, { useMemo, useState, createContext, useContext } from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import SafeBrowserScreen from './src/screens/SafeBrowserScreen';
import LinkScannerScreen from './src/screens/LinkScannerScreen';
import StorageScannerScreen from './src/screens/StorageScannerScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { loadSettings, saveSettings } from './src/services/settingsService';

const Tab = createBottomTabNavigator();
const AppThemeDark = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: '#0b1220', card: '#0f172a', text: '#e6eef3', border: '#334155', notification: '#2563eb' }
};

const SettingsContext = createContext(null);
export const useSettings = () => useContext(SettingsContext);

export default function App() {
  const [settings, setSettings] = useState({ promptScanOnLinks: true, trackerBlocking: true, vtApiKey: '', safeBrowsingLevel: 'standard' });

  React.useEffect(() => { (async () => { const s = await loadSettings(); if (s) setSettings(s); })(); }, []);
  const ctxValue = useMemo(() => ({
    settings,
    updateSettings: async (partial) => { const next = { ...settings, ...partial }; setSettings(next); await saveSettings(next); }
  }), [settings]);

  return (
    <SettingsContext.Provider value={ctxValue}>
      <NavigationContainer theme={AppThemeDark}>
        <StatusBar barStyle={Platform.OS === 'ios' ? 'light-content' : 'light-content'} />
        <Tab.Navigator screenOptions={{
          headerStyle: { backgroundColor: '#0f172a' }, headerTintColor: '#e6eef3',
          tabBarStyle: { backgroundColor: '#0f172a', borderTopColor: '#334155' },
          tabBarActiveTintColor: '#60a5fa', tabBarInactiveTintColor: '#94a3b8'
        }}>
          <Tab.Screen name="Browser" component={SafeBrowserScreen} />
          <Tab.Screen name="Link Scan" component={LinkScannerScreen} />
          <Tab.Screen name="Storage" component={StorageScannerScreen} />
          <Tab.Screen name="History" component={HistoryScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SettingsContext.Provider>
  );
}


