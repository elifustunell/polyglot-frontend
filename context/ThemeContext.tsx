// context/ThemeContext.tsx - Web Compatible Version
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';

// Platform-specific storage imports
let AsyncStorage: any = null;
if (Platform.OS !== 'web') {
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch (e) {
    console.warn('AsyncStorage not available, using memory storage');
  }
}

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  colors: {
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    headerBackground: string;
    tabBar: string;
    shadow: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@polyglotpal_theme_mode';

// Light theme colors
const lightColors = {
  background: '#f5f5f5',
  surface: '#ffffff',
  card: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  primary: '#007AFF',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  headerBackground: '#ffffff',
  tabBar: '#ffffff',
  shadow: '#000000'
};

// Dark theme colors
const darkColors = {
  background: '#121212',
  surface: '#1e1e1e',
  card: '#2d2d2d',
  text: '#ffffff',
  textSecondary: '#b3b3b3',
  border: '#404040',
  primary: '#007AFF',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  headerBackground: '#1e1e1e',
  tabBar: '#1e1e1e',
  shadow: '#000000'
};

// Web localStorage wrapper
const webStorage = {
  async getItem(key: string): Promise<string | null> {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        console.warn('localStorage not accessible:', e);
        return null;
      }
    }
    return null;
  },

  async setItem(key: string, value: string): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
      } catch (e) {
        console.warn('localStorage not accessible:', e);
      }
    }
  },

  async removeItem(key: string): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {
        console.warn('localStorage not accessible:', e);
      }
    }
  }
};

// Storage adapter based on platform
const storage = Platform.OS === 'web' ? webStorage : AsyncStorage;

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on app start
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      if (storage) {
        const savedTheme = await storage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          setIsDarkMode(JSON.parse(savedTheme));
          console.log('🎨 Loaded saved theme preference:', JSON.parse(savedTheme) ? 'dark' : 'light');
        }
      }
    } catch (error) {
      console.error('❌ Failed to load theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    try {
      if (storage) {
        await storage.setItem(THEME_STORAGE_KEY, JSON.stringify(newMode));
        console.log('💾 Theme preference saved:', newMode ? 'dark' : 'light');
      }
    } catch (error) {
      console.error('❌ Failed to save theme preference:', error);
    }
  };

  const colors = isDarkMode ? darkColors : lightColors;

  // Don't render children until theme is loaded
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};