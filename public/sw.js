/**
 * Service Worker for Web Push Notifications
 *
 * Handles push notifications and displays them to users.
 * Supports click actions and notification management.
 */

const CACHE_NAME = 'msh-notifications-v1'

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(self.clients.claim())
})

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)

  if (!event.data) {
    console.log('Push event but no data')
    return
  }

  try {
    const data = event.data.json()
    console.log('Push data:', data)

    const options = {
      body: data.body || data.message,
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/badge-72x72.png',
      image: data.image,
      data: data.data || {},
      actions: data.actions || [],
      tag: data.tag || 'msh-notification',
      renotify: true,
      requireInteraction: data.priority === 'high' || data.priority === 'urgent',
      silent: data.priority === 'low',
      vibrate: data.priority === 'urgent' ? [200, 100, 200] : [100],
      timestamp: Date.now(),
    }

    event.waitUntil(self.registration.showNotification(data.title || 'Multi-Service Hub', options))
  } catch (error) {
    console.error('Error processing push notification:', error)

    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('Nueva notificación', {
        body: 'Tienes una nueva notificación en Multi-Service Hub',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'msh-fallback',
      }),
    )
  }
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)

  event.notification.close()

  const data = event.notification.data || {}
  const action = event.action

  // Determine URL to open
  let urlToOpen = '/'

  if (action) {
    // Handle specific action clicks
    switch (action) {
      case 'view':
        urlToOpen = data.actionUrl || '/dashboard'
        break
      case 'dismiss':
        return // Just close the notification
      default:
        urlToOpen = data.actionUrl || '/dashboard'
    }
  } else {
    // Handle general notification click
    urlToOpen = data.actionUrl || '/dashboard'
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }

      // If no existing window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    }),
  )
})

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event)

  // Optional: Track notification dismissals
  const data = event.notification.data || {}
  if (data.trackDismissal) {
    // Send analytics or update read status
    fetch('/api/notifications/track-dismissal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationId: data.notificationId,
        action: 'dismissed',
        timestamp: Date.now(),
      }),
    }).catch((error) => {
      console.error('Failed to track notification dismissal:', error)
    })
  }
})

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-notifications') {
    event.waitUntil(syncNotifications())
  }
})

// Sync notifications when back online
async function syncNotifications() {
  try {
    // Fetch any pending notifications
    const response = await fetch('/api/notifications/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const notifications = await response.json()

      // Show any notifications that were missed while offline
      for (const notification of notifications) {
        await self.registration.showNotification(notification.title, {
          body: notification.message,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          data: notification.data,
          tag: `sync-${notification.id}`,
        })
      }
    }
  } catch (error) {
    console.error('Failed to sync notifications:', error)
  }
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data)

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

console.log('Service Worker loaded successfully')
