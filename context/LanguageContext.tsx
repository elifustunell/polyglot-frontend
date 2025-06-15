import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LanguageContextType = {
  sourceLang: string;
  targetLang: string;
  setLanguages: (source: string, target: string) => void;
  loading: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Turkish');
  const [loading, setLoading] = useState(true);

  // Language selection'ı AsyncStorage'dan yükle
  useEffect(() => {
    loadLanguagePreferences();
  }, []);

  const loadLanguagePreferences = async () => {
    try {
      const savedSource = await AsyncStorage.getItem('sourceLang');
      const savedTarget = await AsyncStorage.getItem('targetLang');

      if (savedSource && savedTarget) {
        setSourceLang(savedSource);
        setTargetLang(savedTarget);
      }
    } catch (error) {
      console.error('Error loading language preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const setLanguages = async (source: string, target: string) => {
    try {
      setSourceLang(source);
      setTargetLang(target);

      // AsyncStorage'a kaydet
      await AsyncStorage.setItem('sourceLang', source);
      await AsyncStorage.setItem('targetLang', target);
    } catch (error) {
      console.error('Error saving language preferences:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ sourceLang, targetLang, setLanguages, loading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}