/**
 * useQuotesNotifications - Custom hook for managing quotes notifications
 *
 * Provides functionality to:
 * - Track new quotes received
 * - Show notifications when new quotes arrive
 * - Manage notification state and timing
 * - Provide consistent notification behavior across components
 *
 * @param {string | null} requestId - ID of the service request
 * @param {boolean} isAuthenticated - Whether user is authenticated
 * @returns {Object} Quotes notifications state and controls
 */

import { useState, useEffect, useCallback } from 'react'

interface Quote {
  id: string
  contractor: {
    name: string
  }
  amount: number
  status: 'pending' | 'accepted' | 'rejected'
  submittedAt: string
}

interface UseQuotesNotificationsReturn {
  quotes: Quote[]
  isLoading: boolean
  error: string | null
  hasNewQuotes: boolean
  showNotification: boolean
  newQuotesCount: number
  fetchQuotes: () => void
  dismissNotification: () => void
  markAllAsRead: () => void
}

export const useQuotesNotifications = (
  requestId: string | null,
  isAuthenticated: boolean,
): UseQuotesNotificationsReturn => {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasNewQuotes, setHasNewQuotes] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [newQuotesCount, setNewQuotesCount] = useState(0)
  const [lastKnownCount, setLastKnownCount] = useState(0)

  // Función para obtener cotizaciones
  const fetchQuotes = useCallback(async () => {
    if (!requestId || !isAuthenticated) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/request-details?id=${requestId}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const newQuotes = data.quotes || []

      // Verificar si hay nuevas cotizaciones
      if (newQuotes.length > lastKnownCount && lastKnownCount > 0) {
        const newCount = newQuotes.length - lastKnownCount
        setHasNewQuotes(true)
        setShowNotification(true)
        setNewQuotesCount(newCount)

        // Auto-dismiss notification after 10 seconds
        setTimeout(() => {
          setShowNotification(false)
        }, 10000)
      }

      setQuotes(newQuotes)
      setLastKnownCount(newQuotes.length)
    } catch (err: any) {
      let errorMessage = 'Error al cargar cotizaciones'

      if (err.message?.includes('Service request not found')) {
        errorMessage = 'La solicitud de servicio no fue encontrada'
      } else if (err.message?.includes('HTTP 404')) {
        errorMessage = 'La solicitud de servicio no fue encontrada'
      } else if (err.message?.includes('HTTP 500')) {
        errorMessage = 'Error interno del servidor. Por favor intenta nuevamente.'
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [requestId, isAuthenticated, lastKnownCount])

  // Polling automático para nuevas cotizaciones
  useEffect(() => {
    if (!requestId || !isAuthenticated) return

    // Carga inicial
    fetchQuotes()

    // Polling cada 30 segundos
    const interval = setInterval(fetchQuotes, 30000)

    return () => clearInterval(interval)
  }, [requestId, isAuthenticated, fetchQuotes])

  // Dismiss notification manually
  const dismissNotification = useCallback(() => {
    setShowNotification(false)
    setHasNewQuotes(false)
  }, [])

  // Mark all quotes as read
  const markAllAsRead = useCallback(() => {
    setHasNewQuotes(false)
    setShowNotification(false)
    setNewQuotesCount(0)
  }, [])

  return {
    quotes,
    isLoading,
    error,
    hasNewQuotes,
    showNotification,
    newQuotesCount,
    fetchQuotes,
    dismissNotification,
    markAllAsRead,
  }
}
