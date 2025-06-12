/**
 * useDashboardData - Custom hook for client dashboard data management
 *
 * Centralized data fetching and state management for client dashboard,
 * including service requests, quotes, and real-time updates.
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/providers/AuthProvider'

export interface ServiceRequest {
  id: string
  requestId: string
  requestTitle: string
  serviceType: string[]
  description: string
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency'
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled'
  location: {
    formattedAddress: string
  }
  createdAt: string
  updatedAt?: string
  quotes?: Array<{
    id?: string
    contractor: string
    contractorInfo?: {
      name: string
      rating?: number
      verified?: boolean
    }
    amount: number
    description: string
    status: 'pending' | 'accepted' | 'rejected'
    createdAt?: string
    updatedAt?: string
  }>
}

export interface DashboardStats {
  totalRequests: number
  pendingRequests: number
  completedRequests: number
  totalQuotes: number
  pendingQuotes: number
  acceptedQuotes: number
  recentActivity: number
}

export interface RecentActivity {
  id: string
  type: 'new_quote' | 'status_update' | 'quote_accepted' | 'service_completed'
  requestId: string
  requestTitle: string
  message: string
  timestamp: string
  isNew?: boolean
}

interface UseDashboardDataReturn {
  requests: ServiceRequest[]
  stats: DashboardStats
  recentActivity: RecentActivity[]
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  refreshData: () => Promise<void>
  markActivityAsRead: (activityId: string) => void
  getRequestById: (id: string) => ServiceRequest | undefined
}

/**
 * useDashboardData - Hook for dashboard data management
 *
 * Provides centralized access to client dashboard data including
 * service requests, statistics, and real-time activity updates.
 *
 * @returns Dashboard data and management functions
 */
export const useDashboardData = (): UseDashboardDataReturn => {
  const { user, isAuthenticated } = useAuth()

  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    totalQuotes: 0,
    pendingQuotes: 0,
    acceptedQuotes: 0,
    recentActivity: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch user's service requests
  const fetchUserRequests = async (userEmail: string): Promise<ServiceRequest[]> => {
    try {
      const response = await fetch(`/api/user-requests?email=${encodeURIComponent(userEmail)}`)

      if (!response.ok) {
        throw new Error('Failed to fetch user requests')
      }

      const data = await response.json()
      return data.requests || []
    } catch (error) {
      console.error('Error fetching user requests:', error)
      throw error
    }
  }

  // Calculate dashboard statistics
  const calculateStats = (userRequests: ServiceRequest[]): DashboardStats => {
    const allQuotes = userRequests.flatMap((req) => req.quotes || [])
    const recentActivityCount = recentActivity.filter((activity) => activity.isNew).length

    return {
      totalRequests: userRequests.length,
      pendingRequests: userRequests.filter((req) => req.status === 'pending').length,
      completedRequests: userRequests.filter((req) => req.status === 'completed').length,
      totalQuotes: allQuotes.length,
      pendingQuotes: allQuotes.filter((quote) => quote.status === 'pending').length,
      acceptedQuotes: allQuotes.filter((quote) => quote.status === 'accepted').length,
      recentActivity: recentActivityCount,
    }
  }

  // Generate recent activity from requests data
  const generateRecentActivity = (userRequests: ServiceRequest[]): RecentActivity[] => {
    const activities: RecentActivity[] = []

    userRequests.forEach((request) => {
      // Add new quotes as activities
      request.quotes?.forEach((quote) => {
        if (quote.createdAt) {
          activities.push({
            id: `quote-${quote.id || Math.random()}`,
            type: 'new_quote',
            requestId: request.requestId,
            requestTitle: request.requestTitle,
            message: `Nueva cotización de ${quote.contractor} por $${quote.amount.toLocaleString()}`,
            timestamp: quote.createdAt,
            isNew: isRecentTimestamp(quote.createdAt),
          })
        }

        // Add accepted quotes
        if (quote.status === 'accepted') {
          activities.push({
            id: `accepted-${quote.id || Math.random()}`,
            type: 'quote_accepted',
            requestId: request.requestId,
            requestTitle: request.requestTitle,
            message: `Cotización aceptada de ${quote.contractor}`,
            timestamp: quote.updatedAt || quote.createdAt || new Date().toISOString(),
            isNew: isRecentTimestamp(quote.updatedAt || quote.createdAt),
          })
        }
      })

      // Add status updates
      if (request.status === 'completed') {
        activities.push({
          id: `completed-${request.id}`,
          type: 'service_completed',
          requestId: request.requestId,
          requestTitle: request.requestTitle,
          message: 'Servicio completado exitosamente',
          timestamp: request.updatedAt || request.createdAt,
          isNew: isRecentTimestamp(request.updatedAt),
        })
      }
    })

    // Sort by timestamp (most recent first) and take last 10
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
  }

  // Check if timestamp is from the last 24 hours
  const isRecentTimestamp = (timestamp?: string): boolean => {
    if (!timestamp) return false
    const now = new Date()
    const time = new Date(timestamp)
    const diffHours = (now.getTime() - time.getTime()) / (1000 * 60 * 60)
    return diffHours <= 24
  }

  // Load dashboard data
  const loadDashboardData = useCallback(
    async (showRefreshIndicator = false) => {
      if (!isAuthenticated || !user?.email) {
        setIsLoading(false)
        return
      }

      if (showRefreshIndicator) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      try {
        const userRequests = await fetchUserRequests(user.email)
        const activities = generateRecentActivity(userRequests)

        setRequests(userRequests)
        setRecentActivity(activities)
        setStats(calculateStats(userRequests))
        setError(null)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        setError('Error al cargar los datos del dashboard')
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [user, isAuthenticated],
  )

  // Refresh data
  const refreshData = useCallback(async () => {
    await loadDashboardData(true)
  }, [loadDashboardData])

  // Mark activity as read
  const markActivityAsRead = useCallback((activityId: string) => {
    setRecentActivity((prev) =>
      prev.map((activity) =>
        activity.id === activityId ? { ...activity, isNew: false } : activity,
      ),
    )
  }, [])

  // Get request by ID
  const getRequestById = useCallback(
    (id: string) => {
      return requests.find((request) => request.id === id || request.requestId === id)
    },
    [requests],
  )

  // Initial load
  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      loadDashboardData(true)
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [isAuthenticated, loadDashboardData])

  return {
    requests,
    stats,
    recentActivity,
    isLoading,
    isRefreshing,
    error,
    refreshData,
    markActivityAsRead,
    getRequestById,
  }
}

export default useDashboardData
