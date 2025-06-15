// app/(tabs)/_layout.tsx - Font issues düzeltilmiş versiyon
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Tabs, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const [isMounted, setIsMounted] = useState(false);

  // Component mount tracking
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auth guard - redirect to welcome if not authenticated
  useEffect(() => {
    if (!loading && !user && isMounted) {
      const timer = setTimeout(() => {
        router.replace('/');
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [user, loading, isMounted, router]);

  // Loading state
  if (loading || !isMounted) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Tab bar'ı gizlenecek ekranlar
  const hideTabBarScreens = ['profile', 'exercise-detail', 'settings'];
  const currentScreen = segments[segments.length - 1];
  const shouldHideTabBar = hideTabBarScreens.includes(currentScreen);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: shouldHideTabBar ?
          { display: 'none' } :
          {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.border,
            ...(Platform.select({
              ios: {
                position: 'absolute',
              },
              default: {},
            }))
          },
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
      }}>

      {/* Main navigation tabs */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Welcome',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size || 28} color={color} />
          ),
          href: null // Hidden from tab bar
        }}
      />

      <Tabs.Screen
        name="mainscreen"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size || 28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Exercises',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="game-controller" size={size || 28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size || 28} color={color} />
          ),
        }}
      />

      {/* Hidden screens - accessible via navigation but not in tab bar */}
      <Tabs.Screen
        name="exercise-detail"
        options={{
          href: null,
          title: 'Exercise'
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          title: 'Profile'
        }}
      />
    </Tabs>
  );
}