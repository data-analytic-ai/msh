import type { Access } from 'payload'

import type { User } from '../payload-types'

/**
 * Access control function that grants access to admins, superadmins or clients
 *
 * @returns {boolean} Whether the user has access or not
 */
export const adminsOrUser: Access = ({ req }) => {
  // Si el usuario no está autenticado, no tiene acceso
  if (!req.user) return false

  const user = req.user as User

  // Los administradores, superadmins y clientes tienen acceso
  if (['admin', 'superadmin', 'client'].includes(user.role)) return true

  // Por defecto, no tiene acceso
  return false
}
