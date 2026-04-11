/**
 * Push Notification Service for PWA
 * Handles subscription to push notifications and sending subscription to backend
 */

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

// Check if browser supports push notifications
export const isPushSupported = () => {
  return 'serviceWorker' in navigator && 
         'PushManager' in window && 
         'Notification' in window
}

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('[PUSH] Browser tidak support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    console.log('[PUSH] Permission sudah granted')
    return true
  }

  if (Notification.permission !== 'denied') {
    console.log('[PUSH] Requesting permission...')
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      console.log('[PUSH] Permission granted')
      return true
    } else {
      console.log('[PUSH] Permission denied atau dismissed')
      return false
    }
  }

  console.log('[PUSH] Permission sudah denied sebelumnya')
  return false
}

// Subscribe to push notifications
export const subscribeToPush = async () => {
  if (!isPushSupported()) {
    console.error('[PUSH] Push notifications not supported')
    return null
  }

  try {
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready
    console.log('[PUSH] Service Worker ready:', registration)

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription()
    
    if (subscription) {
      console.log('[PUSH] Already subscribed to push notifications')
      return subscription
    }

    // Subscribe with VAPID key
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    })

    console.log('[PUSH] Successfully subscribed to push notifications')
    return subscription
  } catch (error) {
    console.error('[PUSH] Error subscribing to push:', error)
    throw error
  }
}

// Unsubscribe from push notifications
export const unsubscribeFromPush = async () => {
  if (!isPushSupported()) {
    console.error('[PUSH] Push notifications not supported')
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      console.log('[PUSH] Not subscribed to push notifications')
      return true
    }

    const success = await subscription.unsubscribe()
    console.log('[PUSH] Successfully unsubscribed from push:', success)
    return success
  } catch (error) {
    console.error('[PUSH] Error unsubscribing from push:', error)
    throw error
  }
}

// Get current push subscription
export const getPushSubscription = async () => {
  if (!isPushSupported()) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    return await registration.pushManager.getSubscription()
  } catch (error) {
    console.error('[PUSH] Error getting subscription:', error)
    return null
  }
}

// Send subscription to backend
export const sendSubscriptionToBackend = async (subscription) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription)
    })

    if (!response.ok) {
      throw new Error('Failed to send subscription to backend')
    }

    console.log('[PUSH] Subscription sent to backend')
    return true
  } catch (error) {
    console.error('[PUSH] Error sending subscription to backend:', error)
    throw error
  }
}

// Initialize push notifications
export const initializePushNotifications = async () => {
  // Request permission first
  const permissionGranted = await requestNotificationPermission()
  
  if (!permissionGranted) {
    console.log('[PUSH] Permission not granted')
    return null
  }

  // Subscribe to push
  const subscription = await subscribeToPush()
  
  if (subscription) {
    // Send to backend
    await sendSubscriptionToBackend(subscription)
  }

  return subscription
}

// Convert VAPID key from base64 to Uint8Array
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
