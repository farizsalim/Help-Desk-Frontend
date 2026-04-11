/**
 * Service Worker for Help Desk Application
 * Handles push notifications and background sync
 */

const CACHE_NAME = 'helpdesk-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html'
]

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching assets')
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Gracefully handle if some assets fail to cache
        console.log('Some assets failed to cache')
      })
    })
  )
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - Network First strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip API calls and other non-static assets
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        // Return offline response if needed
        return new Response(JSON.stringify({ success: false, message: 'Offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        })
      })
    )
    return
  }

  // Cache first for static assets
  event.respondWith(
    caches
      .match(request)
      .then((cached) => cached || fetch(request))
      .catch(() => {
        // Return a basic offline page
        return new Response('Offline - Please check your connection', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        })
      })
  )
})

// Push event - Handle push notifications
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'Help Desk Notification',
    options: {
      body: 'You have a new notification',
      badge: '/vite.svg',
      icon: '/vite.svg',
      tag: 'helpdesk-notification'
    }
  }

  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = {
        title: data.title || 'Help Desk',
        options: {
          body: data.body || 'New notification',
          badge: '/vite.svg',
          icon: '/vite.svg',
          tag: data.tag || 'helpdesk-notification',
          data: data.data || {}
        }
      }
    } catch (e) {
      // Jika bukan JSON, gunakan text
      notificationData.options.body = event.data.text()
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData.options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const { conversationId } = event.notification.data || {}

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if window already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === '/' || client.url.includes('/dashboard')) {
          client.focus()
          if (conversationId) {
            client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              conversationId
            })
          }
          return
        }
      }

      // Open new window if not already open
      if (clients.openWindow) {
        const url = conversationId ? `/dashboard?ticket=${conversationId}` : '/dashboard'
        return clients.openWindow(url)
      }
    })
  )
})

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag)
})

// Handle messages from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
