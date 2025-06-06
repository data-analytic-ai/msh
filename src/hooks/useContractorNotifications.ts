/**
 * useContractorNotifications - Hook para gestionar notificaciones del contratista
 *
 * Proporciona funcionalidades para:
 * - Obtener notificaciones del contratista
 * - Marcar notificaciones como leídas
 * - Contar notificaciones no leídas
 * - Polling automático para nuevas notificaciones
 *
 * @param contractorId - ID del contratista
 * @returns {Object} - Objeto con notificaciones y funciones de gestión
 */

import { useState, useEffect, useCallback } from 'react'

export interface ContractorNotification {
  id: string
  type: 'new_job' | 'payment_released' | 'client_message'
  title: string
  message: string
  serviceRequestId?: string
  amount?: number
  clientName?: string
  createdAt: Date
  read: boolean
}

interface UseContractorNotificationsReturn {
  notifications: ContractorNotification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
}

export function useContractorNotifications(
  contractorId: string | null,
): UseContractorNotificationsReturn {
  const [notifications, setNotifications] = useState<ContractorNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función para obtener notificaciones
  const fetchNotifications = useCallback(async () => {
    if (!contractorId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/contractor/notifications?contractorId=${contractorId}`)

      if (!response.ok) {
        throw new Error('Error al obtener notificaciones')
      }

      const data = await response.json()

      // Convertir fechas de string a Date
      const notificationsWithDates = data.notifications.map((notif: any) => ({
        ...notif,
        createdAt: new Date(notif.createdAt),
      }))

      setNotifications(notificationsWithDates)
      setUnreadCount(data.unreadCount)
    } catch (err: any) {
      console.error('Error al obtener notificaciones:', err)
      setError(err.message || 'Error al cargar notificaciones')
    } finally {
      setIsLoading(false)
    }
  }, [contractorId])

  // Función para marcar una notificación como leída
  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!contractorId) return

      try {
        const response = await fetch('/api/contractor/notifications', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contractorId,
            notificationId,
            read: true,
          }),
        })

        if (!response.ok) {
          throw new Error('Error al marcar notificación como leída')
        }

        // Actualizar estado local
        setNotifications((prev) =>
          prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif)),
        )

        // Actualizar contador de no leídas
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch (err: any) {
        console.error('Error al marcar notificación como leída:', err)
        setError(err.message || 'Error al actualizar notificación')
      }
    },
    [contractorId],
  )

  // Función para marcar todas las notificaciones como leídas
  const markAllAsRead = useCallback(async () => {
    if (!contractorId) return

    try {
      // Marcar todas las notificaciones no leídas
      const unreadNotifications = notifications.filter((n) => !n.read)

      await Promise.all(
        unreadNotifications.map((notif) =>
          fetch('/api/contractor/notifications', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contractorId,
              notificationId: notif.id,
              read: true,
            }),
          }),
        ),
      )

      // Actualizar estado local
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
      setUnreadCount(0)
    } catch (err: any) {
      console.error('Error al marcar todas las notificaciones como leídas:', err)
      setError(err.message || 'Error al actualizar notificaciones')
    }
  }, [contractorId, notifications])

  // Función para refrescar notificaciones manualmente
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications()
  }, [fetchNotifications])

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    if (contractorId) {
      fetchNotifications()
    }
  }, [contractorId, fetchNotifications])

  // Polling automático cada 30 segundos para nuevas notificaciones
  useEffect(() => {
    if (!contractorId) return

    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000) // 30 segundos

    return () => clearInterval(interval)
  }, [contractorId, fetchNotifications])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  }
}

// Hook adicional para crear notificaciones (para testing)
export function useCreateNotification() {
  const createNotification = useCallback(
    async (
      contractorId: string,
      type: ContractorNotification['type'],
      title: string,
      message: string,
      serviceRequestId?: string,
      amount?: number,
      clientName?: string,
    ) => {
      try {
        const response = await fetch('/api/contractor/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contractorId,
            type,
            title,
            message,
            serviceRequestId,
            amount,
            clientName,
          }),
        })

        if (!response.ok) {
          throw new Error('Error al crear notificación')
        }

        const data = await response.json()
        return data.notification
      } catch (err: any) {
        console.error('Error al crear notificación:', err)
        throw err
      }
    },
    [],
  )

  return { createNotification }
}
