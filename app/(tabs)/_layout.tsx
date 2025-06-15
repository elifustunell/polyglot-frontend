// app/(tabs)/_layout.tsx - Cleaned version
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const router = useRouter();
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
        backgroundColor: '#f5f5f5'
      }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>

      {/* Main navigation tabs */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Welcome',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          href: null // Hidden from tab bar
        }}
      />

      <Tabs.Screen
        name="mainscreen"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Exercises',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gamecontroller.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
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