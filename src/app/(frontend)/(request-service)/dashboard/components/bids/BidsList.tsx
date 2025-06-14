/**
 * BidsList - Bids list container component
 *
 * Manages the display of multiple bids in a list format.
 * Handles empty states, loading states, and integrates with
 * bid management actions.
 *
 * @param {Bid[]} bids - Array of bids to display
 * @param {number} timeElapsed - Minutes elapsed since request
 * @param {Function} onAcceptBid - Callback when a bid is accepted
 * @param {Function} onViewDetails - Callback to view bid details
 * @param {Function} onRefresh - Callback to refresh bids
 * @param {string} acceptingBidId - ID of bid being accepted
 * @param {string} requestId - ID of the service request
 * @returns {JSX.Element} - The rendered bids list component
 */

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, Clock, ExternalLink } from 'lucide-react'
import { Bid } from '@/types/bid'
import { BidCard } from './BidCard'
import { EmptyBidsState } from './EmptyBidsState'
import { formatTimeElapsed } from '@/utils/bidHelpers'

interface BidsListProps {
  bids: Bid[]
  timeElapsed: number
  onAcceptBid: (bidId: string) => void
  onViewDetails: (bid: Bid) => void
  onRefresh: () => void
  acceptingBidId: string | null
  requestId: string
}

export const BidsList: React.FC<BidsListProps> = ({
  bids,
  timeElapsed,
  onAcceptBid,
  onViewDetails,
  onRefresh,
  acceptingBidId,
  requestId,
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Received Bids
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatTimeElapsed(timeElapsed)} elapsed
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bids.length === 0 ? (
          <EmptyBidsState timeElapsed={timeElapsed} onRefresh={onRefresh} />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {bids.length} bid{bids.length > 1 ? 's' : ''} received
              </p>
              <Link href={`/quotes/${requestId}`}>
                <Button size="sm" variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Manage Bids
                </Button>
              </Link>
            </div>

            {/* Bids list */}
            <div className="space-y-3">
              {bids.map((bid) => (
                <BidCard
                  key={bid.id}
                  bid={bid}
                  onAccept={onAcceptBid}
                  onViewDetails={onViewDetails}
                  isAccepting={acceptingBidId === bid.id}
                  acceptingBidId={acceptingBidId}
                  onClick={onViewDetails}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
