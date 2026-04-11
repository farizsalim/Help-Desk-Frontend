/**
 * Notification Utility Functions
 * Handles browser notifications for desktop and mobile
 */

const DEBUG = true // Set ke false untuk production

const log = (msg, data) => {
  if (DEBUG) console.log(`[NOTIF] ${msg}`, data || '')
}

// Request notification permission from user
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    log('❌ Browser tidak support Notifications')
    return false
  }

  // Jika sudah denied, jangan minta ulang
  if (Notification.permission === 'denied') {
    log('❌ Notification permission sudah DENIED')
    return false
  }

  // Jika sudah granted, langsung return true
  if (Notification.permission === 'granted') {
    log('✅ Notification permission sudah GRANTED')
    return true
  }

  // Minta permission (permission akan 'default' jika belum pernah diminta)
  try {
    log('📢 Meminta notification permission dari user...')
    const permission = await Notification.requestPermission()
    log(`📢 User response: ${permission}`)
    
    if (permission === 'granted') {
      log('✅ Permission GRANTED!')
      return true
    } else if (permission === 'denied') {
      log('❌ Permission DENIED - user tolak')
      return false
    }
    return false
  } catch (error) {
    log('❌ Error requesting permission', error)
    return false
  }
}

// Show notification
export const showNotification = (title, options = {}) => {
  if (!('Notification' in window)) {
    log('❌ Browser tidak support Notifications')
    return
  }

  log(`🔔 Menampilkan notifikasi: "${title}"`)

  if (Notification.permission !== 'granted') {
    log(`❌ Permission bukan GRANTED, current: ${Notification.permission}`)
    return
  }

  try {
    const defaultOptions = {
      icon: '/vite.svg',
      badge: '/vite.svg',
      tag: 'helpdesk-notification',
      requireInteraction: true, // Jangan auto close
      ...options
    }

    log('📨 Membuat notification object...', { title, options: defaultOptions })

    const notification = new Notification(title, defaultOptions)

    // Click handler
    if (options.onClick) {
      notification.addEventListener('click', () => {
        log('👆 User klik notification')
        options.onClick()
        notification.close()
      })
    }

    // Show event
    notification.addEventListener('show', () => {
      log('✨ Notification tampil di screen')
    })

    // Error event
    notification.addEventListener('error', (error) => {
      log('❌ Notification error', error)
    })

    // Close event
    notification.addEventListener('close', () => {
      log('❌ Notification ditutup')
    })

    return notification
  } catch (error) {
    log('❌ Error showing notification', error)
  }
}


// Show new ticket notification
export const showNewTicketNotification = (ticketData, onClickCallback) => {
  const { conversation, createdBy } = ticketData

  const title = '🎫 Ticket BARU!'
  const body = `${createdBy?.nama || 'User'}: ${conversation?.subject || 'Bantuan diperlukan'}`
  
  log('📌 New Ticket Notification', { title, body })

  const options = {
    body: body,
    tag: `ticket-${conversation?._id}`,
    data: {
      conversationId: conversation?._id,
      ticketSubject: conversation?.subject
    },
    onClick: onClickCallback
  }

  showNotification(title, options)
}

// Show new message notification  
export const showNewMessageNotification = (messageData, onClickCallback) => {
  const { senderName, conversationId, messagePreview } = messageData

  const title = '💬 Pesan Baru!'
  const body = `${senderName}: ${messagePreview}`
  
  log('📌 New Message Notification', { title, body })

  const options = {
    body: body,
    tag: `message-${conversationId}`,
    data: {
      conversationId,
      type: 'message'
    },
    onClick: onClickCallback
  }

  showNotification(title, options)
}

// Check if notifications are enabled
export const isNotificationEnabled = () => {
  return 'Notification' in window && Notification.permission === 'granted'
}

// Get current notification permission status
export const getNotificationStatus = () => {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission // 'default', 'granted', 'denied'
}

// Register service worker for push notifications
export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    log('⚠️ Service Worker tidak didukung di browser ini')
    return null
  }

  try {
    log('📝 Attempting to register service worker...')
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    })
    log('✅ Service Worker registered successfully', registration)
    return registration
  } catch (error) {
    log('⚠️ Error registering Service Worker', error)
    return null
  }
}

// Subscribe to push notifications
export const subscribeToPushNotifications = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push Notifications tidak didukung')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.VITE_VAPID_PUBLIC_KEY || '')
    })
    console.log('Push subscription successful:', subscription)
    return subscription
  } catch (error) {
    console.error('Error subscribing to push notifications:', error)
    return null
  }
}

// Helper function to convert VAPID key
const urlBase64ToUint8Array = (base64String) => {
  try {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  } catch (error) {
    console.warn('Error converting VAPID key:', error)
    return null
  }
}
