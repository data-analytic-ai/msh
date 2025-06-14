/**
 * useBidActions - Custom hook for bid actions
 *
 * Handles bid acceptance, rejection, and status updates.
 * Manages loading states and provides callbacks for UI updates.
 *
 * @param {Function} onBidUpdate - Callback function to update bid state
 * @returns {object} - Bid action functions and loading states
 */

import { useState, useCallback } from 'react'
import { Bid, BidActionsState } from '@/types/bid'

interface UseBidActionsReturn extends BidActionsState {
  acceptBid: (bidId: string, requestId: string) => Promise<void>
  rejectBid: (bidId: string) => Promise<void>
}

export const useBidActions = (): UseBidActionsReturn => {
  const [acceptingBid, setAcceptingBid] = useState<string | null>(null)
  const [rejectingBid, setRejectingBid] = useState<string | null>(null)

  const acceptBid = useCallback(async (bidId: string, requestId: string) => {
    setAcceptingBid(bidId)

    try {
      console.log('🎯 Accepting bid:', bidId, 'for request:', requestId)

      // Update the bid status to accepted using the new endpoint
      const updateBidResponse = await fetch(`/api/bids`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          bidId: bidId,
          status: 'accepted',
        }),
      })

      if (!updateBidResponse.ok) {
        const errorData = await updateBidResponse.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to accept bid')
      }

      const updatedBid = await updateBidResponse.json()
      console.log('✅ Bid updated successfully:', updatedBid)
      console.log('✅ Bid accepted successfully and notifications sent automatically')
    } catch (error) {
      console.error('❌ Error accepting bid:', error)
      throw error // Re-throw to allow component to handle the error
    } finally {
      setAcceptingBid(null)
    }
  }, [])

  const rejectBid = useCallback(async (bidId: string) => {
    setRejectingBid(bidId)

    try {
      console.log('🚫 Rejecting bid:', bidId)

      const updateBidResponse = await fetch(`/api/bids`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          bidId: bidId,
          status: 'rejected',
        }),
      })

      if (!updateBidResponse.ok) {
        const errorData = await updateBidResponse.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to reject bid')
      }

      console.log('✅ Bid rejected successfully')
    } catch (error) {
      console.error('❌ Error rejecting bid:', error)
      throw error
    } finally {
      setRejectingBid(null)
    }
  }, [])

  return {
    acceptingBid,
    rejectingBid,
    acceptBid,
    rejectBid,
  }
}
