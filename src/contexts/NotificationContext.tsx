/**
 * NotificationContext - Global notification system
 *
 * Provides centralized notification management that respects user preferences
 * and supports multiple channels: in-app, web push, email, and SMS.
 *
 * Features:
 * - Real-time in-app notifications
 * - Web push notifications
 * - Email notifications
 * - SMS notifications
 * - User preference-based filtering
 * - Notification persistence and history
 */

'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/providers/AuthProvider'

// Notification types
export type NotificationType =
  | 'quote_received'
  | 'quote_accepted'
  | 'quote_rejected'
  | 'job_assigned'
  | 'job_completed'
  | 'payment_received'
  | 'payment_released'
  | 'system_update'
  | 'profile_verified'

// Notification channels
export type NotificationChannel = 'in_app' | 'web_push' | 'email' | 'sms'

// Notification priority levels
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

// Base notification interface
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  channels: NotificationChannel[]
  data?: Record<string, any>
  userId: string
  read: boolean
  createdAt: string
  expiresAt?: string
}

// In-app notification for UI display
export interface InAppNotification extends Notification {
  showTime?: number // milliseconds to show
  actionLabel?: string
  action?: {
    label: string
    onClick: () => void
  }
}

// Notification preferences mapping
interface NotificationPreferences {
  email: boolean
  sms: boolean
  push: boolean
  newJobs: boolean
  jobUpdates: boolean
  payments: boolean
}

// Context interface
interface NotificationContextType {
  // State
  notifications: InAppNotification[]
  unreadCount: number
  isConnected: boolean

  // Actions
  notify: (type: NotificationType, data: Partial<InAppNotification>) => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  dismissNotification: (notificationId: string) => void
  clearAll: () => void

  // Subscription management
  subscribeToWebPush: () => Promise<boolean>
  unsubscribeFromWebPush: () => Promise<boolean>

  // Preferences
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Notification type configurations
const NOTIFICATION_CONFIGS: Record<
  NotificationType,
  {
    defaultChannels: NotificationChannel[]
    priority: NotificationPriority
    showTime: number
    requiresAuth: boolean
  }
> = {
  quote_received: {
    defaultChannels: ['in_app', 'web_push', 'email'],
    priority: 'high',
    showTime: 8000,
    requiresAuth: true,
  },
  quote_accepted: {
    defaultChannels: ['in_app', 'web_push', 'email', 'sms'],
    priority: 'high',
    showTime: 10000,
    requiresAuth: true,
  },
  quote_rejected: {
    defaultChannels: ['in_app', 'email'],
    priority: 'normal',
    showTime: 6000,
    requiresAuth: true,
  },
  job_assigned: {
    defaultChannels: ['in_app', 'web_push', 'email', 'sms'],
    priority: 'high',
    showTime: 10000,
    requiresAuth: true,
  },
  job_completed: {
    defaultChannels: ['in_app', 'email'],
    priority: 'normal',
    showTime: 6000,
    requiresAuth: true,
  },
  payment_received: {
    defaultChannels: ['in_app', 'web_push', 'email', 'sms'],
    priority: 'high',
    showTime: 8000,
    requiresAuth: true,
  },
  payment_released: {
    defaultChannels: ['in_app', 'email'],
    priority: 'normal',
    showTime: 6000,
    requiresAuth: true,
  },
  system_update: {
    defaultChannels: ['in_app'],
    priority: 'low',
    showTime: 5000,
    requiresAuth: false,
  },
  profile_verified: {
    defaultChannels: ['in_app', 'email'],
    priority: 'normal',
    showTime: 8000,
    requiresAuth: true,
  },
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<InAppNotification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [webPushSubscription, setWebPushSubscription] = useState<PushSubscription | null>(null)

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length

  // Initialize web push service worker
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration)
          return registration.pushManager.getSubscription()
        })
        .then((subscription) => {
          setWebPushSubscription(subscription)
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }
  }, [])

  // Load persisted notifications on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      loadNotifications()
      connectToRealTime()
    }
  }, [isAuthenticated, user])

  // Load notifications from API
  const loadNotifications = useCallback(async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/notifications?userId=${user.id}&limit=50`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        const notificationsWithConfig = data.docs.map((notif: Notification) => ({
          ...notif,
          showTime: NOTIFICATION_CONFIGS[notif.type]?.showTime || 5000,
        }))
        setNotifications(notificationsWithConfig)
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }, [user])

  // Connect to real-time notifications (WebSocket/SSE)
  const connectToRealTime = useCallback(() => {
    if (!user) return

    // For now, we'll use polling. In production, implement WebSocket/SSE
    const interval = setInterval(() => {
      loadNotifications()
    }, 30000) // Poll every 30 seconds

    setIsConnected(true)

    return () => {
      clearInterval(interval)
      setIsConnected(false)
    }
  }, [user, loadNotifications])

  // Filter channels based on user preferences
  const getEnabledChannels = useCallback(
    (type: NotificationType, defaultChannels: NotificationChannel[]): NotificationChannel[] => {
      if (!user?.notificationPreferences) return ['in_app']

      const prefs = user.notificationPreferences
      const enabledChannels: NotificationChannel[] = ['in_app'] // Always include in-app

      // Check each channel against preferences
      if (defaultChannels.includes('email') && prefs.email) {
        enabledChannels.push('email')
      }
      if (defaultChannels.includes('sms') && prefs.sms) {
        enabledChannels.push('sms')
      }
      if (defaultChannels.includes('web_push') && prefs.push) {
        enabledChannels.push('web_push')
      }

      // Check notification type preferences
      const typePrefs = {
        quote_received: prefs.newJobs,
        quote_accepted: prefs.jobUpdates,
        quote_rejected: prefs.jobUpdates,
        job_assigned: prefs.newJobs,
        job_completed: prefs.jobUpdates,
        payment_received: prefs.payments,
        payment_released: prefs.payments,
        system_update: true, // Always allow system updates
        profile_verified: true, // Always allow verification notifications
      }

      // If type is disabled, only return in_app
      if (!typePrefs[type]) {
        return ['in_app']
      }

      return enabledChannels
    },
    [user],
  )

  // Main notification function
  const notify = useCallback(
    async (type: NotificationType, data: Partial<InAppNotification>) => {
      if (!user && NOTIFICATION_CONFIGS[type].requiresAuth) {
        console.warn('Cannot send notification: user not authenticated')
        return
      }

      const config = NOTIFICATION_CONFIGS[type]
      const enabledChannels = getEnabledChannels(type, config.defaultChannels)

      const notification: InAppNotification = {
        id: data.id || `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        title: data.title || `Notification: ${type}`,
        message: data.message || 'You have a new notification',
        priority: data.priority || config.priority,
        channels: enabledChannels,
        data: data.data || {},
        userId: user?.id || 'anonymous',
        read: false,
        createdAt: new Date().toISOString(),
        expiresAt: data.expiresAt,
        showTime: config.showTime,
        action: data.action,
      }

      // Add to in-app notifications
      setNotifications((prev) => [notification, ...prev])

      // Send to other channels
      try {
        await sendNotification(notification)
      } catch (error) {
        console.error('Failed to send notification:', error)
      }

      // Auto-dismiss after showTime
      if (notification.showTime && notification.showTime > 0) {
        setTimeout(() => {
          dismissNotification(notification.id)
        }, notification.showTime)
      }
    },
    [user, getEnabledChannels],
  )

  // Send notification to external channels
  const sendNotification = async (notification: InAppNotification) => {
    const promises: Promise<any>[] = []

    for (const channel of notification.channels) {
      switch (channel) {
        case 'web_push':
          if (webPushSubscription) {
            promises.push(sendWebPush(notification))
          }
          break
        case 'email':
          promises.push(sendEmail(notification))
          break
        case 'sms':
          promises.push(sendSMS(notification))
          break
        case 'in_app':
          // Already handled above
          break
      }
    }

    // Also persist to database
    promises.push(persistNotification(notification))

    await Promise.allSettled(promises)
  }

  // Send web push notification
  const sendWebPush = async (notification: InAppNotification) => {
    try {
      await fetch('/api/notifications/web-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          subscription: webPushSubscription,
          notification: {
            title: notification.title,
            body: notification.message,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            data: notification.data,
          },
        }),
      })
    } catch (error) {
      console.error('Failed to send web push:', error)
    }
  }

  // Send email notification
  const sendEmail = async (notification: InAppNotification) => {
    try {
      await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          to: user?.email,
          subject: notification.title,
          html: `
            <h2>${notification.title}</h2>
            <p>${notification.message}</p>
            ${notification.data?.actionUrl ? `<a href="${notification.data.actionUrl}">Ver detalles</a>` : ''}
          `,
          notification,
        }),
      })
    } catch (error) {
      console.error('Failed to send email:', error)
    }
  }

  // Send SMS notification
  const sendSMS = async (notification: InAppNotification) => {
    if (!user?.phone) return

    try {
      await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          to: user.phone,
          message: `${notification.title}: ${notification.message}`,
          notification,
        }),
      })
    } catch (error) {
      console.error('Failed to send SMS:', error)
    }
  }

  // Persist notification to database
  const persistNotification = async (notification: InAppNotification) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(notification),
      })
    } catch (error) {
      console.error('Failed to persist notification:', error)
    }
  }

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    )

    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ read: true }),
      })
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))

    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }, [])

  // Dismiss notification from UI
  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }, [])

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Subscribe to web push
  const subscribeToWebPush = useCallback(async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Web Push not supported')
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })

      setWebPushSubscription(subscription)

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(subscription),
      })

      return true
    } catch (error) {
      console.error('Failed to subscribe to web push:', error)
      return false
    }
  }, [])

  // Unsubscribe from web push
  const unsubscribeFromWebPush = useCallback(async (): Promise<boolean> => {
    if (!webPushSubscription) return true

    try {
      await webPushSubscription.unsubscribe()
      setWebPushSubscription(null)

      // Remove subscription from server
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        credentials: 'include',
      })

      return true
    } catch (error) {
      console.error('Failed to unsubscribe from web push:', error)
      return false
    }
  }, [webPushSubscription])

  // Update notification preferences
  const updatePreferences = useCallback(
    async (preferences: Partial<NotificationPreferences>) => {
      if (!user) return

      try {
        await fetch(`/api/users/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            notificationPreferences: {
              ...user.notificationPreferences,
              ...preferences,
            },
          }),
        })
      } catch (error) {
        console.error('Failed to update notification preferences:', error)
      }
    },
    [user],
  )

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    notify,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll,
    subscribeToWebPush,
    unsubscribeFromWebPush,
    updatePreferences,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

// Hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Export types for use in other components
export type { NotificationContextType, NotificationPreferences }
