import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const lightTheme = {
  background: '#ffffff',
  surface: '#f8f9fa',
  card: '#ffffff',
  text: '#1a1a1a',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  primary: '#2563eb',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  gradient1: '#667eea',
  gradient2: '#764ba2',
};

export const darkTheme = {
  background: '#0b1220',
  surface: '#0f172a',
  card: '#1e293b',
  text: '#e6eef3',
  textSecondary: '#94a3b8',
  border: '#334155',
  primary: '#60a5fa',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  gradient1: '#667eea',
  gradient2: '#764ba2',
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const [theme, setTheme] = useState(darkTheme);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    setTheme(isDark ? darkTheme : lightTheme);
  }, [isDark]);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('ghostguard_theme');
      if (saved !== null) {
        setIsDark(saved === 'dark');
      }
    } catch (error) {
      console.error('Load theme error:', error);
    }
  };

  const toggleTheme = async () => {
    const newMode = !isDark;
    setIsDark(newMode);
    try {
      await AsyncStorage.setItem('ghostguard_theme', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Save theme error:', error);
    }
  };

  const value = {
    theme,
    isDark,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};


