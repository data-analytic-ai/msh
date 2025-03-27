import type { Access } from 'payload'

import type { User } from '../payload-types'

/**
 * Access control function that grants access only to admins and superadmins
 *
 * @returns {boolean} Whether the user has access or not
 */
export const admins: Access = ({ req }) => {
  // Si el usuario no está autenticado, no tiene acceso
  if (!req.user) return false

  const user = req.user as User

  // Solo los administradores y superadmins tienen acceso
  if (['admin', 'superadmin'].includes(user.role)) return true

  // Por defecto, no tiene acceso
  return false
}
