// app/index.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to PolyglotPal!</Text>
      <Button title="Go to Welcome Screen" onPress={() => router.push('/(tabs)')} />
    </View>
  );
}
