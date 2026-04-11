/**
 * Test Notification Display
 * Gunakan ini untuk testing notifikasi langsung dari browser console
 */

// Test 1: Basic notification
export const testBasicNotification = () => {
  console.log('🔔 Testing basic notification...')
  
  if (!('Notification' in window)) {
    console.error('❌ Notifications not supported')
    return false
  }

  if (Notification.permission !== 'granted') {
    console.warn('⚠️ Permission not granted. Requesting...')
    Notification.requestPermission().then(permission => {
      console.log('Permission:', permission)
      if (permission === 'granted') {
        showTestNotification()
      }
    })
    return false
  }

  showTestNotification()
  return true
}

const showTestNotification = () => {
  const notif = new Notification('✅ Test Notification', {
    body: 'Notifikasi berhasil ditampilkan seperti WhatsApp!',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    tag: 'test-notification',
    requireInteraction: true,
    silent: false,
    data: {
      ticketId: 'test-123',
      type: 'test'
    }
  })

  notif.onshow = () => {
    console.log('✅ Notification shown successfully!')
  }

  notif.onclick = (event) => {
    event.preventDefault()
    console.log('✅ Notification clicked!')
    window.focus()
    notif.close()
  }

  notif.onerror = (error) => {
    console.error('❌ Notification error:', error)
  }

  console.log('📱 Notification object:', notif)
}

// Test 2: Service Worker notification
export const testServiceWorkerNotification = async () => {
  console.log('🔧 Testing Service Worker notification...')

  if (!navigator.serviceWorker) {
    console.error('❌ Service Worker not available')
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    console.log('✅ Service Worker ready:', registration)

    // Check subscription
    const subscription = await registration.pushManager.getSubscription()
    console.log('📋 Push subscription:', subscription ? 'Active' : 'Inactive')

    // Send test message to service worker
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title: '🤖 SW Test',
        options: {
          body: 'Notifikasi dari Service Worker!',
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          vibrate: [200, 100, 200],
          tag: 'sw-test',
          requireInteraction: true,
          data: {
            ticketId: 'sw-test-456',
            type: 'service_worker_test'
          }
        }
      })
      console.log('✅ Message sent to Service Worker')
    } else {
      console.warn('⚠️ No active Service Worker controller')
    }

    return true
  } catch (error) {
    console.error('❌ Error:', error)
    return false
  }
}

// Test 3: Check all requirements
export const checkNotificationRequirements = () => {
  console.log('📋 Checking notification requirements...\n')

  const checks = {
    'Notification API': 'Notification' in window,
    'Service Worker': 'serviceWorker' in navigator,
    'Push Manager': 'PushManager' in window,
    'Permission Granted': Notification.permission === 'granted'
  }

  let allPassed = true

  Object.entries(checks).forEach(([name, passed]) => {
    const icon = passed ? '✅' : '❌'
    console.log(`${icon} ${name}: ${passed ? 'PASS' : 'FAIL'}`)
    if (!passed) allPassed = false
  })

  console.log('\n' + (allPassed ? '✅ All checks passed!' : '⚠️ Some checks failed'))

  if (!checks['Permission Granted']) {
    console.log('\n💡 To enable permission, run:')
    console.log('Notification.requestPermission()')
  }

  return allPassed
}

// Test 4: Simulate WhatsApp-style notification
export const testWhatsAppStyleNotification = () => {
  console.log('💬 Testing WhatsApp-style notification...')

  if (Notification.permission !== 'granted') {
    console.warn('⚠️ Permission not granted')
    Notification.requestPermission()
    return
  }

  const notif = new Notification('Pesan Baru dari John', {
    body: 'Halo, apakah tiket ini sudah selesai?\n\n[Klik untuk membalas]',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    tag: 'message-john-123',
    requireInteraction: true,
    silent: false,
    data: {
      ticketId: 'TKT-123',
      senderName: 'John Doe',
      senderRole: 'user',
      type: 'new_message'
    }
  })

  notif.onshow = () => {
    console.log('✅ WhatsApp-style notification shown!')
  }

  notif.onclick = () => {
    console.log('✅ Opening conversation...')
    window.focus()
    window.dispatchEvent(new CustomEvent('app:notification-click', {
      detail: { ticketId: 'TKT-123', type: 'new_message' }
    }))
    notif.close()
  }
}

// Auto-run on import
console.log('\n🔔 Notification Test Module Loaded')
console.log('Available tests:')
console.log('  - testBasicNotification()')
console.log('  - testServiceWorkerNotification()')
console.log('  - checkNotificationRequirements()')
console.log('  - testWhatsAppStyleNotification()')
console.log('\n💡 Run these functions from browser console to test\n')
