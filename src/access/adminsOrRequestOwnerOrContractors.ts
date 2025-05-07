import { Access } from 'payload'

/**
 * Allows access to admins, the owner of the request, or contractors
 * Used for service requests that need to be visible to contractors
 */
export const adminsOrRequestOwnerOrContractors: Access = ({ req: { user } }) => {
  // Denied if there's no user
  if (!user) return false

  // Allow if user is admin or superadmin
  if (['admin', 'superadmin'].includes(user.role)) return true

  // Allow if user is a contractor
  if (user.role === 'contractor') return true

  // If user is client (not admin and not contractor), only allow access to their own requests
  if (user.role === 'client') {
    return {
      customer: {
        equals: user.id,
      },
    }
  }

  // Deny by default
  return false
}
