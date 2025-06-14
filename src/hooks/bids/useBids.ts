/**
 * useBids - Custom hook for bid management
 *
 * Handles fetching, polling, and state management for service request bids.
 * Provides automatic polling every 30 seconds and manages notification states
 * for new incoming bids.
 *
 * @param {string | null} requestId - ID of the service request
 * @param {boolean} isAuthenticated - Whether user is authenticated
 * @returns {object} - Bid state and management functions
 */

import { useState, useEffect, useCallback } from 'react'
import { Bid, BidsState } from '@/types/bid'

interface UseBidsReturn extends BidsState {
  fetchBids: () => Promise<void>
  clearNotification: () => void
}

export const useBids = (requestId: string | null, isAuthenticated: boolean): UseBidsReturn => {
  const [bids, setBids] = useState<Bid[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasNewBids, setHasNewBids] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showNotification, setShowNotification] = useState(false)

  // Timer to track elapsed time since request
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  // Function to fetch bids using the new endpoint
  const fetchBids = useCallback(async () => {
    if (!requestId || !isAuthenticated) return

    setIsLoading(true)
    setError(null)

    try {
      console.log(`🔍 Fetching bids for request ID: ${requestId}`)
      const response = await fetch(`/api/bids?serviceRequestId=${requestId}`)

      console.log(`📡 Response status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ Error response:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Bids data received:', data)

      // Transform bids to match the expected format
      const newBids: Bid[] = (data.docs || []).map((bid: any) => ({
        id: bid.id,
        contractor: {
          id: bid.contractor?.id || bid.contractor,
          firstName: bid.contractor?.firstName || '',
          lastName: bid.contractor?.lastName || '',
          name: bid.contractor
            ? `${bid.contractor.firstName} ${bid.contractor.lastName}`
            : 'Unknown Contractor',
          rating: bid.contractor?.rating || 0,
          reviewCount: bid.contractor?.reviewCount || 0,
          profileImage: bid.contractor?.avatar,
          location: bid.contractor?.location?.address,
          phone: bid.contractor?.phone,
          email: bid.contractor?.email,
          verified: bid.contractor?.verified || false,
          specialties: bid.contractor?.specializations?.map((s: any) => s.specialization) || [],
          experience: bid.contractor?.yearsOfExperience
            ? `${bid.contractor.yearsOfExperience} años`
            : undefined,
          completedJobs: bid.contractor?.completedJobs || 0,
        },
        amount: bid.amount,
        description: bid.description,
        status: bid.status,
        submittedAt: bid.createdAt,
        acceptedAt: bid.acceptedAt,
        rejectedAt: bid.rejectedAt,
        estimatedDuration: bid.estimatedDuration,
        warranty: bid.warranty,
        materials: bid.materials,
        priceBreakdown: bid.priceBreakdown,
        availability: bid.availability,
        portfolio: bid.portfolio,
        serviceRequest: bid.serviceRequest,
        title: bid.title,
      }))

      console.log(`📝 Found ${newBids.length} bids`)

      // Check for new bids
      if (newBids.length > bids.length) {
        setHasNewBids(true)
        setShowNotification(true)
        // Clear notification after 10 seconds
        setTimeout(() => {
          setHasNewBids(false)
          setShowNotification(false)
        }, 10000)
      }

      setBids(newBids)
    } catch (err: any) {
      console.error('❌ Error al obtener propuestas:', err)

      // Provide more specific error messages based on the error type
      let errorMessage = 'Error al cargar propuestas'

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
  }, [requestId, isAuthenticated, bids.length])

  // Automatic polling every 30 seconds for new bids
  useEffect(() => {
    if (!requestId || !isAuthenticated) return

    // Initial load
    fetchBids()

    // Polling every 30 seconds
    const interval = setInterval(fetchBids, 30000)

    return () => clearInterval(interval)
  }, [requestId, isAuthenticated, fetchBids])

  const clearNotification = useCallback(() => {
    setHasNewBids(false)
    setShowNotification(false)
  }, [])

  return {
    bids,
    isLoading,
    error,
    hasNewBids,
    timeElapsed,
    showNotification,
    fetchBids,
    clearNotification,
  }
}
