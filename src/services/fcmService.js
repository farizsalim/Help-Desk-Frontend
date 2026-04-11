import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, deleteToken } from 'firebase/messaging'
// Optional: For Firebase Analytics
// import { getAnalytics } from 'firebase/analytics'

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase
let app = null
let messaging = null
let analytics = null
let serviceWorkerRegistration = null

// Debug: Log environment variables on load
console.log('[FCM] Environment Variables:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? 'Present' : 'Missing',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'Present' : 'Missing',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? 'Present' : 'Missing',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ? 'Present' : 'Missing'
})

// Register Service Worker for FCM
export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('[FCM] Service Worker not supported')
    return null
  }

  try {
    console.log('[FCM] Registering service worker...')
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    })
    
    console.log('[FCM] Service Worker registered:', registration.scope)
    serviceWorkerRegistration = registration
    
    // Wait for service worker to be ready
    if (registration.active) {
      console.log('[FCM] Service Worker already active')
    } else if (registration.installing) {
      console.log('[FCM] Waiting for service worker to install...')
      await new Promise((resolve) => {
        registration.installing.addEventListener('statechange', (e) => {
          if (e.target.state === 'activated') {
            console.log('[FCM] Service Worker activated')
            resolve()
          }
        })
      })
    }
    
    return registration
  } catch (error) {
    console.error('[FCM] Service Worker registration failed:', error)
    throw error
  }
}

export const initializeFirebase = () => {
  if (!app) {
    try {
      app = initializeApp(firebaseConfig)
      console.log('[FCM] Firebase initialized successfully')
      
      // Optional: Initialize Analytics only in browser (not in Service Worker)
      // if (typeof window !== 'undefined') {
      //   analytics = getAnalytics(app)
      //   console.log('[FCM] Firebase Analytics initialized')
      // }
    } catch (error) {
      console.error('[FCM] Error initializing Firebase:', error)
      throw error
    }
  }
  return app
}

// Get messaging instance
export const getMessagingInstance = () => {
  if (!app) {
    initializeFirebase()
  }
  
  if (!messaging) {
    try {
      messaging = getMessaging(app)
      console.log('[FCM] Messaging instance created')
    } catch (error) {
      console.error('[FCM] Error creating messaging instance:', error)
      throw error
    }
  }
  
  return messaging
}

// Request notification permission and get FCM token
export const requestFCMPermission = async () => {
  console.log('[FCM] === Starting Permission Request ===')
  
  // First, ensure Service Worker is registered
  try {
    if (!serviceWorkerRegistration) {
      console.log('[FCM] Registering Service Worker first...')
      await registerServiceWorker()
    }
  } catch (swError) {
    console.error('[FCM] Service Worker registration failed:', swError.message)
    // Continue anyway - FCM might still work
  }
  
  console.log('[FCM] Environment check:')
  console.log('- API Key:', import.meta.env.VITE_FIREBASE_API_KEY ? 'Present' : 'Missing')
  console.log('- Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'Present' : 'Missing')
  console.log('- VAPID Key:', import.meta.env.VITE_FIREBASE_VAPID_KEY ? 'Present (first 10): ' + import.meta.env.VITE_FIREBASE_VAPID_KEY.substring(0, 10) : 'Missing')
  
  try {
    // Check if browser supports FCM
    if (!('Notification' in window)) {
      console.warn('[FCM] Browser does not support notifications')
      return null
    }

    console.log('[FCM] Initializing Firebase...')
    // Initialize Firebase
    const messaging = getMessagingInstance()
    console.log('[FCM] Messaging instance obtained:', !!messaging)
    
    // Request permission
    console.log('[FCM] Requesting notification permission...')
    const permission = await Notification.requestPermission()
    console.log('[FCM] Permission result:', permission)
    
    if (permission !== 'granted') {
      console.warn('[FCM] Notification permission denied')
      return null
    }

    // Get VAPID key
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
    
    if (!vapidKey) {
      console.error('[FCM] VAPID key not configured')
      return null
    }

    console.log('[FCM] Getting token with VAPID key...')
    // Get FCM token
    const token = await getToken(messaging, { vapidKey: vapidKey })
    console.log('[FCM] Token response:', token ? 'Success' : 'Null')
    
    if (token) {
      console.log('[FCM] Token obtained:', token.substring(0, 20) + '...')
      // Store token in localStorage for later use
      localStorage.setItem('fcm_token', token)
      console.log('[FCM] Token saved to localStorage')
      return token
    } else {
      console.warn('[FCM] No token received - this could be due to:')
      console.warn('1. Domain not authorized in Firebase Console')
      console.warn('2. Service Worker not registered')
      console.warn('3. Network error')
      return null
    }
  } catch (error) {
    console.error('[FCM] Error getting FCM token:', error)
    console.error('[FCM] Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    })
    return null
  }
}

// Get existing FCM token
export const getFCMToken = async () => {
  try {
    const messaging = getMessagingInstance()
    const token = await getToken(messaging, { 
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY 
    })
    return token
  } catch (error) {
    console.error('[FCM] Error getting token:', error)
    return null
  }
}

// Delete FCM token (unsubscribe)
export const deleteFCMToken = async () => {
  try {
    const messaging = getMessagingInstance()
    await deleteToken(messaging)
    localStorage.removeItem('fcm_token')
    console.log('[FCM] Token deleted successfully')
    return true
  } catch (error) {
    console.error('[FCM] Error deleting token:', error)
    return false
  }
}

// Listen for foreground messages
export const onForegroundMessage = (callback) => {
  try {
    const messaging = getMessagingInstance()
    
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('[FCM] Foreground message received:', payload)
      
      // Call callback with payload data
      if (callback) {
        callback(payload)
      }
    })
    
    return unsubscribe
  } catch (error) {
    console.error('[FCM] Error setting up message listener:', error)
    return () => {}
  }
}

// Check if device is Android (for mobile browsers)
export const isAndroidDevice = () => {
  return /android/i.test(navigator.userAgent)
}

// Check if device is iOS
export const isIOSDevice = () => {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

// Check if device is mobile
export const isMobileDevice = () => {
  return isAndroidDevice() || isIOSDevice()
}
