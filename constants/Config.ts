// constants/Config.ts

export const CONFIG = {
API_BASE_URL: __DEV__
? 'http://192.168.1.104:3000/api' // Geliştirme IP (yerel)
    : 'https://polyglotpall.onrender.com/api', // Render URL

  ENVIRONMENT: __DEV__ ? 'development' : 'production',

  FIREBASE_CONFIG: {
    apiKey: "AIzaSyBIadjUYHNEFKpDKnTGHxKtLrOAC8ST0JA",
    authDomain: "polyglotpal-16f33.firebaseapp.com",
    projectId: "polyglotpal-16f33",
    storageBucket: "polyglotpal-16f33.appspot.com",
    messagingSenderId: "89747440954",
    appId: "1:89747440954:android:2ab8b6884f9ebd617a7c03"
  }
};

console.log('🔗 API Base URL:', CONFIG.API_BASE_URL);
