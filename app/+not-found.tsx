// app/_layout.tsx - Updated with ThemeProvider and fixed font loading

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';

// Contexts
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ProgressProvider } from '@/context/ProgressContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from '@/context/ThemeContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Navigation theme wrapper component
function NavigationThemeWrapper({ children }: { children: React.ReactNode }) {
  const { isDarkMode } = useTheme();

  // Use custom theme preference over system preference
  const navigationTheme = isDarkMode ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider value={navigationTheme}>
      {children}
      <StatusBar style={isDarkMode ? "light" : "dark"} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  // Font yükleme - assets klasörü olmadığı için system font kullanıyoruz
  const [loaded, error] = useFonts({
    // System fonts kullanıyoruz, custom font yok
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <CustomThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <ProgressProvider>
            <NavigationThemeWrapper>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="language-selection" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="register" options={{ headerShown: false }} />
                <Stack.Screen name="forgotpassword" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
            </NavigationThemeWrapper>
          </ProgressProvider>
        </LanguageProvider>
      </AuthProvider>
    </CustomThemeProvider>
  );
}