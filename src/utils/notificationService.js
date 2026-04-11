const getRoleLabel = (role) => {
  const roleMap = {
    'user': 'User',
    'it_staff': 'IT Staff',
    'admin': 'Admin'
  }
  return roleMap[role] || role
}

// Check if browser supports notifications
export const isNotificationSupported = () => {
  return 'Notification' in window
}

// Request notification permission from user
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    console.warn('[NOTIF] Browser tidak support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    console.log('[NOTIF] Permission sudah granted')
    return true
  }

  if (Notification.permission !== 'denied') {
    console.log('[NOTIF] Requesting permission...')
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      console.log('[NOTIF] Permission granted')
      return true
    } else {
      console.log('[NOTIF] Permission denied atau dismissed')
      return false
    }
  }

  console.log('[NOTIF] Permission sudah denied sebelumnya')
  return false
}

// Send a notification
export const sendNotification = (title, options = {}) => {
  if (!isNotificationSupported()) {
    console.warn('[NOTIF] Notifications tidak tersedia di browser ini')
    return
  }

  if (Notification.permission === 'granted') {
    try {
      console.log('[NOTIF] Sending notification:', {
        title,
        body: options.body,
        tag: options.tag
      })

      const defaultOptions = {
        icon: '/vite.svg',
        badge: '/vite.svg',
        vibrate: [200, 100, 200],
        renotify: true,
        timestamp: Date.now(),
        ...options
      }

      // Service Worker notification if available
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          options: defaultOptions
        })
      } else {
        // Fallback to standard notification
        const notif = new Notification(title, defaultOptions)

        // Click behavior (mirip WhatsApp): fokus app + open conversation
        notif.onclick = (event) => {
          event.preventDefault()
          try {
            window.focus()
          } catch (err) {
            // some browsers may block focus, ignore
          }

          const ticketId = defaultOptions.data?.ticketId
          if (ticketId) {
            window.dispatchEvent(new CustomEvent('app:notification-click', {
              detail: { ticketId, type: defaultOptions.data?.type }
            }))
          }

          notif.close()
        }

        notif.onclose = () => {
          console.log('[NOTIF] Notification closed:', title)
        }

        console.log('[NOTIF] Notification ditampilkan')

        // Play sound notification if available
        notif.addEventListener('show', () => {
          try {
            const audio = new Audio('/notification-sound.mp3')
            audio.volume = 0.5
            audio.play().catch(() => {
              console.log('[NOTIF] Note: audio tidak bisa diputar')
            })
          } catch (err) {
            // Ignore audio errors
          }
        })
      }
    } catch (err) {
      console.error('[NOTIF] Error sending notification:', err)
    }
  } else {
    console.warn('[NOTIF] Permission belum granted untuk notification')
  }
}

// Send notification for new message with full sender info
export const notifyNewMessage = (senderName, senderRole, ticketId, messagePreview) => {
  const roleLabel = getRoleLabel(senderRole)
  const title = `Pesan dari ${senderName}`
  const body = `${roleLabel}\n${messagePreview || 'Anda memiliki pesan baru'}`

  console.log('[NOTIF] New message notification:', {
    from: senderName,
    role: senderRole,
    preview: messagePreview,
    ticketId
  })

  sendNotification(title, {
    body,
    tag: `message-${ticketId}`,
    requireInteraction: true, // Tetap tampil sampai diklik
    badge: '/vite.svg',
    data: {
      type: 'new_message',
      ticketId,
      senderName,
      senderRole
    }
  })
}

// Send notification for ticket closed
export const notifyTicketClosed = (ticketId, ticketTitle, closedByName) => {
  console.log('[NOTIF] Ticket closed notification:', { ticketTitle, ticketId, closedBy: closedByName })

  sendNotification('Tiket ditutup', {
    body: `"${ticketTitle}"\nDitutup oleh: ${closedByName || 'Admin'}`,
    tag: `ticket-closed-${ticketId}`,
    requireInteraction: false,
    data: {
      type: 'ticket_closed',
      ticketId
    }
  })
}

// Send notification for IT staff assigned
export const notifyITStaffAdded = (staffName, staffRole, ticketId) => {
  const roleLabel = getRoleLabel(staffRole)
  console.log('[NOTIF] IT Staff added notification:', { staffName, staffRole, ticketId })

  sendNotification('IT Staff ditambahkan', {
    body: `${staffName} ${roleLabel}\ntelah ditambahkan ke tiket ini`,
    tag: `staff-added-${ticketId}`,
    requireInteraction: true,
    data: {
      type: 'it_staff_added',
      ticketId,
      staffName,
      staffRole
    }
  })
}

// Send notification for new ticket with creator info
export const notifyNewTicket = (ticketTitle, userName, userRole) => {
  const roleLabel = getRoleLabel(userRole)
  const title = `Tiket baru dari ${userName}`
  const body = `${roleLabel}\nSubject: ${ticketTitle}`

  console.log('[NOTIF] New ticket notification:', {
    title: ticketTitle,
    from: userName,
    role: userRole
  })

  sendNotification(title, {
    body,
    tag: `new-ticket-${Date.now()}`,
    requireInteraction: true,
    badge: '/vite.svg',
    data: {
      type: 'new_ticket',
      userName,
      userRole,
      ticketTitle
    }
  })
}

// Close all notifications with specific tag
export const closeNotification = (tag) => {
  if (isNotificationSupported() && navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CLOSE_NOTIFICATION',
      tag
    })
  }
}

// Initialize FCM and handle push notifications
export const initializeFCM = async (user) => {
  if (!user?._id) return null
  
  try {
    // Import Firebase modules dynamically
    const { initializeApp } = await import('firebase/app')
    const { getMessaging, getToken, onMessage } = await import('firebase/messaging')
    
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
    let app
    try {
      app = initializeApp(firebaseConfig)
      console.log('[FCM] Firebase initialized')
    } catch (error) {
      console.log('[FCM] Firebase already initialized or error:', error)
    }
    
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      })
      console.log('[FCM] Service Worker registered:', registration.scope)
      
      // Request permission
      const permission = await Notification.requestPermission()
      console.log('[FCM] Notification permission:', permission)
      
      if (permission !== 'granted') {
        console.log('[FCM] Permission denied')
        return null
      }
      
      // Get FCM token
      const messaging = getMessaging(app)
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
      
      if (!vapidKey) {
        console.error('[FCM] VAPID key not configured')
        return null
      }
      
      const token = await getToken(messaging, { 
        vapidKey,
        serviceWorkerRegistration: registration
      })
      
      if (token) {
        console.log('[FCM] Token obtained:', token)
        
        // Save token to backend
        await saveFCMToken(token, user._id)
        
        // Listen for foreground messages
        onMessage(messaging, (payload) => {
          console.log('[FCM] Message received:', payload)

          const { title, body, data } = payload.notification || {}

          if (title && body) {
            // Show notification using our existing function
            sendNotification(title, {
              body,
              data: data || payload.data,
              tag: `fcm-${Date.now()}`,
              requireInteraction: true
            })
          }
        })
        
        return token
      } else {
        console.log('[FCM] No token available')
        return null
      }
    } else {
      console.error('[FCM] Service Workers not supported')
      return null
    }
  } catch (error) {
    console.error('[FCM] Initialization error:', error)
    return null
  }
}

// Save FCM token to backend
const saveFCMToken = async (token, userId) => {
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
      console.log('[FCM] Token saved to backend')
    } else {
      console.error('[FCM] Failed to save token:', await response.text())
    }
  } catch (error) {
    console.error('[FCM] Error saving token:', error)
  }
}
