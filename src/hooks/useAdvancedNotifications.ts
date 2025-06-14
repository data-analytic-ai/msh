/**
 * useAdvancedNotifications - Advanced notification management hook
 *
 * Provides enhanced notification features including templates, scheduling,
 * analytics tracking, and bulk operations.
 *
 * @returns {Object} Advanced notification management methods
 */

import { useNotifications } from '@/contexts/NotificationContext'
import { useCallback, useState, useEffect } from 'react'
import type { NotificationType, InAppNotification } from '@/contexts/NotificationContext'

// Notification template interface
interface NotificationTemplate {
  id: string
  name: string
  type: NotificationType
  titleTemplate: string
  messageTemplate: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  channels: ('in_app' | 'web_push' | 'email' | 'sms')[]
  variables: string[] // e.g., ['customerName', 'amount', 'requestId']
}

// Scheduled notification interface
interface ScheduledNotification {
  id: string
  template: NotificationTemplate
  variables: Record<string, any>
  scheduledFor: Date
  userId: string
  status: 'pending' | 'sent' | 'failed'
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly'
    interval: number
    endDate?: Date
  }
}

// Notification analytics interface
interface NotificationAnalytics {
  deliveryRate: number
  openRate: number
  clickRate: number
  channelPerformance: Record<
    string,
    {
      sent: number
      delivered: number
      opened: number
      clicked: number
    }
  >
  typePerformance: Record<
    NotificationType,
    {
      sent: number
      opened: number
      clicked: number
    }
  >
}

export const useAdvancedNotifications = () => {
  const { notify } = useNotifications()
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([])
  const [analytics, setAnalytics] = useState<NotificationAnalytics | null>(null)

  // Load notification templates
  const loadTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/templates', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Failed to load notification templates:', error)
    }
  }, [])

  // Load scheduled notifications
  const loadScheduledNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/scheduled', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setScheduledNotifications(data)
      }
    } catch (error) {
      console.error('Failed to load scheduled notifications:', error)
    }
  }, [])

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/analytics', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to load notification analytics:', error)
    }
  }, [])

  // Initialize data loading
  useEffect(() => {
    loadTemplates()
    loadScheduledNotifications()
    loadAnalytics()
  }, [loadTemplates, loadScheduledNotifications, loadAnalytics])

  // Send notification from template
  const sendFromTemplate = useCallback(
    async (templateId: string, userId: string, variables: Record<string, any>): Promise<void> => {
      const template = templates.find((t) => t.id === templateId)
      if (!template) {
        throw new Error(`Template ${templateId} not found`)
      }

      // Replace variables in title and message
      let title = template.titleTemplate
      let message = template.messageTemplate

      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`
        title = title.replace(new RegExp(placeholder, 'g'), String(value))
        message = message.replace(new RegExp(placeholder, 'g'), String(value))
      })

      await notify(template.type, {
        title,
        message,
        userId,
        priority: template.priority,
        channels: template.channels,
        data: { ...variables, templateId },
      })
    },
    [notify, templates],
  )

  // Schedule notification
  const scheduleNotification = useCallback(
    async (
      templateId: string,
      userId: string,
      variables: Record<string, any>,
      scheduledFor: Date,
      recurring?: ScheduledNotification['recurring'],
    ): Promise<string> => {
      const template = templates.find((t) => t.id === templateId)
      if (!template) {
        throw new Error(`Template ${templateId} not found`)
      }

      const scheduledNotification: Omit<ScheduledNotification, 'id'> = {
        template,
        variables,
        scheduledFor,
        userId,
        status: 'pending',
        recurring,
      }

      try {
        const response = await fetch('/api/notifications/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(scheduledNotification),
        })

        if (response.ok) {
          const created = await response.json()
          setScheduledNotifications((prev) => [...prev, created])
          return created.id
        } else {
          throw new Error('Failed to schedule notification')
        }
      } catch (error) {
        console.error('Error scheduling notification:', error)
        throw error
      }
    },
    [templates],
  )

  // Cancel scheduled notification
  const cancelScheduledNotification = useCallback(async (scheduledId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/notifications/scheduled/${scheduledId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        setScheduledNotifications((prev) => prev.filter((n) => n.id !== scheduledId))
      } else {
        throw new Error('Failed to cancel scheduled notification')
      }
    } catch (error) {
      console.error('Error canceling scheduled notification:', error)
      throw error
    }
  }, [])

  // Send bulk notifications
  const sendBulkNotifications = useCallback(
    async (
      notifications: Array<{
        templateId: string
        userId: string
        variables: Record<string, any>
      }>,
    ): Promise<{ successful: number; failed: number; errors: Error[] }> => {
      const results = { successful: 0, failed: 0, errors: [] as Error[] }

      const batches = []
      const batchSize = 10 // Process in batches of 10

      for (let i = 0; i < notifications.length; i += batchSize) {
        batches.push(notifications.slice(i, i + batchSize))
      }

      for (const batch of batches) {
        const promises = batch.map(async (notif) => {
          try {
            await sendFromTemplate(notif.templateId, notif.userId, notif.variables)
            results.successful++
          } catch (error) {
            results.failed++
            results.errors.push(error as Error)
          }
        })

        await Promise.allSettled(promises)

        // Add delay between batches to avoid overwhelming the system
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      return results
    },
    [sendFromTemplate],
  )

  // Create notification template
  const createTemplate = useCallback(
    async (template: Omit<NotificationTemplate, 'id'>): Promise<string> => {
      try {
        const response = await fetch('/api/notifications/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(template),
        })

        if (response.ok) {
          const created = await response.json()
          setTemplates((prev) => [...prev, created])
          return created.id
        } else {
          throw new Error('Failed to create template')
        }
      } catch (error) {
        console.error('Error creating template:', error)
        throw error
      }
    },
    [],
  )

  // Update notification template
  const updateTemplate = useCallback(
    async (templateId: string, updates: Partial<NotificationTemplate>): Promise<void> => {
      try {
        const response = await fetch(`/api/notifications/templates/${templateId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(updates),
        })

        if (response.ok) {
          const updated = await response.json()
          setTemplates((prev) => prev.map((t) => (t.id === templateId ? updated : t)))
        } else {
          throw new Error('Failed to update template')
        }
      } catch (error) {
        console.error('Error updating template:', error)
        throw error
      }
    },
    [],
  )

  // Delete notification template
  const deleteTemplate = useCallback(async (templateId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/notifications/templates/${templateId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== templateId))
      } else {
        throw new Error('Failed to delete template')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      throw error
    }
  }, [])

  // Get notification statistics
  const getNotificationStats = useCallback(async (timeRange: '7d' | '30d' | '90d' = '30d') => {
    try {
      const response = await fetch(`/api/notifications/stats?range=${timeRange}`, {
        credentials: 'include',
      })

      if (response.ok) {
        return await response.json()
      } else {
        throw new Error('Failed to fetch notification stats')
      }
    } catch (error) {
      console.error('Error fetching notification stats:', error)
      throw error
    }
  }, [])

  return {
    // Templates
    templates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    sendFromTemplate,

    // Scheduling
    scheduledNotifications,
    scheduleNotification,
    cancelScheduledNotification,

    // Bulk operations
    sendBulkNotifications,

    // Analytics
    analytics,
    getNotificationStats,

    // Data management
    loadTemplates,
    loadScheduledNotifications,
    loadAnalytics,
  }
}

export default useAdvancedNotifications

// Pre-defined templates for common business scenarios
export const DEFAULT_TEMPLATES: Omit<NotificationTemplate, 'id'>[] = [
  {
    name: 'Nueva Cotización - Cliente',
    type: 'quote_received',
    titleTemplate: 'Nueva cotización de {{contractorName}}',
    messageTemplate:
      '{{contractorName}} envió una cotización de ${{amount}} para "{{requestTitle}}". ¡Revísala ahora!',
    priority: 'high',
    channels: ['in_app', 'web_push', 'email'],
    variables: ['contractorName', 'amount', 'requestTitle', 'requestId'],
  },
  {
    name: 'Cotización Aceptada - Contratista',
    type: 'quote_accepted',
    titleTemplate: '¡Tu cotización fue aceptada!',
    messageTemplate:
      '{{customerName}} aceptó tu cotización de ${{amount}} para "{{requestTitle}}". El trabajo te fue asignado.',
    priority: 'high',
    channels: ['in_app', 'web_push', 'email', 'sms'],
    variables: ['customerName', 'amount', 'requestTitle', 'requestId'],
  },
  {
    name: 'Pago Recibido - Contratista',
    type: 'payment_received',
    titleTemplate: 'Pago recibido - ${{amount}}',
    messageTemplate:
      'Recibiste un pago de ${{amount}} por el trabajo "{{requestTitle}}". El dinero estará disponible en {{businessDays}} días hábiles.',
    priority: 'high',
    channels: ['in_app', 'web_push', 'email', 'sms'],
    variables: ['amount', 'requestTitle', 'requestId', 'businessDays'],
  },
  {
    name: 'Recordatorio de Trabajo',
    type: 'job_assigned',
    titleTemplate: 'Recordatorio: Trabajo programado para mañana',
    messageTemplate:
      'Te recordamos que tienes un trabajo programado para mañana: "{{requestTitle}}" con {{customerName}}. Dirección: {{address}}',
    priority: 'normal',
    channels: ['in_app', 'web_push', 'sms'],
    variables: ['requestTitle', 'customerName', 'address', 'time'],
  },
]
