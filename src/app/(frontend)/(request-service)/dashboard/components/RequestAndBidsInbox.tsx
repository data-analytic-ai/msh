/**
 * RequestAndBidsInbox - Legacy wrapper for BidsInbox component
 *
 * This component has been refactored into smaller, modular components.
 * This file now serves as a simple wrapper that imports the new
 * modular BidsInbox component, maintaining backward compatibility.
 *
 * The original monolithic component has been broken down into:
 * - BidsInbox: Main orchestrator component
 * - BidsList: List view of bids
 * - BidCard: Individual bid cards
 * - BidDetail: Detailed view of a single bid
 * - BidActions: Action buttons for bids
 * - ContractorInfo: Reusable contractor information display
 * - BidNotification: New bid notifications
 * - EmptyBidsState: Empty state when no bids exist
 * - UnauthenticatedState: State for non-authenticated users
 *
 * Custom hooks:
 * - useBids: Manages bid fetching and state
 * - useBidActions: Handles bid acceptance/rejection actions
 *
 * @param {string} requestId - ID of the service request
 * @param {boolean} isAuthenticated - Whether user is authenticated
 * @returns {JSX.Element} - The rendered bids inbox component
 */

'use client'

import React from 'react'
import { BidsInbox } from './bids'

interface RequestAndBidsInboxProps {
  requestId: string | null
  isAuthenticated: boolean
}

/**
 * RequestAndBidsInbox - Wrapper component for the refactored BidsInbox
 *
 * Maintains backward compatibility while using the new modular architecture.
 * Simply passes props through to the new BidsInbox component.
 */
export const RequestAndBidsInbox: React.FC<RequestAndBidsInboxProps> = ({
  requestId,
  isAuthenticated,
}) => {
  return <BidsInbox requestId={requestId} isAuthenticated={isAuthenticated} />
}

export default RequestAndBidsInbox
