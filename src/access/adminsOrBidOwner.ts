import type { Access } from 'payload'

/**
 * Access control for bids
 * Allows admins and the bid owner (contractor) to access
 */
export const adminsOrBidOwner: Access = ({ req: { user } }) => {
  if (!user) return false

  // Allow admins and superadmins
  if (['admin', 'superadmin'].includes(user.role as string)) {
    return true
  }

  // Allow bid owner (contractor)
  if (user.role === 'contractor') {
    return {
      contractor: {
        equals: user.id,
      },
    }
  }

  return false
}
