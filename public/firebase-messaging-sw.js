// Service Worker for Firebase Cloud Messaging
// This MUST be in the public folder to work properly

const CACHE_NAME = 'fcm-cache-v2'
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/vite.svg',
  '/manifest.webmanifest'
]

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell')
      return cache.addAll(ASSETS_TO_CACHE)
    }).then(() => {
      console.log('[SW] Installation complete, skipping waiting')
      return self.skipWaiting()
    })
  )
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
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
    }).then(() => {
      console.log('[SW] Activation complete, claiming clients')
      return self.clients.claim()
    })
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // For SPA navigations, always prefer the latest app shell from the network.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch('/index.html', { cache: 'no-store' }).catch(() => caches.match('/index.html'))
    )
    return
  }
  
  // Skip chrome-extension and other non-http(s) requests
  if (!event.request.url.startsWith('http')) return
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }
      
      // Clone the request
      const fetchRequest = event.request.clone()
      
      return fetch(fetchRequest).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }
        
        // Clone the response
        const responseToCache = response.clone()
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })
        
        return response
      })
    }).catch((error) => {
      console.error('[SW] Fetch failed:', error)
      // Return offline fallback if available
      return caches.match('/index.html')
    })
  )
})

// Handle FCM push messages
self.addEventListener('push', (event) => {
  console.log('[SW] Push message received:', event)
  
  let data = {}
  
  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      data = { title: 'New Notification', body: event.data.text() }
    }
  }

  const title = data.title || 'Help Desk Notification'
  const options = {
    body: data.body || 'You have a new message',
    icon: '/vite.svg',
    badge: '/vite.svg',
    vibrate: [200, 100, 200],
    data: data.data || {},
    tag: data.tag || 'helpdesk-notification',
    requireInteraction: data.requireInteraction !== false,
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'dismiss') return;
  
  // Get the ticket ID from notification data if available
  const ticketId = event.notification.data?.ticketId;
  const type = event.notification.data?.type || 'new_message';
  
  // Get the base URL from client or use origin
  const baseUrl = self.registration.scope || '/';
  
  // Build URL based on notification type
  let targetUrl = baseUrl;
  if (ticketId) {
    targetUrl = `${baseUrl}dashboard/ticket/${ticketId}${type ? `?notif=${encodeURIComponent(type)}` : ''}`;
  }
  
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then((clientList) => {
      console.log('[SW] Found clients:', clientList.length);
      
      // Try to find and focus existing window
      for (const client of clientList) {
        console.log('[SW] Checking client:', client.url);
        // If app is already open
        if (client.url.includes('/dashboard') || client.url.endsWith('/')) {
          // Navigate to specific ticket if ticketId exists
          if (ticketId) {
            const newUrl = targetUrl;
            console.log('[SW] Navigating to:', newUrl);
            return client.navigate(newUrl).then(c => c.focus());
          }
          // Just focus existing dashboard
          console.log('[SW] Focusing existing client');
          return client.focus();
        }
      }

      // No existing window, open new one with ticket parameter
      console.log('[SW] Opening new window:', targetUrl);
      return clients.openWindow(targetUrl);
    }).catch((error) => {
      console.error('[SW] Error handling notification click:', error);
      // Fallback: always open new window
      return clients.openWindow(targetUrl);
    })
  )
})

// Handle messages from the main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received from app:', event.data)
  
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    // Show notification from in-app message
    self.registration.showNotification(event.data.title, event.data.options)
  }
  
  if (event.data && event.data.type === 'CLOSE_NOTIFICATION') {
    // Close notification with specific tag
    self.registration.getNotifications().then((notifications) => {
      notifications.forEach((notif) => {
        if (notif.tag === event.data.tag) {
          notif.close()
        }
      })
    })
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    // Force service worker update
    self.skipWaiting()
  }
})

console.log('[SW] Service worker script loaded')
