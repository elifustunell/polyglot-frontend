import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIadjUYHNEFKpDKnTGHxKtLrOAC8ST0JA",
  authDomain: "polyglotpal-16f33.firebaseapp.com",
  projectId: "polyglotpal-16f33",
  storageBucket: "polyglotpal-16f33.appspot.com",
  messagingSenderId: "89747440954",
  appId: "1:89747440954:android:2ab8b6884f9ebd617a7c03"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth
let auth;
try {
  if (Platform.OS === 'web') {
    // Web için getAuth kullan
    auth = getAuth(app);
  } else {
    // React Native için AsyncStorage ile birlikte initialize et
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
} catch (error) {
  // Eğer auth zaten initialize edilmişse, mevcut instance'ı kullan
  console.log('Auth already initialized, using existing instance');
  auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

// Export instances
export { auth, db };
export default app;