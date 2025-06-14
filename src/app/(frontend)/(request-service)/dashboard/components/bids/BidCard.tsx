/**
 * BidCard - Individual bid card component
 *
 * Displays a single bid in a card format within the bids list.
 * Shows contractor info, bid amount, description, and action buttons.
 * Handles different bid states with appropriate styling.
 *
 * @param {Bid} bid - The bid object to display
 * @param {Function} onAccept - Callback when bid is accepted
 * @param {Function} onViewDetails - Callback to view bid details
 * @param {boolean} isAccepting - Whether accept action is in progress
 * @param {Function} onClick - Callback when card is clicked
 * @returns {JSX.Element} - The rendered bid card component
 */

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Bid } from '@/types/bid'
import { ContractorInfo } from './ContractorInfo'
import { BidActions } from './BidActions'
import { formatCurrency, getBidStatusVariant } from '@/utils/bidHelpers'

interface BidCardProps {
  bid: Bid
  onAccept: (bidId: string) => void
  onViewDetails: (bid: Bid) => void
  isAccepting: boolean
  acceptingBidId?: string | null
  onClick?: (bid: Bid) => void
}

export const BidCard: React.FC<BidCardProps> = ({
  bid,
  onAccept,
  onViewDetails,
  isAccepting,
  acceptingBidId,
  onClick,
}) => {
  const handleCardClick = () => {
    if (onClick) {
      onClick(bid)
    }
  }

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const getCardStyles = () => {
    const baseStyles = 'transition-all cursor-pointer'

    switch (bid.status) {
      case 'accepted':
        return `${baseStyles} border-green-500 bg-green-50`
      case 'rejected':
        return `${baseStyles} border-gray-300 opacity-60`
      default:
        return `${baseStyles} border-border hover:border-primary hover:shadow-md`
    }
  }

  return (
    <Card className={getCardStyles()} onClick={handleCardClick}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with contractor info and bid amount */}
          <div className="flex items-start justify-between">
            <ContractorInfo contractor={bid.contractor} size="md" />

            <div className="flex items-center gap-2 text-right">
              <span className="font-bold text-lg text-green-600">{formatCurrency(bid.amount)}</span>
              <Badge variant={getBidStatusVariant(bid.status)}>
                {bid.status === 'pending' && 'Pendiente'}
                {bid.status === 'accepted' && 'Aceptada'}
                {bid.status === 'rejected' && 'Rechazada'}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Bid description */}
          <div>
            <p className="text-sm text-muted-foreground line-clamp-2">{bid.description}</p>
          </div>

          {/* Additional info if available */}
          {(bid.estimatedDuration || bid.warranty) && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {bid.estimatedDuration && <span>Duración: {bid.estimatedDuration}</span>}
              {bid.warranty && <span>Garantía: {bid.warranty}</span>}
            </div>
          )}

          {/* Action buttons */}
          <div onClick={handleActionClick}>
            <BidActions
              bid={bid}
              onAccept={onAccept}
              onViewDetails={onViewDetails}
              isAccepting={acceptingBidId === bid.id}
              compact={true}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
