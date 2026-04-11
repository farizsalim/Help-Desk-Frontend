/**
 * Firebase Configuration for Cloud Messaging (FCM)
 * Used for Android push notifications
 */

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Validate config
const missingKeys = Object.entries(firebaseConfig)
  .filter(([_, value]) => !value || value.includes('YOUR_') || value === 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX')
  .map(([key]) => key)

if (missingKeys.length > 0) {
  console.warn('⚠️ Firebase configuration incomplete. Missing keys:', missingKeys)
  console.warn('📝 Please update .env file with your Firebase credentials')
  console.warn('🔗 See: ANDROID_FIREBASE_SETUP.md for setup instructions')
}

export default firebaseConfig
