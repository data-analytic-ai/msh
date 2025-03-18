import type { Access } from 'payload'

import type { User } from '../payload-types'

export const admins: Access = ({ req }) => {
  // Si el usuario no está autenticado, no tiene acceso
  if (!req.user) return false

  const user = req.user as User

  // Solo los administradores tienen acceso
  if (user.role === 'admin') return true

  // Por defecto, no tiene acceso
  return false
}
