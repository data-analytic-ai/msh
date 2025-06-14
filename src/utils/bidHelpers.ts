/**
 * Bid Helper Utilities
 *
 * Collection of utility functions for bid-related operations
 * such as formatting, validation, and data transformation.
 */

/**
 * Format elapsed time from minutes to human-readable string
 *
 * @param {number} minutes - Number of minutes elapsed
 * @returns {string} - Formatted time string (e.g., "2h 30m" or "45 min")
 */
export const formatTimeElapsed = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

/**
 * Get bid status display text in Spanish
 *
 * @param {string} status - Bid status
 * @returns {string} - Localized status text
 */
export const getBidStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Pendiente',
    accepted: 'Aceptada',
    rejected: 'Rechazada',
    withdrawn: 'Retirada',
    expired: 'Expirada',
  }
  return statusMap[status] || status
}

/**
 * Get bid status variant for UI components
 *
 * @param {string} status - Bid status
 * @returns {string} - Badge variant
 */
export const getBidStatusVariant = (status: string): 'default' | 'outline' | 'secondary' => {
  switch (status) {
    case 'accepted':
      return 'default'
    case 'pending':
      return 'outline'
    default:
      return 'secondary'
  }
}

/**
 * Format currency amount with localization
 *
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString()}`
}

/**
 * Check if enough time has passed to suggest manual contractor search
 *
 * @param {number} timeElapsed - Minutes elapsed since request
 * @returns {boolean} - Whether to show manual search suggestion
 */
export const shouldSuggestManualSearch = (timeElapsed: number): boolean => {
  return timeElapsed > 1440 // 24 hours = 1440 minutes
}

/**
 * Get contractor initials for avatar fallback
 *
 * @param {string} firstName - Contractor first name
 * @param {string} lastName - Contractor last name
 * @returns {string} - Initials string
 */
export const getContractorInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}
