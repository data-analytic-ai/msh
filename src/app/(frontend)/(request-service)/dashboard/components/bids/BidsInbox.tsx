/**
 * BidsInbox - Main bids management component
 *
 * Orchestrates the bid management functionality by coordinating
 * multiple modular components. Handles view state, authentication,
 * and provides a clean interface for bid operations.
 *
 * This refactored version separates concerns into smaller, reusable
 * components while maintaining the same functionality as the original
 * monolithic component.
 *
 * @param {string | null} requestId - ID of the service request
 * @param {boolean} isAuthenticated - Whether user is authenticated
 * @returns {JSX.Element} - The rendered bids inbox component
 */

'use client'

import React, { useState, useCallback } from 'react'
import { ViewMode, Bid } from '@/types/bid'
import { useBids } from '@/hooks/bids/useBids'
import { useBidActions } from '@/hooks/bids/useBidActions'
import { BidNotification } from './BidNotification'
import { UnauthenticatedState } from './UnauthenticatedState'
import { BidsList } from './BidsList'
import { BidDetail } from './BidDetail'

interface BidsInboxProps {
  requestId: string | null
  isAuthenticated: boolean
}

export const BidsInbox: React.FC<BidsInboxProps> = ({ requestId, isAuthenticated }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null)

  // Use custom hooks for bid management
  const bidsState = useBids(requestId, isAuthenticated)
  const bidActions = useBidActions()

  // Handle viewing bid details
  const handleViewDetails = useCallback((bid: Bid) => {
    setSelectedBid(bid)
    setViewMode('detail')
  }, [])

  // Handle returning to list view
  const handleBackToList = useCallback(() => {
    setViewMode('list')
    setSelectedBid(null)
  }, [])

  // Handle accepting a bid
  const handleAcceptBid = useCallback(
    async (bidId: string) => {
      if (!requestId) return

      try {
        await bidActions.acceptBid(bidId, requestId)
        // After successful acceptance, return to list view
        if (viewMode === 'detail') {
          handleBackToList()
        }
        // Refresh bids to get updated state
        await bidsState.fetchBids()
      } catch (error) {
        console.error('Error accepting bid:', error)
        // TODO: Show error toast notification
      }
    },
    [bidActions, requestId, viewMode, handleBackToList, bidsState.fetchBids],
  )

  // Handle rejecting a bid
  const handleRejectBid = useCallback(
    async (bidId: string) => {
      try {
        await bidActions.rejectBid(bidId)
        // Refresh bids to get updated state
        await bidsState.fetchBids()
      } catch (error) {
        console.error('Error rejecting bid:', error)
        // TODO: Show error toast notification
      }
    },
    [bidActions, bidsState.fetchBids],
  )

  // Show error state if there's an error
  if (bidsState.error) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          <h3 className="font-medium mb-2">Error al cargar propuestas</h3>
          <p className="text-sm">{bidsState.error}</p>
        </div>
      </div>
    )
  }

  // Show unauthenticated state
  if (!isAuthenticated) {
    return <UnauthenticatedState />
  }

  return (
    <div className="space-y-4">
      {/* New bid notification */}
      {requestId && (
        <BidNotification
          show={bidsState.showNotification && bidsState.hasNewBids}
          requestId={requestId}
          onDismiss={bidsState.clearNotification}
        />
      )}

      {/* Main content based on view mode */}
      {viewMode === 'detail' && selectedBid ? (
        <BidDetail
          bid={selectedBid}
          onBack={handleBackToList}
          onAccept={handleAcceptBid}
          onReject={handleRejectBid}
          isAccepting={bidActions.acceptingBid === selectedBid.id}
          isRejecting={bidActions.rejectingBid === selectedBid.id}
        />
      ) : (
        requestId && (
          <BidsList
            bids={bidsState.bids}
            timeElapsed={bidsState.timeElapsed}
            onAcceptBid={handleAcceptBid}
            onViewDetails={handleViewDetails}
            onRefresh={bidsState.fetchBids}
            acceptingBidId={bidActions.acceptingBid}
            requestId={requestId}
          />
        )
      )}
    </div>
  )
}
