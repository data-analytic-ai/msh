/**
 * useContractorDashboard - Dashboard data management hook
 *
 * Manages all data fetching and state for the contractor dashboard,
 * including profile, assigned jobs, payment summary, and notifications.
 *
 * @returns {Object} Dashboard data and control functions
 */
import { useState, useEffect, useCallback } from 'react'
import { ServiceRequest } from '../types/ServiceRequest'

interface ContractorProfile {
  id: string
  name: string
  email: string
  phone: string
  services: string[]
  rating: number
  reviewCount: number
  verified: boolean
}

interface PaymentSummary {
  availableBalance: number
  pendingPayments: number
  heldPayments: number
  totalEarnings: number
  thisMonthEarnings: number
}

interface QuoteSummary {
  requestId: string
  requestTitle: string
  amount: number
  status: string
  submittedAt: string
}

interface UseContractorDashboardReturn {
  contractor: ContractorProfile | null
  assignedRequests: ServiceRequest[]
  sentQuotes: QuoteSummary[]
  completedRequests: ServiceRequest[]
  paymentSummary: PaymentSummary | null
  notifications: number
  isLoading: boolean
  error: string | null
  refreshData: () => Promise<void>
  acceptRequest: (requestId: string) => Promise<void>
  rejectRequest: (requestId: string) => Promise<void>
  updateRequestStatus: (requestId: string, status: string) => Promise<void>
  refreshSentQuotes: () => Promise<void>
}

export const useContractorDashboard = (): UseContractorDashboardReturn => {
  const [contractor, setContractor] = useState<ContractorProfile | null>(null)
  const [assignedRequests, setAssignedRequests] = useState<ServiceRequest[]>([])
  const [sentQuotes, setSentQuotes] = useState<QuoteSummary[]>([])
  const [completedRequests, setCompletedRequests] = useState<ServiceRequest[]>([])
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null)
  const [notifications, setNotifications] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch contractor profile
  const fetchContractorProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/users/me', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch contractor profile')
      }

      const userData = await response.json()

      // Transform user data to contractor profile format
      setContractor({
        id: userData.user.id,
        name: `${userData.user.firstName} ${userData.user.lastName}`,
        email: userData.user.email,
        phone: userData.user.phone || '',
        services: userData.user.services || [],
        rating: userData.user.rating || 0,
        reviewCount: userData.user.reviewCount || 0,
        verified: userData.user.verified || false,
      })

      return userData.user
    } catch (err) {
      console.error('Error fetching contractor profile:', err)
      throw err
    }
  }, [])

  // Fetch assigned service requests
  const fetchAssignedRequests = useCallback(async (contractorId: string) => {
    try {
      const url = new URL('/api/service-requests', window.location.origin)
      const params = new URLSearchParams()

      // Query for requests assigned to this contractor
      // Only show requests that are:
      // 1. Directly assigned by admin/customer (assignedContractor field)
      // 2. Won through bidding process (contractor's quote was accepted)
      const where = {
        or: [
          // Direct assignments
          {
            assignedContractor: {
              equals: contractorId,
            },
            status: {
              in: ['assigned', 'accepted', 'in-progress'],
            },
          },
          // Won quotes (contractor submitted quote that was accepted)
          {
            quotes: {
              $elemMatch: {
                contractor: contractorId,
                status: 'accepted',
              },
            },
            status: {
              in: ['assigned', 'accepted', 'in-progress'],
            },
          },
        ],
      }

      params.append('where', JSON.stringify(where))
      params.append('depth', '2')
      params.append('sort', '-createdAt')
      url.search = params.toString()

      const response = await fetch(url.toString(), {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch assigned requests')
      }

      const data = await response.json()

      // Filter to ensure we only show truly assigned requests
      const filteredRequests = (data.docs || []).filter((req: ServiceRequest) => {
        // Check if directly assigned
        const isDirectlyAssigned = req.assignedContractor === contractorId

        // Check if won through bidding
        const hasAcceptedQuote = req.quotes?.some(
          (quote) => quote.contractor === contractorId && quote.status === 'accepted',
        )

        return isDirectlyAssigned || hasAcceptedQuote
      })

      setAssignedRequests(filteredRequests)

      // Count new notifications (newly assigned requests)
      const newAssignments = filteredRequests.filter(
        (req: ServiceRequest) => req.status === 'assigned',
      )
      setNotifications(newAssignments.length)

      return filteredRequests
    } catch (err) {
      console.error('Error fetching assigned requests:', err)
      throw err
    }
  }, [])

  // Fetch completed requests for payment history
  const fetchCompletedRequests = useCallback(async (contractorId: string) => {
    try {
      const url = new URL('/api/service-requests', window.location.origin)
      const params = new URLSearchParams()

      const where = {
        assignedContractor: {
          equals: contractorId,
        },
        status: {
          equals: 'completed',
        },
      }

      params.append('where', JSON.stringify(where))
      params.append('depth', '2')
      params.append('sort', '-updatedAt')
      params.append('limit', '10')
      url.search = params.toString()

      const response = await fetch(url.toString(), {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch completed requests')
      }

      const data = await response.json()
      setCompletedRequests(data.docs || [])

      return data.docs || []
    } catch (err) {
      console.error('Error fetching completed requests:', err)
      throw err
    }
  }, [])

  // Fetch sent quotes by contractor (extracting from service requests)
  const fetchSentQuotes = useCallback(async (contractorId: string) => {
    try {
      const url = new URL('/api/service-requests', window.location.origin)
      const params = new URLSearchParams()
      // Filter service requests that contain quotes by this contractor
      const where = {
        quotes: { $elemMatch: { contractor: contractorId } },
      }
      params.append('where', JSON.stringify(where))
      params.append('depth', '2')
      params.append('sort', '-createdAt')
      url.search = params.toString()

      const response = await fetch(url.toString(), {
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch sent quotes')
      }
      const data = await response.json()
      // Transform service requests into flat list of quotes by this contractor
      const quotesList: QuoteSummary[] = (data.docs || []).flatMap(
        (req: ServiceRequest) =>
          req.quotes
            ?.filter((q) => q.contractor === contractorId)
            .map((q) => ({
              requestId: req.id,
              requestTitle: req.requestTitle,
              amount: q.amount,
              status: q.status,
              submittedAt: (q as any).submittedAt || req.createdAt,
            })) || [],
      )
      setSentQuotes(quotesList)
      return quotesList
    } catch (err) {
      console.error('Error fetching sent quotes:', err)
      throw err
    }
  }, [])

  // Calculate payment summary
  const calculatePaymentSummary = useCallback(
    (assigned: ServiceRequest[], completed: ServiceRequest[]) => {
      // Mock calculation - in production this would come from a payments API
      const completedPayments = completed.reduce((sum, req) => {
        // Assuming we have payment info in the request
        return sum + (req.quotes?.[0]?.amount || 0)
      }, 0)

      const pendingPayments = assigned.reduce((sum, req) => {
        if (req.status === 'completed') {
          return sum + (req.quotes?.[0]?.amount || 0)
        }
        return sum
      }, 0)

      const currentDate = new Date()
      const currentMonth = currentDate.getMonth()
      const currentYear = currentDate.getFullYear()

      const thisMonthEarnings = completed
        .filter((req) => {
          const completedDate = new Date(req.createdAt)
          return (
            completedDate.getMonth() === currentMonth && completedDate.getFullYear() === currentYear
          )
        })
        .reduce((sum, req) => sum + (req.quotes?.[0]?.amount || 0), 0)

      setPaymentSummary({
        availableBalance: completedPayments * 0.7, // 70% available, 30% held
        pendingPayments,
        heldPayments: completedPayments * 0.3,
        totalEarnings: completedPayments,
        thisMonthEarnings,
      })
    },
    [],
  )

  // Main data fetching function
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const contractorData = await fetchContractorProfile()
      const [assignedData, completedData, sentData] = await Promise.all([
        fetchAssignedRequests(contractorData.id),
        fetchCompletedRequests(contractorData.id),
        fetchSentQuotes(contractorData.id),
      ])

      calculatePaymentSummary(assignedData, completedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [
    fetchContractorProfile,
    fetchAssignedRequests,
    fetchCompletedRequests,
    calculatePaymentSummary,
    fetchSentQuotes,
  ])

  // Accept a service request
  const acceptRequest = useCallback(async (requestId: string) => {
    try {
      const response = await fetch(`/api/service-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'accepted',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to accept request')
      }

      // Update local state
      setAssignedRequests((prev) =>
        prev.map((req) => (req.id === requestId ? { ...req, status: 'accepted' as const } : req)),
      )
      setNotifications((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error accepting request:', err)
      throw err
    }
  }, [])

  // Reject a service request
  const rejectRequest = useCallback(async (requestId: string) => {
    try {
      const response = await fetch(`/api/service-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'pending',
          assignedContractor: null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject request')
      }

      // Remove from local state
      setAssignedRequests((prev) => prev.filter((req) => req.id !== requestId))
      setNotifications((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error rejecting request:', err)
      throw err
    }
  }, [])

  // Update request status
  const updateRequestStatus = useCallback(
    async (requestId: string, status: string) => {
      try {
        const response = await fetch(`/api/service-requests/${requestId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            status,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to update request status')
        }

        // Update local state
        setAssignedRequests((prev) =>
          prev.map((req) => (req.id === requestId ? { ...req, status: status as any } : req)),
        )

        // If completed, refresh data to update payment summary
        if (status === 'completed') {
          setTimeout(fetchData, 1000) // Refresh after a second
        }
      } catch (err) {
        console.error('Error updating request status:', err)
        throw err
      }
    },
    [fetchData],
  )

  // Initial data load
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    contractor,
    assignedRequests,
    sentQuotes,
    completedRequests,
    paymentSummary,
    notifications,
    isLoading,
    error,
    refreshData: fetchData,
    acceptRequest,
    rejectRequest,
    updateRequestStatus,
    refreshSentQuotes: async (): Promise<void> => {
      if (contractor) {
        await fetchSentQuotes(contractor.id)
      }
    },
  }
}
