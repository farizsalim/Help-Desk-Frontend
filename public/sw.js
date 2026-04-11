// Service Worker for PWA Notifications
// This file will be used in production builds

const CACHE_NAME = 'helpdesk-cache-v1'

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  self.skipWaiting() // Activate immediately
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Service worker activated')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  // Claim all clients immediately
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }
      return fetch(event.request)
    }).catch(() => {
      // Offline fallback for navigation requests
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html')
      }
    })
  )
})

// Handle messages from the main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data)

  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data
    
    // Show notification using Service Worker registration
    self.registration.showNotification(title, {
      ...options,
      icon: options.icon || '/pwa-192x192.png',
      badge: options.badge || '/pwa-192x192.png',
      vibrate: options.vibrate || [200, 100, 200],
      actions: options.actions || [
        {
          action: 'open',
          title: 'Buka',
          icon: '/pwa-192x192.png'
        },
        {
          action: 'close',
          title: 'Tutup',
          icon: '/pwa-192x192.png'
        }
      ]
    })
  }

  if (event.data && event.data.type === 'CLOSE_NOTIFICATION') {
    const { tag } = event.data
    // Note: Can't directly close notifications from SW message handler
    // This needs to be done via Notification API in the main thread
  }
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.title)
  event.notification.close()

  // Reactivate app and focus window
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If there's already a window open, focus it
      for (const client of clientList) {
        if (client.url === self.location.origin && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow('/')
      }
    })
  )
})

// Push notification handler (for backend-triggered push)
self.addEventListener('push', (event) => {
  console.log('[SW] Push received')
  
  let data = {}
  
  try {
    data = event.data ? event.data.json() : {}
  } catch (e) {
    console.error('[SW] Error parsing push data:', e)
  }

  const title = data.title || 'Pesan Baru'
  const options = {
    body: data.body || 'Anda memiliki pesan baru',
    icon: data.icon || '/pwa-192x192.png',
    badge: data.badge || '/pwa-192x192.png',
    vibrate: data.vibrate || [200, 100, 200],
    tag: data.tag || `notification-${Date.now()}`,
    renotify: data.renotify || true,
    requireInteraction: data.requireInteraction ?? true,
    data: data.data || {},
    actions: [
      {
        action: 'open',
        title: 'Buka',
        icon: '/pwa-192x192.png'
      },
      {
        action: 'close',
        title: 'Tutup',
        icon: '/pwa-192x192.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Background sync for offline support
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event:', event.tag)
  
  if (event.tag === 'sync-messages') {
    event.waitUntil(
      // Sync logic here when needed
      Promise.resolve()
    )
  }
})

console.log('[SW] Service worker script loaded')
