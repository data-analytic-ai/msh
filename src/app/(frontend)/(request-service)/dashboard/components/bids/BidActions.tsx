/**
 * BidActions - Bid action buttons component
 *
 * Provides action buttons for bid management including accept, reject,
 * view details, and negotiate options. Handles loading states and
 * different bid statuses appropriately.
 *
 * @param {Bid} bid - The bid object
 * @param {Function} onAccept - Callback when bid is accepted
 * @param {Function} onReject - Callback when bid is rejected (optional)
 * @param {Function} onViewDetails - Callback to view bid details
 * @param {boolean} isAccepting - Whether accept action is in progress
 * @param {boolean} isRejecting - Whether reject action is in progress
 * @returns {JSX.Element} - The rendered bid actions component
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { ThumbsUp, Eye, MessageCircle, X, CheckCircle } from 'lucide-react'
import { Bid } from '@/types/bid'
import { getBidStatusText } from '@/utils/bidHelpers'

interface BidActionsProps {
  bid: Bid
  onAccept: (bidId: string) => void
  onReject?: (bidId: string) => void
  onViewDetails: (bid: Bid) => void
  isAccepting: boolean
  isRejecting?: boolean
  compact?: boolean
}

export const BidActions: React.FC<BidActionsProps> = ({
  bid,
  onAccept,
  onReject,
  onViewDetails,
  isAccepting,
  isRejecting = false,
  compact = false,
}) => {
  // Show different actions based on bid status
  if (bid.status === 'accepted') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
          <CheckCircle className="h-4 w-4" />
          {getBidStatusText(bid.status)}
        </div>
        {!compact && (
          <Button size="sm" variant="outline" onClick={() => onViewDetails(bid)}>
            <Eye className="h-4 w-4 mr-1" />
            Ver detalles
          </Button>
        )}
      </div>
    )
  }

  if (bid.status === 'rejected') {
    return (
      <div className="flex items-center gap-2 opacity-60">
        <div className="text-muted-foreground text-sm">{getBidStatusText(bid.status)}</div>
        {!compact && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onViewDetails(bid)}
            className="text-muted-foreground"
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver detalles
          </Button>
        )}
      </div>
    )
  }

  // Pending status - show action buttons
  if (bid.status === 'pending') {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'flex-col' : ''}`}>
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700"
          onClick={() => onAccept(bid.id)}
          disabled={isAccepting}
        >
          {isAccepting ? (
            'Aceptando...'
          ) : (
            <>
              <ThumbsUp className="h-4 w-4 mr-1" />
              {compact ? 'Aceptar' : 'Aceptar'}
            </>
          )}
        </Button>

        <Button size="sm" variant="outline" onClick={() => onViewDetails(bid)}>
          <Eye className="h-4 w-4 mr-1" />
          {compact ? 'Detalles' : 'Ver detalles'}
        </Button>

        {!compact && (
          <>
            <Button size="sm" variant="outline">
              <MessageCircle className="h-4 w-4 mr-1" />
              Negociar
            </Button>

            {onReject && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onReject(bid.id)}
                disabled={isRejecting}
                className="text-destructive hover:text-destructive"
              >
                {isRejecting ? (
                  'Rechazando...'
                ) : (
                  <>
                    <X className="h-4 w-4 mr-1" />
                    Rechazar
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </div>
    )
  }

  // Other statuses (withdrawn, expired, etc.)
  return (
    <div className="flex items-center gap-2">
      <div className="text-muted-foreground text-sm">{getBidStatusText(bid.status)}</div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onViewDetails(bid)}
        className="text-muted-foreground"
      >
        <Eye className="h-4 w-4 mr-1" />
        Ver detalles
      </Button>
    </div>
  )
}
