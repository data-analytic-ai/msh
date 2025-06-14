/**
 * Bid Types and Interfaces
 *
 * Shared type definitions for bid-related components and functionality.
 * These types ensure consistency across all bid management components.
 */

export interface BidContractor {
  id: string
  firstName: string
  lastName: string
  name?: string // For backward compatibility
  rating: number
  reviewCount: number
  profileImage?: { url: string }
  location?: string
  phone?: string
  email?: string
  verified: boolean
  specialties?: string[]
  experience?: string
  completedJobs?: number
}

export interface BidMaterial {
  item: string
  cost?: number
  description?: string
}

export interface BidPriceBreakdown {
  labor: number
  materials: number
  additional: number
  notes?: string
}

export interface BidPortfolioItem {
  image: { url: string }
  description?: string
}

export interface Bid {
  id: string
  contractor: BidContractor
  amount: number
  description: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired'
  submittedAt: string
  acceptedAt?: string
  rejectedAt?: string
  estimatedDuration?: string
  warranty?: string
  materials?: BidMaterial[]
  priceBreakdown?: BidPriceBreakdown
  availability?: string
  portfolio?: BidPortfolioItem[]
  serviceRequest: string
  title: string
}

export type ViewMode = 'list' | 'detail'

export interface BidsState {
  bids: Bid[]
  isLoading: boolean
  error: string | null
  hasNewBids: boolean
  timeElapsed: number
  showNotification: boolean
}

export interface BidActionsState {
  acceptingBid: string | null
  rejectingBid: string | null
}
