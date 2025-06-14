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

  // Initialize web push service worker (disabled for now)
  useEffect(() => {
    // TODO: Enable service worker when push notifications are implemented
    console.log('Service Worker initialization disabled temporarily')
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
    if (!user?.id) {
      console.log('No user ID available for loading notifications')
      return
    }

    try {
      console.log('🔍 Loading notifications for user:', user.id)
      const response = await fetch(
        `/api/notifications?userId=${user.id}&limit=50&sort=-createdAt`,
        {
          credentials: 'include',
        },
      )

      console.log('📡 Notifications API response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Notifications data received:', data)

        // Handle both PayloadCMS format and simple array format
        const notificationArray = data.docs || data || []
        console.log('📊 Raw notifications from API:', notificationArray.length, notificationArray)

        const notificationsWithConfig = notificationArray.map((notif: Notification) => ({
          ...notif,
          showTime: NOTIFICATION_CONFIGS[notif.type]?.showTime || 5000,
        }))

        console.log(
          '✅ Processed notifications:',
          notificationsWithConfig.length,
          notificationsWithConfig,
        )
        setNotifications(notificationsWithConfig)
      } else {
        console.error(
          'Failed to load notifications, status:',
          response.status,
          await response.text(),
        )
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }, [user])

  // Connect to real-time notifications (currently using polling)
  const connectToRealTime = useCallback(() => {
    if (!user) return

    // Using polling for now - SSE will be implemented later
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

  // Send notification to external channels with retry logic
  const sendNotification = async (notification: InAppNotification) => {
    const promises: Promise<any>[] = []
    const maxRetryAttempts = 3
    const maxRetries = 3
    const retryDelay = 1000 // 1 second base delay

    const sendWithRetry = async (channel: NotificationChannel, attempt = 0): Promise<any> => {
      try {
        switch (channel) {
          case 'web_push':
            if (webPushSubscription) {
              return await sendWebPush(notification)
            }
            break
          case 'email':
            return await sendEmail(notification)
          case 'sms':
            return await sendSMS(notification)
          default:
            break
        }
      } catch (error) {
        console.error(`Failed to send ${channel} notification (attempt ${attempt + 1}):`, error)

        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = retryDelay * Math.pow(2, attempt)
          await new Promise((resolve) => setTimeout(resolve, delay))
          return sendWithRetry(channel, attempt + 1)
        } else {
          // TODO: Log failed delivery to analytics when API is ready
          console.warn(
            `Failed to send ${channel} notification after ${attempt + 1} attempts:`,
            error,
          )
          throw error
        }
      }
    }

    for (const channel of notification.channels) {
      if (channel !== 'in_app') {
        promises.push(sendWithRetry(channel))
      }
    }

    // Always persist to database
    promises.push(persistNotification(notification))

    const results = await Promise.allSettled(promises)

    // Track successful deliveries
    const successfulChannels: NotificationChannel[] = []
    const failedChannels: NotificationChannel[] = []

    let resultIndex = 0
    notification.channels.forEach((channel) => {
      if (channel === 'in_app') {
        successfulChannels.push(channel)
      } else {
        const result = results[resultIndex]
        if (result && result.status === 'fulfilled') {
          successfulChannels.push(channel)
        } else {
          failedChannels.push(channel)
        }
        resultIndex++
      }
    })

    // Update notification with delivery status
    if (successfulChannels.length > 0) {
      await updateNotificationDeliveryStatus(notification.id, {
        sentChannels: successfulChannels,
        deliveryStatus: failedChannels.length === 0 ? 'delivered' : 'partially_delivered',
        deliveryAttempts: maxRetryAttempts,
      })
    }
  }

  // Track notification events for analytics (disabled until API is ready)
  const trackNotificationEvent = async (
    notificationId: string,
    event: 'viewed' | 'clicked' | 'dismissed' | 'delivery_failed',
    metadata?: Record<string, any>,
  ) => {
    // TODO: Implement tracking API
    console.log('Notification event:', { notificationId, event, metadata })
  }

  // Update notification delivery status
  const updateNotificationDeliveryStatus = async (
    notificationId: string,
    updates: {
      sentChannels?: NotificationChannel[]
      deliveryStatus?: string
      deliveryAttempts?: number
    },
  ) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      })
    } catch (error) {
      console.error('Failed to update notification delivery status:', error)
    }
  }

  // Send web push notification
  const sendWebPush = async (notification: InAppNotification) => {
    try {
      // TODO: Implement web push API
      console.log('Would send web push:', notification.title)
    } catch (error) {
      console.error('Failed to send web push:', error)
    }
  }

  // Send email notification
  const sendEmail = async (notification: InAppNotification) => {
    try {
      // TODO: Implement email API
      console.log('Would send email to:', user?.email, notification.title)
    } catch (error) {
      console.error('Failed to send email:', error)
    }
  }

  // Send SMS notification
  const sendSMS = async (notification: InAppNotification) => {
    if (!user?.phone) return

    try {
      // TODO: Implement SMS API
      console.log('Would send SMS to:', user.phone, notification.title)
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
      // TODO: Implement web push subscription API
      console.log('Would subscribe to web push')
      return true
    } catch (error) {
      console.error('Failed to subscribe to web push:', error)
      return false
    }
  }, [])

  // Unsubscribe from web push
  const unsubscribeFromWebPush = useCallback(async (): Promise<boolean> => {
    try {
      // TODO: Implement web push unsubscription API
      console.log('Would unsubscribe from web push')
      return true
    } catch (error) {
      console.error('Failed to unsubscribe from web push:', error)
      return false
    }
  }, [])

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
