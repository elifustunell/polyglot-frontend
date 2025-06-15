// config/firebase.js - Firebase persistence'ı kapat
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, browserSessionPersistence, inMemoryPersistence } from 'firebase/auth';
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

// Initialize Auth - SESSION ONLY (No persistence)
let auth;
try {
  if (Platform.OS === 'web') {
    // Web için session persistence (sadece tab açık olduğu sürece)
    auth = getAuth(app);
    auth.setPersistence(browserSessionPersistence);
  } else {
    // React Native için in-memory persistence (sadece app açık olduğu sürece)
    auth = initializeAuth(app, {
      persistence: inMemoryPersistence
    });
  }
  console.log('🔥 Firebase Auth initialized with SESSION-ONLY persistence');
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