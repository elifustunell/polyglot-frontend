// app/(tabs)/index.tsx - Tabs içindeki index'i güncelle
import React from 'react';
import { Redirect } from 'expo-router';

export default function TabIndex() {
  // Tabs içindeki index sayfası direkt mainscreen'e yönlendirsin
  return <Redirect href="/(tabs)/mainscreen" />;
}
