import { useEffect, useRef } from 'react'
import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'

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

if (typeof window !== 'undefined') {
  try {
    app = initializeApp(firebaseConfig)
    console.log('[FCM] Firebase initialized successfully')
  } catch (error) {
    console.error('[FCM] Firebase initialization error:', error)
  }
}

export const useFCM = (user) => {
  const messagingInitialized = useRef(false)
  const tokenSent = useRef(false)

  useEffect(() => {
    const initFCM = async () => {
      // Only initialize once
      if (messagingInitialized.current) return
      
      // Check if Firebase was initialized
      if (!app) {
        console.error('[FCM] Firebase app not initialized')
        return
      }

      try {
        // Check if messaging is supported
        const supported = await isSupported()
        if (!supported) {
          console.warn('[FCM] Push messaging not supported in this browser')
          return
        }

        messaging = getMessaging(app)
        console.log('[FCM] Messaging instance created')

        // Request permission and get token
        const permission = await Notification.requestPermission()
        console.log('[FCM] Notification permission:', permission)

        if (permission !== 'granted') {
          console.log('[FCM] Notification permission denied')
          return
        }

        // Get FCM token
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
        if (!vapidKey) {
          console.error('[FCM] VAPID key not configured')
          return
        }

        const token = await getToken(messaging, { 
          vapidKey: vapidKey,
          serviceWorkerRegistration: await registerServiceWorker()
        })

        if (token) {
          console.log('[FCM] Token obtained:', token)
          
          // Send token to backend
          await saveTokenToBackend(token, user?._id)
          tokenSent.current = true
        } else {
          console.log('[FCM] No registration token available')
        }

        // Listen for foreground messages
        onMessage(messaging, (payload) => {
          console.log('[FCM] Message received while app is open:', payload)
          
          const { title, body, data } = payload.notification || {}
          
          // Dispatch custom event for notification handling
          if (title && body) {
            window.dispatchEvent(new CustomEvent('fcm:message', {
              detail: {
                title,
                body,
                data: data || payload.data
              }
            }))
          }
        })

        messagingInitialized.current = true
        
      } catch (error) {
        console.error('[FCM] Error during initialization:', error)
        
        // Handle specific errors
        if (error.code === 'messaging/available-only-in-secure-context') {
          console.error('[FCM] FCM requires HTTPS or localhost')
        } else if (error.code === 'messaging/token-unsubscribe-failed') {
          console.error('[FCM] Failed to unsubscribe from topic')
        }
      }
    }

    // Register service worker
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/'
          })
          console.log('[FCM] Service Worker registered:', registration.scope)
          return registration
        } catch (error) {
          console.error('[FCM] Service Worker registration failed:', error)
          throw error
        }
      } else {
        console.error('[FCM] Service Workers not supported')
        throw new Error('Service Workers not supported')
      }
    }

    // Save token to backend
    const saveTokenToBackend = async (token, userId) => {
      if (!userId) {
        console.warn('[FCM] Cannot save token without user ID')
        return
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/fcm/save-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            fcm_token: token,
            user_id: userId,
            platform: 'web'
          })
        })

        if (response.ok) {
          console.log('[FCM] Token saved to backend successfully')
        } else {
          console.error('[FCM] Failed to save token to backend:', await response.text())
        }
      } catch (error) {
        console.error('[FCM] Error saving token to backend:', error)
      }
    }

    // Initialize FCM when user is logged in
    if (user?._id && !messagingInitialized.current) {
      initFCM()
    }

    // Cleanup
    return () => {
      // Keep messaging instance for faster re-initialization
    }
  }, [user?._id])

  return { messaging, isSupported: !!messaging }
}

export { app, messaging }
