import React, { useMemo, useState, createContext, useContext } from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import ErrorBoundary from './src/components/ErrorBoundary';
import { loadSettings, saveSettings } from './src/services/settingsService';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

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
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SettingsContext.Provider value={ctxValue}>
            <NavigationContainer theme={AppThemeDark}>
              <StatusBar barStyle={Platform.OS === 'ios' ? 'light-content' : 'light-content'} />
              <AppNavigator />
            </NavigationContainer>
          </SettingsContext.Provider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}


